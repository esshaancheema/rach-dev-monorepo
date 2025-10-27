import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';
import { getOptimizedImageUrl } from '@/lib/cms/utils';

interface AMPRichTextRendererProps {
  content: any;
  className?: string;
}

export function AMPRichTextRenderer({ content, className = '' }: AMPRichTextRendererProps) {
  if (!content) {
    return null;
  }

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => <code>{text}</code>,
    },
    renderNode: {
      [BLOCKS.DOCUMENT]: (node: any, children: React.ReactNode) => (
        <div className={className}>{children}</div>
      ),
      [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => <p>{children}</p>,
      [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => <h1>{children}</h1>,
      [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => <h2>{children}</h2>,
      [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => <h3>{children}</h3>,
      [BLOCKS.HEADING_4]: (node: any, children: React.ReactNode) => <h4>{children}</h4>,
      [BLOCKS.HEADING_5]: (node: any, children: React.ReactNode) => <h5>{children}</h5>,
      [BLOCKS.HEADING_6]: (node: any, children: React.ReactNode) => <h6>{children}</h6>,
      [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => <ul>{children}</ul>,
      [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => <ol>{children}</ol>,
      [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => <li>{children}</li>,
      [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
        <blockquote>{children}</blockquote>
      ),
      [BLOCKS.HR]: () => <hr />,
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
        
        // Use amp-img for AMP compatibility
        return (
          <figure>
            <amp-img
              src={imageUrl}
              width="800"
              height="450"
              layout="responsive"
              alt={title || description || 'Content image'}
            />
            {(title || description) && (
              <figcaption>{title || description}</figcaption>
            )}
          </figure>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const { target } = node.data;
        if (!target || !target.fields) return null;
        
        // Handle different embedded entry types for AMP
        const contentType = target.sys?.contentType?.sys?.id;
        
        switch (contentType) {
          case 'codeBlock':
            return <AMPCodeBlock entry={target} />;
          case 'callout':
            return <AMPCallout entry={target} />;
          case 'videoEmbed':
            return <AMPVideoEmbed entry={target} />;
          default:
            return null;
        }
      },
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { uri } = node.data;
        const isExternal = uri.startsWith('http') && !uri.includes(process.env.NEXT_PUBLIC_SITE_URL);
        
        return (
          <a
            href={uri}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
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
        
        return <a href={href}>{children}</a>;
      },
      [INLINES.ASSET_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { target } = node.data;
        if (!target || !target.fields || !target.fields.file) {
          return <span>{children}</span>;
        }
        
        const fileUrl = `https:${target.fields.file.url}`;
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
    },
  };

  return documentToReactComponents(content, options);
}

// AMP-compatible components for embedded entries
function AMPCodeBlock({ entry }: { entry: any }) {
  const { language, code, title } = entry.fields;
  
  return (
    <div className="amp-code-block">
      {title && <h4>{title}</h4>}
      <pre>
        <code className={language ? `language-${language}` : ''}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function AMPCallout({ entry }: { entry: any }) {
  const { type, title, content } = entry.fields;
  
  const typeClass = `amp-callout amp-callout-${type || 'info'}`;
  
  return (
    <div className={typeClass}>
      {title && <h4>{title}</h4>}
      <AMPRichTextRenderer content={content} />
    </div>
  );
}

function AMPVideoEmbed({ entry }: { entry: any }) {
  const { url, title, description } = entry.fields;
  
  // Extract video ID and platform for AMP components
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('youtu.be') 
      ? url.split('/').pop() 
      : url.split('v=')[1]?.split('&')[0];
    
    return (
      <figure>
        <amp-youtube
          data-videoid={videoId}
          layout="responsive"
          width="480"
          height="270"
        />
        {(title || description) && (
          <figcaption>{title || description}</figcaption>
        )}
      </figure>
    );
  } else if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    
    return (
      <figure>
        <amp-vimeo
          data-videoid={videoId}
          layout="responsive"
          width="500"
          height="281"
        />
        {(title || description) && (
          <figcaption>{title || description}</figcaption>
        )}
      </figure>
    );
  }
  
  // Fallback for unsupported video platforms
  return (
    <div className="amp-video-fallback">
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Watch video: {title || url}
        </a>
      </p>
    </div>
  );
}