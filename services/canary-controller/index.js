const express = require('express');
const k8s = require('@kubernetes/client-node');
const cron = require('node-cron');
const axios = require('axios');

/**
 * Canary Deployment Controller
 * 
 * Manages automated canary deployments with metrics-based analysis
 */

class CanaryController {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8090;
    
    // Metrics configuration
    this.prometheusUrl = process.env.PROMETHEUS_URL || 'http://prometheus.zoptal-monitoring:9090';
    this.analysisInterval = parseInt(process.env.ANALYSIS_INTERVAL) || 300; // 5 minutes
    this.errorThreshold = parseFloat(process.env.ERROR_THRESHOLD) || 1.0;
    this.latencyThreshold = parseInt(process.env.LATENCY_THRESHOLD) || 500;
    this.successThreshold = parseFloat(process.env.SUCCESS_THRESHOLD) || 99.0;
    
    // Active canary deployments
    this.activeCanaries = new Map();
    
    // Initialize Kubernetes client
    this.k8sConfig = new k8s.KubeConfig();
    if (process.env.KUBERNETES_SERVICE_HOST) {
      this.k8sConfig.loadFromCluster();
    } else {
      this.k8sConfig.loadFromDefault();
    }
    
    this.k8sApi = this.k8sConfig.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsApi = this.k8sConfig.makeApiClient(k8s.AppsV1Api);
    this.k8sNetworkingApi = this.k8sConfig.makeApiClient(k8s.NetworkingV1Api);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startAutomation();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        activeCanaries: this.activeCanaries.size,
        timestamp: new Date().toISOString()
      });
    });

    // Get active canary deployments
    this.app.get('/canaries', async (req, res) => {
      try {
        const canaries = Array.from(this.activeCanaries.values());
        res.json({
          success: true,
          data: canaries
        });
      } catch (error) {
        console.error('Error getting canaries:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Start a new canary deployment
    this.app.post('/canaries', async (req, res) => {
      try {
        const {
          service,
          version,
          initialPercentage = 10,
          increment = 20,
          analysisInterval = 300,
          autoPromote = false,
          thresholds = {}
        } = req.body;

        if (!service || !version) {
          return res.status(400).json({ error: 'Service and version are required' });
        }

        const canaryId = `${service}-${version}-${Date.now()}`;
        
        const canary = {
          id: canaryId,
          service,
          version,
          status: 'initializing',
          currentPercentage: 0,
          targetPercentage: initialPercentage,
          increment,
          analysisInterval,
          autoPromote,
          thresholds: {
            errorRate: thresholds.errorRate || this.errorThreshold,
            latency: thresholds.latency || this.latencyThreshold,
            successRate: thresholds.successRate || this.successThreshold
          },
          createdAt: new Date().toISOString(),
          metrics: [],
          phases: []
        };

        // Start the canary deployment
        await this.startCanaryDeployment(canary);
        
        this.activeCanaries.set(canaryId, canary);

        res.json({
          success: true,
          data: canary
        });

      } catch (error) {
        console.error('Error starting canary:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific canary status
    this.app.get('/canaries/:id', (req, res) => {
      const { id } = req.params;
      const canary = this.activeCanaries.get(id);

      if (!canary) {
        return res.status(404).json({ error: 'Canary not found' });
      }

      res.json({
        success: true,
        data: canary
      });
    });

    // Promote canary to stable
    this.app.post('/canaries/:id/promote', async (req, res) => {
      try {
        const { id } = req.params;
        const canary = this.activeCanaries.get(id);

        if (!canary) {
          return res.status(404).json({ error: 'Canary not found' });
        }

        await this.promoteCanary(canary);

        res.json({
          success: true,
          message: 'Canary promoted to stable'
        });

      } catch (error) {
        console.error('Error promoting canary:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Rollback canary
    this.app.post('/canaries/:id/rollback', async (req, res) => {
      try {
        const { id } = req.params;
        const canary = this.activeCanaries.get(id);

        if (!canary) {
          return res.status(404).json({ error: 'Canary not found' });
        }

        await this.rollbackCanary(canary);

        res.json({
          success: true,
          message: 'Canary rolled back'
        });

      } catch (error) {
        console.error('Error rolling back canary:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Update traffic percentage
    this.app.post('/canaries/:id/traffic', async (req, res) => {
      try {
        const { id } = req.params;
        const { percentage } = req.body;
        const canary = this.activeCanaries.get(id);

        if (!canary) {
          return res.status(404).json({ error: 'Canary not found' });
        }

        if (percentage < 0 || percentage > 100) {
          return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
        }

        await this.updateTrafficSplit(canary, percentage);

        res.json({
          success: true,
          message: `Traffic updated to ${percentage}%`
        });

      } catch (error) {
        console.error('Error updating traffic:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get canary metrics
    this.app.get('/canaries/:id/metrics', async (req, res) => {
      try {
        const { id } = req.params;
        const canary = this.activeCanaries.get(id);

        if (!canary) {
          return res.status(404).json({ error: 'Canary not found' });
        }

        const metrics = await this.getCanaryMetrics(canary.service);

        res.json({
          success: true,
          data: {
            current: metrics,
            history: canary.metrics.slice(-20) // Last 20 data points
          }
        });

      } catch (error) {
        console.error('Error getting metrics:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Start automated analysis tasks
   */
  startAutomation() {
    // Run canary analysis every minute
    cron.schedule('* * * * *', () => {
      this.analyzeActiveCanaries();
    });

    console.log('Canary automation started');
  }

  /**
   * Start a canary deployment
   */
  async startCanaryDeployment(canary) {
    try {
      canary.status = 'deploying';
      canary.phases.push({
        phase: 'deployment',
        status: 'started',
        timestamp: new Date().toISOString()
      });

      // Deploy canary version
      await this.deployCanaryVersion(canary);
      
      // Wait for deployment to be ready
      await this.waitForCanaryReady(canary);
      
      // Start with initial traffic percentage
      await this.updateTrafficSplit(canary, canary.targetPercentage);
      
      canary.status = 'analyzing';
      canary.currentPercentage = canary.targetPercentage;
      canary.phases.push({
        phase: 'traffic_split',
        status: 'completed',
        percentage: canary.targetPercentage,
        timestamp: new Date().toISOString()
      });

      console.log(`Canary deployment started for ${canary.service}:${canary.version}`);

    } catch (error) {
      canary.status = 'failed';
      canary.error = error.message;
      console.error('Error starting canary deployment:', error);
      throw error;
    }
  }

  /**
   * Deploy canary version to Kubernetes
   */
  async deployCanaryVersion(canary) {
    const namespace = 'zoptal-canary';
    const deploymentName = `${canary.service}-canary`;
    
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: deploymentName,
        namespace: namespace,
        labels: {
          app: canary.service,
          version: canary.version,
          track: 'canary'
        }
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: canary.service,
            track: 'canary'
          }
        },
        template: {
          metadata: {
            labels: {
              app: canary.service,
              version: canary.version,
              track: 'canary'
            },
            annotations: {
              'prometheus.io/scrape': 'true',
              'prometheus.io/port': '3000'
            }
          },
          spec: {
            containers: [{
              name: canary.service,
              image: `zoptal/${canary.service}:${canary.version}`,
              ports: [{ containerPort: 3000, name: 'http' }],
              env: [
                { name: 'DEPLOYMENT_TYPE', value: 'canary' },
                { name: 'VERSION', value: canary.version }
              ],
              resources: {
                requests: { memory: '256Mi', cpu: '200m' },
                limits: { memory: '512Mi', cpu: '500m' }
              },
              livenessProbe: {
                httpGet: { path: '/health', port: 'http' },
                initialDelaySeconds: 30,
                periodSeconds: 10
              },
              readinessProbe: {
                httpGet: { path: '/ready', port: 'http' },
                initialDelaySeconds: 5,
                periodSeconds: 5
              }
            }]
          }
        }
      }
    };

    try {
      await this.k8sAppsApi.createNamespacedDeployment(namespace, deployment);
    } catch (error) {
      if (error.response?.body?.reason === 'AlreadyExists') {
        await this.k8sAppsApi.replaceNamespacedDeployment(deploymentName, namespace, deployment);
      } else {
        throw error;
      }
    }
  }

  /**
   * Wait for canary deployment to be ready
   */
  async waitForCanaryReady(canary, timeoutSeconds = 300) {
    const namespace = 'zoptal-canary';
    const deploymentName = `${canary.service}-canary`;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutSeconds * 1000) {
      try {
        const deployment = await this.k8sAppsApi.readNamespacedDeployment(deploymentName, namespace);
        const status = deployment.body.status;

        if (status.readyReplicas === status.replicas && status.replicas > 0) {
          console.log(`Canary deployment ${deploymentName} is ready`);
          return;
        }

        console.log(`Waiting for canary deployment... (${status.readyReplicas || 0}/${status.replicas || 0} ready)`);
      } catch (error) {
        console.error('Error checking deployment status:', error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }

    throw new Error(`Canary deployment ${deploymentName} failed to become ready within ${timeoutSeconds} seconds`);
  }

  /**
   * Update traffic split between stable and canary
   */
  async updateTrafficSplit(canary, percentage) {
    try {
      // Update service annotations
      const serviceName = canary.service;
      const namespace = 'zoptal-production';

      await this.k8sApi.patchNamespacedService(
        serviceName,
        namespace,
        {
          metadata: {
            annotations: {
              'canary.deployment/enabled': 'true',
              'canary.deployment/weight': percentage.toString()
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
      );

      canary.currentPercentage = percentage;
      console.log(`Updated traffic split for ${serviceName}: ${percentage}% to canary`);

    } catch (error) {
      console.error('Error updating traffic split:', error);
      throw error;
    }
  }

  /**
   * Get metrics for canary analysis
   */
  async getCanaryMetrics(serviceName) {
    try {
      const queries = {
        successRate: `sum(rate(http_requests_total{app="${serviceName}",track="canary",status=~"2.."}[5m])) / sum(rate(http_requests_total{app="${serviceName}",track="canary"}[5m])) * 100`,
        errorRate: `sum(rate(http_requests_total{app="${serviceName}",track="canary",status=~"5.."}[5m])) / sum(rate(http_requests_total{app="${serviceName}",track="canary"}[5m])) * 100`,
        latencyP50: `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{app="${serviceName}",track="canary"}[5m])) by (le)) * 1000`,
        latencyP95: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="${serviceName}",track="canary"}[5m])) by (le)) * 1000`,
        latencyP99: `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{app="${serviceName}",track="canary"}[5m])) by (le)) * 1000`,
        requestRate: `sum(rate(http_requests_total{app="${serviceName}",track="canary"}[5m]))`
      };

      const metrics = {};
      
      for (const [name, query] of Object.entries(queries)) {
        try {
          const response = await axios.get(`${this.prometheusUrl}/api/v1/query`, {
            params: { query },
            timeout: 10000
          });

          const result = response.data.data.result;
          metrics[name] = result.length > 0 ? parseFloat(result[0].value[1]) : 0;
        } catch (error) {
          console.warn(`Failed to get metric ${name}:`, error.message);
          metrics[name] = 0;
        }
      }

      // Default values if no data
      metrics.successRate = metrics.successRate || 100;
      metrics.errorRate = metrics.errorRate || 0;

      return {
        ...metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting canary metrics:', error);
      return {
        successRate: 100,
        errorRate: 0,
        latencyP50: 0,
        latencyP95: 0,
        latencyP99: 0,
        requestRate: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze active canary deployments
   */
  async analyzeActiveCanaries() {
    for (const [canaryId, canary] of this.activeCanaries) {
      try {
        if (canary.status !== 'analyzing') {
          continue;
        }

        // Get current metrics
        const metrics = await this.getCanaryMetrics(canary.service);
        canary.metrics.push(metrics);

        // Keep only last 100 metrics
        if (canary.metrics.length > 100) {
          canary.metrics = canary.metrics.slice(-100);
        }

        // Analyze metrics
        const analysis = this.analyzeMetrics(canary, metrics);
        
        if (analysis.decision === 'rollback') {
          console.log(`Rolling back canary ${canaryId}: ${analysis.reason}`);
          await this.rollbackCanary(canary);
        } else if (analysis.decision === 'promote' && canary.currentPercentage < 100) {
          const nextPercentage = Math.min(canary.currentPercentage + canary.increment, 100);
          console.log(`Promoting canary ${canaryId} to ${nextPercentage}%`);
          
          await this.updateTrafficSplit(canary, nextPercentage);
          
          if (nextPercentage === 100 && canary.autoPromote) {
            setTimeout(() => {
              this.promoteCanary(canary);
            }, canary.analysisInterval * 1000);
          }
        }

      } catch (error) {
        console.error(`Error analyzing canary ${canaryId}:`, error);
        canary.status = 'error';
        canary.error = error.message;
      }
    }
  }

  /**
   * Analyze metrics and make deployment decisions
   */
  analyzeMetrics(canary, metrics) {
    const { thresholds } = canary;
    
    // Check error rate
    if (metrics.errorRate > thresholds.errorRate) {
      return {
        decision: 'rollback',
        reason: `Error rate ${metrics.errorRate.toFixed(2)}% exceeds threshold ${thresholds.errorRate}%`
      };
    }

    // Check success rate
    if (metrics.successRate < thresholds.successRate) {
      return {
        decision: 'rollback',
        reason: `Success rate ${metrics.successRate.toFixed(2)}% below threshold ${thresholds.successRate}%`
      };
    }

    // Check latency
    if (metrics.latencyP95 > thresholds.latency) {
      return {
        decision: 'rollback',
        reason: `P95 latency ${metrics.latencyP95.toFixed(2)}ms exceeds threshold ${thresholds.latency}ms`
      };
    }

    // Check if we have enough metrics history for promotion
    if (canary.metrics.length < 3) {
      return {
        decision: 'wait',
        reason: 'Not enough metrics history'
      };
    }

    // Check trend over last few measurements
    const recentMetrics = canary.metrics.slice(-3);
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;
    const avgLatency = recentMetrics.reduce((sum, m) => sum + m.latencyP95, 0) / recentMetrics.length;

    if (avgErrorRate <= thresholds.errorRate && avgLatency <= thresholds.latency) {
      return {
        decision: 'promote',
        reason: 'Metrics are healthy and stable'
      };
    }

    return {
      decision: 'wait',
      reason: 'Metrics are stable but need more observation'
    };
  }

  /**
   * Promote canary to stable
   */
  async promoteCanary(canary) {
    try {
      console.log(`Promoting canary ${canary.service}:${canary.version} to stable`);
      
      // Update stable deployment
      const namespace = 'zoptal-production';
      const deploymentName = `${canary.service}-stable`;
      
      await this.k8sAppsApi.patchNamespacedDeployment(
        deploymentName,
        namespace,
        {
          spec: {
            template: {
              spec: {
                containers: [{
                  name: canary.service,
                  image: `zoptal/${canary.service}:${canary.version}`
                }]
              }
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
      );

      // Remove canary deployment
      await this.k8sAppsApi.deleteNamespacedDeployment(
        `${canary.service}-canary`,
        'zoptal-canary'
      );

      // Reset traffic annotations
      await this.k8sApi.patchNamespacedService(
        canary.service,
        namespace,
        {
          metadata: {
            annotations: {
              'canary.deployment/enabled': 'false',
              'canary.deployment/weight': '0'
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
      );

      canary.status = 'promoted';
      canary.completedAt = new Date().toISOString();
      
      // Remove from active canaries after a delay
      setTimeout(() => {
        this.activeCanaries.delete(canary.id);
      }, 300000); // 5 minutes

      console.log(`Canary ${canary.service}:${canary.version} promoted successfully`);

    } catch (error) {
      console.error('Error promoting canary:', error);
      canary.status = 'promotion_failed';
      canary.error = error.message;
      throw error;
    }
  }

  /**
   * Rollback canary deployment
   */
  async rollbackCanary(canary) {
    try {
      console.log(`Rolling back canary ${canary.service}:${canary.version}`);

      // Delete canary deployment
      try {
        await this.k8sAppsApi.deleteNamespacedDeployment(
          `${canary.service}-canary`,
          'zoptal-canary'
        );
      } catch (error) {
        console.warn('Canary deployment already deleted or not found');
      }

      // Reset traffic to 100% stable
      await this.k8sApi.patchNamespacedService(
        canary.service,
        'zoptal-production',
        {
          metadata: {
            annotations: {
              'canary.deployment/enabled': 'false',
              'canary.deployment/weight': '0'
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
      );

      canary.status = 'rolled_back';
      canary.completedAt = new Date().toISOString();

      // Remove from active canaries after a delay
      setTimeout(() => {
        this.activeCanaries.delete(canary.id);
      }, 300000); // 5 minutes

      console.log(`Canary ${canary.service}:${canary.version} rolled back successfully`);

    } catch (error) {
      console.error('Error rolling back canary:', error);
      canary.status = 'rollback_failed';
      canary.error = error.message;
      throw error;
    }
  }

  /**
   * Start the canary controller
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`Canary controller started on port ${this.port}`);
      console.log(`Prometheus URL: ${this.prometheusUrl}`);
      console.log(`Analysis interval: ${this.analysisInterval}s`);
    });
  }
}

// Start the controller
const controller = new CanaryController();
controller.start();