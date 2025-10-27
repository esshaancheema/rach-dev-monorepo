'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getOptimizedImageUrl } from '@/lib/cms/utils';

interface RichTextRendererProps {
  content: any;
  className?: string;
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) {
    return null;
  }

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong className="font-semibold">{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em className="italic">{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u className="underline">{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.DOCUMENT]: (node: any, children: React.ReactNode) => (
        <div className={className}>{children}</div>
      ),
      [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
        <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => (
        <h1 className="text-4xl font-bold mb-6 text-gray-900">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => (
        <h2 className="text-3xl font-bold mb-4 text-gray-900 mt-8">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => (
        <h3 className="text-2xl font-semibold mb-3 text-gray-900 mt-6">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node: any, children: React.ReactNode) => (
        <h4 className="text-xl font-semibold mb-2 text-gray-900 mt-4">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (node: any, children: React.ReactNode) => (
        <h5 className="text-lg font-semibold mb-2 text-gray-900 mt-4">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (node: any, children: React.ReactNode) => (
        <h6 className="text-base font-semibold mb-2 text-gray-900 mt-4">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
        <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
        <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
        <li className="ml-4">{children}</li>
      ),
      [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
        <blockquote className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-blue-50 italic text-gray-700">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const { target } = node.data;
        if (!target || !target.fields) return null;
        
        const { file, title, description } = target.fields;
        if (!file || !file.url) return null;
        
        const isImage = file.contentType?.startsWith('image/');
        if (!isImage) return null;
        
        const imageUrl = getOptimizedImageUrl(target, {
          width: 800,
          format: 'webp',
          quality: 85,
        });
        
        return (
          <figure className="my-8">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={title || description || 'Content image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            {(title || description) && (
              <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
                {title || description}
              </figcaption>
            )}
          </figure>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const { target } = node.data;
        if (!target || !target.fields) return null;
        
        // Handle different embedded entry types
        const contentType = target.sys?.contentType?.sys?.id;
        
        switch (contentType) {
          case 'codeBlock':
            return <CodeBlock entry={target} />;
          case 'callout':
            return <Callout entry={target} />;
          case 'videoEmbed':
            return <VideoEmbed entry={target} />;
          default:
            return null;
        }
      },
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { uri } = node.data;
        const isExternal = uri.startsWith('http') && !uri.includes(process.env.NEXT_PUBLIC_SITE_URL);
        
        if (isExternal) {
          return (
            <a
              href={uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          );
        }
        
        return (
          <Link href={uri} className="text-blue-600 hover:text-blue-800 underline">
            {children}
          </Link>
        );
      },
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { target } = node.data;
        if (!target || !target.fields) return <span>{children}</span>;
        
        // Generate URL based on content type
        const contentType = target.sys?.contentType?.sys?.id;
        let href = '#';
        
        switch (contentType) {
          case 'blogPost':
            href = `/blog/${target.fields.slug}`;
            break;
          case 'caseStudy':
            href = `/case-studies/${target.fields.slug}`;
            break;
          case 'service':
            href = `/services/${target.fields.slug}`;
            break;
        }
        
        return (
          <Link href={href} className="text-blue-600 hover:text-blue-800 underline">
            {children}
          </Link>
        );
      },
      [INLINES.ASSET_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { target } = node.data;
        if (!target || !target.fields || !target.fields.file) {
          return <span>{children}</span>;
        }
        
        const fileUrl = `https:${target.fields.file.url}`;
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {children}
          </a>
        );
      },
    },
  };

  return documentToReactComponents(content, options);
}

// Custom components for embedded entries
function CodeBlock({ entry }: { entry: any }) {
  const { language, code, title } = entry.fields;
  
  return (
    <Card className="my-6 p-0 overflow-hidden">
      {title && (
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-gray-900 text-gray-100">
        <code className={language ? `language-${language}` : ''}>
          {code}
        </code>
      </pre>
    </Card>
  );
}

function Callout({ entry }: { entry: any }) {
  const { type, title, content } = entry.fields;
  
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  
  const typeIcons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  const styleClass = typeStyles[type as keyof typeof typeStyles] || typeStyles.info;
  const icon = typeIcons[type as keyof typeof typeIcons] || typeIcons.info;
  
  return (
    <Card className={`my-6 p-4 border-l-4 ${styleClass}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-2">{title}</h4>}
          <RichTextRenderer content={content} />
        </div>
      </div>
    </Card>
  );
}

function VideoEmbed({ entry }: { entry: any }) {
  const { url, title, description } = entry.fields;
  
  // Extract video ID and platform
  let embedUrl = '';
  let platform = '';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    platform = 'youtube';
    const videoId = url.includes('youtu.be') 
      ? url.split('/').pop() 
      : url.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('vimeo.com')) {
    platform = 'vimeo';
    const videoId = url.split('/').pop();
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }
  
  if (!embedUrl) {
    return (
      <Card className="my-6 p-4">
        <p className="text-gray-600">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Watch video: {title || url}
          </a>
        </p>
      </Card>
    );
  }
  
  return (
    <figure className="my-8">
      <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {(title || description) && (
        <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
          {title || description}
        </figcaption>
      )}
    </figure>
  );
}