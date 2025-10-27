// Advanced Image Optimization System for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  progressive?: boolean;
  lossless?: boolean;
  mozjpeg?: boolean;
  background?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  orientation?: number;
  colorSpace?: string;
  density?: number;
}

export interface OptimizedImage {
  buffer: ArrayBuffer;
  metadata: ImageMetadata;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  url?: string;
}

export interface ResponsiveImageSet {
  src: string;
  srcSet: string;
  sizes: string;
  placeholder: string;
  metadata: ImageMetadata;
  variants: Array<{
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }>;
}

export interface WebPSupport {
  webp: boolean;
  avif: boolean;
  modern: boolean;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private supportedFormats: Set<string> = new Set(['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'svg']);
  private cache: Map<string, OptimizedImage> = new Map();
  private processingQueue: Map<string, Promise<OptimizedImage>> = new Map();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Optimize single image
   */
  async optimizeImage(
    input: string | ArrayBuffer | File, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    try {
      const startTime = performance.now();
      
      // Generate cache key
      const cacheKey = await this.generateCacheKey(input, options);
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        
        analytics.track({
          name: 'image_optimization_cache_hit',
          category: 'performance',
          properties: {
            cache_key: cacheKey,
            format: cached.format
          }
        });
        
        return cached;
      }

      // Check if already processing
      if (this.processingQueue.has(cacheKey)) {
        return await this.processingQueue.get(cacheKey)!;
      }

      // Start processing
      const processingPromise = this.processImage(input, options);
      this.processingQueue.set(cacheKey, processingPromise);

      try {
        const result = await processingPromise;
        
        // Cache result
        this.cache.set(cacheKey, result);
        
        const endTime = performance.now();
        
        analytics.track({
          name: 'image_optimized',
          category: 'performance',
          properties: {
            original_size: result.originalSize,
            optimized_size: result.optimizedSize,
            compression_ratio: result.compressionRatio,
            format: result.format,
            processing_time: endTime - startTime,
            width: result.metadata.width,
            height: result.metadata.height
          }
        });

        return result;
      } finally {
        this.processingQueue.delete(cacheKey);
      }
    } catch (error) {
      console.error('Image optimization failed:', error);
      
      analytics.track({
        name: 'image_optimization_failed',
        category: 'performance',
        properties: {
          error: error.message
        }
      });
      
      throw error;
    }
  }

  /**
   * Generate responsive image set
   */
  async generateResponsiveImageSet(
    input: string | ArrayBuffer | File,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920],
    options: ImageOptimizationOptions = {}
  ): Promise<ResponsiveImageSet> {
    try {
      const originalMetadata = await this.getImageMetadata(input);
      const variants: ResponsiveImageSet['variants'] = [];
      const srcSetEntries: string[] = [];

      // Generate variants for each breakpoint
      for (const width of breakpoints) {
        if (width <= originalMetadata.width) {
          const height = Math.round((originalMetadata.height * width) / originalMetadata.width);
          
          const optimized = await this.optimizeImage(input, {
            ...options,
            width,
            height,
            format: options.format || 'webp'
          });

          const url = await this.saveOptimizedImage(optimized, `${width}x${height}`);
          
          variants.push({
            url,
            width,
            height,
            format: optimized.format,
            size: optimized.optimizedSize
          });

          srcSetEntries.push(`${url} ${width}w`);
        }
      }

      // Generate placeholder (small, blurred version)
      const placeholder = await this.generatePlaceholder(input);

      // Generate sizes attribute
      const sizes = this.generateSizesAttribute(breakpoints);

      const result: ResponsiveImageSet = {
        src: variants[variants.length - 1]?.url || '',
        srcSet: srcSetEntries.join(', '),
        sizes,
        placeholder,
        metadata: originalMetadata,
        variants
      };

      analytics.track({
        name: 'responsive_image_set_generated',
        category: 'performance',
        properties: {
          variant_count: variants.length,
          breakpoints: breakpoints.length,
          original_width: originalMetadata.width,
          original_height: originalMetadata.height
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to generate responsive image set:', error);
      throw error;
    }
  }

  /**
   * Generate low-quality image placeholder
   */
  async generatePlaceholder(
    input: string | ArrayBuffer | File,
    width: number = 20,
    blur: number = 10
  ): Promise<string> {
    try {
      const optimized = await this.optimizeImage(input, {
        width,
        quality: 10,
        blur,
        format: 'jpeg'
      });

      // Convert to data URL
      const base64 = await this.arrayBufferToBase64(optimized.buffer);
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Failed to generate placeholder:', error);
      // Return a simple colored placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
    }
  }

  /**
   * Detect browser format support
   */
  detectFormatSupport(): WebPSupport {
    if (typeof window === 'undefined') {
      return { webp: false, avif: false, modern: false };
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    const webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    // AVIF detection is more complex and may not be available in all browsers
    const avif = false; // Placeholder - would need more sophisticated detection

    return {
      webp,
      avif,
      modern: webp || avif
    };
  }

  /**
   * Get optimal format for browser
   */
  getOptimalFormat(originalFormat: string, browserSupport?: WebPSupport): string {
    const support = browserSupport || this.detectFormatSupport();

    // If original is already modern format, keep it
    if (originalFormat === 'webp' || originalFormat === 'avif') {
      return originalFormat;
    }

    // Return best supported modern format
    if (support.avif) return 'avif';
    if (support.webp) return 'webp';

    // Fallback to original or JPEG
    return originalFormat === 'png' ? 'png' : 'jpeg';
  }

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    images: Array<{ input: string | ArrayBuffer | File; options?: ImageOptimizationOptions }>,
    concurrency: number = 3
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];
    
    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < images.length; i += concurrency) {
      const batch = images.slice(i, i + concurrency);
      
      const batchPromises = batch.map(({ input, options }) => 
        this.optimizeImage(input, options)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch optimization failed:', result.reason);
        }
      });
    }

    analytics.track({
      name: 'batch_image_optimization_completed',
      category: 'performance',
      properties: {
        total_images: images.length,
        successful: results.length,
        failed: images.length - results.length,
        concurrency
      }
    });

    return results;
  }

  /**
   * Progressive JPEG enhancement
   */
  async enhanceForProgressive(input: string | ArrayBuffer | File): Promise<OptimizedImage> {
    return this.optimizeImage(input, {
      format: 'jpeg',
      progressive: true,
      mozjpeg: true,
      quality: 85
    });
  }

  /**
   * Create image sprite from multiple images
   */
  async createSprite(
    images: Array<{ input: string | ArrayBuffer | File; name: string }>,
    options: {
      direction?: 'horizontal' | 'vertical';
      spacing?: number;
      format?: string;
      quality?: number;
    } = {}
  ): Promise<{
    sprite: OptimizedImage;
    coordinates: Record<string, { x: number; y: number; width: number; height: number }>;
  }> {
    try {
      // This is a simplified implementation
      // In production, you'd use a proper image processing library like Sharp
      
      const optimizedImages = await Promise.all(
        images.map(({ input }) => this.optimizeImage(input))
      );

      const coordinates: Record<string, { x: number; y: number; width: number; height: number }> = {};
      let currentX = 0;
      let currentY = 0;

      // Calculate coordinates for each image
      optimizedImages.forEach((img, index) => {
        const name = images[index].name;
        
        coordinates[name] = {
          x: options.direction === 'vertical' ? 0 : currentX,
          y: options.direction === 'vertical' ? currentY : 0,
          width: img.metadata.width,
          height: img.metadata.height
        };

        if (options.direction === 'vertical') {
          currentY += img.metadata.height + (options.spacing || 0);
        } else {
          currentX += img.metadata.width + (options.spacing || 0);
        }
      });

      // Create mock sprite (in production, would actually combine images)
      const mockSprite: OptimizedImage = {
        buffer: new ArrayBuffer(0),
        metadata: {
          width: options.direction === 'vertical' ? 
                  Math.max(...optimizedImages.map(img => img.metadata.width)) :
                  optimizedImages.reduce((sum, img) => sum + img.metadata.width, 0),
          height: options.direction === 'vertical' ?
                   optimizedImages.reduce((sum, img) => sum + img.metadata.height, 0) :
                   Math.max(...optimizedImages.map(img => img.metadata.height)),
          format: options.format || 'png',
          size: 0,
          hasAlpha: true
        },
        originalSize: optimizedImages.reduce((sum, img) => sum + img.originalSize, 0),
        optimizedSize: 0,
        compressionRatio: 0,
        format: options.format || 'png'
      };

      analytics.track({
        name: 'image_sprite_created',
        category: 'performance',
        properties: {
          image_count: images.length,
          direction: options.direction || 'horizontal',
          sprite_width: mockSprite.metadata.width,
          sprite_height: mockSprite.metadata.height
        }
      });

      return {
        sprite: mockSprite,
        coordinates
      };
    } catch (error) {
      console.error('Failed to create image sprite:', error);
      throw error;
    }
  }

  /**
   * Analyze image for optimization opportunities
   */
  async analyzeImage(input: string | ArrayBuffer | File): Promise<{
    metadata: ImageMetadata;
    recommendations: Array<{
      type: 'format' | 'quality' | 'resize' | 'compression';
      current: any;
      recommended: any;
      potentialSavings: number;
      reason: string;
    }>;
  }> {
    try {
      const metadata = await this.getImageMetadata(input);
      const recommendations = [];

      // Format recommendation
      if (metadata.format === 'png' && !metadata.hasAlpha) {
        recommendations.push({
          type: 'format' as const,
          current: 'png',
          recommended: 'jpeg',
          potentialSavings: 60,
          reason: 'PNG without transparency can be converted to JPEG for better compression'
        });
      }

      // Modern format recommendation
      if (['jpeg', 'png'].includes(metadata.format.toLowerCase())) {
        recommendations.push({
          type: 'format' as const,
          current: metadata.format,
          recommended: 'webp',
          potentialSavings: 25,
          reason: 'WebP provides better compression than traditional formats'
        });
      }

      // Size recommendation
      if (metadata.width > 1920 || metadata.height > 1080) {
        recommendations.push({
          type: 'resize' as const,
          current: `${metadata.width}x${metadata.height}`,
          recommended: '1920x1080',
          potentialSavings: 40,
          reason: 'Large images can be resized for better performance'
        });
      }

      // Quality recommendation
      if (metadata.size > 500 * 1024) { // 500KB
        recommendations.push({
          type: 'quality' as const,
          current: 100,
          recommended: 85,
          potentialSavings: 30,
          reason: 'Reducing quality slightly can significantly reduce file size'
        });
      }

      analytics.track({
        name: 'image_analyzed',
        category: 'performance',
        properties: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          recommendations_count: recommendations.length
        }
      });

      return {
        metadata,
        recommendations
      };
    } catch (error) {
      console.error('Failed to analyze image:', error);
      throw error;
    }
  }

  /**
   * Clear optimization cache
   */
  clearCache(): void {
    this.cache.clear();
    this.processingQueue.clear();

    analytics.track({
      name: 'image_optimization_cache_cleared',
      category: 'performance'
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    totalSizeBytes: number;
    hitRate: number;
    processingQueueSize: number;
  } {
    const totalSizeBytes = Array.from(this.cache.values())
      .reduce((sum, img) => sum + img.optimizedSize, 0);

    return {
      size: this.cache.size,
      totalSizeBytes,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      processingQueueSize: this.processingQueue.size
    };
  }

  /**
   * Private helper methods
   */
  private async processImage(
    input: string | ArrayBuffer | File,
    options: ImageOptimizationOptions
  ): Promise<OptimizedImage> {
    // Get input buffer
    const inputBuffer = await this.getInputBuffer(input);
    const originalMetadata = await this.getImageMetadata(inputBuffer);
    
    // For demo purposes, return mock optimization result
    // In production, this would use a library like Sharp or similar
    const mockOptimized: OptimizedImage = {
      buffer: inputBuffer,
      metadata: {
        ...originalMetadata,
        width: options.width || originalMetadata.width,
        height: options.height || originalMetadata.height,
        format: options.format || originalMetadata.format
      },
      originalSize: inputBuffer.byteLength,
      optimizedSize: Math.round(inputBuffer.byteLength * 0.7), // Mock 30% reduction
      compressionRatio: 0.3,
      format: options.format || originalMetadata.format
    };

    return mockOptimized;
  }

  private async getInputBuffer(input: string | ArrayBuffer | File): Promise<ArrayBuffer> {
    if (input instanceof ArrayBuffer) {
      return input;
    }
    
    if (input instanceof File) {
      return await input.arrayBuffer();
    }
    
    // Assume it's a URL or base64 string
    if (input.startsWith('data:')) {
      const base64 = input.split(',')[1];
      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
      }
      return buffer;
    }

    // Fetch from URL
    const response = await fetch(input);
    return await response.arrayBuffer();
  }

  private async getImageMetadata(input: string | ArrayBuffer | File): Promise<ImageMetadata> {
    const buffer = await this.getInputBuffer(input);
    
    // Basic metadata extraction (simplified)
    // In production, would use proper image library
    return {
      width: 1920, // Mock values
      height: 1080,
      format: 'jpeg',
      size: buffer.byteLength,
      hasAlpha: false,
      orientation: 1,
      colorSpace: 'srgb',
      density: 72
    };
  }

  private async generateCacheKey(
    input: string | ArrayBuffer | File,
    options: ImageOptimizationOptions
  ): Promise<string> {
    // Simple hash generation - in production, use proper hashing
    const optionsStr = JSON.stringify(options);
    let inputStr = '';
    
    if (typeof input === 'string') {
      inputStr = input;
    } else {
      const buffer = await this.getInputBuffer(input);
      inputStr = buffer.byteLength.toString();
    }
    
    return btoa(`${inputStr}_${optionsStr}`).replace(/[^a-zA-Z0-9]/g, '');
  }

  private async saveOptimizedImage(image: OptimizedImage, suffix: string): Promise<string> {
    // Mock URL generation - in production, would save to CDN/storage
    return `/optimized-images/${Date.now()}_${suffix}.${image.format}`;
  }

  private generateSizesAttribute(breakpoints: number[]): string {
    const sizes = breakpoints.map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp}px`;
      }
      return `(max-width: ${bp}px) ${bp}px`;
    });
    
    return sizes.join(', ');
  }

  private async arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();

// React hook for image optimization
export function useImageOptimization() {
  const optimizeImage = async (
    input: string | File,
    options?: ImageOptimizationOptions
  ) => {
    return await imageOptimizer.optimizeImage(input, options);
  };

  const generateResponsiveSet = async (
    input: string | File,
    breakpoints?: number[],
    options?: ImageOptimizationOptions
  ) => {
    return await imageOptimizer.generateResponsiveImageSet(input, breakpoints, options);
  };

  const generatePlaceholder = async (input: string | File) => {
    return await imageOptimizer.generatePlaceholder(input);
  };

  const analyzeImage = async (input: string | File) => {
    return await imageOptimizer.analyzeImage(input);
  };

  return {
    optimizeImage,
    generateResponsiveSet,
    generatePlaceholder,
    analyzeImage,
    detectFormatSupport: imageOptimizer.detectFormatSupport.bind(imageOptimizer),
    getOptimalFormat: imageOptimizer.getOptimalFormat.bind(imageOptimizer)
  };
}

// Utility components for optimized images
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  responsive?: boolean;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Image optimization utilities
export const imageUtils = {
  /**
   * Check if image format is supported
   */
  isFormatSupported: (format: string): boolean => {
    const supported = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'svg'];
    return supported.includes(format.toLowerCase());
  },

  /**
   * Calculate aspect ratio
   */
  calculateAspectRatio: (width: number, height: number): number => {
    return width / height;
  },

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  calculateDimensions: (
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } => {
    const aspectRatio = originalWidth / originalHeight;

    if (targetWidth && targetHeight) {
      return { width: targetWidth, height: targetHeight };
    }

    if (targetWidth) {
      return { width: targetWidth, height: Math.round(targetWidth / aspectRatio) };
    }

    if (targetHeight) {
      return { width: Math.round(targetHeight * aspectRatio), height: targetHeight };
    }

    return { width: originalWidth, height: originalHeight };
  }
};