# Cost Optimization Guide

This guide provides comprehensive strategies for optimizing costs while maintaining performance and reliability of the Zoptal platform.

## Table of Contents

1. [Cost Architecture](#cost-architecture)
2. [Infrastructure Cost Optimization](#infrastructure-cost-optimization)
3. [Kubernetes Resource Management](#kubernetes-resource-management)
4. [Database Cost Optimization](#database-cost-optimization)
5. [Monitoring and Alerting](#monitoring-and-alerting)
6. [Reserved Instances and Savings Plans](#reserved-instances-and-savings-plans)
7. [Storage Optimization](#storage-optimization)
8. [Network Cost Optimization](#network-cost-optimization)
9. [Cost Allocation and Chargeback](#cost-allocation-and-chargeback)
10. [Automated Cost Controls](#automated-cost-controls)

## Cost Architecture

### Cost Optimization Principles

1. **Right-sizing**: Match resources to actual usage
2. **Reserved Capacity**: Commit to long-term usage for discounts
3. **Spot Instances**: Use for non-critical workloads
4. **Auto-scaling**: Scale resources based on demand
5. **Resource Scheduling**: Turn off resources when not needed
6. **Data Lifecycle**: Move data to cheaper storage tiers
7. **Monitoring**: Continuous cost visibility and optimization

### Cost Breakdown by Service

```
Production Environment Cost Distribution:
┌─────────────────────────────────────────────────────────────┐
│                    Monthly Cost Breakdown                   │
├─────────────────────────────────────────────────────────────┤
│ Compute (EKS + EC2):           $1,200 (40%)                │
│ Database (RDS):                $600 (20%)                  │
│ Storage (EBS + S3):            $300 (10%)                  │
│ Network (LoadBalancer + CDN):  $450 (15%)                  │
│ Monitoring (CloudWatch):       $150 (5%)                   │
│ Other Services:                $300 (10%)                  │
├─────────────────────────────────────────────────────────────┤
│ Total:                         $3,000/month                │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure Cost Optimization

### Terraform Cost-Optimized Configuration

```hcl
# Optimized EKS cluster configuration
resource "aws_eks_cluster" "zoptal" {
  name     = "zoptal-cluster"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.private[*].id, aws_subnet.public[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    
    # Cost optimization: Restrict public access
    public_access_cidrs = ["0.0.0.0/0"]
  }

  # Enable cluster logging selectively to reduce costs
  enabled_cluster_log_types = ["api", "audit"]

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
  ]
}

# Cost-optimized node groups
resource "aws_eks_node_group" "primary" {
  cluster_name    = aws_eks_cluster.zoptal.name
  node_group_name = "primary-nodes"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.private[*].id

  # Mixed instance types for cost optimization
  instance_types = ["t3.medium", "t3a.medium", "t2.medium"]
  
  # Spot instances for cost savings (70% discount)
  capacity_type = "SPOT"
  
  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 1
  }

  # Auto-scaling based on time/usage
  update_config {
    max_unavailable_percentage = 25
  }

  tags = {
    "k8s.io/cluster-autoscaler/enabled"                = "true"
    "k8s.io/cluster-autoscaler/zoptal-cluster"        = "owned"
    "k8s.io/cluster-autoscaler/node-template/label/node-type" = "spot"
  }
}

# On-demand node group for critical workloads
resource "aws_eks_node_group" "on_demand" {
  cluster_name    = aws_eks_cluster.zoptal.name
  node_group_name = "on-demand-nodes"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.private[*].id

  instance_types = ["t3.small"]
  capacity_type  = "ON_DEMAND"
  
  scaling_config {
    desired_size = 1
    max_size     = 3
    min_size     = 1
  }

  # Taints for critical workloads only
  taint {
    key    = "dedicated"
    value  = "critical"
    effect = "NO_SCHEDULE"
  }

  tags = {
    "node-type" = "on-demand"
    "workload"  = "critical"
  }
}

# Cost-optimized RDS configuration
resource "aws_rds_cluster" "zoptal" {
  cluster_identifier     = "zoptal-cluster"
  engine                = "aurora-postgresql"
  engine_version        = "15.4"
  database_name         = "zoptal"
  master_username       = "postgres"
  master_password       = random_password.db_password.result
  
  # Use smaller instances for cost optimization
  # Scale up during peak hours with scheduled actions
  
  backup_retention_period = 7  # Reduce from default 35 days
  preferred_backup_window = "03:00-04:00"  # During low usage
  
  # Enable deletion protection in production only
  deletion_protection = var.environment == "production"
  
  # Cost optimization: Skip final snapshot in dev
  skip_final_snapshot = var.environment != "production"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.zoptal.name
  
  # Enable Performance Insights only in production
  enabled_cloudwatch_logs_exports = var.environment == "production" ? ["postgresql"] : []
  
  tags = {
    Environment = var.environment
    Project     = "zoptal"
  }
}

# Cost-effective RDS instances
resource "aws_rds_cluster_instance" "zoptal" {
  count              = var.environment == "production" ? 2 : 1
  identifier         = "zoptal-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.zoptal.id
  
  # Use smaller instances for cost optimization
  instance_class = var.environment == "production" ? "db.r6g.large" : "db.t4g.medium"
  engine         = aws_rds_cluster.zoptal.engine
  engine_version = aws_rds_cluster.zoptal.engine_version
  
  # Disable Performance Insights in non-production
  performance_insights_enabled = var.environment == "production"
  
  tags = {
    Environment = var.environment
  }
}

# S3 with lifecycle policies for cost optimization
resource "aws_s3_bucket" "zoptal_assets" {
  bucket = "zoptal-assets-${var.environment}"
}

resource "aws_s3_bucket_lifecycle_configuration" "zoptal_assets" {
  bucket = aws_s3_bucket.zoptal_assets.id

  rule {
    id     = "cost_optimization"
    status = "Enabled"

    # Move to IA after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Move to Glacier after 90 days
    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    # Move to Deep Archive after 1 year
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }

    # Delete old versions after 30 days
    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    # Delete incomplete multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# CloudWatch log retention for cost control
resource "aws_cloudwatch_log_group" "eks_cluster" {
  for_each = toset(["api", "audit", "authenticator", "controllerManager", "scheduler"])
  
  name              = "/aws/eks/zoptal-cluster/${each.value}"
  retention_in_days = var.environment == "production" ? 30 : 7  # Reduce retention for cost
}
```

### Cost-Aware Auto-Scaling

```yaml
# Cost-optimized cluster autoscaler
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0
        name: cluster-autoscaler
        resources:
          limits:
            cpu: 100m
            memory: 300Mi
          requests:
            cpu: 100m
            memory: 300Mi
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste  # Cost optimization
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/zoptal-cluster
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
        - --scale-down-enabled=true
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m  # Aggressive scale-down for cost savings
        - --scale-down-utilization-threshold=0.5  # Scale down at 50% utilization
        - --max-node-provision-time=15m
        env:
        - name: AWS_REGION
          value: us-east-1

---
# Scheduled scaling for predictable workloads
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-down-evening
  namespace: kube-system
spec:
  schedule: "0 18 * * 1-5"  # 6 PM on weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - /bin/sh
            - -c
            - |
              # Scale down non-critical services
              kubectl scale deployment auth-service --replicas=1
              kubectl scale deployment project-service --replicas=1
              kubectl scale deployment ai-service --replicas=1
              # Keep critical services running
              kubectl scale deployment billing-service --replicas=2
          restartPolicy: OnFailure

---
# Scale up for business hours
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-morning
  namespace: kube-system
spec:
  schedule: "0 8 * * 1-5"  # 8 AM on weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - /bin/sh
            - -c
            - |
              # Scale up for business hours
              kubectl scale deployment auth-service --replicas=3
              kubectl scale deployment project-service --replicas=3
              kubectl scale deployment ai-service --replicas=2
              kubectl scale deployment billing-service --replicas=2
          restartPolicy: OnFailure
```

## Kubernetes Resource Management

### Resource Quotas and Limits

```yaml
# Namespace resource quotas
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: default
spec:
  hard:
    requests.cpu: "8"      # Total CPU requests
    requests.memory: 16Gi   # Total memory requests
    limits.cpu: "16"       # Total CPU limits
    limits.memory: 32Gi     # Total memory limits
    persistentvolumeclaims: "10"
    pods: "50"
    services: "20"
    secrets: "30"
    configmaps: "30"

---
# Limit ranges for cost control
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: default
spec:
  limits:
  - default:  # Default limits
      cpu: 500m
      memory: 512Mi
    defaultRequest:  # Default requests
      cpu: 100m
      memory: 128Mi
    max:  # Maximum limits
      cpu: 2000m
      memory: 2Gi
    min:  # Minimum requests
      cpu: 50m
      memory: 64Mi
    type: Container
  - default:
      storage: 10Gi
    max:
      storage: 100Gi
    min:
      storage: 1Gi
    type: PersistentVolumeClaim

---
# Cost-optimized pod priorities
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000
globalDefault: false
description: "High priority class for critical workloads"

---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: low-priority
value: 100
globalDefault: false
description: "Low priority class for batch/background workloads"

---
# Example deployment with resource optimization
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      priorityClassName: high-priority
      containers:
      - name: auth-service
        image: zoptal/auth-service:latest
        resources:
          requests:
            memory: "128Mi"  # Right-sized requests
            cpu: "100m"
          limits:
            memory: "256Mi"  # Conservative limits
            cpu: "200m"
        # Reduce startup time for faster scaling
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
      # Topology spread for cost-effective placement
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: auth-service
```

### Vertical Pod Autoscaler for Right-Sizing

```yaml
# VPA for automatic resource right-sizing
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: auth-service-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  updatePolicy:
    updateMode: "Auto"  # Automatically update resources
  resourcePolicy:
    containerPolicies:
    - containerName: auth-service
      minAllowed:
        cpu: 50m
        memory: 64Mi
      maxAllowed:
        cpu: 500m      # Limit maximum to control costs
        memory: 512Mi
      controlledResources: ["cpu", "memory"]
      # Cost optimization: Prefer memory over CPU
      controlledValues: RequestsAndLimits

---
# VPA for background services with lower limits
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: analytics-service-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: analytics-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: analytics-service
      minAllowed:
        cpu: 25m
        memory: 32Mi
      maxAllowed:
        cpu: 200m      # Lower limits for background services
        memory: 256Mi
      controlledResources: ["cpu", "memory"]
```

## Database Cost Optimization

### Aurora Serverless for Variable Workloads

```hcl
# Aurora Serverless for cost optimization
resource "aws_rds_cluster" "zoptal_serverless" {
  cluster_identifier = "zoptal-serverless"
  engine             = "aurora-postgresql"
  engine_mode        = "serverless"
  engine_version     = "13.7"
  
  database_name   = "zoptal"
  master_username = "postgres"
  master_password = random_password.db_password.result
  
  # Serverless scaling configuration
  scaling_configuration {
    auto_pause               = true
    max_capacity            = 2      # Limit max capacity for cost control
    min_capacity            = 0.5    # Start small
    seconds_until_auto_pause = 300   # Pause after 5 minutes of inactivity
    timeout_action          = "ForceApplyCapacityChange"
  }
  
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  
  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.zoptal.name
}

# Read replica for read-heavy workloads
resource "aws_rds_cluster" "zoptal_read_replica" {
  count = var.environment == "production" ? 1 : 0
  
  cluster_identifier              = "zoptal-read-replica"
  replication_source_identifier   = aws_rds_cluster.zoptal.cluster_identifier
  
  # Use smaller instances for read replicas
  
  backup_retention_period = 1  # Minimal backup for read replicas
  
  tags = {
    Purpose = "read-replica"
  }
}
```

### Database Connection Pooling

```typescript
// Optimized database connection pooling
import { Pool } from 'pg';

export class DatabaseConnectionManager {
  private pools: Map<string, Pool> = new Map();
  
  constructor() {
    this.initializePools();
  }

  private initializePools() {
    // Primary database pool (smaller for cost optimization)
    const primaryPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      min: 2,        // Reduced minimum connections
      max: 10,       // Reduced maximum connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
    });

    // Read replica pool (even smaller)
    const readPool = new Pool({
      host: process.env.DB_READ_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      min: 1,        // Minimal connections for reads
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pools.set('primary', primaryPool);
    this.pools.set('read', readPool);
  }

  // Route read queries to read replica for cost optimization
  async query(text: string, params?: any[], readOnly: boolean = false): Promise<any> {
    const poolName = readOnly && this.pools.has('read') ? 'read' : 'primary';
    const pool = this.pools.get(poolName)!;
    
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log expensive queries for optimization
      if (duration > 1000) {
        console.warn(`Slow query detected (${duration}ms):`, text);
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Graceful shutdown
  async close(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map(pool => pool.end());
    await Promise.all(closePromises);
  }
}

// Query optimization for cost reduction
export class OptimizedQueryService {
  constructor(private db: DatabaseConnectionManager) {}

  // Use pagination to reduce data transfer costs
  async findUsersWithPagination(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    // Use lightweight query for list views
    const query = `
      SELECT id, email, first_name, last_name, created_at
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    return await this.db.query(query, [limit, offset], true); // Use read replica
  }

  // Aggregate data in database to reduce network costs
  async getUserStats(userId: string) {
    const query = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        MAX(updated_at) as last_activity
      FROM projects 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    
    return await this.db.query(query, [userId], true);
  }

  // Batch operations to reduce connection overhead
  async batchUpdateProjects(updates: Array<{id: string, data: any}>) {
    const query = `
      UPDATE projects 
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        updated_at = NOW()
      WHERE id = $1
    `;
    
    // Use transaction for batch operations
    const client = await this.db.pools.get('primary')!.connect();
    try {
      await client.query('BEGIN');
      
      for (const { id, data } of updates) {
        await client.query(query, [id, data.name, data.description]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

## Monitoring and Alerting

### Cost Monitoring Dashboard

```typescript
// Cost monitoring service
export class CostMonitoringService {
  private cloudWatch: AWS.CloudWatch;
  private costExplorer: AWS.CostExplorer;

  constructor() {
    this.cloudWatch = new AWS.CloudWatch();
    this.costExplorer = new AWS.CostExplorer();
  }

  // Get current month costs
  async getCurrentMonthCosts(): Promise<CostBreakdown> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const params = {
      TimePeriod: {
        Start: startOfMonth.toISOString().split('T')[0],
        End: now.toISOString().split('T')[0],
      },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'SERVICE',
        },
      ],
    };

    const result = await this.costExplorer.getCostAndUsage(params).promise();
    return this.processCostData(result);
  }

  // Set up cost alerts
  async setupCostAlerts(): Promise<void> {
    // Daily cost alert
    await this.cloudWatch.putMetricAlarm({
      AlarmName: 'ZoptalDailyCostAlert',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'EstimatedCharges',
      Namespace: 'AWS/Billing',
      Period: 86400, // 24 hours
      Statistic: 'Maximum',
      Threshold: 100.0, // $100 daily threshold
      ActionsEnabled: true,
      AlarmActions: [
        process.env.COST_ALERT_SNS_TOPIC!,
      ],
      AlarmDescription: 'Alert when daily costs exceed $100',
      Dimensions: [
        {
          Name: 'Currency',
          Value: 'USD',
        },
      ],
    }).promise();

    // Monthly cost alert
    await this.cloudWatch.putMetricAlarm({
      AlarmName: 'ZoptalMonthlyCostAlert',
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1,
      MetricName: 'EstimatedCharges',
      Namespace: 'AWS/Billing',
      Period: 86400,
      Statistic: 'Maximum',
      Threshold: 3000.0, // $3000 monthly threshold
      ActionsEnabled: true,
      AlarmActions: [
        process.env.COST_ALERT_SNS_TOPIC!,
      ],
      AlarmDescription: 'Alert when monthly costs exceed $3000',
    }).promise();
  }

  // Cost optimization recommendations
  async getCostOptimizationRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Get EC2 rightsizing recommendations
    const rightSizingRecs = await this.costExplorer.getRightsizingRecommendation({
      Service: 'AmazonEC2',
    }).promise();

    recommendations.push(...this.processRightSizingRecommendations(rightSizingRecs));

    // Get Reserved Instance recommendations
    const riRecs = await this.costExplorer.getReservationPurchaseRecommendation({
      Service: 'AmazonEC2',
    }).promise();

    recommendations.push(...this.processRIRecommendations(riRecs));

    return recommendations;
  }

  // Resource utilization monitoring
  async monitorResourceUtilization(): Promise<UtilizationReport> {
    const ec2Instances = await this.getEC2Utilization();
    const rdsInstances = await this.getRDSUtilization();
    const eksNodes = await this.getEKSUtilization();

    return {
      ec2: ec2Instances,
      rds: rdsInstances,
      eks: eksNodes,
      timestamp: new Date(),
    };
  }

  private async getEC2Utilization(): Promise<any[]> {
    // Get CPU utilization for all EC2 instances
    const params = {
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      EndTime: new Date(),
      MetricName: 'CPUUtilization',
      Namespace: 'AWS/EC2',
      Period: 3600, // 1 hour
      Statistics: ['Average'],
    };

    const result = await this.cloudWatch.getMetricStatistics(params).promise();
    return result.Datapoints || [];
  }

  // Automated cost optimization actions
  async performAutomatedOptimizations(): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    // Stop idle instances
    const idleInstances = await this.findIdleInstances();
    for (const instance of idleInstances) {
      await this.stopIdleInstance(instance.InstanceId);
      results.push({
        action: 'stop_idle_instance',
        resource: instance.InstanceId,
        estimatedSavings: instance.EstimatedSavings,
      });
    }

    // Scale down over-provisioned resources
    const overProvisionedResources = await this.findOverProvisionedResources();
    for (const resource of overProvisionedResources) {
      await this.scaleDownResource(resource);
      results.push({
        action: 'scale_down',
        resource: resource.resourceId,
        estimatedSavings: resource.estimatedSavings,
      });
    }

    return results;
  }
}

interface CostBreakdown {
  totalCost: number;
  serviceBreakdown: Array<{
    service: string;
    cost: number;
    percentage: number;
  }>;
  trends: {
    dailyAverage: number;
    weeklyTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

interface Recommendation {
  type: 'rightsizing' | 'reserved_instance' | 'spot_instance' | 'storage_optimization';
  resource: string;
  currentCost: number;
  projectedSavings: number;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

interface UtilizationReport {
  ec2: any[];
  rds: any[];
  eks: any[];
  timestamp: Date;
}

interface OptimizationResult {
  action: string;
  resource: string;
  estimatedSavings: number;
}
```

### Cost Alerting Configuration

```yaml
# CloudWatch cost alerts
apiVersion: v1
kind: ConfigMap
metadata:
  name: cost-alert-config
data:
  cost-thresholds.json: |
    {
      "daily_threshold": 100,
      "weekly_threshold": 500,
      "monthly_threshold": 3000,
      "service_thresholds": {
        "EC2": 1200,
        "RDS": 600,
        "EKS": 400,
        "S3": 300,
        "CloudWatch": 150
      },
      "alert_channels": {
        "slack": "#cost-alerts",
        "email": "ops@zoptal.com",
        "pagerduty": "cost-escalation"
      }
    }

---
# Cost monitoring deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cost-monitor
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cost-monitor
  template:
    metadata:
      labels:
        app: cost-monitor
    spec:
      containers:
      - name: cost-monitor
        image: zoptal/cost-monitor:latest
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        env:
        - name: AWS_REGION
          value: "us-east-1"
        - name: COST_ALERT_SNS_TOPIC
          valueFrom:
            secretKeyRef:
              name: cost-monitor-secrets
              key: sns-topic-arn
        - name: SLACK_WEBHOOK_URL
          valueFrom:
            secretKeyRef:
              name: cost-monitor-secrets
              key: slack-webhook

---
# Cost monitoring cronjob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-cost-report
spec:
  schedule: "0 9 * * *"  # 9 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cost-reporter
            image: zoptal/cost-monitor:latest
            command:
            - /bin/sh
            - -c
            - |
              echo "Generating daily cost report..."
              node scripts/generate-cost-report.js
              echo "Cost report sent to stakeholders"
          restartPolicy: OnFailure
```

## Reserved Instances and Savings Plans

### Reserved Instance Strategy

```bash
#!/bin/bash
# Reserved Instance optimization script

echo "Analyzing Reserved Instance opportunities..."

# Get current EC2 usage patterns
aws ce get-usage-forecast \
  --time-period Start=2024-01-01,End=2024-12-31 \
  --metric BlendedCost \
  --granularity MONTHLY \
  --filter-dimensions Service=AmazonEC2

# Get RI recommendations
aws ce get-reservation-purchase-recommendation \
  --service AmazonEC2 \
  --account-scope PAYER \
  --lookback-period-in-days 60 \
  --term-in-years 1 \
  --payment-option NoUpfront

# Calculate potential savings
echo "Calculating potential RI savings..."

# Example RI purchase strategy:
# - 50% No Upfront 1-year terms for flexibility
# - 25% Partial Upfront 1-year terms for additional savings
# - 25% All Upfront 3-year terms for maximum savings on stable workloads

# Purchase recommendations (example)
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id "ri-1234567890abcdef0" \
  --instance-count 2 \
  --dry-run  # Remove for actual purchase

echo "RI analysis complete. Review recommendations before purchasing."
```

### Savings Plans Configuration

```hcl
# Terraform configuration for Savings Plans
resource "aws_savingsplans_plan" "compute_savings_plan" {
  savings_plan_type = "Compute"
  term             = 1
  payment_option   = "No Upfront"
  commitment       = "10.00"  # $10/hour commitment
  
  tags = {
    Environment = "production"
    Project     = "zoptal"
    Purpose     = "cost-optimization"
  }
}

# EC2 Instance Savings Plan for specific instance families
resource "aws_savingsplans_plan" "ec2_instance_savings_plan" {
  savings_plan_type = "EC2Instance"
  term             = 3
  payment_option   = "All Upfront"
  commitment       = "5.00"   # $5/hour commitment
  
  tags = {
    Environment = "production"
    Project     = "zoptal"
    InstanceFamily = "t3"
  }
}
```

## Storage Optimization

### S3 Cost Optimization

```typescript
// S3 storage optimization service
export class S3OptimizationService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3();
  }

  // Analyze storage usage and costs
  async analyzeStorageUsage(bucketName: string): Promise<StorageAnalysis> {
    const objects = await this.s3.listObjectsV2({ Bucket: bucketName }).promise();
    
    const analysis: StorageAnalysis = {
      totalObjects: objects.Contents?.length || 0,
      totalSize: 0,
      storageClasses: new Map(),
      ageDistribution: new Map(),
      duplicates: [],
    };

    for (const object of objects.Contents || []) {
      analysis.totalSize += object.Size || 0;
      
      // Track storage classes
      const storageClass = object.StorageClass || 'STANDARD';
      analysis.storageClasses.set(
        storageClass,
        (analysis.storageClasses.get(storageClass) || 0) + (object.Size || 0)
      );

      // Track age distribution
      const ageInDays = Math.floor(
        (Date.now() - (object.LastModified?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );
      const ageRange = this.getAgeRange(ageInDays);
      analysis.ageDistribution.set(
        ageRange,
        (analysis.ageDistribution.get(ageRange) || 0) + (object.Size || 0)
      );
    }

    return analysis;
  }

  // Implement intelligent tiering
  async implementIntelligentTiering(bucketName: string): Promise<void> {
    const lifecycleConfig = {
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'IntelligentTiering',
            Status: 'Enabled',
            Filter: {},
            Transitions: [
              {
                Days: 0,
                StorageClass: 'INTELLIGENT_TIERING',
              },
            ],
          },
          {
            ID: 'StandardIA',
            Status: 'Enabled',
            Filter: {
              Prefix: 'backups/',
            },
            Transitions: [
              {
                Days: 30,
                StorageClass: 'STANDARD_IA',
              },
              {
                Days: 90,
                StorageClass: 'GLACIER',
              },
              {
                Days: 365,
                StorageClass: 'DEEP_ARCHIVE',
              },
            ],
          },
        ],
      },
    };

    await this.s3.putBucketLifecycleConfiguration(lifecycleConfig).promise();
  }

  // Find and remove duplicate files
  async findDuplicateFiles(bucketName: string): Promise<DuplicateFile[]> {
    const objects = await this.s3.listObjectsV2({ Bucket: bucketName }).promise();
    const hashMap = new Map<string, string[]>();
    const duplicates: DuplicateFile[] = [];

    for (const object of objects.Contents || []) {
      // Generate content hash (simplified - in reality, use ETag or calculate MD5)
      const hash = object.ETag?.replace(/"/g, '') || '';
      
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash)!.push(object.Key || '');
    }

    // Find duplicates
    for (const [hash, keys] of hashMap.entries()) {
      if (keys.length > 1) {
        duplicates.push({
          hash,
          files: keys,
          size: await this.getObjectSize(bucketName, keys[0]),
        });
      }
    }

    return duplicates;
  }

  // Optimize multipart upload settings
  async optimizeMultipartUploads(bucketName: string): Promise<void> {
    // Configure multipart upload for large files
    const bucketPolicy = {
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'MultipartUploadCleanup',
            Status: 'Enabled',
            Filter: {},
            AbortIncompleteMultipartUpload: {
              DaysAfterInitiation: 7, // Clean up incomplete uploads after 7 days
            },
          },
        ],
      },
    };

    await this.s3.putBucketLifecycleConfiguration(bucketPolicy).promise();
  }

  // Calculate storage cost optimization savings
  async calculateStorageSavings(bucketName: string): Promise<SavingsCalculation> {
    const analysis = await this.analyzeStorageUsage(bucketName);
    
    // S3 pricing (simplified - actual pricing varies by region)
    const pricing = {
      STANDARD: 0.023,        // per GB/month
      STANDARD_IA: 0.0125,    // per GB/month
      GLACIER: 0.004,         // per GB/month
      DEEP_ARCHIVE: 0.00099,  // per GB/month
      INTELLIGENT_TIERING: 0.0125, // per GB/month + monitoring cost
    };

    const currentCost = Array.from(analysis.storageClasses.entries())
      .reduce((total, [storageClass, size]) => {
        const pricePerGB = pricing[storageClass as keyof typeof pricing] || pricing.STANDARD;
        return total + (size / (1024 ** 3) * pricePerGB);
      }, 0);

    // Calculate optimized cost with intelligent tiering
    const optimizedCost = (analysis.totalSize / (1024 ** 3)) * pricing.INTELLIGENT_TIERING;
    
    return {
      currentMonthlyCost: currentCost,
      optimizedMonthlyCost: optimizedCost,
      monthlySavings: currentCost - optimizedCost,
      annualSavings: (currentCost - optimizedCost) * 12,
      savingsPercentage: ((currentCost - optimizedCost) / currentCost) * 100,
    };
  }

  private getAgeRange(days: number): string {
    if (days <= 30) return '0-30 days';
    if (days <= 90) return '31-90 days';
    if (days <= 365) return '91-365 days';
    return '365+ days';
  }

  private async getObjectSize(bucketName: string, key: string): Promise<number> {
    try {
      const metadata = await this.s3.headObject({ Bucket: bucketName, Key: key }).promise();
      return metadata.ContentLength || 0;
    } catch (error) {
      return 0;
    }
  }
}

interface StorageAnalysis {
  totalObjects: number;
  totalSize: number;
  storageClasses: Map<string, number>;
  ageDistribution: Map<string, number>;
  duplicates: DuplicateFile[];
}

interface DuplicateFile {
  hash: string;
  files: string[];
  size: number;
}

interface SavingsCalculation {
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercentage: number;
}
```

## Network Cost Optimization

### CDN and Data Transfer Optimization

```hcl
# Cost-optimized CloudFront configuration
resource "aws_cloudfront_distribution" "zoptal_cdn" {
  origin {
    domain_name = aws_s3_bucket.zoptal_assets.bucket_regional_domain_name
    origin_id   = "S3-zoptal-assets"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  default_root_object = "index.html"
  
  # Cost optimization: Use appropriate price class
  price_class = "PriceClass_100"  # US, Canada, Europe only

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-zoptal-assets"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    
    # Aggressive caching for cost optimization
    min_ttl     = 86400    # 1 day
    default_ttl = 604800   # 1 week
    max_ttl     = 31536000 # 1 year
    
    compress = true  # Enable compression to reduce data transfer
  }

  # Separate cache behavior for API calls (no caching)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-zoptal-assets"

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US", "CA", "GB", "DE", "FR", "AU", "IN"]  # Limit to target markets
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.zoptal_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
    Purpose     = "cost-optimization"
  }
}

# VPC endpoints to reduce NAT gateway costs
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.s3"
  
  tags = {
    Name = "s3-endpoint"
  }
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.dynamodb"
  
  tags = {
    Name = "dynamodb-endpoint"
  }
}

# Use smaller NAT instances instead of NAT gateways for dev
resource "aws_instance" "nat_instance" {
  count = var.environment == "production" ? 0 : length(aws_subnet.public)
  
  ami                         = "ami-00a9d4a05375b2763"  # NAT instance AMI
  instance_type              = "t3.nano"  # Smallest instance for cost savings
  key_name                   = aws_key_pair.nat.key_name
  vpc_security_group_ids     = [aws_security_group.nat.id]
  subnet_id                  = aws_subnet.public[count.index].id
  associate_public_ip_address = true
  source_dest_check          = false

  tags = {
    Name = "nat-instance-${count.index + 1}"
    Environment = var.environment
  }
}
```

## Cost Allocation and Chargeback

### Resource Tagging Strategy

```typescript
// Automated resource tagging for cost allocation
export class ResourceTaggingService {
  private ec2: AWS.EC2;
  private rds: AWS.RDS;
  private s3: AWS.S3;

  constructor() {
    this.ec2 = new AWS.EC2();
    this.rds = new AWS.RDS();
    this.s3 = new AWS.S3();
  }

  // Standard tagging schema
  private getStandardTags(resourceType: string, environment: string, team: string): AWS.Tag[] {
    return [
      { Key: 'Project', Value: 'zoptal' },
      { Key: 'Environment', Value: environment },
      { Key: 'Team', Value: team },
      { Key: 'ResourceType', Value: resourceType },
      { Key: 'CostCenter', Value: this.getCostCenter(team) },
      { Key: 'CreatedBy', Value: 'automation' },
      { Key: 'CreatedDate', Value: new Date().toISOString().split('T')[0] },
    ];
  }

  // Tag all EC2 instances
  async tagEC2Instances(): Promise<void> {
    const instances = await this.ec2.describeInstances().promise();
    
    for (const reservation of instances.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        if (instance.State?.Name === 'running') {
          const environment = this.getEnvironmentFromName(instance.Tags);
          const team = this.getTeamFromName(instance.Tags);
          
          const tags = this.getStandardTags('EC2Instance', environment, team);
          
          await this.ec2.createTags({
            Resources: [instance.InstanceId!],
            Tags: tags,
          }).promise();
        }
      }
    }
  }

  // Tag RDS instances
  async tagRDSInstances(): Promise<void> {
    const clusters = await this.rds.describeClusters().promise();
    
    for (const cluster of clusters.Clusters || []) {
      const environment = this.getEnvironmentFromClusterName(cluster.DBClusterIdentifier || '');
      const team = 'platform';
      
      const tags = this.getStandardTags('RDSCluster', environment, team);
      
      await this.rds.addTagsToResource({
        ResourceName: cluster.DBClusterArn!,
        Tags: tags.map(tag => ({ Key: tag.Key, Value: tag.Value })),
      }).promise();
    }
  }

  // Generate cost allocation report
  async generateCostAllocationReport(startDate: Date, endDate: Date): Promise<CostAllocationReport> {
    const costExplorer = new AWS.CostExplorer();
    
    const params = {
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0],
      },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        { Type: 'TAG', Key: 'Team' },
        { Type: 'TAG', Key: 'Environment' },
        { Type: 'DIMENSION', Key: 'SERVICE' },
      ],
    };

    const result = await costExplorer.getCostAndUsage(params).promise();
    return this.processCostAllocationData(result);
  }

  // Cost chargeback calculation
  async calculateTeamChargebacks(period: 'monthly' | 'quarterly'): Promise<ChargebackReport[]> {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    const costData = await this.generateCostAllocationReport(startDate, endDate);
    const chargebacks: ChargebackReport[] = [];

    // Calculate costs by team
    for (const team of ['platform', 'frontend', 'ai', 'data']) {
      const teamCosts = this.calculateTeamCosts(costData, team);
      
      chargebacks.push({
        team,
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalCost: teamCosts.total,
        breakdown: teamCosts.breakdown,
        recommendations: await this.getTeamCostRecommendations(team, teamCosts),
      });
    }

    return chargebacks;
  }

  private getCostCenter(team: string): string {
    const costCenters: Record<string, string> = {
      platform: 'CC-001',
      frontend: 'CC-002',
      ai: 'CC-003',
      data: 'CC-004',
    };
    return costCenters[team] || 'CC-000';
  }

  private getEnvironmentFromName(tags?: AWS.Tag[]): string {
    const envTag = tags?.find(tag => tag.Key === 'Environment');
    return envTag?.Value || 'unknown';
  }

  private getTeamFromName(tags?: AWS.Tag[]): string {
    const teamTag = tags?.find(tag => tag.Key === 'Team');
    return teamTag?.Value || 'unknown';
  }

  private getEnvironmentFromClusterName(name: string): string {
    if (name.includes('prod')) return 'production';
    if (name.includes('staging')) return 'staging';
    if (name.includes('dev')) return 'development';
    return 'unknown';
  }
}

interface CostAllocationReport {
  totalCost: number;
  breakdown: Array<{
    team: string;
    environment: string;
    service: string;
    cost: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

interface ChargebackReport {
  team: string;
  period: string;
  totalCost: number;
  breakdown: Array<{
    service: string;
    environment: string;
    cost: number;
  }>;
  recommendations: string[];
}
```

## Automated Cost Controls

### Cost Control Automation

```yaml
# Cost control automation
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cost-optimizer
spec:
  schedule: "0 */4 * * *"  # Every 4 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cost-optimizer
            image: zoptal/cost-optimizer:latest
            env:
            - name: AWS_REGION
              value: us-east-1
            - name: COST_THRESHOLD_DAILY
              value: "100"
            - name: COST_THRESHOLD_MONTHLY
              value: "3000"
            command:
            - /bin/sh
            - -c
            - |
              echo "Starting cost optimization checks..."
              
              # Check current daily costs
              DAILY_COST=$(aws ce get-cost-and-usage \
                --time-period Start=$(date -d '1 day ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
                --granularity DAILY \
                --metrics BlendedCost \
                --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
                --output text)
              
              echo "Daily cost: $DAILY_COST"
              
              # Trigger optimization if threshold exceeded
              if (( $(echo "$DAILY_COST > $COST_THRESHOLD_DAILY" | bc -l) )); then
                echo "Daily cost threshold exceeded. Triggering optimizations..."
                
                # Scale down non-critical services
                kubectl scale deployment analytics-service --replicas=1
                kubectl scale deployment notification-service --replicas=1
                
                # Stop development instances if running
                aws ec2 describe-instances \
                  --filters "Name=tag:Environment,Values=development" "Name=instance-state-name,Values=running" \
                  --query 'Reservations[].Instances[].InstanceId' \
                  --output text | xargs -r aws ec2 stop-instances --instance-ids
                
                # Send cost alert
                curl -X POST "$SLACK_WEBHOOK_URL" \
                  -H "Content-Type: application/json" \
                  -d "{\"text\":\"⚠️ Daily cost threshold exceeded: \$$DAILY_COST. Automated optimizations triggered.\"}"
              fi
              
              echo "Cost optimization check complete"
          restartPolicy: OnFailure

---
# Emergency cost circuit breaker
apiVersion: batch/v1
kind: Job
metadata:
  name: emergency-cost-breaker
spec:
  template:
    spec:
      containers:
      - name: cost-breaker
        image: zoptal/cost-optimizer:latest
        env:
        - name: EMERGENCY_COST_THRESHOLD
          value: "500"  # $500 daily emergency threshold
        command:
        - /bin/sh
        - -c
        - |
          echo "Checking for emergency cost situation..."
          
          CURRENT_COST=$(aws ce get-cost-and-usage \
            --time-period Start=$(date +%Y-%m-%d),End=$(date -d '+1 day' +%Y-%m-%d) \
            --granularity DAILY \
            --metrics BlendedCost \
            --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
            --output text)
          
          if (( $(echo "$CURRENT_COST > $EMERGENCY_COST_THRESHOLD" | bc -l) )); then
            echo "🚨 EMERGENCY: Cost threshold exceeded ($CURRENT_COST). Implementing emergency measures..."
            
            # Emergency actions:
            # 1. Scale down all non-critical services to minimum
            kubectl scale deployment ai-service --replicas=1
            kubectl scale deployment analytics-service --replicas=1
            kubectl scale deployment notification-service --replicas=1
            
            # 2. Switch to smaller instance types (if possible)
            # 3. Stop all development and staging environments
            
            # 4. Send emergency alert
            curl -X POST "$SLACK_WEBHOOK_URL" \
              -H "Content-Type: application/json" \
              -d "{\"text\":\"🚨 EMERGENCY COST ALERT: Daily costs reached \$$CURRENT_COST! Emergency cost controls activated. Contact ops team immediately.\"}"
            
            # 5. Create incident ticket
            curl -X POST "$INCIDENT_WEBHOOK_URL" \
              -H "Content-Type: application/json" \
              -d "{\"title\":\"Emergency Cost Threshold Exceeded\",\"severity\":\"high\",\"description\":\"Daily costs reached \$$CURRENT_COST, exceeding emergency threshold of \$$EMERGENCY_COST_THRESHOLD\"}"
          fi
      restartPolicy: Never
```

### Cost Optimization Checklist

```bash
#!/bin/bash
# Daily cost optimization checklist

echo "🔍 Daily Cost Optimization Check - $(date)"
echo "============================================"

# 1. Check unused resources
echo "1. Checking for unused resources..."

# Find stopped EC2 instances
STOPPED_INSTANCES=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=stopped" \
  --query 'Reservations[].Instances[].InstanceId' \
  --output text)

if [ -n "$STOPPED_INSTANCES" ]; then
  echo "  ⚠️  Found stopped instances: $STOPPED_INSTANCES"
  echo "     Consider terminating if no longer needed"
else
  echo "  ✅ No stopped instances found"
fi

# Find unused EBS volumes
UNUSED_VOLUMES=$(aws ec2 describe-volumes \
  --filters "Name=status,Values=available" \
  --query 'Volumes[].VolumeId' \
  --output text)

if [ -n "$UNUSED_VOLUMES" ]; then
  echo "  ⚠️  Found unused volumes: $UNUSED_VOLUMES"
  echo "     Consider deleting if no longer needed"
else
  echo "  ✅ No unused volumes found"
fi

# 2. Check resource utilization
echo "2. Checking resource utilization..."

# Get CPU utilization for last 24 hours
CURRENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)
YESTERDAY=$(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S)

LOW_CPU_INSTANCES=$(aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --start-time "$YESTERDAY" \
  --end-time "$CURRENT_TIME" \
  --period 3600 \
  --statistics Average \
  --query 'Datapoints[?Average<`10`]' \
  --output text)

if [ -n "$LOW_CPU_INSTANCES" ]; then
  echo "  ⚠️  Found instances with low CPU utilization"
  echo "     Consider downsizing or using spot instances"
else
  echo "  ✅ CPU utilization looks healthy"
fi

# 3. Check Kubernetes resource usage
echo "3. Checking Kubernetes resource usage..."

# Get pod resource usage
kubectl top pods --all-namespaces --sort-by=cpu | head -10

# Check for over-provisioned pods
OVER_PROVISIONED=$(kubectl get pods --all-namespaces -o json | \
  jq '.items[] | select(.spec.containers[0].resources.requests.cpu != null) | 
      select(.spec.containers[0].resources.limits.cpu != null) | 
      select((.spec.containers[0].resources.limits.cpu | rtrimstr("m") | tonumber) > 
             (.spec.containers[0].resources.requests.cpu | rtrimstr("m") | tonumber) * 5)')

if [ -n "$OVER_PROVISIONED" ]; then
  echo "  ⚠️  Found over-provisioned pods"
  echo "     Consider adjusting resource limits"
else
  echo "  ✅ Pod resource allocation looks optimal"
fi

# 4. Check storage usage
echo "4. Checking storage usage..."

# Check S3 bucket sizes
aws s3 ls --summarize --recursive s3://zoptal-assets/ | tail -2

# Check for old snapshots
OLD_SNAPSHOTS=$(aws ec2 describe-snapshots \
  --owner-ids self \
  --query 'Snapshots[?StartTime<=`'$(date -d '30 days ago' --iso-8601)'`].SnapshotId' \
  --output text)

if [ -n "$OLD_SNAPSHOTS" ]; then
  echo "  ⚠️  Found old snapshots (>30 days): $OLD_SNAPSHOTS"
  echo "     Consider deleting if no longer needed"
else
  echo "  ✅ No old snapshots found"
fi

# 5. Generate cost report
echo "5. Generating cost summary..."

YESTERDAY_COST=$(aws ce get-cost-and-usage \
  --time-period Start=$(date -d '1 day ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
  --output text)

MONTH_TO_DATE_COST=$(aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
  --output text)

echo "  💰 Yesterday's cost: \$$YESTERDAY_COST"
echo "  💰 Month-to-date cost: \$$MONTH_TO_DATE_COST"

# 6. Recommendations
echo "6. Cost optimization recommendations:"
echo "  📊 Review Grafana cost dashboard: https://grafana.zoptal.com/d/cost-overview"
echo "  🏷️  Ensure all resources are properly tagged"
echo "  💾 Implement S3 lifecycle policies"
echo "  🔄 Consider Reserved Instances for stable workloads"
echo "  📍 Use Spot Instances for batch processing"
echo "  📈 Monitor trends and set up alerts"

echo ""
echo "✅ Cost optimization check complete!"
echo "============================================"
```

This comprehensive cost optimization guide provides strategies and tools to minimize cloud spending while maintaining performance and reliability. Implement these practices gradually and monitor their impact on both costs and system performance.

For additional cost optimization resources:
- [AWS Cost Optimization Hub](https://aws.amazon.com/aws-cost-management/)
- [FinOps Foundation](https://www.finops.org/)
- [Cloud Cost Optimization Best Practices](https://docs.aws.amazon.com/whitepapers/latest/cost-optimization-pillars/cost-optimization-pillars.html)
- Contact cost optimization team: finops@zoptal.com