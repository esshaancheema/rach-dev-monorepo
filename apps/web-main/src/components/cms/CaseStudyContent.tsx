'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextRenderer } from './RichTextRenderer';
import { ShareButtons } from './ShareButtons';
import type { Entry } from 'contentful';

interface CaseStudyContentProps {
  caseStudy: Entry<any>;
}

export default function CaseStudyContent({ caseStudy }: CaseStudyContentProps) {
  const { fields } = caseStudy;

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
              <Link href="/case-studies" className="hover:text-gray-900">
                Case Studies
              </Link>
              <span>/</span>
              <span className="text-gray-900">{fields.title}</span>
            </nav>
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" size="sm">
                  {fields.industry}
                </Badge>
                {fields.featured && (
                  <Badge variant="secondary" size="sm">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {fields.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {fields.description}
              </p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Client:</span> {fields.client}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {fields.projectDuration}
                </div>
                <div>
                  <span className="font-medium">Team Size:</span> {fields.teamSize}
                </div>
                <div>
                  <span className="font-medium">Published:</span> {fields.formattedDate}
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            {fields.featuredImageUrl && (
              <div className="aspect-video relative rounded-xl overflow-hidden shadow-xl mb-12">
                <Image
                  src={fields.featuredImageUrl}
                  alt={fields.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Key Results */}
      {fields.budget && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Project Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {fields.projectDuration}
                  </div>
                  <div className="text-gray-600">Project Duration</div>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {fields.teamSize}
                  </div>
                  <div className="text-gray-600">Team Members</div>
                </Card>
                <Card className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {fields.budget && `${fields.currency} ${fields.budget.toLocaleString()}`}
                  </div>
                  <div className="text-gray-600">Project Budget</div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Challenge Section */}
              <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
              <div className="mb-12">
                <RichTextRenderer content={fields.challenge} />
              </div>
              
              {/* Solution Section */}
              <h2 className="text-3xl font-bold mb-6">Our Solution</h2>
              <div className="mb-12">
                <RichTextRenderer content={fields.solution} />
              </div>
              
              {/* Technologies Used */}
              <h2 className="text-3xl font-bold mb-6">Technologies Used</h2>
              <div className="mb-12">
                <div className="flex flex-wrap gap-3">
                  {fields.technologiesUsed.map((tech: string) => (
                    <Badge key={tech} size="lg" variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Testimonial */}
              {fields.clientTestimonial && (
                <div className="my-12">
                  <Card className="p-8 bg-blue-50 border-blue-200">
                    <svg className="w-12 h-12 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <blockquote className="text-lg text-gray-700 mb-4">
                      "{fields.clientTestimonial.content}"
                    </blockquote>
                    <cite className="block text-sm text-gray-600">
                      <strong>{fields.clientTestimonial.clientName}</strong>
                      <br />
                      {fields.clientTestimonial.clientPosition}, {fields.client}
                    </cite>
                  </Card>
                </div>
              )}
              
              {/* Results */}
              <h2 className="text-3xl font-bold mb-6">The Results</h2>
              <div className="mb-12">
                <RichTextRenderer content={fields.results} />
              </div>
            </div>
            
            {/* Image Gallery */}
            {fields.galleryUrls && fields.galleryUrls.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6">Project Gallery</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {fields.galleryUrls.map((imageUrl: string, index: number) => (
                    <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`${fields.title} gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <ShareButtons
                title={fields.title}
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/case-studies/${fields.slug}`}
                description={fields.description}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Case Studies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Case Studies</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Related case studies would be fetched and rendered here */}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build Your Success Story?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let's discuss how we can help transform your business with our proven solutions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/case-studies">
                <Button variant="outline-white" size="lg">
                  More Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}