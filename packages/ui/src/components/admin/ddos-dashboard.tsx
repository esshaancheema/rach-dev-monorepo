import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card';
import { Button } from '../button/button';
import { Input } from '../form/form';
import { Label } from '../label/label';
import { Badge } from '../badge/badge';
import { Separator } from '../separator/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs';
import { Alert, AlertDescription } from '../alert/alert';
import {
  Shield,
  AlertTriangle,
  Activity,
  Globe,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  Zap,
  TrendingUp,
  Clock,
  Users,
  Server
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DDoSStatistics {
  local: {
    blockedIPs: number;
    whitelistedIPs: number;
    activeBlocks: number;
    recentViolations: number;
    rateLimitHits: number;
  };
  cloudflare: {
    securityLevel: string;
    botFightMode: string;
    analytics: {
      requests: number;
      threats: number;
      bandwidth: number;
    };
  };
  combined: {
    totalBlockedIPs: number;
    activeProtection: boolean;
    lastUpdated: string;
  };
}

export interface SecurityEvent {
  id: string;
  type: string;
  source: 'local' | 'cloudflare';
  ip: string;
  timestamp: string;
  details: string;
  action: string;
}

export interface DDoSDashboardProps {
  onBlockIP?: (ip: string, reason: string, duration: number, level: string) => Promise<void>;
  onUnblockIP?: (ip: string, level: string) => Promise<void>;
  onAddToWhitelist?: (ip: string, reason: string) => Promise<void>;
  onRemoveFromWhitelist?: (ip: string) => Promise<void>;
  onUpdateSettings?: (settings: any) => Promise<void>;
  onEnableEmergency?: (reason: string) => Promise<void>;
  onDisableEmergency?: () => Promise<void>;
  className?: string;
}

export function DDoSDashboard({
  onBlockIP,
  onUnblockIP,
  onAddToWhitelist,
  onRemoveFromWhitelist,
  onUpdateSettings,
  onEnableEmergency,
  onDisableEmergency,
  className
}: DDoSDashboardProps) {
  const [statistics, setStatistics] = useState<DDoSStatistics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Form states
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState('3600');
  const [blockLevel, setBlockLevel] = useState('local');
  const [ipToUnblock, setIpToUnblock] = useState('');
  const [ipToWhitelist, setIpToWhitelist] = useState('');
  const [whitelistReason, setWhitelistReason] = useState('');

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      // Simulate API calls - replace with actual API calls
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch('/api/security/ddos/statistics'),
        fetch('/api/security/ddos/events?limit=50')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.data);
        setEmergencyMode(statsData.data.cloudflare.securityLevel === 'under_attack');
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setSecurityEvents(eventsData.data.combined || []);
      }
    } catch (error) {
      console.error('Error fetching DDoS data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  const handleBlockIP = async () => {
    if (!ipToBlock.trim() || !onBlockIP) return;

    try {
      await onBlockIP(
        ipToBlock.trim(),
        blockReason || 'Manual block',
        parseInt(blockDuration),
        blockLevel
      );
      
      setIpToBlock('');
      setBlockReason('');
      await fetchData();
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  };

  const handleUnblockIP = async () => {
    if (!ipToUnblock.trim() || !onUnblockIP) return;

    try {
      await onUnblockIP(ipToUnblock.trim(), blockLevel);
      setIpToUnblock('');
      await fetchData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
    }
  };

  const handleAddToWhitelist = async () => {
    if (!ipToWhitelist.trim() || !onAddToWhitelist) return;

    try {
      await onAddToWhitelist(
        ipToWhitelist.trim(),
        whitelistReason || 'Manual whitelist'
      );
      
      setIpToWhitelist('');
      setWhitelistReason('');
      await fetchData();
    } catch (error) {
      console.error('Error adding to whitelist:', error);
    }
  };

  const handleEmergencyToggle = async () => {
    try {
      if (emergencyMode) {
        if (onDisableEmergency) {
          await onDisableEmergency();
        }
      } else {
        if (onEnableEmergency) {
          await onEnableEmergency('Emergency activation from dashboard');
        }
      }
      await fetchData();
    } catch (error) {
      console.error('Error toggling emergency mode:', error);
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'under_attack': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Clock className="h-4 w-4" />;
      case 'suspicious_pattern': return <AlertTriangle className="h-4 w-4" />;
      case 'geo_block': return <Globe className="h-4 w-4" />;
      case 'firewall_block': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
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
          <h1 className="text-2xl font-bold">DDoS Protection Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage DDoS protection across all services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant={emergencyMode ? 'destructive' : 'default'}
            size="sm"
            onClick={handleEmergencyToggle}
          >
            <Zap className="h-4 w-4 mr-2" />
            {emergencyMode ? 'Disable Emergency' : 'Emergency Mode'}
          </Button>
        </div>
      </div>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Emergency DDoS protection is active. Maximum security settings are in effect.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.combined.totalBlockedIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.local.activeBlocks || 0} active blocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.local.rateLimitHits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Badge variant={getSecurityLevelColor(statistics?.cloudflare.securityLevel || 'medium') as any}>
              {statistics?.cloudflare.securityLevel || 'medium'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              CloudFlare protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Whitelisted IPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.local.whitelistedIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Trusted addresses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="management">IP Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Protection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Protection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Local Protection</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CloudFlare Protection</span>
                  <Badge variant={statistics?.combined.activeProtection ? 'success' : 'secondary'}>
                    {statistics?.combined.activeProtection ? 'Active' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bot Fight Mode</span>
                  <Badge variant={statistics?.cloudflare.botFightMode === 'on' ? 'success' : 'secondary'}>
                    {statistics?.cloudflare.botFightMode || 'off'}
                  </Badge>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Last updated: {statistics?.combined.lastUpdated ? 
                    new Date(statistics.combined.lastUpdated).toLocaleString() : 'Never'}
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Traffic Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Requests</span>
                  <span className="font-medium">
                    {statistics?.cloudflare.analytics.requests?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Threats Blocked</span>
                  <span className="font-medium text-destructive">
                    {statistics?.cloudflare.analytics.threats?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bandwidth Used</span>
                  <span className="font-medium">
                    {statistics?.cloudflare.analytics.bandwidth ? 
                      `${(statistics.cloudflare.analytics.bandwidth / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recent Violations</span>
                  <span className="font-medium">
                    {statistics?.local.recentViolations || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security events from local and CloudFlare protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.length > 0 ? (
                  securityEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <div className="text-sm font-medium">{event.ip}</div>
                          <div className="text-xs text-muted-foreground">{event.details}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={event.source === 'cloudflare' ? 'default' : 'secondary'}>
                          {event.source}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent security events
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Block IP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Block IP Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="block-ip">IP Address</Label>
                  <Input
                    id="block-ip"
                    placeholder="192.168.1.100"
                    value={ipToBlock}
                    onChange={(e) => setIpToBlock(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-reason">Reason</Label>
                  <Input
                    id="block-reason"
                    placeholder="Suspicious activity"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="block-duration">Duration (seconds)</Label>
                    <Input
                      id="block-duration"
                      type="number"
                      value={blockDuration}
                      onChange={(e) => setBlockDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block-level">Level</Label>
                    <select
                      id="block-level"
                      className="w-full px-3 py-2 border rounded-md"
                      value={blockLevel}
                      onChange={(e) => setBlockLevel(e.target.value)}
                    >
                      <option value="local">Local</option>
                      <option value="cloudflare">CloudFlare</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleBlockIP} className="w-full">
                  Block IP Address
                </Button>
              </CardContent>
            </Card>

            {/* Unblock IP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Unblock IP Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unblock-ip">IP Address</Label>
                  <Input
                    id="unblock-ip"
                    placeholder="192.168.1.100"
                    value={ipToUnblock}
                    onChange={(e) => setIpToUnblock(e.target.value)}
                  />
                </div>
                <Button onClick={handleUnblockIP} variant="outline" className="w-full">
                  Unblock IP Address
                </Button>
              </CardContent>
            </Card>

            {/* Whitelist IP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Add to Whitelist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whitelist-ip">IP Address</Label>
                  <Input
                    id="whitelist-ip"
                    placeholder="192.168.1.100"
                    value={ipToWhitelist}
                    onChange={(e) => setIpToWhitelist(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whitelist-reason">Reason</Label>
                  <Input
                    id="whitelist-reason"
                    placeholder="Trusted partner"
                    value={whitelistReason}
                    onChange={(e) => setWhitelistReason(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddToWhitelist} variant="outline" className="w-full">
                  Add to Whitelist
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                DDoS Protection Settings
              </CardTitle>
              <CardDescription>
                Configure rate limiting and protection thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Settings configuration interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}