import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCaseStudy, generateStaticParams as generateCMSParams } from '@/lib/cms/server';
import { transformCaseStudy } from '@/lib/cms/utils';
import { generateCaseStudySchema } from '@/lib/seo/schemaMarkup';
import { generateMetaTitle, generateMetaDescription } from '@/lib/cms/utils';
import CaseStudyContent from '@/components/cms/CaseStudyContent';

interface CaseStudyPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const caseStudy = await getCaseStudy(params.slug);
  
  if (!caseStudy) {
    return {
      title: 'Case Study Not Found | Zoptal',
      description: 'The requested case study could not be found.',
    };
  }
  
  const transformedCaseStudy = transformCaseStudy(caseStudy);
  const { fields } = transformedCaseStudy;
  
  const title = generateMetaTitle(`${fields.title} - ${fields.client} Case Study`);
  const description = generateMetaDescription(fields.description);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/case-studies/${fields.slug}`;
  
  return {
    title,
    description,
    keywords: `${fields.industry}, ${fields.technologiesUsed.join(', ')}, case study, ${fields.client}`,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'Zoptal',
      images: fields.featuredImageUrl ? [{
        url: fields.featuredImageUrl,
        width: 1200,
        height: 630,
        alt: `${fields.client} - ${fields.title}`,
      }] : undefined,
      publishedTime: fields.publishDate,
      modifiedTime: caseStudy.sys.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: fields.featuredImageUrl ? [fields.featuredImageUrl] : undefined,
      creator: '@zoptal',
    },
    alternates: {
      canonical: url,
    },
    other: {
      'article:section': 'Case Studies',
      'article:tag': fields.technologiesUsed.join(', '),
    },
  };
}

export async function generateStaticParams() {
  return await generateCMSParams.caseStudies();
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const caseStudy = await getCaseStudy(params.slug);
  
  if (!caseStudy) {
    notFound();
  }

  const transformedCaseStudy = transformCaseStudy(caseStudy);
  const { fields } = transformedCaseStudy;
  
  // Generate schema markup
  const schema = generateCaseStudySchema({
    title: fields.title,
    description: fields.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/case-studies/${fields.slug}`,
    client: fields.client,
    industry: fields.industry,
    technologies: fields.technologiesUsed,
    results: [fields.description], // You might want to extract actual results
    datePublished: fields.publishDate,
    projectDuration: fields.projectDuration,
    teamSize: fields.teamSize,
    budget: fields.budget ? {
      currency: fields.currency || 'USD',
      amount: fields.budget,
    } : undefined,
  });
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CaseStudyContent caseStudy={transformedCaseStudy} />
    </>
  );
}