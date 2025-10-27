# Zoptal Mobile App

A powerful React Native mobile application for the Zoptal development platform, providing full access to AI-powered coding tools, project management, and collaboration features on iOS and Android.

## Features

### 🚀 **Core Functionality**
- **Project Management**: Create, manage, and collaborate on development projects
- **AI Assistant**: Access powerful AI coding tools including code generation, review, and chat
- **Real-time Collaboration**: Work with your team in real-time with live updates
- **Code Editor**: Syntax-highlighted code editing with intelligent suggestions
- **File Management**: Upload, organize, and manage project files
- **Analytics**: Track project progress and team productivity

### 🔐 **Authentication & Security**
- **Multi-factor Authentication**: Email, SMS, and authenticator app support
- **Biometric Login**: Face ID / Touch ID / Fingerprint authentication
- **Secure Storage**: Encrypted local storage for sensitive data
- **Session Management**: Automatic token refresh and secure logout

### 📱 **Mobile-Optimized Features**
- **Offline Mode**: Continue working when connectivity is limited
- **Push Notifications**: Real-time updates for project activities
- **Native Performance**: Smooth animations and responsive UI
- **Cross-platform**: Single codebase for iOS and Android
- **Adaptive Design**: Optimized for phones and tablets

### 🔄 **Development Features**
- **Hot Reload**: Instant updates during development
- **CodePush**: Over-the-air updates without app store releases
- **Crash Analytics**: Automatic crash reporting and analytics
- **Performance Monitoring**: Real-time performance metrics

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │     Redux       │    │   Navigation    │
│   Components    │◄──►│   State Mgmt    │◄──►│   Stack/Tabs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Native APIs   │    │   AsyncStorage  │    │   Network API   │
│   (iOS/Android) │    │   & Keychain    │    │   Client        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/zoptal/mobile-app.git
cd mobile-app
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Install iOS dependencies**:
```bash
cd ios && pod install && cd ..
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

#### iOS Development

```bash
# Run on iOS simulator
npm run ios

# Run on specific iOS simulator
npm run ios -- --simulator="iPhone 15 Pro"

# Run on physical device
npm run ios -- --device
```

#### Android Development

```bash
# Start Metro bundler
npm start

# Run on Android emulator/device
npm run android

# Run in release mode
npm run android -- --variant=release
```

### Building for Production

#### iOS Build

```bash
# Archive for App Store
cd ios
xcodebuild -workspace ZoptalMobile.xcworkspace \
  -scheme ZoptalMobile \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath ZoptalMobile.xcarchive \
  archive
```

#### Android Build

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form components
│   ├── navigation/     # Navigation components
│   └── ui/             # UI-specific components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── home/           # Dashboard screens
│   ├── projects/       # Project screens
│   ├── ai/             # AI assistant screens
│   └── profile/        # User profile screens
├── navigation/         # Navigation configuration
├── store/              # Redux store and slices
├── services/           # API and external services
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── theme/              # Design system and theming
└── config/             # App configuration
```

## Key Components

### Navigation System

```typescript
// Main tab navigation
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeStack} />
  <Tab.Screen name="Projects" component={ProjectsStack} />
  <Tab.Screen name="AI" component={AIStack} />
  <Tab.Screen name="Profile" component={ProfileStack} />
</Tab.Navigator>
```

### State Management

```typescript
// Redux store with RTK
const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    ai: aiSlice,
    // ... other slices
  },
});
```

### API Integration

```typescript
// API service with interceptors
const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
});

// Auto token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Features Implementation

### AI Assistant Integration

```typescript
// AI chat functionality
const sendMessage = async (message: string) => {
  const response = await aiAPI.sendMessage({
    message,
    sessionId: currentSession.id,
    context: projectContext,
  });
  
  setMessages(prev => [...prev, response]);
};
```

### Real-time Collaboration

```typescript
// WebSocket connection for real-time updates
const useWebSocket = (projectId: string) => {
  useEffect(() => {
    const ws = new WebSocket(`${Config.WS_BASE_URL}/projects/${projectId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      dispatch(updateProject(update));
    };
    
    return () => ws.close();
  }, [projectId]);
};
```

### Offline Support

```typescript
// Offline state management
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useNetInfo();
  
  useEffect(() => {
    if (isOnline) {
      syncOfflineActions();
    }
  }, [isOnline]);
};
```

### Push Notifications

```typescript
// Push notification setup
const setupNotifications = async () => {
  const permission = await messaging().requestPermission();
  
  if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
    const token = await messaging().getToken();
    await registerDeviceToken(token);
  }
};
```

## Security

### Data Protection

```typescript
// Secure storage for sensitive data
import Keychain from 'react-native-keychain';

const storeSecureData = async (key: string, value: string) => {
  await Keychain.setInternetCredentials(key, key, value);
};
```

### Biometric Authentication

```typescript
// Biometric login
import TouchID from 'react-native-touch-id';

const authenticateWithBiometrics = async () => {
  try {
    const isSupported = await TouchID.isSupported();
    if (isSupported) {
      await TouchID.authenticate('Access your account');
      return true;
    }
  } catch (error) {
    console.error('Biometric authentication failed:', error);
  }
  return false;
};
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### E2E Tests (Detox)

```bash
# Build for testing
npm run detox:build:ios
npm run detox:build:android

# Run E2E tests
npm run detox:test:ios
npm run detox:test:android
```

### Test Examples

```typescript
// Component test
describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    const project = mockProject();
    render(<ProjectCard project={project} />);
    
    expect(screen.getByText(project.name)).toBeInTheDocument();
    expect(screen.getByText(project.description)).toBeInTheDocument();
  });
});

// E2E test
describe('Authentication Flow', () => {
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

## Deployment

### CodePush Integration

```bash
# Release to staging
appcenter codepush release-react -a zoptal/zoptal-mobile-ios -d Staging
appcenter codepush release-react -a zoptal/zoptal-mobile-android -d Staging

# Release to production
appcenter codepush release-react -a zoptal/zoptal-mobile-ios -d Production
appcenter codepush release-react -a zoptal/zoptal-mobile-android -d Production
```

### App Store Deployment

#### iOS App Store

1. **Archive the app** in Xcode
2. **Validate** the archive
3. **Upload** to App Store Connect
4. **Submit** for review

#### Google Play Store

1. **Generate signed AAB**:
```bash
cd android
./gradlew bundleRelease
```

2. **Upload** to Google Play Console
3. **Complete store listing**
4. **Submit** for review

## Configuration

### Environment Variables

```bash
# API Configuration
API_BASE_URL=https://api.zoptal.com
WS_BASE_URL=wss://ws.zoptal.com

# Authentication
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_REDIRECT_URI=com.zoptal.mobile://oauth

# Analytics
ANALYTICS_API_KEY=your_analytics_key

# Push Notifications
FCM_SENDER_ID=your_fcm_sender_id
APNS_KEY_ID=your_apns_key_id

# CodePush
CODEPUSH_DEPLOYMENT_KEY_IOS=your_ios_key
CODEPUSH_DEPLOYMENT_KEY_ANDROID=your_android_key
```

### Build Configurations

```typescript
// Config per environment
const Config = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    LOG_LEVEL: 'debug',
    ENABLE_FLIPPER: true,
  },
  staging: {
    API_BASE_URL: 'https://api-staging.zoptal.com',
    LOG_LEVEL: 'info',
    ENABLE_FLIPPER: true,
  },
  production: {
    API_BASE_URL: 'https://api.zoptal.com',
    LOG_LEVEL: 'error',
    ENABLE_FLIPPER: false,
  },
};
```

## Performance Optimization

### Bundle Size Optimization

```typescript
// Code splitting for large screens
const ProjectDetailScreen = lazy(() => import('../screens/projects/ProjectDetailScreen'));

// Image optimization
<FastImage
  source={{ uri: imageUrl }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

### Memory Management

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Network Optimization

```typescript
// Request caching
const cachedRequest = useMemo(() => {
  return apiClient.get('/projects', {
    cacheKey: `projects-${userId}`,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
}, [userId]);
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:
```bash
npm start -- --reset-cache
```

2. **iOS build issues**:
```bash
cd ios && pod install && cd ..
rm -rf ~/Library/Developer/Xcode/DerivedData
```

3. **Android build issues**:
```bash
cd android && ./gradlew clean && cd ..
```

### Debug Tools

- **Flipper**: React Native debugging platform
- **React DevTools**: Component inspection
- **Network Inspector**: API request monitoring
- **Performance Monitor**: FPS and memory tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.zoptal.com/mobile
- Issues: https://github.com/zoptal/mobile-app/issues
- Slack: #mobile-dev channel
- Email: mobile-support@zoptal.com