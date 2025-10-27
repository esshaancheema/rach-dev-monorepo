const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const k8s = require('@kubernetes/client-node');

/**
 * Traffic Controller for Blue-Green Deployments
 * 
 * Manages traffic switching between blue and green environments
 */

class TrafficController {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.configPath = process.env.NGINX_CONFIG_PATH || '/etc/nginx/active-env.conf';
    this.activeEnvironment = process.env.ACTIVE_ENVIRONMENT || 'blue';
    
    // Initialize Kubernetes client
    this.k8sConfig = new k8s.KubeConfig();
    if (process.env.KUBERNETES_SERVICE_HOST) {
      this.k8sConfig.loadFromCluster();
    } else {
      this.k8sConfig.loadFromDefault();
    }
    this.k8sApi = this.k8sConfig.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsApi = this.k8sConfig.makeApiClient(k8s.AppsV1Api);
    
    this.setupMiddleware();
    this.setupRoutes();
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
        activeEnvironment: this.activeEnvironment,
        timestamp: new Date().toISOString()
      });
    });

    // Get current environment status
    this.app.get('/status', async (req, res) => {
      try {
        const status = await this.getEnvironmentStatus();
        res.json(status);
      } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Switch traffic to specific environment
    this.app.post('/switch/:environment', async (req, res) => {
      try {
        const { environment } = req.params;
        const { validate = true, force = false } = req.body;

        if (!['blue', 'green'].includes(environment)) {
          return res.status(400).json({ error: 'Invalid environment. Must be blue or green.' });
        }

        if (environment === this.activeEnvironment && !force) {
          return res.status(400).json({ 
            error: `Already serving traffic from ${environment} environment`,
            hint: 'Use force=true to force switch'
          });
        }

        // Validate target environment if requested
        if (validate) {
          const validation = await this.validateEnvironment(environment);
          if (!validation.healthy) {
            return res.status(400).json({
              error: 'Target environment validation failed',
              details: validation
            });
          }
        }

        // Switch traffic
        await this.switchTraffic(environment);

        res.json({
          success: true,
          previousEnvironment: this.activeEnvironment,
          newEnvironment: environment,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error switching traffic:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Canary deployment endpoint
    this.app.post('/canary', async (req, res) => {
      try {
        const { targetEnvironment, percentage } = req.body;

        if (!['blue', 'green'].includes(targetEnvironment)) {
          return res.status(400).json({ error: 'Invalid target environment' });
        }

        if (percentage < 0 || percentage > 100) {
          return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
        }

        await this.setupCanaryDeployment(targetEnvironment, percentage);

        res.json({
          success: true,
          targetEnvironment,
          percentage,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error setting up canary:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get deployment metrics
    this.app.get('/metrics/:environment', async (req, res) => {
      try {
        const { environment } = req.params;
        const metrics = await this.getEnvironmentMetrics(environment);
        res.json(metrics);
      } catch (error) {
        console.error('Error getting metrics:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Rollback to previous environment
    this.app.post('/rollback', async (req, res) => {
      try {
        const targetEnvironment = this.activeEnvironment === 'blue' ? 'green' : 'blue';
        
        // Validate target environment
        const validation = await this.validateEnvironment(targetEnvironment);
        if (!validation.healthy) {
          return res.status(400).json({
            error: 'Cannot rollback - target environment is not healthy',
            details: validation
          });
        }

        await this.switchTraffic(targetEnvironment);

        res.json({
          success: true,
          rolledBackFrom: this.activeEnvironment,
          rolledBackTo: targetEnvironment,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error during rollback:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Scale environment
    this.app.post('/scale/:environment', async (req, res) => {
      try {
        const { environment } = req.params;
        const { replicas } = req.body;

        if (!['blue', 'green'].includes(environment)) {
          return res.status(400).json({ error: 'Invalid environment' });
        }

        if (!replicas || replicas < 0) {
          return res.status(400).json({ error: 'Invalid replica count' });
        }

        await this.scaleEnvironment(environment, replicas);

        res.json({
          success: true,
          environment,
          replicas,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error scaling environment:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Get current environment status
   */
  async getEnvironmentStatus() {
    const blueStatus = await this.getEnvironmentHealth('blue');
    const greenStatus = await this.getEnvironmentHealth('green');

    return {
      activeEnvironment: this.activeEnvironment,
      environments: {
        blue: blueStatus,
        green: greenStatus
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get health status of specific environment
   */
  async getEnvironmentHealth(environment) {
    try {
      const namespace = `zoptal-${environment}`;
      const deployments = await this.k8sAppsApi.listNamespacedDeployment(namespace);
      
      const health = {
        healthy: true,
        deployments: [],
        totalReplicas: 0,
        readyReplicas: 0
      };

      for (const deployment of deployments.body.items) {
        const deploymentHealth = {
          name: deployment.metadata.name,
          replicas: deployment.spec.replicas,
          readyReplicas: deployment.status.readyReplicas || 0,
          updatedReplicas: deployment.status.updatedReplicas || 0,
          availableReplicas: deployment.status.availableReplicas || 0
        };

        health.deployments.push(deploymentHealth);
        health.totalReplicas += deployment.spec.replicas;
        health.readyReplicas += deployment.status.readyReplicas || 0;

        if (deploymentHealth.readyReplicas < deploymentHealth.replicas) {
          health.healthy = false;
        }
      }

      health.readinessPercentage = health.totalReplicas > 0 
        ? Math.round((health.readyReplicas / health.totalReplicas) * 100)
        : 0;

      return health;

    } catch (error) {
      console.error(`Error checking ${environment} health:`, error);
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Validate environment before switching
   */
  async validateEnvironment(environment) {
    const health = await this.getEnvironmentHealth(environment);
    
    // Additional validation checks
    const validation = {
      healthy: health.healthy,
      checks: {
        deploymentsReady: health.healthy,
        minimumReplicas: health.readyReplicas >= 3,
        readinessThreshold: health.readinessPercentage >= 80
      },
      details: health
    };

    validation.healthy = Object.values(validation.checks).every(check => check === true);
    
    return validation;
  }

  /**
   * Switch traffic to specified environment
   */
  async switchTraffic(environment) {
    try {
      // Update nginx configuration
      const nginxConfig = `# Active environment configuration
# This file is updated by the traffic controller
set $active_backend ${environment}_backend;
`;
      
      await fs.writeFile(this.configPath, nginxConfig);
      
      // Update active environment
      this.activeEnvironment = environment;
      
      // Update ConfigMap in Kubernetes
      await this.updateConfigMap(environment);
      
      // Reload nginx configuration
      await this.reloadNginx();
      
      console.log(`Traffic switched to ${environment} environment`);
      
    } catch (error) {
      console.error('Error switching traffic:', error);
      throw error;
    }
  }

  /**
   * Update ConfigMap with new active environment
   */
  async updateConfigMap(environment) {
    try {
      const configMapName = 'traffic-manager-config';
      const namespace = 'zoptal-production';
      
      const configMap = await this.k8sApi.readNamespacedConfigMap(configMapName, namespace);
      
      // Update active environment in config
      configMap.body.data['active-env.conf'] = `# Active environment configuration
# This file is updated by the traffic controller
set $active_backend ${environment}_backend;
`;
      configMap.body.data['active-environment'] = environment;
      
      await this.k8sApi.replaceNamespacedConfigMap(
        configMapName,
        namespace,
        configMap.body
      );
      
    } catch (error) {
      console.error('Error updating ConfigMap:', error);
      throw error;
    }
  }

  /**
   * Reload nginx configuration
   */
  async reloadNginx() {
    try {
      // Send reload signal to nginx
      const { exec } = require('child_process');
      
      return new Promise((resolve, reject) => {
        exec('nginx -s reload', (error, stdout, stderr) => {
          if (error) {
            console.error('Error reloading nginx:', stderr);
            reject(error);
          } else {
            console.log('Nginx configuration reloaded');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error reloading nginx:', error);
      // Don't throw - nginx might reload on its own
    }
  }

  /**
   * Setup canary deployment
   */
  async setupCanaryDeployment(targetEnvironment, percentage) {
    // This would configure nginx to split traffic based on percentage
    // For now, we'll implement a simple weighted round-robin
    
    const canaryConfig = `# Canary deployment configuration
upstream canary_backend {
    # Current environment gets ${100 - percentage}% of traffic
    server ${this.activeEnvironment}_backend weight=${100 - percentage};
    # Target environment gets ${percentage}% of traffic
    server ${targetEnvironment}_backend weight=${percentage};
}

set $active_backend canary_backend;
`;
    
    await fs.writeFile(this.configPath, canaryConfig);
    await this.reloadNginx();
  }

  /**
   * Get environment metrics
   */
  async getEnvironmentMetrics(environment) {
    // This would fetch actual metrics from Prometheus
    // For now, return mock metrics
    return {
      environment,
      metrics: {
        requestsPerSecond: Math.random() * 1000,
        errorRate: Math.random() * 5,
        latencyP50: Math.random() * 100,
        latencyP95: Math.random() * 500,
        latencyP99: Math.random() * 1000,
        cpuUsage: Math.random() * 80,
        memoryUsage: Math.random() * 70
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scale environment up or down
   */
  async scaleEnvironment(environment, replicas) {
    try {
      const namespace = `zoptal-${environment}`;
      const deployments = await this.k8sAppsApi.listNamespacedDeployment(namespace);
      
      const scalePromises = deployments.body.items.map(deployment => {
        const scale = {
          metadata: deployment.metadata,
          spec: { replicas }
        };
        
        return this.k8sAppsApi.replaceNamespacedDeploymentScale(
          deployment.metadata.name,
          namespace,
          scale
        );
      });
      
      await Promise.all(scalePromises);
      
    } catch (error) {
      console.error(`Error scaling ${environment} environment:`, error);
      throw error;
    }
  }

  /**
   * Start the traffic controller
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`Traffic controller started on port ${this.port}`);
      console.log(`Active environment: ${this.activeEnvironment}`);
    });
  }
}

// Start the controller
const controller = new TrafficController();
controller.start();