import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card';
import { Button } from '../button/button';
import { Input } from '../form/form';
import { Label } from '../label/label';
import { Badge } from '../badge/badge';
import { Separator } from '../separator/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs';
import { Alert, AlertDescription } from '../alert/alert';
import { Progress } from '../progress/progress';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  PlayCircle,
  StopCircle,
  FastForward,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CanaryMetrics {
  successRate: number;
  errorRate: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  requestRate: number;
  timestamp: string;
}

export interface CanaryDeployment {
  id: string;
  service: string;
  version: string;
  status: 'initializing' | 'analyzing' | 'promoting' | 'promoted' | 'rolled_back' | 'failed';
  currentPercentage: number;
  targetPercentage: number;
  increment: number;
  autoPromote: boolean;
  thresholds: {
    errorRate: number;
    latency: number;
    successRate: number;
  };
  createdAt: string;
  completedAt?: string;
  metrics: CanaryMetrics[];
  phases: Array<{
    phase: string;
    status: string;
    percentage?: number;
    timestamp: string;
  }>;
}

export interface CanaryDashboardProps {
  onStartCanary?: (config: any) => Promise<void>;
  onPromoteCanary?: (canaryId: string) => Promise<void>;
  onRollbackCanary?: (canaryId: string) => Promise<void>;
  onUpdateTraffic?: (canaryId: string, percentage: number) => Promise<void>;
  className?: string;
}

export function CanaryDashboard({
  onStartCanary,
  onPromoteCanary,
  onRollbackCanary,
  onUpdateTraffic,
  className
}: CanaryDashboardProps) {
  const [canaries, setCanaries] = useState<CanaryDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [version, setVersion] = useState('');
  const [initialPercentage, setInitialPercentage] = useState(10);
  const [increment, setIncrement] = useState(20);
  const [autoPromote, setAutoPromote] = useState(false);
  const [successThreshold, setSuccessThreshold] = useState(99.0);
  const [errorThreshold, setErrorThreshold] = useState(1.0);
  const [latencyThreshold, setLatencyThreshold] = useState(500);

  // Fetch canary deployments
  const fetchCanaries = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API call
      const response = await fetch('/api/canaries');
      if (response.ok) {
        const data = await response.json();
        setCanaries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching canaries:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCanaries();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCanaries, 30000);
    return () => clearInterval(interval);
  }, [fetchCanaries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCanaries();
  };

  const handleStartCanary = async () => {
    if (!serviceName.trim() || !version.trim() || !onStartCanary) return;

    try {
      await onStartCanary({
        service: serviceName.trim(),
        version: version.trim(),
        initialPercentage,
        increment,
        autoPromote,
        thresholds: {
          successRate: successThreshold,
          errorRate: errorThreshold,
          latency: latencyThreshold
        }
      });
      
      // Reset form
      setServiceName('');
      setVersion('');
      
      await fetchCanaries();
    } catch (error) {
      console.error('Error starting canary:', error);
    }
  };

  const getStatusColor = (status: CanaryDeployment['status']) => {
    switch (status) {
      case 'promoted': return 'success';
      case 'rolled_back': return 'destructive';
      case 'failed': return 'destructive';
      case 'analyzing': return 'default';
      case 'promoting': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: CanaryDeployment['status']) => {
    switch (status) {
      case 'promoted': return <CheckCircle className="h-4 w-4" />;
      case 'rolled_back': return <XCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'analyzing': return <Activity className="h-4 w-4" />;
      case 'promoting': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  const getLatestMetrics = (canary: CanaryDeployment): CanaryMetrics | null => {
    return canary.metrics.length > 0 ? canary.metrics[canary.metrics.length - 1] : null;
  };

  const getMetricTrend = (canary: CanaryDeployment, metric: keyof CanaryMetrics): 'up' | 'down' | 'stable' => {
    if (canary.metrics.length < 2) return 'stable';
    
    const latest = canary.metrics[canary.metrics.length - 1];
    const previous = canary.metrics[canary.metrics.length - 2];
    
    const latestValue = latest[metric] as number;
    const previousValue = previous[metric] as number;
    
    if (latestValue > previousValue * 1.05) return 'up';
    if (latestValue < previousValue * 0.95) return 'down';
    return 'stable';
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Canary Deployments</h1>
          <p className="text-muted-foreground">
            Manage progressive rollouts with automated analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Active Canaries Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Canaries</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canaries.filter(c => ['analyzing', 'promoting'].includes(c.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoted Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canaries.filter(c => 
                c.status === 'promoted' && 
                new Date(c.completedAt || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rollbacks</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canaries.filter(c => c.status === 'rolled_back').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total rollbacks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {canaries.length > 0 
                ? Math.round((canaries.filter(c => c.status === 'promoted').length / canaries.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Promotion success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deployments</TabsTrigger>
          <TabsTrigger value="history">Deployment History</TabsTrigger>
          <TabsTrigger value="start">Start New Canary</TabsTrigger>
        </TabsList>

        {/* Active Deployments */}
        <TabsContent value="active" className="space-y-4">
          {canaries.filter(c => ['analyzing', 'promoting', 'initializing'].includes(c.status)).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active canary deployments</p>
              </CardContent>
            </Card>
          ) : (
            canaries
              .filter(c => ['analyzing', 'promoting', 'initializing'].includes(c.status))
              .map((canary) => {
                const latestMetrics = getLatestMetrics(canary);
                return (
                  <Card key={canary.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {getStatusIcon(canary.status)}
                              {canary.service}:{canary.version}
                            </CardTitle>
                            <CardDescription>
                              Started {formatDuration(canary.createdAt)} ago
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(canary.status) as any}>
                            {canary.status}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{canary.currentPercentage}%</div>
                            <div className="text-xs text-muted-foreground">traffic</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Traffic Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Traffic Progress</span>
                          <span>{canary.currentPercentage}% / 100%</span>
                        </div>
                        <Progress value={canary.currentPercentage} className="h-2" />
                      </div>

                      {/* Current Metrics */}
                      {latestMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="text-lg font-bold text-green-600">
                                {latestMetrics.successRate.toFixed(1)}%
                              </div>
                              {getMetricTrend(canary, 'successRate') === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                              {getMetricTrend(canary, 'successRate') === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                            </div>
                            <div className="text-xs text-muted-foreground">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="text-lg font-bold text-red-600">
                                {latestMetrics.errorRate.toFixed(2)}%
                              </div>
                              {getMetricTrend(canary, 'errorRate') === 'up' && <TrendingUp className="h-3 w-3 text-red-600" />}
                              {getMetricTrend(canary, 'errorRate') === 'down' && <TrendingDown className="h-3 w-3 text-green-600" />}
                            </div>
                            <div className="text-xs text-muted-foreground">Error Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="text-lg font-bold">
                                {latestMetrics.latencyP95.toFixed(0)}ms
                              </div>
                              {getMetricTrend(canary, 'latencyP95') === 'up' && <TrendingUp className="h-3 w-3 text-red-600" />}
                              {getMetricTrend(canary, 'latencyP95') === 'down' && <TrendingDown className="h-3 w-3 text-green-600" />}
                            </div>
                            <div className="text-xs text-muted-foreground">P95 Latency</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {latestMetrics.requestRate.toFixed(1)}/s
                            </div>
                            <div className="text-xs text-muted-foreground">Request Rate</div>
                          </div>
                        </div>
                      )}

                      {/* Threshold Status */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Threshold Status</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            {latestMetrics && latestMetrics.successRate >= canary.thresholds.successRate ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Success ≥{canary.thresholds.successRate}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {latestMetrics && latestMetrics.errorRate <= canary.thresholds.errorRate ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>Errors ≤{canary.thresholds.errorRate}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {latestMetrics && latestMetrics.latencyP95 <= canary.thresholds.latency ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span>P95 ≤{canary.thresholds.latency}ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPromoteCanary?.(canary.id)}
                          disabled={canary.status !== 'analyzing'}
                        >
                          <FastForward className="h-4 w-4 mr-2" />
                          Promote
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRollbackCanary?.(canary.id)}
                          disabled={!['analyzing', 'promoting'].includes(canary.status)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rollback
                        </Button>
                        {!canary.autoPromote && (
                          <div className="ml-auto">
                            <Badge variant="secondary">Manual</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        {/* Deployment History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>
                History of completed canary deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canaries
                  .filter(c => ['promoted', 'rolled_back', 'failed'].includes(c.status))
                  .slice(0, 10)
                  .map((canary) => (
                    <div key={canary.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(canary.status)}
                        <div>
                          <div className="text-sm font-medium">
                            {canary.service}:{canary.version}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDuration(canary.createdAt, canary.completedAt)} duration
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(canary.status) as any}>
                          {canary.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(canary.completedAt || canary.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                {canaries.filter(c => ['promoted', 'rolled_back', 'failed'].includes(c.status)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No deployment history yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Start New Canary */}
        <TabsContent value="start" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Start New Canary Deployment
              </CardTitle>
              <CardDescription>
                Configure and launch a new canary deployment with automated analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input
                    id="service-name"
                    placeholder="auth-service"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    placeholder="v1.2.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
              </div>

              {/* Traffic Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Traffic Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initial-percentage">Initial Traffic %</Label>
                    <Input
                      id="initial-percentage"
                      type="number"
                      min="1"
                      max="50"
                      value={initialPercentage}
                      onChange={(e) => setInitialPercentage(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="increment">Increment %</Label>
                    <Input
                      id="increment"
                      type="number"
                      min="5"
                      max="50"
                      value={increment}
                      onChange={(e) => setIncrement(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-promote</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-promote"
                        checked={autoPromote}
                        onChange={(e) => setAutoPromote(e.target.checked)}
                      />
                      <Label htmlFor="auto-promote" className="text-sm">
                        Enable automatic promotion
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threshold Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Success Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="success-threshold">Success Rate %</Label>
                    <Input
                      id="success-threshold"
                      type="number"
                      min="90"
                      max="100"
                      step="0.1"
                      value={successThreshold}
                      onChange={(e) => setSuccessThreshold(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="error-threshold">Max Error Rate %</Label>
                    <Input
                      id="error-threshold"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={errorThreshold}
                      onChange={(e) => setErrorThreshold(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latency-threshold">Max P95 Latency (ms)</Label>
                    <Input
                      id="latency-threshold"
                      type="number"
                      min="100"
                      max="5000"
                      value={latencyThreshold}
                      onChange={(e) => setLatencyThreshold(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The canary will be automatically rolled back if any threshold is exceeded.
                  Monitor the deployment carefully and be ready to intervene if needed.
                </AlertDescription>
              </Alert>

              {/* Start Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleStartCanary}
                  disabled={!serviceName.trim() || !version.trim()}
                  className="min-w-32"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Canary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}