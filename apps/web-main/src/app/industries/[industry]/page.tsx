import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IndustryPageTemplate from '@/components/industry/IndustryPageTemplate';
import { getIndustryBySlug, generateIndustryPageData, getAllIndustrySlugs } from '@/lib/industry/data';

interface IndustryPageProps {
  params: {
    industry: string;
  };
}

export async function generateStaticParams() {
  const industrySlugs = getAllIndustrySlugs();
  
  return industrySlugs.map((industry) => ({
    industry,
  }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const industryData = getIndustryBySlug(params.industry);
  
  if (!industryData) {
    return {
      title: 'Industry Not Found | Zoptal',
    };
  }

  const pageData = generateIndustryPageData(industryData);
  
  return {
    title: pageData.seo.title,
    description: pageData.seo.description,
    keywords: pageData.seo.keywords,
    alternates: {
      canonical: `https://zoptal.com/industries/${params.industry}`,
    },
    openGraph: {
      title: pageData.seo.title,
      description: pageData.seo.description,
      url: `https://zoptal.com/industries/${params.industry}`,
      siteName: 'Zoptal',
      type: 'website',
      images: [
        {
          url: `/images/og/industry-${params.industry}.jpg`,
          width: 1200,
          height: 630,
          alt: `${industryData.name} Software Development`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.seo.title,
      description: pageData.seo.description,
      images: [`/images/og/industry-${params.industry}.jpg`],
      creator: '@ZoptalTech',
    },
  };
}

export default function IndustryPage({ params }: IndustryPageProps) {
  const industryData = getIndustryBySlug(params.industry);
  
  if (!industryData) {
    notFound();
  }

  const pageData = generateIndustryPageData(industryData);
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${industryData.name} Software Development`,
            description: industryData.description,
            provider: {
              '@type': 'Organization',
              name: 'Zoptal',
              url: 'https://zoptal.com',
              logo: 'https://zoptal.com/images/logo.png',
            },
            serviceType: 'Software Development',
            areaServed: 'Worldwide',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `${industryData.name} Services`,
              itemListElement: pageData.services.featured.map((service, index) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: service.name,
                  description: service.description,
                },
                position: index + 1,
              })),
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '89',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />

      {/* Industry-specific structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${industryData.name} Software Development Solutions`,
            description: industryData.description,
            author: {
              '@type': 'Organization',
              name: 'Zoptal',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Zoptal',
              logo: {
                '@type': 'ImageObject',
                url: 'https://zoptal.com/images/logo.png',
              },
            },
            datePublished: '2024-01-01',
            dateModified: new Date().toISOString(),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://zoptal.com/industries/${params.industry}`,
            },
            about: {
              '@type': 'Thing',
              name: `${industryData.name} Industry`,
              description: `Software development solutions for the ${industryData.name.toLowerCase()} industry`,
            },
          }),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: pageData.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <IndustryPageTemplate data={pageData} />
    </>
  );
}