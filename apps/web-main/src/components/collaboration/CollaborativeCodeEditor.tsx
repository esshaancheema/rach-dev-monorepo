'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useCollaboration, CollaborationUser, Comment } from '@/hooks/useCollaboration';
import { ProjectFile } from '@/lib/ai/enhanced-code-generator';

interface CollaborativeCodeEditorProps {
  projectId: string;
  files: ProjectFile[];
  currentUserId: string;
  initialFile?: ProjectFile;
  onFileChange?: (file: ProjectFile, content: string) => void;
  className?: string;
}

interface CursorPosition {
  line: number;
  column: number;
  user: CollaborationUser;
}

interface Selection {
  start: { line: number; column: number };
  end: { line: number; column: number };
  user: CollaborationUser;
}

export default function CollaborativeCodeEditor({
  projectId,
  files,
  currentUserId,
  initialFile,
  onFileChange,
  className
}: CollaborativeCodeEditorProps) {
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(initialFile || files[0] || null);
  const [showComments, setShowComments] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLine, setCommentLine] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [selection, setSelection] = useState<Selection | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const {
    session,
    currentUser,
    connectedUsers,
    isConnected,
    syncStatus,
    canEdit,
    canComment,
    hasPendingChanges,
    sendChange,
    updateCursor,
    addComment,
    resolveComment,
    startTyping,
    stopTyping,
    shareSession,
    getFileComments,
    getActiveUsers
  } = useCollaboration(projectId, currentUserId);

  const [localContent, setLocalContent] = useState(activeFile?.content || '');

  useEffect(() => {
    if (activeFile) {
      setLocalContent(activeFile.content);
    }
  }, [activeFile]);

  const handleContentChange = (newContent: string) => {
    if (!activeFile || !canEdit) return;

    const oldContent = localContent;
    setLocalContent(newContent);

    // Calculate the change
    const change = calculateChange(oldContent, newContent, cursorPosition);
    if (change) {
      sendChange({
        type: change.type,
        file: activeFile.path,
        position: change.position,
        content: change.content
      });
    }

    // Notify parent
    onFileChange?.(activeFile, newContent);

    // Start typing indicator
    startTyping(activeFile.path);
  };

  const handleCursorMove = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return;

    const textarea = e.currentTarget;
    const position = getLineColumnFromOffset(textarea.value, textarea.selectionStart);
    setCursorPosition(position);

    // Update cursor for other users
    updateCursor(activeFile.path, position.line, position.column);

    // Handle selection
    if (textarea.selectionStart !== textarea.selectionEnd) {
      const start = getLineColumnFromOffset(textarea.value, textarea.selectionStart);
      const end = getLineColumnFromOffset(textarea.value, textarea.selectionEnd);
      setSelection({
        start,
        end,
        user: currentUser!
      });
    } else {
      setSelection(null);
    }
  };

  const handleKeyUp = () => {
    if (activeFile) {
      setTimeout(() => {
        stopTyping(activeFile.path);
      }, 1000);
    }
  };

  const handleLineClick = (lineNumber: number) => {
    if (canComment) {
      setCommentLine(lineNumber);
      setShowComments(true);
    }
  };

  const handleAddComment = () => {
    if (!activeFile || commentLine === null || !newComment.trim()) return;

    addComment(activeFile.path, commentLine, newComment.trim());
    setNewComment('');
    setCommentLine(null);
  };

  const calculateChange = (oldContent: string, newContent: string, cursor: { line: number; column: number }) => {
    // Simple diff algorithm for demo
    if (oldContent.length < newContent.length) {
      // Insertion
      const insertedText = newContent.substring(oldContent.length);
      return {
        type: 'insert' as const,
        position: cursor,
        content: insertedText
      };
    } else if (oldContent.length > newContent.length) {
      // Deletion
      return {
        type: 'delete' as const,
        position: cursor,
        content: oldContent.substring(newContent.length)
      };
    }
    
    return null;
  };

  const getLineColumnFromOffset = (text: string, offset: number) => {
    const lines = text.substring(0, offset).split('\n');
    return {
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
  };

  const renderLineNumbers = () => {
    const lines = localContent.split('\n');
    const comments = activeFile ? getFileComments(activeFile.path) : [];
    
    return lines.map((_, index) => {
      const lineComments = comments.filter(c => c.line === index);
      const hasComments = lineComments.length > 0;
      const hasUnresolvedComments = lineComments.some(c => !c.resolved);

      return (
        <div
          key={index}
          onClick={() => handleLineClick(index)}
          className={cn(
            "flex items-center justify-between px-2 py-0.5 text-sm font-mono cursor-pointer hover:bg-gray-100",
            hasComments && "bg-yellow-50",
            hasUnresolvedComments && "bg-red-50"
          )}
        >
          <span className="text-gray-500 select-none">{index + 1}</span>
          {hasComments && (
            <div className="flex space-x-1">
              {hasUnresolvedComments && (
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              )}
              <ChatBubbleLeftRightIcon className="h-3 w-3 text-yellow-600" />
            </div>
          )}
        </div>
      );
    });
  };

  const renderUserCursors = () => {
    if (!activeFile) return null;

    const activeUsers = getActiveUsers(activeFile.path);
    
    return activeUsers
      .filter(user => user.id !== currentUser?.id && user.cursor)
      .map(user => (
        <div
          key={user.id}
          className="absolute pointer-events-none"
          style={{
            top: `${user.cursor!.line * 1.5}rem`,
            left: `${user.cursor!.column * 0.6}rem`,
            borderLeftColor: user.color
          }}
        >
          <div 
            className="w-0.5 h-6 animate-pulse"
            style={{ backgroundColor: user.color }}
          />
          <div
            className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ));
  };

  const renderUserSelections = () => {
    if (!activeFile) return null;

    const activeUsers = getActiveUsers(activeFile.path);
    
    return activeUsers
      .filter(user => user.id !== currentUser?.id && user.selection)
      .map(user => {
        const selection = user.selection!;
        return (
          <div
            key={`${user.id}-selection`}
            className="absolute pointer-events-none opacity-30"
            style={{
              top: `${selection.start.line * 1.5}rem`,
              left: `${selection.start.column * 0.6}rem`,
              width: `${(selection.end.column - selection.start.column) * 0.6}rem`,
              height: `${(selection.end.line - selection.start.line + 1) * 1.5}rem`,
              backgroundColor: user.color
            }}
          />
        );
      });
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-500';
      case 'syncing': return 'text-yellow-500';
      case 'offline': return 'text-gray-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'connected': return <CheckCircleIcon className="h-4 w-4" />;
      case 'syncing': return <ClockIcon className="h-4 w-4 animate-spin" />;
      case 'offline': return <WifiIcon className="h-4 w-4" />;
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <WifiIcon className="h-4 w-4" />;
    }
  };

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No file selected
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">{activeFile.path}</h3>
            <div className={cn("flex items-center space-x-1 text-sm", getSyncStatusColor())}>
              {getSyncStatusIcon()}
              <span className="capitalize">{syncStatus}</span>
              {hasPendingChanges && <span className="text-xs">(syncing...)</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {connectedUsers.slice(0, 4).map(user => (
                  <div
                    key={user.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                    title={user.name}
                    style={{ borderColor: user.color }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    {user.isTyping && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
              
              {connectedUsers.length > 4 && (
                <span className="text-sm text-gray-500 font-medium">
                  +{connectedUsers.length - 4}
                </span>
              )}

              <button
                onClick={() => setShowUsers(!showUsers)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserGroupIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showComments
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </button>

            {/* Share */}
            <button
              onClick={() => shareSession([])}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
            </button>

            {/* Edit Mode */}
            <div className="flex items-center space-x-2 text-sm">
              {canEdit ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gray-500">
                  <EyeIcon className="h-4 w-4" />
                  <span>View Only</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex h-96">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-16 bg-gray-50 border-r border-gray-200 overflow-hidden"
        >
          {renderLineNumbers()}
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          {/* Collaborative overlays */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {renderUserSelections()}
            {renderUserCursors()}
          </div>

          <textarea
            ref={editorRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onSelect={handleCursorMove}
            onKeyUp={handleKeyUp}
            disabled={!canEdit}
            className={cn(
              "w-full h-full p-4 font-mono text-sm resize-none focus:outline-none",
              "bg-white text-gray-800 leading-6",
              !canEdit && "bg-gray-50 cursor-not-allowed"
            )}
            spellCheck={false}
            style={{
              lineHeight: '1.5rem',
              letterSpacing: '0.05em'
            }}
          />
        </div>

        {/* Comments Panel */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="p-4 h-full overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
                
                {/* New Comment */}
                {commentLine !== null && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">
                      Line {commentLine + 1}
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setCommentLine(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddComment}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Comments */}
                <div className="space-y-3">
                  {getFileComments(activeFile.path).map(comment => (
                    <div
                      key={comment.id}
                      className={cn(
                        "p-3 bg-white rounded-lg border",
                        comment.resolved ? "border-green-200" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm">
                          <span className="font-medium">User</span>
                          <span className="text-gray-500 ml-2">Line {comment.line + 1}</span>
                        </div>
                        {!comment.resolved && (
                          <button
                            onClick={() => resolveComment(comment.id)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
                      <div className="text-xs text-gray-500">
                        {comment.timestamp.toLocaleTimeString()}
                        {comment.resolved && (
                          <span className="ml-2 text-green-600">✓ Resolved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Panel */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="p-4 h-full overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Connected Users ({connectedUsers.length})
                </h4>
                
                <div className="space-y-3">
                  {connectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 bg-white rounded-lg"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                          style={{ backgroundColor: user.color }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-1 text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.isTyping ? (
                            <span className="text-green-600">Typing...</span>
                          ) : user.currentFile ? (
                            `Editing ${user.currentFile.split('/').pop()}`
                          ) : (
                            'Idle'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-sm text-gray-600">
        <div className="flex justify-between">
          <div>
            Line {cursorPosition.line + 1}, Column {cursorPosition.column + 1}
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {activeFile.type} • {localContent.split('\n').length} lines
            </span>
            {hasPendingChanges && (
              <span className="text-yellow-600">• Syncing changes...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}