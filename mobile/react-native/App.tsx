import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import RNBootSplash from 'react-native-bootsplash';
import CodePush from 'react-native-code-push';

import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/providers/AuthProvider';
import { NetworkProvider } from './src/providers/NetworkProvider';
import { theme } from './src/theme';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { toastConfig } from './src/config/toast';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ReactImageView: Image source "null" doesn\'t exist',
]);

const App: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      // Initialize app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hide splash screen
      await RNBootSplash.hide({ fade: true, duration: 500 });
    };

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <PaperProvider theme={theme}>
            <NetworkProvider>
              <AuthProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor={theme.colors.primary}
                    translucent
                  />
                  <AppNavigator />
                </NavigationContainer>
              </AuthProvider>
            </NetworkProvider>
            <Toast config={toastConfig} />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

// Configure CodePush for automatic updates
const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.ON_NEXT_RESUME,
};

export default CodePush(codePushOptions)(App);