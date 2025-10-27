import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  Chip,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { RootState, AppDispatch } from '../../store';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { fetchRecentProjects } from '../../store/slices/projectsSlice';
import { theme } from '../../theme';
import { QuickActionsCard } from '../../components/home/QuickActionsCard';
import { RecentProjectsCard } from '../../components/home/RecentProjectsCard';
import { ActivityFeedCard } from '../../components/home/ActivityFeedCard';
import { StatsCard } from '../../components/home/StatsCard';
import { AIInsightsCard } from '../../components/home/AIInsightsCard';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    stats, 
    recentActivity, 
    aiInsights, 
    isLoading 
  } = useSelector((state: RootState) => state.dashboard);
  const { recentProjects } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardData()),
        dispatch(fetchRecentProjects()),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar.Image
              size={50}
              source={{
                uri: user?.avatar || 'https://via.placeholder.com/50',
              }}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.firstName}!
              </Text>
              <Text style={styles.subtitle}>
                Ready to build something amazing?
              </Text>
            </View>
          </View>
          <IconButton
            icon="bell-outline"
            iconColor={theme.colors.onPrimary}
            size={24}
            onPress={() => navigation.navigate('Notifications' as never)}
          />
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.projectCount || 0}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.aiSessionsCount || 0}</Text>
            <Text style={styles.statLabel}>AI Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.collaborationsCount || 0}</Text>
            <Text style={styles.statLabel}>Collaborations</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Recent Projects */}
        <RecentProjectsCard 
          projects={recentProjects}
          onViewAll={() => navigation.navigate('ProjectsTab' as never)}
        />

        {/* AI Insights */}
        {aiInsights && (
          <AIInsightsCard 
            insights={aiInsights}
            onViewDetails={() => navigation.navigate('AITab' as never)}
          />
        )}

        {/* Statistics Overview */}
        <StatsCard stats={stats} />

        {/* Activity Feed */}
        <ActivityFeedCard 
          activities={recentActivity}
          onViewAll={() => navigation.navigate('Analytics' as never)}
        />

        {/* Resource Usage Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">Resource Usage</Text>
              <Chip mode="outlined" compact>
                This Month
              </Chip>
            </View>
            
            <View style={styles.resourceItem}>
              <Text variant="bodyMedium">Storage</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={stats?.storageUsage || 0.4} 
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall">
                  {Math.round((stats?.storageUsage || 0.4) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.resourceItem}>
              <Text variant="bodyMedium">API Calls</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={stats?.apiUsage || 0.6} 
                  color={theme.colors.secondary}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall">
                  {Math.round((stats?.apiUsage || 0.6) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.resourceItem}>
              <Text variant="bodyMedium">AI Credits</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={stats?.aiCreditsUsage || 0.3} 
                  color={theme.colors.tertiary}
                  style={styles.progressBar}
                />
                <Text variant="bodySmall">
                  {Math.round((stats?.aiCreditsUsage || 0.3) * 100)}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Upgrade Prompt (if on free plan) */}
        {user?.plan === 'free' && (
          <Card style={styles.upgradeCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.upgradeTitle}>
                Unlock Premium Features
              </Text>
              <Text variant="bodyMedium" style={styles.upgradeText}>
                Get unlimited projects, advanced AI features, and priority support.
              </Text>
              <Button
                mode="contained"
                style={styles.upgradeButton}
                onPress={() => {
                  // Navigate to billing/upgrade screen
                }}
              >
                Upgrade Now
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceItem: {
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    marginRight: 8,
  },
  upgradeCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.primaryContainer,
  },
  upgradeTitle: {
    color: theme.colors.onPrimaryContainer,
    marginBottom: 8,
  },
  upgradeText: {
    color: theme.colors.onPrimaryContainer,
    marginBottom: 16,
    opacity: 0.8,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
});