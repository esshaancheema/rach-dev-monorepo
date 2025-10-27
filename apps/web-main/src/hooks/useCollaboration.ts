'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectFile } from '@/lib/ai/enhanced-code-generator';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
    file: string;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
    file: string;
  };
  lastActivity: Date;
  isTyping: boolean;
  currentFile: string | null;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  type: 'insert' | 'delete' | 'replace';
  file: string;
  position: {
    line: number;
    column: number;
  };
  content: string;
  timestamp: Date;
  applied: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  file: string;
  line: number;
  column?: number;
  content: string;
  resolved: boolean;
  timestamp: Date;
  replies: CommentReply[];
  reactions: Record<string, string[]>; // emoji -> user IDs
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  name: string;
  description: string;
  owner: string;
  users: CollaborationUser[];
  files: ProjectFile[];
  changes: CollaborationChange[];
  comments: Comment[];
  createdAt: Date;
  lastActivity: Date;
  settings: {
    allowEditing: boolean;
    allowComments: boolean;
    maxUsers: number;
    isPublic: boolean;
  };
}

interface CollaborationState {
  session: CollaborationSession | null;
  currentUser: CollaborationUser | null;
  connectedUsers: CollaborationUser[];
  isConnected: boolean;
  isHost: boolean;
  pendingChanges: CollaborationChange[];
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncTime: Date | null;
}

// Simulated WebSocket connection for demo purposes
class MockWebSocket {
  private handlers: Record<string, Function[]> = {};
  private isConnected = false;
  
  connect() {
    setTimeout(() => {
      this.isConnected = true;
      this.emit('connected');
    }, 1000);
  }
  
  disconnect() {
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  send(data: any) {
    if (!this.isConnected) return;
    
    // Simulate server processing
    setTimeout(() => {
      this.emit('message', { 
        type: 'ack', 
        data: data,
        timestamp: new Date()
      });
    }, 100);
  }
  
  on(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
  
  off(event: string, handler: Function) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }
  }
  
  private emit(event: string, data?: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(data));
    }
  }
  
  // Simulate receiving messages from other users
  simulateIncomingMessage(type: string, data: any) {
    if (this.isConnected) {
      this.emit('message', { type, data, timestamp: new Date() });
    }
  }
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export function useCollaboration(projectId: string, userId?: string) {
  const [state, setState] = useState<CollaborationState>({
    session: null,
    currentUser: null,
    connectedUsers: [],
    isConnected: false,
    isHost: false,
    pendingChanges: [],
    syncStatus: 'offline',
    lastSyncTime: null
  });

  const wsRef = useRef<MockWebSocket | null>(null);
  const changeBufferRef = useRef<CollaborationChange[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (projectId && userId) {
      initializeCollaboration();
    }

    return () => {
      cleanup();
    };
  }, [projectId, userId]);

  const initializeCollaboration = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));

      // Create mock WebSocket connection
      wsRef.current = new MockWebSocket();
      
      // Set up event listeners
      wsRef.current.on('connected', handleConnected);
      wsRef.current.on('disconnected', handleDisconnected);
      wsRef.current.on('message', handleMessage);

      // Connect
      wsRef.current.connect();

      // Start periodic sync
      syncIntervalRef.current = setInterval(syncChanges, 2000);

    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [projectId, userId]);

  const handleConnected = useCallback(() => {
    const currentUser: CollaborationUser = {
      id: userId!,
      name: 'Current User',
      email: 'user@example.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      lastActivity: new Date(),
      isTyping: false,
      currentFile: null
    };

    // Create or join session
    const session: CollaborationSession = {
      id: `session_${projectId}`,
      projectId,
      name: 'Collaborative Editing Session',
      description: 'Real-time collaborative editing',
      owner: userId!,
      users: [currentUser],
      files: [],
      changes: [],
      comments: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      settings: {
        allowEditing: true,
        allowComments: true,
        maxUsers: 10,
        isPublic: false
      }
    };

    setState(prev => ({
      ...prev,
      session,
      currentUser,
      connectedUsers: [currentUser],
      isConnected: true,
      isHost: true,
      syncStatus: 'connected',
      lastSyncTime: new Date()
    }));

    // Send join message
    wsRef.current?.send({
      type: 'join',
      sessionId: session.id,
      user: currentUser
    });

  }, [projectId, userId]);

  const handleDisconnected = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      syncStatus: 'offline'
    }));
  }, []);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'user-joined':
        handleUserJoined(message.data);
        break;
      case 'user-left':
        handleUserLeft(message.data);
        break;
      case 'change':
        handleRemoteChange(message.data);
        break;
      case 'cursor-update':
        handleCursorUpdate(message.data);
        break;
      case 'comment-added':
        handleCommentAdded(message.data);
        break;
      case 'comment-resolved':
        handleCommentResolved(message.data);
        break;
      case 'typing-start':
      case 'typing-stop':
        handleTypingUpdate(message.data);
        break;
      case 'ack':
        handleAcknowledgment(message.data);
        break;
    }
  }, []);

  const handleUserJoined = (user: CollaborationUser) => {
    setState(prev => ({
      ...prev,
      connectedUsers: [...prev.connectedUsers.filter(u => u.id !== user.id), user]
    }));
  };

  const handleUserLeft = (userId: string) => {
    setState(prev => ({
      ...prev,
      connectedUsers: prev.connectedUsers.filter(u => u.id !== userId)
    }));
  };

  const handleRemoteChange = (change: CollaborationChange) => {
    if (change.userId === state.currentUser?.id) return; // Ignore own changes

    setState(prev => {
      const updatedSession = prev.session ? {
        ...prev.session,
        changes: [...prev.session.changes, change]
      } : null;

      return {
        ...prev,
        session: updatedSession
      };
    });

    // Apply change to files
    applyChange(change);
  };

  const handleCursorUpdate = (data: { userId: string; cursor: any; selection?: any }) => {
    setState(prev => ({
      ...prev,
      connectedUsers: prev.connectedUsers.map(user =>
        user.id === data.userId
          ? { ...user, cursor: data.cursor, selection: data.selection }
          : user
      )
    }));
  };

  const handleCommentAdded = (comment: Comment) => {
    setState(prev => {
      const updatedSession = prev.session ? {
        ...prev.session,
        comments: [...prev.session.comments, comment]
      } : null;

      return {
        ...prev,
        session: updatedSession
      };
    });
  };

  const handleCommentResolved = (commentId: string) => {
    setState(prev => {
      const updatedSession = prev.session ? {
        ...prev.session,
        comments: prev.session.comments.map(comment =>
          comment.id === commentId ? { ...comment, resolved: true } : comment
        )
      } : null;

      return {
        ...prev,
        session: updatedSession
      };
    });
  };

  const handleTypingUpdate = (data: { userId: string; isTyping: boolean; file: string }) => {
    setState(prev => ({
      ...prev,
      connectedUsers: prev.connectedUsers.map(user =>
        user.id === data.userId
          ? { ...user, isTyping: data.isTyping, currentFile: data.file }
          : user
      )
    }));
  };

  const handleAcknowledgment = (data: any) => {
    // Remove acknowledged changes from pending
    setState(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges.filter(change => change.id !== data.id),
      lastSyncTime: new Date()
    }));
  };

  const applyChange = (change: CollaborationChange) => {
    // Apply change to local files
    setState(prev => {
      if (!prev.session) return prev;

      const updatedFiles = prev.session.files.map(file => {
        if (file.path !== change.file) return file;

        const updatedContent = file.content;
        const lines = updatedContent.split('\n');

        switch (change.type) {
          case 'insert':
            if (change.position.line < lines.length) {
              const line = lines[change.position.line];
              const newLine = 
                line.substring(0, change.position.column) +
                change.content +
                line.substring(change.position.column);
              lines[change.position.line] = newLine;
            }
            break;
          case 'delete':
            // Implementation for delete
            break;
          case 'replace':
            // Implementation for replace
            break;
        }

        return {
          ...file,
          content: lines.join('\n')
        };
      });

      return {
        ...prev,
        session: {
          ...prev.session,
          files: updatedFiles
        }
      };
    });
  };

  const sendChange = useCallback((change: Omit<CollaborationChange, 'id' | 'userId' | 'timestamp' | 'applied'>) => {
    if (!state.isConnected || !state.currentUser) return;

    const fullChange: CollaborationChange = {
      ...change,
      id: generateChangeId(),
      userId: state.currentUser.id,
      timestamp: new Date(),
      applied: false
    };

    // Add to pending changes
    setState(prev => ({
      ...prev,
      pendingChanges: [...prev.pendingChanges, fullChange]
    }));

    // Send to server
    wsRef.current?.send({
      type: 'change',
      data: fullChange
    });

    // Apply locally immediately
    applyChange(fullChange);

  }, [state.isConnected, state.currentUser]);

  const updateCursor = useCallback((file: string, line: number, column: number, selection?: any) => {
    if (!state.isConnected) return;

    wsRef.current?.send({
      type: 'cursor-update',
      data: {
        userId: state.currentUser?.id,
        cursor: { line, column, file },
        selection
      }
    });
  }, [state.isConnected, state.currentUser]);

  const addComment = useCallback((file: string, line: number, content: string, column?: number) => {
    if (!state.currentUser) return;

    const comment: Comment = {
      id: generateCommentId(),
      userId: state.currentUser.id,
      file,
      line,
      column,
      content,
      resolved: false,
      timestamp: new Date(),
      replies: [],
      reactions: {}
    };

    wsRef.current?.send({
      type: 'add-comment',
      data: comment
    });

    // Add locally
    setState(prev => {
      const updatedSession = prev.session ? {
        ...prev.session,
        comments: [...prev.session.comments, comment]
      } : null;

      return {
        ...prev,
        session: updatedSession
      };
    });

  }, [state.currentUser]);

  const resolveComment = useCallback((commentId: string) => {
    wsRef.current?.send({
      type: 'resolve-comment',
      data: { commentId }
    });

    setState(prev => {
      const updatedSession = prev.session ? {
        ...prev.session,
        comments: prev.session.comments.map(comment =>
          comment.id === commentId ? { ...comment, resolved: true } : comment
        )
      } : null;

      return {
        ...prev,
        session: updatedSession
      };
    });
  }, []);

  const startTyping = useCallback((file: string) => {
    if (!state.isConnected) return;

    wsRef.current?.send({
      type: 'typing-start',
      data: {
        userId: state.currentUser?.id,
        file,
        isTyping: true
      }
    });
  }, [state.isConnected, state.currentUser]);

  const stopTyping = useCallback((file: string) => {
    if (!state.isConnected) return;

    wsRef.current?.send({
      type: 'typing-stop',
      data: {
        userId: state.currentUser?.id,
        file,
        isTyping: false
      }
    });
  }, [state.isConnected, state.currentUser]);

  const shareSession = useCallback((inviteEmails: string[]) => {
    // Generate shareable link or send invitations
    const shareLink = `${window.location.origin}/collaborate/${state.session?.id}`;
    
    return {
      link: shareLink,
      invites: inviteEmails.map(email => ({
        email,
        token: generateInviteToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }))
    };
  }, [state.session]);

  const syncChanges = useCallback(() => {
    if (!state.isConnected || changeBufferRef.current.length === 0) return;

    // Batch pending changes
    const changes = [...changeBufferRef.current];
    changeBufferRef.current = [];

    wsRef.current?.send({
      type: 'batch-changes',
      data: changes
    });
  }, [state.isConnected]);

  const cleanup = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  };

  const getFileComments = useCallback((filePath: string) => {
    return state.session?.comments.filter(comment => comment.file === filePath) || [];
  }, [state.session?.comments]);

  const getActiveUsers = useCallback((filePath?: string) => {
    return state.connectedUsers.filter(user => 
      !filePath || user.currentFile === filePath
    );
  }, [state.connectedUsers]);

  return {
    // State
    ...state,
    
    // Actions
    sendChange,
    updateCursor,
    addComment,
    resolveComment,
    startTyping,
    stopTyping,
    shareSession,
    
    // Computed
    getFileComments,
    getActiveUsers,
    
    // Status
    canEdit: state.session?.settings.allowEditing && state.isConnected,
    canComment: state.session?.settings.allowComments && state.isConnected,
    hasPendingChanges: state.pendingChanges.length > 0
  };
}

// Helper functions
function generateChangeId(): string {
  return 'change_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateCommentId(): string {
  return 'comment_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateInviteToken(): string {
  return 'invite_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}