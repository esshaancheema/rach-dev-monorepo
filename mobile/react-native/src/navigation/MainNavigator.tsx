import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen';
import { AIAssistantScreen } from '../screens/ai/AIAssistantScreen';
import { AIChatScreen } from '../screens/ai/AIChatScreen';
import { CodeGenerationScreen } from '../screens/ai/CodeGenerationScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { CollaborationScreen } from '../screens/collaboration/CollaborationScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';

import { theme } from '../theme';

export type MainTabParamList = {
  HomeTab: undefined;
  ProjectsTab: undefined;
  AITab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Analytics: undefined;
  Notifications: undefined;
};

export type ProjectsStackParamList = {
  Projects: undefined;
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  Collaboration: { projectId: string };
};

export type AIStackParamList = {
  AIAssistant: undefined;
  AIChat: { sessionId?: string };
  CodeGeneration: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProjectsStack = createNativeStackNavigator<ProjectsStackParamList>();
const AIStack = createNativeStackNavigator<AIStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Stack Navigators
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Dashboard' }}
    />
    <HomeStack.Screen 
      name="Analytics" 
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
    <HomeStack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
  </HomeStack.Navigator>
);

const ProjectsStackNavigator = () => (
  <ProjectsStack.Navigator>
    <ProjectsStack.Screen 
      name="Projects" 
      component={ProjectsScreen}
      options={{ title: 'My Projects' }}
    />
    <ProjectsStack.Screen 
      name="ProjectDetail" 
      component={ProjectDetailScreen}
      options={{ title: 'Project Details' }}
    />
    <ProjectsStack.Screen 
      name="CreateProject" 
      component={CreateProjectScreen}
      options={{ title: 'Create Project' }}
    />
    <ProjectsStack.Screen 
      name="Collaboration" 
      component={CollaborationScreen}
      options={{ title: 'Collaboration' }}
    />
  </ProjectsStack.Navigator>
);

const AIStackNavigator = () => (
  <AIStack.Navigator>
    <AIStack.Screen 
      name="AIAssistant" 
      component={AIAssistantScreen}
      options={{ title: 'AI Assistant' }}
    />
    <AIStack.Screen 
      name="AIChat" 
      component={AIChatScreen}
      options={{ title: 'AI Chat' }}
    />
    <AIStack.Screen 
      name="CodeGeneration" 
      component={CodeGenerationScreen}
      options={{ title: 'Code Generation' }}
    />
  </AIStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </ProfileStack.Navigator>
);

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ProjectsTab':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'AITab':
              iconName = focused ? 'robot' : 'robot-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{ tabBarLabel: 'Projects' }}
      />
      <Tab.Screen
        name="AITab"
        component={AIStackNavigator}
        options={{ tabBarLabel: 'AI Assistant' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};