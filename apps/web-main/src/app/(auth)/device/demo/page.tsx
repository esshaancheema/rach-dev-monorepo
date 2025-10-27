'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import { 
  Loader2, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  Tv, 
  Copy, 
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MotionDiv } from '@/components/motion/MotionPrimitives';

interface DeviceAuthResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

const DEMO_CLIENT_ID = 'demo-device-client-001';

export default function DeviceFlowDemoPage() {
  const [deviceAuth, setDeviceAuth] = useState<DeviceAuthResponse | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const initiateDeviceFlow = async () => {
    try {
      setIsInitiating(true);
      setError(null);

      // Call the device authorization endpoint
      const response = await fetch('/api/oauth/device/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: DEMO_CLIENT_ID,
          scope: 'openid profile email'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate device flow');
      }

      const authData = await response.json();
      setDeviceAuth(authData);
      setTimeRemaining(authData.expires_in);

      // Start countdown timer
      const countdown = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      setError('Failed to initiate device authorization flow');
    } finally {
      setIsInitiating(false);
    }
  };

  const startPolling = async () => {
    if (!deviceAuth) return;

    setIsPolling(true);
    setError(null);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: deviceAuth.device_code,
            client_id: DEMO_CLIENT_ID,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Success! We got tokens
          setTokenResponse(data);
          setIsPolling(false);
          clearInterval(pollInterval);
        } else if (data.error === 'authorization_pending') {
          // Keep polling
          return;
        } else if (data.error === 'slow_down') {
          // Increase polling interval (simplified for demo)
          return;
        } else {
          // Other error
          throw new Error(data.error_description || data.error);
        }

      } catch (error) {
        setError('Polling failed: ' + (error as Error).message);
        setIsPolling(false);
        clearInterval(pollInterval);
      }
    }, deviceAuth.interval * 1000);

    // Stop polling after expiry
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isPolling) {
        setIsPolling(false);
        setError('Device code expired');
      }
    }, deviceAuth.expires_in * 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setDeviceAuth(null);
    setTokenResponse(null);
    setError(null);
    setTimeRemaining(0);
    setIsPolling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        {/* Header */}
        <MotionDiv
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OAuth 2.0 Device Authorization Flow
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            RFC 8628 Implementation Demo
          </p>
          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="outline">OAuth 2.0</Badge>
            <Badge variant="outline">RFC 8628</Badge>
            <Badge variant="outline">Device Flow</Badge>
            <Badge variant="outline">PKCE</Badge>
          </div>
        </MotionDiv>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Step 1: Initiate Flow */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>1. Device Authorization</CardTitle>
                  <CardDescription>
                    Start the device authorization flow
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!deviceAuth ? (
                <Button 
                  onClick={initiateDeviceFlow}
                  disabled={isInitiating}
                  className="w-full"
                >
                  {isInitiating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initiating...
                    </>
                  ) : (
                    'Start Device Flow'
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Device flow initiated successfully!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">User Code:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-2xl font-mono font-bold bg-white px-3 py-2 rounded border">
                          {deviceAuth.user_code}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(deviceAuth.user_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Verification URL:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-white px-3 py-2 rounded border">
                          {deviceAuth.verification_uri}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(deviceAuth.verification_uri, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Expires in: {formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: User Authorization */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>2. User Authorization</CardTitle>
                  <CardDescription>
                    User enters code on their device
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!deviceAuth ? (
                <div className="text-center py-8 text-gray-500">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete step 1 first</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>1. Open the verification URL on any device</p>
                    <p>2. Enter the user code: <code className="font-mono bg-gray-100 px-1 rounded">{deviceAuth.user_code}</code></p>
                    <p>3. Authorize the application</p>
                  </div>

                  {!isPolling && !tokenResponse ? (
                    <Button 
                      onClick={startPolling}
                      className="w-full"
                      variant="outline"
                    >
                      Start Polling for Authorization
                    </Button>
                  ) : isPolling ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Waiting for user authorization...
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Token Response */}
        {tokenResponse && (
          <MotionDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="border-0 shadow-xl border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-green-900">Authorization Successful!</CardTitle>
                    <CardDescription className="text-green-700">
                      Device has been authorized and tokens received
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(tokenResponse, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reset Button */}
        {(deviceAuth || tokenResponse || error) && (
          <div className="text-center">
            <Button onClick={reset} variant="outline">
              Reset Demo
            </Button>
          </div>
        )}

        {/* Info Section */}
        <Card className="border-0 shadow-xl bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Device Authorization Flow</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-3">
            <p>
              The OAuth 2.0 Device Authorization Grant (RFC 8628) enables OAuth clients on devices 
              that either lack a browser or have limited input capabilities to obtain user authorization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Perfect for:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Smart TVs & Streaming devices</li>
                  <li>• Game consoles</li>
                  <li>• IoT devices</li>
                  <li>• CLI applications</li>
                  <li>• Mobile apps</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Benefits:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• No credentials on device</li>
                  <li>• User controls authorization</li>
                  <li>• Time-limited codes</li>
                  <li>• Secure token exchange</li>
                  <li>• PKCE support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}