import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  Chip,
  Surface,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../../store';
import { fetchAISessions } from '../../store/slices/aiSlice';
import { theme } from '../../theme';
import { AIFeatureCard } from '../../components/ai/AIFeatureCard';
import { RecentSessionsCard } from '../../components/ai/RecentSessionsCard';
import { AIStatsCard } from '../../components/ai/AIStatsCard';
import { QuickPromptModal } from '../../components/ai/QuickPromptModal';

const { width } = Dimensions.get('window');

export const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [quickPromptVisible, setQuickPromptVisible] = useState(false);

  const { 
    recentSessions, 
    aiStats, 
    isLoading 
  } = useSelector((state: RootState) => state.ai);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadAISessions();
  }, []);

  const loadAISessions = async () => {
    try {
      await dispatch(fetchAISessions());
    } catch (error) {
      console.error('Failed to load AI sessions:', error);
    }
  };

  const aiFeatures = [
    {
      id: 'chat',
      title: 'AI Chat',
      description: 'Ask questions, get explanations, and brainstorm ideas',
      icon: 'chat',
      color: theme.colors.primary,
      action: () => navigation.navigate('AIChat' as never),
    },
    {
      id: 'code-generation',
      title: 'Code Generation',
      description: 'Generate code snippets and complete functions',
      icon: 'code-braces',
      color: theme.colors.secondary,
      action: () => navigation.navigate('CodeGeneration' as never),
    },
    {
      id: 'code-review',
      title: 'Code Review',
      description: 'Get AI-powered code analysis and suggestions',
      icon: 'magnify',
      color: theme.colors.tertiary,
      action: () => {
        // Navigate to code review feature
      },
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Generate documentation for your code',
      icon: 'file-document',
      color: theme.colors.error,
      action: () => {
        // Navigate to documentation feature
      },
    },
  ];

  const quickPrompts = [
    'Explain this code to me',
    'How can I optimize this function?',
    'Write unit tests for this code',
    'Convert this to TypeScript',
    'Add error handling',
    'Refactor for better performance',
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Avatar.Icon
              size={60}
              icon="robot"
              style={styles.aiAvatar}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                AI Assistant
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Your intelligent coding companion
              </Text>
            </View>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {aiStats?.totalSessions || 0}
              </Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {aiStats?.tokensUsed || 0}
              </Text>
              <Text style={styles.statLabel}>Tokens Used</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {aiStats?.codeGenerated || 0}
              </Text>
              <Text style={styles.statLabel}>Code Generated</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">Quick Actions</Text>
            </View>
            
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="chat-plus"
                onPress={() => navigation.navigate('AIChat' as never)}
                style={styles.quickActionButton}
              >
                New Chat
              </Button>
              <Button
                mode="outlined"
                icon="lightning-bolt"
                onPress={() => setQuickPromptVisible(true)}
                style={styles.quickActionButton}
              >
                Quick Prompt
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* AI Features Grid */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          AI Features
        </Text>
        <View style={styles.featuresGrid}>
          {aiFeatures.map((feature) => (
            <AIFeatureCard
              key={feature.id}
              feature={feature}
              onPress={feature.action}
            />
          ))}
        </View>

        {/* AI Statistics */}
        <AIStatsCard stats={aiStats} />

        {/* Recent Sessions */}
        <RecentSessionsCard
          sessions={recentSessions}
          onViewAll={() => {
            // Navigate to all sessions
          }}
          onSessionPress={(sessionId) =>
            navigation.navigate('AIChat' as never, { sessionId } as never)
          }
        />

        {/* AI Tips Card */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">💡 AI Tips</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.tipText}>
                  Be specific in your prompts for better results
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.tipText}>
                  Provide context about your project and requirements
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.tipText}>
                  Ask follow-up questions to refine the output
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={16} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.tipText}>
                  Use code examples to get more targeted assistance
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Usage Limits (for free plan) */}
        {user?.plan === 'free' && (
          <Card style={styles.usageCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">Usage This Month</Text>
                <Chip mode="outlined" compact>
                  Free Plan
                </Chip>
              </View>
              
              <View style={styles.usageStats}>
                <View style={styles.usageItem}>
                  <Text variant="bodyMedium">AI Chats</Text>
                  <Text variant="bodySmall" style={styles.usageText}>
                    {aiStats?.chatsUsed || 0} / 50
                  </Text>
                </View>
                <View style={styles.usageItem}>
                  <Text variant="bodyMedium">Code Generation</Text>
                  <Text variant="bodySmall" style={styles.usageText}>
                    {aiStats?.codeGenerationUsed || 0} / 20
                  </Text>
                </View>
              </View>

              <Button
                mode="contained"
                style={styles.upgradeButton}
                onPress={() => {
                  // Navigate to upgrade screen
                }}
              >
                Upgrade for Unlimited Access
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Quick Prompt Modal */}
      <Portal>
        <Modal
          visible={quickPromptVisible}
          onDismiss={() => setQuickPromptVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <QuickPromptModal
            prompts={quickPrompts}
            onSelect={(prompt) => {
              setQuickPromptVisible(false);
              navigation.navigate('AIChat' as never, { 
                initialPrompt: prompt 
              } as never);
            }}
            onDismiss={() => setQuickPromptVisible(false)}
          />
        </Modal>
      </Portal>
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
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  quickActionsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    flex: 1,
  },
  usageCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.errorContainer,
  },
  usageStats: {
    marginBottom: 16,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageText: {
    fontWeight: '500',
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
});