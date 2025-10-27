'use client';

import { useState, useEffect } from 'react';

export interface IndustryData {
  industry: string;
  confidence: number;
  detectionMethod: 'url' | 'referrer' | 'storage' | 'survey' | 'default';
  isLoading: boolean;
  error: string | null;
}

export interface IndustryContent {
  title: string;
  description: string;
  ctaText: string;
  features: string[];
  caseStudies: string[];
  solutions: string[];
  testimonials: {
    name: string;
    role: string;
    company: string;
    quote: string;
  }[];
}

const industries = {
  'healthcare': {
    title: 'Healthcare & Medical Technology',
    description: 'HIPAA-compliant software solutions for healthcare providers, telemedicine platforms, and medical device integration.',
    ctaText: 'Get Healthcare-Compliant Solutions',
    features: [
      'HIPAA-compliant architecture',
      'Electronic Health Records (EHR) integration',
      'Telemedicine platforms',
      'Medical device connectivity',
      'Patient portal development',
      'Healthcare analytics & reporting'
    ],
    caseStudies: ['telemedicine-platform', 'ehr-integration', 'patient-portal'],
    solutions: ['telemedicine', 'healthcare-management', 'medical-devices'],
    testimonials: [
      {
        name: 'Dr. Sarah Johnson',
        role: 'Chief Medical Officer',
        company: 'Regional Health System',
        quote: 'Zoptal\'s telemedicine platform helped us serve 10,000+ patients remotely during the pandemic.'
      }
    ]
  },
  'fintech': {
    title: 'Financial Technology & Banking',
    description: 'Secure, scalable fintech solutions with regulatory compliance for banking, payments, and financial services.',
    ctaText: 'Build Secure Fintech Solutions',
    features: [
      'SOC 2 Type II compliance',
      'Payment gateway integration',
      'Blockchain & cryptocurrency support',
      'Risk management systems',
      'Regulatory reporting automation',
      'Real-time fraud detection'
    ],
    caseStudies: ['payment-platform', 'crypto-exchange', 'lending-platform'],
    solutions: ['financial-services', 'payment-processing', 'crypto-platforms'],
    testimonials: [
      {
        name: 'Michael Chen',
        role: 'CTO',
        company: 'NextGen Financial',
        quote: 'Our payment processing volume increased 300% after implementing Zoptal\'s scalable architecture.'
      }
    ]
  },
  'ecommerce': {
    title: 'E-commerce & Retail Technology',
    description: 'High-converting e-commerce platforms with advanced inventory management, payment processing, and customer analytics.',
    ctaText: 'Scale Your E-commerce Business',
    features: [
      'Multi-channel selling platforms',
      'Real-time inventory management',
      'AI-powered recommendations',
      'Advanced payment processing',
      'Customer behavior analytics',
      'Mobile commerce optimization'
    ],
    caseStudies: ['marketplace-platform', 'retail-analytics', 'mobile-commerce'],
    solutions: ['e-commerce-marketplace', 'retail-management', 'inventory-systems'],
    testimonials: [
      {
        name: 'Jennifer Liu',
        role: 'E-commerce Director',
        company: 'Premium Retail Co.',
        quote: 'Our online sales doubled within 6 months of launching our Zoptal-built platform.'
      }
    ]
  },
  'logistics': {
    title: 'Logistics & Supply Chain',
    description: 'End-to-end logistics management systems with real-time tracking, route optimization, and supply chain visibility.',
    ctaText: 'Optimize Your Supply Chain',
    features: [
      'Real-time shipment tracking',
      'Route optimization algorithms',
      'Warehouse management systems',
      'Supply chain analytics',
      'Fleet management solutions',
      'Last-mile delivery optimization'
    ],
    caseStudies: ['logistics-platform', 'fleet-management', 'warehouse-automation'],
    solutions: ['trucking-logistics', 'supply-chain', 'delivery-platforms'],
    testimonials: [
      {
        name: 'Robert Davis',
        role: 'Operations Manager',
        company: 'Global Logistics Inc.',
        quote: 'Zoptal\'s logistics platform reduced our delivery times by 35% and cut operational costs by 25%.'
      }
    ]
  },
  'education': {
    title: 'Educational Technology',
    description: 'Innovative EdTech solutions including learning management systems, virtual classrooms, and student information systems.',
    ctaText: 'Transform Digital Learning',
    features: [
      'Learning Management Systems (LMS)',
      'Virtual classroom platforms',
      'Student information systems',
      'AI-powered personalized learning',
      'Assessment & grading automation',
      'Parent-student communication portals'
    ],
    caseStudies: ['lms-platform', 'virtual-classroom', 'student-portal'],
    solutions: ['education-platforms', 'learning-management', 'virtual-learning'],
    testimonials: [
      {
        name: 'Dr. Maria Rodriguez',
        role: 'Director of Technology',
        company: 'Metropolitan School District',
        quote: 'Our student engagement increased 60% after implementing Zoptal\'s interactive learning platform.'
      }
    ]
  },
  'real-estate': {
    title: 'Real Estate Technology',
    description: 'Comprehensive PropTech solutions for property management, real estate platforms, and smart building systems.',
    ctaText: 'Modernize Real Estate Operations',
    features: [
      'Property management systems',
      'MLS integration & search',
      'Virtual property tours',
      'Tenant communication portals',
      'Maintenance request automation',
      'Real estate analytics & reporting'
    ],
    caseStudies: ['property-management', 'real-estate-platform', 'virtual-tours'],
    solutions: ['real-estate-platform', 'property-management', 'proptech-solutions'],
    testimonials: [
      {
        name: 'David Thompson',
        role: 'Managing Partner',
        company: 'Premier Properties',
        quote: 'Zoptal\'s property management system streamlined our operations and improved tenant satisfaction by 40%.'
      }
    ]
  },
  'manufacturing': {
    title: 'Manufacturing & Industrial IoT',
    description: 'Smart manufacturing solutions with IoT integration, predictive maintenance, and production optimization systems.',
    ctaText: 'Digitize Manufacturing Processes',
    features: [
      'Industrial IoT platforms',
      'Predictive maintenance systems',
      'Production planning & scheduling',
      'Quality control automation',
      'Supply chain integration',
      'Real-time performance monitoring'
    ],
    caseStudies: ['iot-manufacturing', 'predictive-maintenance', 'production-optimization'],
    solutions: ['manufacturing-systems', 'iot-platforms', 'industrial-automation'],
    testimonials: [
      {
        name: 'John Mitchell',
        role: 'Plant Manager',
        company: 'Advanced Manufacturing Corp.',
        quote: 'Our production efficiency increased 45% with Zoptal\'s IoT-enabled manufacturing platform.'
      }
    ]
  },
  'default': {
    title: 'Custom Software Development',
    description: 'Tailored software solutions designed to meet your unique business requirements and industry challenges.',
    ctaText: 'Start Your Custom Solution',
    features: [
      'Custom web applications',
      'Mobile app development',
      'API development & integration',
      'Cloud infrastructure setup',
      'Database design & optimization',
      'Third-party integrations'
    ],
    caseStudies: ['custom-platform', 'api-integration', 'cloud-migration'],
    solutions: ['custom-development', 'web-applications', 'mobile-apps'],
    testimonials: [
      {
        name: 'Lisa Anderson',
        role: 'CEO',
        company: 'Innovation Startup',
        quote: 'Zoptal delivered exactly what we envisioned and helped us launch ahead of schedule.'
      }
    ]
  }
};

const industryDetectionKeywords = {
  'healthcare': ['health', 'medical', 'hospital', 'clinic', 'telemedicine', 'hipaa', 'patient', 'doctor', 'nurse', 'pharmaceutical', 'biotech'],
  'fintech': ['finance', 'banking', 'payment', 'fintech', 'cryptocurrency', 'blockchain', 'investment', 'lending', 'insurance', 'trading'],
  'ecommerce': ['ecommerce', 'retail', 'shopping', 'store', 'marketplace', 'inventory', 'cart', 'checkout', 'product', 'commerce'],
  'logistics': ['logistics', 'shipping', 'delivery', 'warehouse', 'supply', 'transportation', 'freight', 'tracking', 'distribution'],
  'education': ['education', 'school', 'learning', 'student', 'teacher', 'course', 'university', 'training', 'edtech', 'classroom'],
  'real-estate': ['real-estate', 'property', 'realty', 'housing', 'apartment', 'commercial', 'residential', 'proptech', 'landlord'],
  'manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'automation', 'iot', 'machinery', 'assembly', 'quality-control']
};

export function useIndustryDetection(): IndustryData & { industryContent: IndustryContent } {
  const [industryData, setIndustryData] = useState<IndustryData>({
    industry: 'default',
    confidence: 0,
    detectionMethod: 'default',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function detectIndustry() {
      try {
        // Method 1: Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlIndustry = urlParams.get('industry');
        if (urlIndustry && industries[urlIndustry as keyof typeof industries]) {
          setIndustryData({
            industry: urlIndustry,
            confidence: 1.0,
            detectionMethod: 'url',
            isLoading: false,
            error: null
          });
          return;
        }

        // Method 2: Check referrer for industry keywords
        const referrer = document.referrer;
        if (referrer) {
          for (const [industry, keywords] of Object.entries(industryDetectionKeywords)) {
            const matches = keywords.filter(keyword => 
              referrer.toLowerCase().includes(keyword)
            );
            if (matches.length > 0) {
              const confidence = Math.min(matches.length * 0.3, 0.9);
              setIndustryData({
                industry,
                confidence,
                detectionMethod: 'referrer',
                isLoading: false,
                error: null
              });
              return;
            }
          }
        }

        // Method 3: Check local storage for previous industry selection
        const storedIndustry = localStorage.getItem('zoptal_industry');
        if (storedIndustry && industries[storedIndustry as keyof typeof industries]) {
          setIndustryData({
            industry: storedIndustry,
            confidence: 0.8,
            detectionMethod: 'storage',
            isLoading: false,
            error: null
          });
          return;
        }

        // Method 4: Check current page path for industry indicators
        const pathname = window.location.pathname;
        for (const [industry, keywords] of Object.entries(industryDetectionKeywords)) {
          const matches = keywords.filter(keyword => 
            pathname.toLowerCase().includes(keyword)
          );
          if (matches.length > 0) {
            const confidence = Math.min(matches.length * 0.4, 0.8);
            setIndustryData({
              industry,
              confidence,
              detectionMethod: 'url',
              isLoading: false,
              error: null
            });
            return;
          }
        }

        // Default fallback
        setIndustryData({
          industry: 'default',
          confidence: 0.5,
          detectionMethod: 'default',
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Industry detection failed:', error);
        setIndustryData({
          industry: 'default',
          confidence: 0,
          detectionMethod: 'default',
          isLoading: false,
          error: 'Failed to detect industry'
        });
      }
    }

    detectIndustry();
  }, []);

  // Get industry content
  const industryContent: IndustryContent = industries[industryData.industry as keyof typeof industries] || industries.default;

  return {
    ...industryData,
    industryContent
  };
}

// Utility function to manually set industry (for user selection)
export function setUserIndustry(industry: string): void {
  if (industries[industry as keyof typeof industries]) {
    localStorage.setItem('zoptal_industry', industry);
    // Trigger a page refresh or state update to reflect the change
    window.dispatchEvent(new CustomEvent('industryChanged', { detail: industry }));
  }
}

// Utility function to get all available industries
export function getAllIndustries(): Array<{ key: string; title: string; description: string }> {
  return Object.entries(industries)
    .filter(([key]) => key !== 'default')
    .map(([key, content]) => ({
      key,
      title: content.title,
      description: content.description
    }));
}

// Utility function to get industry-specific keywords for content personalization
export function getIndustryKeywords(industry: string): string[] {
  return industryDetectionKeywords[industry as keyof typeof industryDetectionKeywords] || [];
}