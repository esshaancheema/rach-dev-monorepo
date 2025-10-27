import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getService, generateStaticParams as generateCMSParams } from '@/lib/cms/server';
import { transformService } from '@/lib/cms/utils';
import { generateServiceSchema } from '@/lib/seo/schemaMarkup';
import { generateMetaTitle, generateMetaDescription } from '@/lib/cms/utils';
import ServiceContent from '@/components/cms/ServiceContent';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return await generateCMSParams.services();
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await getService(params.slug);
  
  if (!service) {
    return {
      title: 'Service Not Found',
      description: 'The requested service could not be found.',
    };
  }

  const transformedService = transformService(service);
  const { fields } = transformedService;
  
  const title = generateMetaTitle(`${fields.name} - Professional Services`);
  const description = generateMetaDescription(fields.shortDescription);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/services/${fields.slug}`;
  
  return {
    title,
    description,
    keywords: `${fields.name}, ${fields.categoryName}, ${fields.features.join(', ')}, professional services`,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'Zoptal',
      images: fields.featuredImageUrl ? [{
        url: fields.featuredImageUrl,
        width: 1200,
        height: 630,
        alt: fields.name,
      }] : undefined,
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
      'product:price:currency': fields.currency,
      'product:price:amount': fields.startingPrice?.toString(),
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = await getService(params.slug);
  
  if (!service) {
    notFound();
  }

  const transformedService = transformService(service);
  const { fields } = transformedService;
  
  // Generate schema markup
  const schema = generateServiceSchema({
    name: fields.name,
    description: fields.shortDescription,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${fields.slug}`,
    category: fields.categoryName,
    price: fields.startingPrice ? {
      currency: fields.currency,
      minPrice: fields.startingPrice,
    } : undefined,
    features: fields.features,
    duration: fields.deliveryTime,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ServiceContent service={transformedService} />
    </>
  );
}