'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextRenderer } from './RichTextRenderer';
import { ShareButtons } from './ShareButtons';
import type { Entry } from 'contentful';

interface ServiceContentProps {
  service: Entry<any>;
}

export default function ServiceContent({ service }: ServiceContentProps) {
  const { fields } = service;

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-gray-900">
                Services
              </Link>
              <span>/</span>
              <span className="text-gray-900">{fields.name}</span>
            </nav>
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" size="sm">
                  {fields.categoryName}
                </Badge>
                {fields.featured && (
                  <Badge variant="secondary" size="sm">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {fields.name}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {fields.shortDescription}
              </p>
              
              {/* Service Details */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                {fields.startingPrice && (
                  <div>
                    <span className="font-medium">Starting at:</span> {fields.currency} {fields.startingPrice.toLocaleString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Delivery:</span> {fields.deliveryTime}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {fields.status === 'active' ? 'Available' : 'Coming Soon'}
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            {fields.featuredImageUrl && (
              <div className="aspect-video relative rounded-xl overflow-hidden shadow-xl mb-12">
                <Image
                  src={fields.featuredImageUrl}
                  alt={fields.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Service Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">What's Included</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {fields.features.map((feature: string, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{feature}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Service Description */}
              <h2 className="text-3xl font-bold mb-6">Service Overview</h2>
              <div className="mb-12">
                <RichTextRenderer content={fields.fullDescription} />
              </div>
              
              {/* Benefits */}
              {fields.benefits && fields.benefits.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Benefits</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {fields.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Process Steps */}
              {fields.processSteps && fields.processSteps.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Our Process</h2>
                  <div className="space-y-6">
                    {fields.processSteps.map((step: any, index: number) => (
                      <Card key={index} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {step.order || index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-600 mb-2">{step.description}</p>
                            {step.duration && (
                              <p className="text-sm text-gray-500">Duration: {step.duration}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Technologies */}
              {fields.technologies && fields.technologies.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Technologies We Use</h2>
                  <div className="flex flex-wrap gap-3">
                    {fields.technologies.map((tech: string) => (
                      <Badge key={tech} size="lg" variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* What's Included */}
              {fields.includes && fields.includes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">What You Get</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {fields.includes.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* FAQ */}
              {fields.faqList && fields.faqList.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {fields.faqList.map((faq: any, index: number) => (
                      <Card key={index} className="p-6">
                        <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                        <RichTextRenderer content={faq.answer} />
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <ShareButtons
                title={fields.name}
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/services/${fields.slug}`}
                description={fields.shortDescription}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Case Studies */}
      {fields.relatedCaseStudies && fields.relatedCaseStudies.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Success Stories</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {fields.relatedCaseStudies.slice(0, 3).map((caseStudy: any) => (
                  <Card key={caseStudy.sys.id} className="hover:shadow-lg transition-shadow">
                    {caseStudy.fields.featuredImageUrl && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <Image
                          src={caseStudy.fields.featuredImageUrl}
                          alt={caseStudy.fields.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <Badge variant="outline" size="sm" className="mb-3">
                        {caseStudy.fields.industry}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-3">
                        {caseStudy.fields.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {caseStudy.fields.description}
                      </p>
                      <Link
                        href={`/case-studies/${caseStudy.fields.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                      >
                        Read Case Study
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let's discuss how {fields.name.toLowerCase()} can help transform your business.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline-white" size="lg">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}