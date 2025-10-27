import { FC } from 'react';

interface LocalBusinessProps {
  businessName: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  website: string;
  priceRange?: string;
  openingHours?: string[];
  services: string[];
  areaServed?: string | string[];
  foundingDate?: string;
  numberOfEmployees?: string;
  sameAs?: string[];
  image?: string;
  logo?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
      worstRating?: number;
    };
  }>;
}

const LocalBusinessSchema: FC<LocalBusinessProps> = ({
  businessName,
  description,
  address,
  geo,
  telephone,
  email,
  website,
  priceRange,
  openingHours,
  services,
  areaServed,
  foundingDate,
  numberOfEmployees,
  sameAs,
  image,
  logo,
  aggregateRating,
  reviews
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${website}#organization`,
    "name": businessName,
    "description": description,
    "url": website,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    ...(geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": geo.latitude,
        "longitude": geo.longitude
      }
    }),
    ...(telephone && { "telephone": telephone }),
    ...(email && { "email": email }),
    ...(priceRange && { "priceRange": priceRange }),
    ...(openingHours && openingHours.length > 0 && { "openingHours": openingHours }),
    ...(foundingDate && { "foundingDate": foundingDate }),
    ...(numberOfEmployees && { "numberOfEmployees": numberOfEmployees }),
    ...(logo && { "logo": logo }),
    ...(image && { "image": image }),
    ...(sameAs && sameAs.length > 0 && { "sameAs": sameAs }),
    ...(areaServed && {
      "areaServed": Array.isArray(areaServed) 
        ? areaServed.map(area => ({
            "@type": "City",
            "name": area
          }))
        : {
            "@type": "City", 
            "name": areaServed
          }
    }),
    "makesOffer": services.map(service => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service
      }
    })),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "ratingCount": aggregateRating.ratingCount,
        "bestRating": aggregateRating.bestRating || 5,
        "worstRating": aggregateRating.worstRating || 1
      }
    }),
    ...(reviews && reviews.length > 0 && {
      "review": reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "datePublished": review.datePublished,
        "reviewBody": review.reviewBody,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.reviewRating.ratingValue,
          "bestRating": review.reviewRating.bestRating || 5,
          "worstRating": review.reviewRating.worstRating || 1
        }
      }))
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default LocalBusinessSchema;