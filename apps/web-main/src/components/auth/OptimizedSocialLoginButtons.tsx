'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

// Lazy load animation library only when needed
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  {
    ssr: false,
    loading: () => <div className="opacity-0" />
  }
);

interface OptimizedSocialLoginButtonsProps {
  redirectTo?: string;
  className?: string;
}

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

// Optimize SVG icons by making them static components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

export default function OptimizedSocialLoginButtons({ 
  redirectTo = '/dashboard', 
  className 
}: OptimizedSocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const oauthProviders: OAuthProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: <GoogleIcon />,
      color: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      hoverColor: 'hover:shadow-md'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <GitHubIcon />,
      color: 'bg-gray-900 text-white hover:bg-gray-800',
      hoverColor: 'hover:shadow-md'
    }
  ];

  const handleSocialLogin = async (provider: string) => {
    const requestKey = `oauth-${provider}-${redirectTo}`;
    
    // Check if request is already pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }
    
    try {
      setLoading(provider);
      setError(null);

      const requestBody = { 
        redirectUri: `${window.location.origin}/api/oauth/${provider}/callback`,
        state: redirectTo 
      };

      // Create the request promise
      const requestPromise = fetch(`/api/oauth/${provider}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
      }).then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to initiate ${provider} login`);
        }
        return response.json();
      });

      // Cache the promise to prevent duplicates
      pendingRequests.set(requestKey, requestPromise);

      const { authUrl } = await requestPromise;
      
      // Preconnect to OAuth provider domain for faster redirect
      if (provider === 'google') {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://accounts.google.com';
        document.head.appendChild(link);
      } else if (provider === 'github') {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://github.com';
        document.head.appendChild(link);
      }
      
      // Use replace instead of href for better UX
      window.location.replace(authUrl);

    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      setError(`Failed to sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}. Please try again.`);
      setLoading(null);
    } finally {
      // Clean up pending request
      pendingRequests.delete(requestKey);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {oauthProviders.map((provider, index) => (
          <MotionDiv
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              className={`w-full ${provider.color} ${provider.hoverColor} transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2`}
              onClick={() => handleSocialLogin(provider.id)}
              disabled={loading !== null}
              aria-label={`Continue with ${provider.name}`}
            >
              {loading === provider.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <span className="mr-2" aria-hidden="true">{provider.icon}</span>
              )}
              {loading === provider.id 
                ? `Connecting to ${provider.name}...` 
                : `Continue with ${provider.name}`
              }
            </Button>
          </MotionDiv>
        ))}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
}

// Cleanup pending requests on module unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    pendingRequests.clear();
  });
}