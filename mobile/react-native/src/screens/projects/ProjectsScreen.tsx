import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Searchbar,
  Chip,
  Menu,
  IconButton,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../../store';
import { fetchProjects, setFilter, setSortBy } from '../../store/slices/projectsSlice';
import { theme } from '../../theme';
import { Project, ProjectStatus } from '../../types/project';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { ProjectCard } from '../../components/projects/ProjectCard';

const { width } = Dimensions.get('window');

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const { 
    projects, 
    isLoading, 
    error, 
    filter, 
    sortBy 
  } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    loadProjects();
  }, [filter, sortBy]);

  const loadProjects = async () => {
    try {
      await dispatch(fetchProjects({ filter, sortBy, search: searchQuery }));
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.framework?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [projects, searchQuery]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.tertiary;
      case 'ARCHIVED':
        return theme.colors.outline;
      case 'ON_HOLD':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'play-circle';
      case 'COMPLETED':
        return 'check-circle';
      case 'ARCHIVED':
        return 'archive';
      case 'ON_HOLD':
        return 'pause-circle';
      default:
        return 'circle';
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => 
        navigation.navigate('ProjectDetail' as never, { projectId: item.id } as never)
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search projects..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* Filters and Sort */}
      <View style={styles.filtersRow}>
        <View style={styles.filterChips}>
          <Chip
            mode={filter === 'all' ? 'flat' : 'outlined'}
            onPress={() => dispatch(setFilter('all'))}
            style={styles.filterChip}
          >
            All ({projects.length})
          </Chip>
          <Chip
            mode={filter === 'active' ? 'flat' : 'outlined'}
            onPress={() => dispatch(setFilter('active'))}
            style={styles.filterChip}
          >
            Active
          </Chip>
          <Chip
            mode={filter === 'recent' ? 'flat' : 'outlined'}
            onPress={() => dispatch(setFilter('recent'))}
            style={styles.filterChip}
          >
            Recent
          </Chip>
        </View>

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort"
              onPress={() => setSortMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            title="Name"
            onPress={() => {
              dispatch(setSortBy('name'));
              setSortMenuVisible(false);
            }}
            leadingIcon="sort-alphabetical-ascending"
          />
          <Menu.Item
            title="Created Date"
            onPress={() => {
              dispatch(setSortBy('created'));
              setSortMenuVisible(false);
            }}
            leadingIcon="calendar"
          />
          <Menu.Item
            title="Last Modified"
            onPress={() => {
              dispatch(setSortBy('modified'));
              setSortMenuVisible(false);
            }}
            leadingIcon="clock"
          />
          <Menu.Item
            title="Status"
            onPress={() => {
              dispatch(setSortBy('status'));
              setSortMenuVisible(false);
            }}
            leadingIcon="flag"
          />
        </Menu>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="folder-plus"
      title="No Projects Yet"
      description="Create your first project to get started with Zoptal's powerful development tools."
      action={
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateProject' as never)}
          style={styles.emptyStateButton}
        >
          Create Project
        </Button>
      }
    />
  );

  if (isLoading && projects.length === 0) {
    return <LoadingState message="Loading your projects..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Project FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProject' as never)}
        label="New Project"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flex: 1,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  emptyStateButton: {
    marginTop: 16,
  },
});