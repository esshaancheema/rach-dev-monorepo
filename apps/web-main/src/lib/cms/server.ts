import { cms, previewCms, type BlogPost, type CaseStudy, type Service, type TeamMember } from './contentful';
import { cache } from 'react';
import { draftMode } from 'next/headers';

// Server-side data fetching functions with Next.js 13+ caching

// Blog post functions
export const getBlogPosts = cache(async (options: {
  limit?: number;
  skip?: number;
  featured?: boolean;
  category?: string;
  author?: string;
  tag?: string;
} = {}) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getBlogPosts(options);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
});

export const getBlogPost = cache(async (slug: string) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getBlogPost(slug);
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return null;
  }
});

export const getBlogPostSlugs = cache(async () => {
  try {
    const posts = await cms.getBlogPosts({ limit: 1000 });
    return posts.map(post => post.fields.slug);
  } catch (error) {
    console.error('Failed to fetch blog post slugs:', error);
    return [];
  }
});

// Case study functions
export const getCaseStudies = cache(async (options: {
  limit?: number;
  skip?: number;
  featured?: boolean;
  industry?: string;
  technology?: string;
} = {}) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getCaseStudies(options);
  } catch (error) {
    console.error('Failed to fetch case studies:', error);
    return [];
  }
});

export const getCaseStudy = cache(async (slug: string) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getCaseStudy(slug);
  } catch (error) {
    console.error(`Failed to fetch case study ${slug}:`, error);
    return null;
  }
});

export const getCaseStudySlugs = cache(async () => {
  try {
    const caseStudies = await cms.getCaseStudies({ limit: 1000 });
    return caseStudies.map(caseStudy => caseStudy.fields.slug);
  } catch (error) {
    console.error('Failed to fetch case study slugs:', error);
    return [];
  }
});

// Service functions
export const getServices = cache(async (options: {
  limit?: number;
  featured?: boolean;
  category?: string;
  status?: 'active' | 'inactive';
} = {}) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getServices(options);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
});

export const getService = cache(async (slug: string) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getService(slug);
  } catch (error) {
    console.error(`Failed to fetch service ${slug}:`, error);
    return null;
  }
});

export const getServiceSlugs = cache(async () => {
  try {
    const services = await cms.getServices({ limit: 1000, status: 'active' });
    return services.map(service => service.fields.slug);
  } catch (error) {
    console.error('Failed to fetch service slugs:', error);
    return [];
  }
});

// Team member functions
export const getTeamMembers = cache(async (options: {
  limit?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  skill?: string;
  location?: string;
} = {}) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getTeamMembers(options);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return [];
  }
});

// Testimonial functions
export const getTestimonials = cache(async (options: {
  limit?: number;
  featured?: boolean;
  minRating?: number;
} = {}) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getTestimonials(options);
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
});

// Category and tag functions
export const getCategories = cache(async () => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
});

export const getTags = cache(async () => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getTags();
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
});

export const getServiceCategories = cache(async () => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.getServiceCategories();
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    return [];
  }
});

// Search function
export const searchContent = cache(async (
  query: string,
  contentTypes: string[] = ['blogPost', 'caseStudy', 'service']
) => {
  const isDraft = draftMode().isEnabled;
  const client = isDraft ? previewCms : cms;
  
  try {
    return await client.searchContent(query, contentTypes);
  } catch (error) {
    console.error('Failed to search content:', error);
    return {
      blogPosts: [],
      caseStudies: [],
      services: [],
    };
  }
});

// Combined data functions for pages
export const getHomepageData = cache(async () => {
  try {
    const [
      featuredBlogPosts,
      featuredCaseStudies,
      featuredServices,
      testimonials,
      teamMembers,
    ] = await Promise.all([
      getBlogPosts({ featured: true, limit: 3 }),
      getCaseStudies({ featured: true, limit: 3 }),
      getServices({ featured: true, limit: 6 }),
      getTestimonials({ featured: true, limit: 5 }),
      getTeamMembers({ limit: 8, availability: 'available' }),
    ]);

    return {
      featuredBlogPosts,
      featuredCaseStudies,
      featuredServices,
      testimonials,
      teamMembers,
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    return {
      featuredBlogPosts: [],
      featuredCaseStudies: [],
      featuredServices: [],
      testimonials: [],
      teamMembers: [],
    };
  }
});

export const getBlogPageData = cache(async (page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const [posts, categories, tags, featured] = await Promise.all([
      getBlogPosts({ limit, skip }),
      getCategories(),
      getTags(),
      getBlogPosts({ featured: true, limit: 3 }),
    ]);

    return {
      posts,
      categories,
      tags,
      featured,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    };
  } catch (error) {
    console.error('Failed to fetch blog page data:', error);
    return {
      posts: [],
      categories: [],
      tags: [],
      featured: [],
      pagination: { page: 1, limit, hasMore: false },
    };
  }
});

export const getCaseStudiesPageData = cache(async (page: number = 1, limit: number = 12) => {
  try {
    const skip = (page - 1) * limit;
    
    const [caseStudies, featured] = await Promise.all([
      getCaseStudies({ limit, skip }),
      getCaseStudies({ featured: true, limit: 3 }),
    ]);

    // Get unique industries and technologies for filters
    const allCaseStudies = await getCaseStudies({ limit: 1000 });
    const industries = [...new Set(allCaseStudies.map(cs => cs.fields.industry))];
    const technologies = [...new Set(allCaseStudies.flatMap(cs => cs.fields.technologies))];

    return {
      caseStudies,
      featured,
      industries,
      technologies,
      pagination: {
        page,
        limit,
        hasMore: caseStudies.length === limit,
      },
    };
  } catch (error) {
    console.error('Failed to fetch case studies page data:', error);
    return {
      caseStudies: [],
      featured: [],
      industries: [],
      technologies: [],
      pagination: { page: 1, limit, hasMore: false },
    };
  }
});

export const getServicesPageData = cache(async () => {
  try {
    const [services, categories, featured] = await Promise.all([
      getServices({ status: 'active' }),
      getServiceCategories(),
      getServices({ featured: true, status: 'active' }),
    ]);

    return {
      services,
      categories,
      featured,
    };
  } catch (error) {
    console.error('Failed to fetch services page data:', error);
    return {
      services: [],
      categories: [],
      featured: [],
    };
  }
});

export const getTeamPageData = cache(async () => {
  try {
    const [allMembers, available] = await Promise.all([
      getTeamMembers({}),
      getTeamMembers({ availability: 'available' }),
    ]);

    // Get unique skills and locations for filters
    const skills = [...new Set(allMembers.flatMap(member => member.fields.skills))];
    const locations = [...new Set(allMembers.map(member => member.fields.location))];

    return {
      teamMembers: allMembers,
      availableMembers: available,
      skills,
      locations,
    };
  } catch (error) {
    console.error('Failed to fetch team page data:', error);
    return {
      teamMembers: [],
      availableMembers: [],
      skills: [],
      locations: [],
    };
  }
});

// Sitemap generation functions
export const getAllSlugsForSitemap = cache(async () => {
  try {
    const [blogSlugs, caseStudySlugs, serviceSlugs] = await Promise.all([
      getBlogPostSlugs(),
      getCaseStudySlugs(),
      getServiceSlugs(),
    ]);

    return {
      blogPosts: blogSlugs.map(slug => ({
        slug,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      caseStudies: caseStudySlugs.map(slug => ({
        slug,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
      services: serviceSlugs.map(slug => ({
        slug,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch sitemap data:', error);
    return {
      blogPosts: [],
      caseStudies: [],
      services: [],
    };
  }
});

// Static generation helpers
export const generateStaticParams = {
  blogPosts: async () => {
    const slugs = await getBlogPostSlugs();
    return slugs.map(slug => ({ slug }));
  },
  
  caseStudies: async () => {
    const slugs = await getCaseStudySlugs();
    return slugs.map(slug => ({ slug }));
  },
  
  services: async () => {
    const slugs = await getServiceSlugs();
    return slugs.map(slug => ({ slug }));
  },
};

// Revalidation functions
export const revalidateContent = {
  blogPost: (slug: string) => {
    // This would trigger revalidation in your webhook handler
    console.info(`Revalidating blog post: ${slug}`);
  },
  
  caseStudy: (slug: string) => {
    console.info(`Revalidating case study: ${slug}`);
  },
  
  service: (slug: string) => {
    console.info(`Revalidating service: ${slug}`);
  },
  
  all: () => {
    console.info('Revalidating all content');
  },
};