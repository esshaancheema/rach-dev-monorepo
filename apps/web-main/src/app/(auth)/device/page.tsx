'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Smartphone, Monitor, Gamepad2, Tv, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeviceVerificationState {
  userCode: string;
  isLoading: boolean;
  isVerified: boolean;
  error: string | null;
  deviceInfo?: {
    type: string;
    name: string;
    clientName?: string;
    scopes: string[];
  };
}

const deviceIcons = {
  mobile: Smartphone,
  desktop: Monitor,
  tv: Tv,
  gaming: Gamepad2,
  default: Monitor,
};

const formatUserCode = (code: string): string => {
  // Format like "ABCD-EFGH" for better readability
  return code.toUpperCase().replace(/(.{4})(?=.)/g, '$1-');
};

export default function DeviceVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<DeviceVerificationState>({
    userCode: searchParams.get('user_code') || '',
    isLoading: false,
    isVerified: false,
    error: null,
  });

  useEffect(() => {
    // If we have a user_code in URL, fetch device info
    const urlCode = searchParams.get('user_code');
    if (urlCode) {
      fetchDeviceInfo(urlCode);
    }
  }, [searchParams]);

  const fetchDeviceInfo = async (userCode: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/oauth/device/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: userCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid device code');
      }

      const deviceInfo = await response.json();
      setState(prev => ({ 
        ...prev, 
        deviceInfo,
        userCode,
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid or expired device code',
        isLoading: false 
      }));
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.userCode.trim()) return;

    const cleanCode = state.userCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    await fetchDeviceInfo(cleanCode);
  };

  const handleAuthorizeDevice = async (action: 'authorize' | 'deny') => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/oauth/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_code: state.userCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
          action 
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setState(prev => ({ 
        ...prev, 
        isVerified: true,
        isLoading: false 
      }));

      // Redirect to success page after a delay
      setTimeout(() => {
        router.push('/dashboard?device_verified=true');
      }, 2000);

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to authorize device. Please try again.',
        isLoading: false 
      }));
    }
  };

  const getDeviceIcon = (type: string) => {
    const IconComponent = deviceIcons[type as keyof typeof deviceIcons] || deviceIcons.default;
    return IconComponent;
  };

  if (state.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-0 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Device Authorized!
              </h2>
              <p className="text-gray-600 mb-6">
                Your device has been successfully authorized. You can now continue on your device.
              </p>
              <div className="text-sm text-gray-500">
                Redirecting to dashboard...
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Device Authorization
          </h1>
          <p className="text-gray-600">
            Enter the code displayed on your device to authorize access
          </p>
        </motion.div>

        {!state.deviceInfo ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Enter Device Code</CardTitle>
                <CardDescription>
                  The code is typically 6-8 characters long
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userCode">Device Code</Label>
                    <Input
                      id="userCode"
                      type="text"
                      value={formatUserCode(state.userCode)}
                      onChange={(e) => setState(prev => ({ 
                        ...prev, 
                        userCode: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                      }))}
                      placeholder="Enter your device code"
                      className="text-center text-lg font-mono tracking-wider"
                      maxLength={12}
                      disabled={state.isLoading}
                    />
                  </div>

                  {state.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={state.isLoading || !state.userCode.trim()}
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = getDeviceIcon(state.deviceInfo.type);
                    return <IconComponent className="h-8 w-8 text-blue-600" />;
                  })()}
                  <div className="flex-1">
                    <CardTitle className="text-xl">Authorize Device</CardTitle>
                    <CardDescription>
                      {state.deviceInfo.name || 'Unknown Device'}
                      {state.deviceInfo.clientName && (
                        <span className="block">via {state.deviceInfo.clientName}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Device Code:
                  </div>
                  <div className="text-2xl font-mono font-bold text-center py-2 bg-white rounded border-2 border-dashed border-gray-300">
                    {formatUserCode(state.userCode)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">
                    This device is requesting access to:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.deviceInfo.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                {state.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAuthorizeDevice('deny')}
                    disabled={state.isLoading}
                  >
                    Deny Access
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAuthorizeDevice('authorize')}
                    disabled={state.isLoading}
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      'Authorize Device'
                    )}
                  </Button>
                </div>

                <div className="text-xs text-center text-gray-500 pt-2">
                  Only authorize devices you recognize and trust
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>Need help? <a href="/help" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}