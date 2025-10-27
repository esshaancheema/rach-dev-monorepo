# Next.js Development Server Troubleshooting Guide

## Issue: "localhost refused to connect" / ERR_CONNECTION_REFUSED

This guide documents a common but misleading error that can occur with Next.js development servers, where the browser shows "connection refused" but the server appears to be running normally.

## 🔍 Problem Description

### Symptoms
- Browser displays: "This site can't be reached - localhost refused to connect"
- Next.js terminal shows: "✓ Ready in 1200ms" and "Local: http://localhost:3000"
- `curl` commands may return `000` status codes or connection failures
- Server process appears to be running but pages don't load

### Misleading Nature
The error **appears** to be a networking/port issue, but is actually caused by **React runtime errors** that prevent proper page rendering, making the server effectively unreachable despite being technically running.

## 🔧 Diagnostic Process

### Step 1: Create Diagnostic Script
Create a diagnostic script to capture hidden Next.js errors:

```javascript
// diagnose.js
const { spawn } = require('child_process');

console.log('🔍 Diagnosing Next.js server issues...');

const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

nextProcess.stdout.on('data', (data) => {
  console.log('📤 STDOUT:', data.toString());
});

nextProcess.stderr.on('data', (data) => {
  console.error('❌ STDERR:', data.toString());
});

nextProcess.on('close', (code) => {
  console.log(`🔚 Process exited with code: ${code}`);
});

nextProcess.on('error', (error) => {
  console.error('💥 Process error:', error);
});

// Kill after 30 seconds
setTimeout(() => {
  console.log('⏰ Killing process after 30 seconds...');
  nextProcess.kill();
}, 30000);
```

### Step 2: Test with curl
While server is running, test with curl to bypass browser issues:
```bash
curl -v http://localhost:3000/
```

Look for connection success vs. actual HTML response.

## 🎯 Common Root Causes

### 1. Server-Side/Client-Side Component Boundary Errors
**Most Common Cause**

```
Event handlers cannot be passed to Client Component props.
<button onClick={function onClick} className=... children=...>
```

**Solution:**
- Ensure components with event handlers have `'use client';` directive
- Create proper client/server component boundaries
- Use client-side providers for state management

### 2. Missing Dependencies
Runtime crashes due to missing packages that components try to import:

```bash
# Common missing dependencies in auth-heavy apps:
pnpm add jose contentful lucide-react framer-motion
pnpm add @heroicons/react react-hook-form @hookform/resolvers zod
```

### 3. SSR/Hydration Issues
Code trying to access browser APIs during server-side rendering:

```javascript
// ❌ Wrong - causes SSR crash
const generateBlurDataURL = (w = 10, h = 10) => {
  const canvas = document.createElement('canvas'); // document undefined on server
  // ...
};

// ✅ Correct - check for browser environment
const generateBlurDataURL = (w = 10, h = 10) => {
  if (typeof window === 'undefined') {
    return 'data:image/svg+xml;base64,...'; // fallback for server
  }
  const canvas = document.createElement('canvas');
  // ...
};
```

### 4. Port Binding Issues
Server starts but fails to properly bind to the port:

```json
// package.json - ensure consistent port configuration
{
  "scripts": {
    "dev": "next dev --hostname 0.0.0.0 --port 3000"
  }
}
```

### 5. Authentication Provider Setup Issues
Improper client/server boundary with authentication contexts:

```javascript
// ❌ Wrong - AuthProvider in server component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* This causes SSR issues */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// ✅ Correct - Separate client provider component
// components/providers.tsx
'use client';
import { AuthProvider } from '@/hooks/useAuth';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// app/layout.tsx
import { Providers } from '@/components/providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 🚀 Solution Steps

### 1. Immediate Fix
```bash
# Kill any hanging processes
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clean build cache
rm -rf .next

# Restart server
pnpm dev
```

### 2. Check Dependencies
```bash
# Verify critical dependencies are installed
pnpm list --depth=0 | grep -E "(jose|contentful|lucide-react|framer-motion|heroicons|react-hook-form|zod)"
```

### 3. Fix Component Boundaries
- Add `'use client';` to components with event handlers
- Create separate client provider components
- Check for `document` or `window` usage in server components

### 4. Test Incrementally
```bash
# Test simple page first
curl -s http://localhost:3000/test

# Test main pages
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

## 🔍 Debugging Commands

### Check Server Status
```bash
# Check if Next.js process is running
ps aux | grep "next dev"

# Check port binding
lsof -i :3000

# Test with curl (bypass browser)
curl -v http://localhost:3000/
```

### Common Patterns in Error Logs
Look for these patterns in the diagnostic output:

1. **Silent crashes**: Server says "Ready" but no actual serving
2. **Component boundary errors**: Event handlers in server components
3. **Import errors**: Missing dependencies causing module resolution failures
4. **SSR errors**: Browser API usage during server rendering

## 📝 Prevention Checklist

- [ ] Always use `'use client';` for interactive components
- [ ] Create client-side providers for context/state management
- [ ] Guard browser APIs with `typeof window !== 'undefined'`
- [ ] Use diagnostic scripts when troubleshooting server issues
- [ ] Test with `curl` to isolate browser vs. server problems
- [ ] Keep dependencies in sync and properly installed
- [ ] Use proper Next.js 14 App Router patterns

## 🎯 Key Takeaway

**The "connection refused" error is often NOT a networking issue** - it's typically a React rendering error that makes the server appear unreachable. Always check for component boundary issues and runtime errors before investigating networking problems.

---

*This guide was created after resolving a persistent "localhost refused to connect" issue that was actually caused by React Server/Client component boundary violations in a Next.js 14 authentication system.*