#!/usr/bin/env node
/**
 * Deployment Tracker - Track and manage deployments across environments
 */

const express = require('express');
const { DynamoDB } = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration
const PORT = process.env.PORT || 3001;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const DEPLOYMENTS_TABLE = process.env.DEPLOYMENTS_TABLE || 'zoptal-deployments';
const ROLLBACKS_TABLE = process.env.ROLLBACKS_TABLE || 'zoptal-rollbacks';
const SNAPSHOTS_TABLE = process.env.SNAPSHOTS_TABLE || 'zoptal-deployment-snapshots';

// Initialize AWS
const dynamodb = new DynamoDB.DocumentClient({ region: AWS_REGION });

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Utility functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// Deployment tracking endpoints

/**
 * Record a new deployment
 * POST /api/deployments
 */
app.post('/api/deployments', authenticate, async (req, res) => {
  try {
    const {
      deploymentId = generateId(),
      service,
      environment,
      version,
      imageTag,
      status,
      deploymentType = 'rolling',
      actor,
      commit,
      pullRequest,
      buildUrl,
      metadata = {}
    } = req.body;

    if (!service || !environment || !version || !status) {
      return res.status(400).json({
        error: 'Missing required fields: service, environment, version, status'
      });
    }

    const timestamp = getCurrentTimestamp();
    
    const deployment = {
      deploymentId,
      service,
      environment,
      version,
      imageTag,
      status, // pending, in_progress, success, failed, rolled_back
      deploymentType,
      actor: actor || 'system',
      commit,
      pullRequest,
      buildUrl,
      metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
      // DynamoDB TTL (keep for 90 days)
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
    };

    await dynamodb.put({
      TableName: DEPLOYMENTS_TABLE,
      Item: deployment
    }).promise();

    // Update latest deployment tracking
    await dynamodb.put({
      TableName: DEPLOYMENTS_TABLE,
      Item: {
        ...deployment,
        deploymentId: `latest-${service}-${environment}`,
        latestDeployment: true
      }
    }).promise();

    res.status(201).json({
      message: 'Deployment recorded successfully',
      deployment
    });

  } catch (error) {
    console.error('Error recording deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update deployment status
 * PUT /api/deployments/:deploymentId
 */
app.put('/api/deployments/:deploymentId', authenticate, async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const { status, metadata = {} } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const timestamp = getCurrentTimestamp();

    await dynamodb.update({
      TableName: DEPLOYMENTS_TABLE,
      Key: { deploymentId },
      UpdateExpression: 'SET #status = :status, #metadata = :metadata, updatedAt = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#metadata': 'metadata'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':metadata': metadata,
        ':timestamp': timestamp
      }
    }).promise();

    res.json({ message: 'Deployment status updated successfully' });

  } catch (error) {
    console.error('Error updating deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get deployments with filtering and pagination
 * GET /api/deployments
 */
app.get('/api/deployments', authenticate, async (req, res) => {
  try {
    const {
      service,
      environment,
      status,
      limit = 50,
      lastKey
    } = req.query;

    let params = {
      TableName: DEPLOYMENTS_TABLE,
      Limit: parseInt(limit),
      ScanIndexForward: false // Most recent first
    };

    // Apply filters
    let filterExpression = '';
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    if (service) {
      filterExpression += (filterExpression ? ' AND ' : '') + '#service = :service';
      expressionAttributeNames['#service'] = 'service';
      expressionAttributeValues[':service'] = service;
    }

    if (environment) {
      filterExpression += (filterExpression ? ' AND ' : '') + 'environment = :environment';
      expressionAttributeValues[':environment'] = environment;
    }

    if (status) {
      filterExpression += (filterExpression ? ' AND ' : '') + '#status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
    }

    const result = await dynamodb.scan(params).promise();

    // Filter out latest deployment markers
    const deployments = result.Items.filter(item => !item.latestDeployment);

    const response = {
      deployments,
      count: deployments.length,
      lastEvaluatedKey: result.LastEvaluatedKey ? 
        Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : null
    };

    res.json(response);

  } catch (error) {
    console.error('Error getting deployments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get deployment statistics
 * GET /api/deployments/stats
 */
app.get('/api/deployments/stats', authenticate, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Convert timeframe to timestamp
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case '1d':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const params = {
      TableName: DEPLOYMENTS_TABLE,
      FilterExpression: 'createdAt >= :startTime AND attribute_not_exists(latestDeployment)',
      ExpressionAttributeValues: {
        ':startTime': startTime.toISOString()
      }
    };

    const result = await dynamodb.scan(params).promise();
    const deployments = result.Items;

    // Calculate statistics
    const stats = {
      total: deployments.length,
      successful: deployments.filter(d => d.status === 'success').length,
      failed: deployments.filter(d => d.status === 'failed').length,
      inProgress: deployments.filter(d => d.status === 'in_progress').length,
      rolledBack: deployments.filter(d => d.status === 'rolled_back').length,
      byService: {},
      byEnvironment: {},
      byType: {},
      timeline: []
    };

    // Group by service, environment, and type
    deployments.forEach(deployment => {
      // By service
      if (!stats.byService[deployment.service]) {
        stats.byService[deployment.service] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byService[deployment.service].total++;
      if (deployment.status === 'success') stats.byService[deployment.service].successful++;
      if (deployment.status === 'failed') stats.byService[deployment.service].failed++;

      // By environment
      if (!stats.byEnvironment[deployment.environment]) {
        stats.byEnvironment[deployment.environment] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byEnvironment[deployment.environment].total++;
      if (deployment.status === 'success') stats.byEnvironment[deployment.environment].successful++;
      if (deployment.status === 'failed') stats.byEnvironment[deployment.environment].failed++;

      // By type
      if (!stats.byType[deployment.deploymentType]) {
        stats.byType[deployment.deploymentType] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byType[deployment.deploymentType].total++;
      if (deployment.status === 'success') stats.byType[deployment.deploymentType].successful++;
      if (deployment.status === 'failed') stats.byType[deployment.deploymentType].failed++;
    });

    // Success rate
    stats.successRate = stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(2) : 0;

    res.json(stats);

  } catch (error) {
    console.error('Error getting deployment stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get last known good deployment
 * GET /api/deployments/last-known-good
 */
app.get('/api/deployments/last-known-good', authenticate, async (req, res) => {
  try {
    const { service, environment } = req.query;

    if (!service || !environment) {
      return res.status(400).json({ error: 'Service and environment are required' });
    }

    const params = {
      TableName: DEPLOYMENTS_TABLE,
      FilterExpression: '#service = :service AND environment = :environment AND #status = :status',
      ExpressionAttributeNames: {
        '#service': 'service',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':service': service,
        ':environment': environment,
        ':status': 'success'
      },
      ScanIndexForward: false,
      Limit: 1
    };

    const result = await dynamodb.scan(params).promise();
    
    if (result.Items.length === 0) {
      return res.status(404).json({ error: 'No successful deployment found' });
    }

    const lastKnownGood = result.Items[0];
    res.json({
      version: lastKnownGood.version,
      imageTag: lastKnownGood.imageTag,
      deploymentId: lastKnownGood.deploymentId,
      createdAt: lastKnownGood.createdAt
    });

  } catch (error) {
    console.error('Error getting last known good deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Record a rollback
 * POST /api/rollbacks
 */
app.post('/api/rollbacks', authenticate, async (req, res) => {
  try {
    const {
      rollbackId = generateId(),
      service,
      environment,
      fromVersion,
      toVersion,
      reason,
      status,
      triggeredBy,
      automatedRollback = false,
      metadata = {}
    } = req.body;

    if (!service || !environment || !fromVersion || !toVersion || !reason) {
      return res.status(400).json({
        error: 'Missing required fields: service, environment, fromVersion, toVersion, reason'
      });
    }

    const timestamp = getCurrentTimestamp();
    
    const rollback = {
      rollbackId,
      service,
      environment,
      fromVersion,
      toVersion,
      reason,
      status: status || 'in_progress',
      triggeredBy: triggeredBy || 'system',
      automatedRollback,
      metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
      // DynamoDB TTL (keep for 90 days)
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
    };

    await dynamodb.put({
      TableName: ROLLBACKS_TABLE,
      Item: rollback
    }).promise();

    res.status(201).json({
      message: 'Rollback recorded successfully',
      rollback
    });

  } catch (error) {
    console.error('Error recording rollback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Record a deployment snapshot
 * POST /api/snapshots
 */
app.post('/api/snapshots', authenticate, async (req, res) => {
  try {
    const {
      snapshotId = generateId(),
      service,
      environment,
      version,
      type,
      s3Location,
      metadata = {}
    } = req.body;

    if (!service || !environment || !version || !type) {
      return res.status(400).json({
        error: 'Missing required fields: service, environment, version, type'
      });
    }

    const timestamp = getCurrentTimestamp();
    
    const snapshot = {
      snapshotId,
      service,
      environment,
      version,
      type, // pre-deployment, post-deployment, pre-rollback
      s3Location,
      metadata,
      createdAt: timestamp,
      // DynamoDB TTL (keep for 30 days)
      ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    };

    await dynamodb.put({
      TableName: SNAPSHOTS_TABLE,
      Item: snapshot
    }).promise();

    res.status(201).json({
      message: 'Snapshot recorded successfully',
      snapshot
    });

  } catch (error) {
    console.error('Error recording snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: getCurrentTimestamp(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * Deployment dashboard data
 * GET /api/dashboard
 */
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    // Get recent deployments
    const recentDeploymentsParams = {
      TableName: DEPLOYMENTS_TABLE,
      FilterExpression: 'attribute_not_exists(latestDeployment)',
      Limit: 20,
      ScanIndexForward: false
    };

    const recentDeployments = await dynamodb.scan(recentDeploymentsParams).promise();

    // Get current deployments per environment
    const currentDeploymentsParams = {
      TableName: DEPLOYMENTS_TABLE,
      FilterExpression: 'attribute_exists(latestDeployment)'
    };

    const currentDeployments = await dynamodb.scan(currentDeploymentsParams).promise();

    // Get recent rollbacks
    const recentRollbacksParams = {
      TableName: ROLLBACKS_TABLE,
      Limit: 10,
      ScanIndexForward: false
    };

    const recentRollbacks = await dynamodb.scan(recentRollbacksParams).promise();

    const dashboard = {
      recentDeployments: recentDeployments.Items,
      currentDeployments: currentDeployments.Items.map(item => ({
        service: item.service,
        environment: item.environment,
        version: item.version,
        status: item.status,
        updatedAt: item.updatedAt
      })),
      recentRollbacks: recentRollbacks.Items,
      summary: {
        totalServices: [...new Set(currentDeployments.Items.map(item => item.service))].length,
        totalEnvironments: [...new Set(currentDeployments.Items.map(item => item.environment))].length,
        healthyServices: currentDeployments.Items.filter(item => item.status === 'success').length,
        unhealthyServices: currentDeployments.Items.filter(item => item.status === 'failed').length
      }
    };

    res.json(dashboard);

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Deployment Tracker API listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`AWS Region: ${AWS_REGION}`);
});

module.exports = app;