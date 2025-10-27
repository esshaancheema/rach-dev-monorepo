import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Zoptal - AI-Accelerated Development Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          fontSize: 32,
          fontWeight: 600,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1,
          }}
        />
        
        {/* Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo Area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          {/* Logo Symbol */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: '36px',
                fontWeight: 'bold',
              }}
            >
              Z
            </div>
          </div>
          
          {/* Company Name */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Zoptal
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '30px',
            maxWidth: '900px',
            color: '#1f2937',
          }}
        >
          AI-Accelerated Development Platform
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            textAlign: 'center',
            color: '#6b7280',
            maxWidth: '700px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Transform your development workflow with intelligent code generation, 
          automated testing, and AI-powered optimization
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#4b5563',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                marginRight: '8px',
              }}
            />
            10x Faster Development
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#4b5563',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#3b82f6',
                borderRadius: '50%',
                marginRight: '8px',
              }}
            />
            AI + Human Expertise
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#4b5563',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#8b5cf6',
                borderRadius: '50%',
                marginRight: '8px',
              }}
            />
            Enterprise-Grade Security
          </div>
        </div>

        {/* Bottom Stats */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>
                500+
              </div>
              <div>Projects Delivered</div>
            </div>
            <div
              style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>
                95%
              </div>
              <div>Client Retention</div>
            </div>
            <div
              style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2563eb' }}>
                3 Days
              </div>
              <div>Average MVP Time</div>
            </div>
          </div>
          
          {/* Website URL */}
          <div
            style={{
              fontSize: '16px',
              color: '#9ca3af',
              fontWeight: '500',
            }}
          >
            zoptal.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}