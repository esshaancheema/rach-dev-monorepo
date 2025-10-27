import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import projectsSlice from './slices/projectsSlice';
import dashboardSlice from './slices/dashboardSlice';
import aiSlice from './slices/aiSlice';
import collaborationSlice from './slices/collaborationSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';
import analyticsSlice from './slices/analyticsSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'], // Only persist auth and settings
  blacklist: ['projects', 'dashboard', 'ai', 'collaboration'], // Don't persist these
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  projects: projectsSlice,
  dashboard: dashboardSlice,
  ai: aiSlice,
  collaboration: collaborationSlice,
  notifications: notificationsSlice,
  settings: settingsSlice,
  analytics: analyticsSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Reset store action
export const resetStore = () => {
  persistor.purge();
  return {
    type: 'RESET_STORE',
  };
};