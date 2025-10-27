// Advanced Content Editor Component for Zoptal CMS
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save,
  Eye,
  Settings,
  Calendar,
  Tag,
  Image,
  Bold,
  Italic,
  Link,
  List,
  Code,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Upload,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  ContentItem, 
  ContentTemplate, 
  contentManager,
  useContentManager 
} from '@/lib/cms/content-manager';
import { analytics } from '@/lib/analytics/tracker';

interface ContentEditorProps {
  contentId?: string;
  template?: ContentTemplate;
  onSave?: (content: ContentItem) => void;
  onCancel?: () => void;
  className?: string;
}

interface EditorState {
  title: string;
  content: string;
  excerpt: string;
  status: ContentItem['status'];
  type: ContentItem['type'];
  categories: string[];
  tags: string[];
  featuredImage?: string;
  images: string[];
  seoData: ContentItem['seoData'];
  scheduledAt?: string;
  customFields: Record<string, any>;
}

export function ContentEditor({ 
  contentId, 
  template, 
  onSave, 
  onCancel,
  className = '' 
}: ContentEditorProps) {
  const { createContent, updateContent, getContent, getAllCategories, getAllTags } = useContentManager();
  
  const [editorState, setEditorState] = useState<EditorState>({
    title: '',
    content: template?.defaultContent || '',
    excerpt: '',
    status: 'draft',
    type: template?.type || 'blog',
    categories: [],
    tags: [],
    images: [],
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      noIndex: false
    },
    customFields: {}
  });

  const [currentView, setCurrentView] = useState<'editor' | 'preview' | 'seo' | 'settings'>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadInitialData();
    loadCategories();
    loadTags();
  }, [contentId]);

  useEffect(() => {
    // Auto-save functionality
    if (hasUnsavedChanges) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [editorState, hasUnsavedChanges]);

  const loadInitialData = async () => {
    if (contentId) {
      setIsLoading(true);
      try {
        const content = getContent(contentId);
        if (content) {
          setEditorState({
            title: content.title,
            content: content.content,
            excerpt: content.excerpt,
            status: content.status,
            type: content.type,
            categories: content.categories,
            tags: content.tags,
            featuredImage: content.featuredImage,
            images: content.images,
            seoData: content.seoData,
            scheduledAt: content.scheduledAt,
            customFields: content.customFields
          });
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadCategories = () => {
    setAvailableCategories(getAllCategories());
  };

  const loadTags = () => {
    setAvailableTags(getAllTags());
  };

  const handleInputChange = (field: keyof EditorState, value: any) => {
    setEditorState(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);

    // Auto-generate SEO data from title and content
    if (field === 'title' || field === 'content') {
      setEditorState(prev => ({
        ...prev,
        seoData: {
          ...prev.seoData,
          metaTitle: field === 'title' ? value : prev.seoData.metaTitle || prev.title,
          metaDescription: field === 'content' ? generateExcerpt(value) : prev.seoData.metaDescription
        }
      }));
    }
  };

  const handleSeoDataChange = (field: keyof ContentItem['seoData'], value: any) => {
    setEditorState(prev => ({
      ...prev,
      seoData: {
        ...prev.seoData,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setEditorState(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (newStatus?: ContentItem['status']) => {
    setIsSaving(true);
    
    try {
      const dataToSave: Partial<ContentItem> = {
        ...editorState,
        status: newStatus || editorState.status,
        excerpt: editorState.excerpt || generateExcerpt(editorState.content)
      };

      let savedContent: ContentItem | null;
      
      if (contentId) {
        savedContent = await updateContent(contentId, dataToSave);
      } else {
        savedContent = await createContent(dataToSave);
      }

      if (savedContent) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        analytics.track({
          name: contentId ? 'content_updated_editor' : 'content_created_editor',
          category: 'cms',
          properties: {
            content_id: savedContent.id,
            type: savedContent.type,
            status: savedContent.status,
            word_count: savedContent.content.split(' ').length
          }
        });

        if (onSave) {
          onSave(savedContent);
        }
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!contentId || !hasUnsavedChanges) return;
    
    try {
      await updateContent(contentId, editorState);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const handleSchedule = () => {
    if (editorState.scheduledAt) {
      handleSave('scheduled');
    }
  };

  const insertFormatting = (format: string, wrapper?: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorState.content.substring(start, end);
    
    let replacement = '';
    
    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'heading1':
        replacement = `# ${selectedText}`;
        break;
      case 'heading2':
        replacement = `## ${selectedText}`;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
      case 'code':
        replacement = `\`${selectedText}\``;
        break;
      case 'quote':
        replacement = `> ${selectedText}`;
        break;
      case 'list':
        replacement = `- ${selectedText}`;
        break;
      default:
        replacement = wrapper ? `${wrapper}${selectedText}${wrapper}` : selectedText;
    }

    const newContent = 
      editorState.content.substring(0, start) + 
      replacement + 
      editorState.content.substring(end);

    handleInputChange('content', newContent);
  };

  const addCategory = () => {
    if (newCategory.trim() && !editorState.categories.includes(newCategory.trim())) {
      handleInputChange('categories', [...editorState.categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    handleInputChange('categories', editorState.categories.filter(c => c !== category));
  };

  const addTag = () => {
    if (newTag.trim() && !editorState.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...editorState.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', editorState.tags.filter(t => t !== tag));
  };

  const generateExcerpt = (content: string, maxLength: number = 160): string => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/[#*>\-`]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const renderEditor = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Enter title..."
          value={editorState.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full text-3xl font-bold border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => insertFormatting('bold')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('italic')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('heading1')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('heading2')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('link')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('list')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('quote')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertFormatting('code')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Upload Image"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>

      {/* Content Editor */}
      <div>
        <textarea
          ref={contentRef}
          placeholder="Start writing your content..."
          value={editorState.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          className="w-full min-h-96 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Excerpt
        </label>
        <textarea
          placeholder="Write a brief excerpt or leave empty to auto-generate..."
          value={editorState.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="prose prose-lg max-w-none dark:prose-dark">
        <h1>{editorState.title || 'Untitled'}</h1>
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {editorState.excerpt || generateExcerpt(editorState.content)}
        </div>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: editorState.content
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
              .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
              .replace(/^- (.*$)/gm, '<li>$1</li>')
              .replace(/\n/g, '<br>')
          }}
        />
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={editorState.seoData.metaTitle}
          onChange={(e) => handleSeoDataChange('metaTitle', e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="SEO title for search engines"
        />
        <div className="text-xs text-gray-500 mt-1">
          {editorState.seoData.metaTitle.length}/60 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meta Description
        </label>
        <textarea
          value={editorState.seoData.metaDescription}
          onChange={(e) => handleSeoDataChange('metaDescription', e.target.value)}
          className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Brief description for search engines"
        />
        <div className="text-xs text-gray-500 mt-1">
          {editorState.seoData.metaDescription.length}/160 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Keywords
        </label>
        <input
          type="text"
          value={editorState.seoData.keywords.join(', ')}
          onChange={(e) => handleSeoDataChange('keywords', e.target.value.split(',').map(k => k.trim()))}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Enter keywords separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Canonical URL
        </label>
        <input
          type="url"
          value={editorState.seoData.canonicalUrl || ''}
          onChange={(e) => handleSeoDataChange('canonicalUrl', e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://example.com/canonical-url"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="noIndex"
          checked={editorState.seoData.noIndex || false}
          onChange={(e) => handleSeoDataChange('noIndex', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="noIndex" className="text-sm text-gray-700 dark:text-gray-300">
          Prevent search engines from indexing this content
        </label>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Status and Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={editorState.status}
            onChange={(e) => handleInputChange('status', e.target.value as ContentItem['status'])}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Type
          </label>
          <select
            value={editorState.type}
            onChange={(e) => handleInputChange('type', e.target.value as ContentItem['type'])}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="blog">Blog Post</option>
            <option value="case-study">Case Study</option>
            <option value="page">Page</option>
            <option value="portfolio">Portfolio</option>
            <option value="documentation">Documentation</option>
          </select>
        </div>
      </div>

      {/* Schedule Publishing */}
      {editorState.status === 'scheduled' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scheduled Date & Time
          </label>
          <input
            type="datetime-local"
            value={editorState.scheduledAt ? new Date(editorState.scheduledAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {editorState.categories.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {category}
              <button
                onClick={() => removeCategory(category)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Add category"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {editorState.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Add tag"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 min-h-screen ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {contentId ? 'Edit Content' : 'Create Content'}
            </h1>
            {lastSaved && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="w-4 h-4 mr-1" />
                Unsaved changes
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* View Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { key: 'editor', label: 'Editor', icon: null },
                { key: 'preview', label: 'Preview', icon: Eye },
                { key: 'seo', label: 'SEO', icon: null },
                { key: 'settings', label: 'Settings', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                    currentView === key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 mr-1" />}
                  {label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            {editorState.status === 'scheduled' && editorState.scheduledAt && (
              <button
                onClick={handleSchedule}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </button>
            )}

            <button
              onClick={handlePublish}
              disabled={isSaving || !editorState.title.trim() || !editorState.content.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'editor' && renderEditor()}
            {currentView === 'preview' && renderPreview()}
            {currentView === 'seo' && renderSEO()}
            {currentView === 'settings' && renderSettings()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}