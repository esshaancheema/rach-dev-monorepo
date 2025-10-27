import { EmailTemplate } from './types';

export const welcomeTemplates: EmailTemplate[] = [
  {
    id: 'welcome-newsletter',
    name: 'Newsletter Welcome',
    subject: 'Welcome to Zoptal! Your software development journey starts here 🚀',
    type: 'welcome',
    category: 'newsletter',
    tags: ['welcome', 'newsletter', 'getting-started'],
    previewText: 'Thank you for subscribing! Get ready for weekly insights on software development, AI, and business growth...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Zoptal Newsletter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 20px; }
    .welcome-box { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px; margin: 20px 0; }
    .benefit-item { display: flex; align-items: flex-start; margin: 20px 0; }
    .benefit-icon { background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
    .recent-posts { background: #f7fafc; padding: 25px; border-radius: 12px; margin: 25px 0; }
    .post-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
    .post-item:last-child { border-bottom: none; }
    .post-meta { font-size: 12px; color: #718096; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #2d3748; color: #a0aec0; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #81e6d9; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Zoptal!</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0;">Your weekly dose of software development insights</p>
    </div>
    
    <div class="content">
      <div class="welcome-box">
        <h2 style="margin: 0 0 15px 0;">🎉 You're In!</h2>
        <p style="margin: 0; opacity: 0.9;">Welcome to our community of {{subscriberCount}}+ developers, founders, and tech leaders who stay ahead of the curve.</p>
      </div>
      
      <p>Hi {{firstName}},</p>
      
      <p>Thank you for subscribing to the Zoptal newsletter! You've just joined thousands of forward-thinking professionals who receive our weekly insights on:</p>
      
      <div class="benefit-item">
        <div class="benefit-icon">🚀</div>
        <div>
          <strong>Latest Development Trends</strong><br>
          <span style="color: #718096;">Stay updated with cutting-edge technologies, frameworks, and best practices</span>
        </div>
      </div>
      
      <div class="benefit-item">
        <div class="benefit-icon">🤖</div>
        <div>
          <strong>AI & Automation Insights</strong><br>
          <span style="color: #718096;">Discover how AI is transforming software development and business operations</span>
        </div>
      </div>
      
      <div class="benefit-item">
        <div class="benefit-icon">💡</div>
        <div>
          <strong>Business Growth Strategies</strong><br>
          <span style="color: #718096;">Learn how technology can drive revenue, efficiency, and competitive advantage</span>
        </div>
      </div>
      
      <div class="benefit-item">
        <div class="benefit-icon">📊</div>
        <div>
          <strong>Real Case Studies</strong><br>
          <span style="color: #718096;">Behind-the-scenes look at successful projects and transformation stories</span>
        </div>
      </div>
      
      <div class="recent-posts">
        <h3 style="margin-top: 0; color: #2d3748;">📚 Recent Popular Articles</h3>
        
        <div class="post-item">
          <div style="flex: 1;">
            <strong style="color: #2d3748;">How AI is Revolutionizing FinTech Development</strong><br>
            <span style="color: #718096; font-size: 14px;">Exploring machine learning applications in financial services</span><br>
            <span class="post-meta">5 min read • 2,847 views</span>
          </div>
        </div>
        
        <div class="post-item">
          <div style="flex: 1;">
            <strong style="color: #2d3748;">The Complete Guide to MVP Development</strong><br>
            <span style="color: #718096; font-size: 14px;">From idea validation to launch in 8 weeks</span><br>
            <span class="post-meta">8 min read • 1,923 views</span>
          </div>
        </div>
        
        <div class="post-item">
          <div style="flex: 1;">
            <strong style="color: #2d3748;">10 Costly Mistakes in Software Development</strong><br>
            <span style="color: #718096; font-size: 14px;">How to avoid pitfalls that sink projects</span><br>
            <span class="post-meta">6 min read • 3,156 views</span>
          </div>
        </div>
      </div>
      
      <center>
        <a href="{{blogUrl}}" class="cta-button">Read Our Latest Articles</a>
      </center>
      
      <p><strong>What to expect:</strong></p>
      <ul style="color: #4a5568;">
        <li>📅 Weekly newsletter every Tuesday morning</li>
        <li>🎯 Curated content tailored for tech leaders</li>
        <li>💌 Exclusive insights not available anywhere else</li>
        <li>🎁 Early access to our resources and tools</li>
      </ul>
      
      <p>Have a specific topic you'd like us to cover? Just reply to this email - we read every response!</p>
      
      <p>Looking forward to sharing valuable insights with you.</p>
      
      <p>Best regards,<br>
      Sarah Johnson<br>
      Content Director, Zoptal</p>
      
      <hr style="border: none; height: 1px; background: #e2e8f0; margin: 40px 0;">
      
      <p style="font-size: 14px; color: #718096;">
        <strong>P.S.</strong> Follow us on social media for daily tips and behind-the-scenes content:<br>
        <a href="{{twitterUrl}}" style="color: #667eea;">Twitter</a> | 
        <a href="{{linkedinUrl}}" style="color: #667eea;">LinkedIn</a> | 
        <a href="{{githubUrl}}" style="color: #667eea;">GitHub</a>
      </p>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you subscribed to Zoptal newsletter.</p>
      <p>
        <a href="{{websiteUrl}}">zoptal.com</a> | 
        <a href="{{preferencesUrl}}">Update Preferences</a> | 
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Welcome to Zoptal!

Hi {{firstName}},

Thank you for subscribing to the Zoptal newsletter! You've just joined {{subscriberCount}}+ forward-thinking professionals who receive our weekly insights.

🎉 YOU'RE IN!
Welcome to our community of developers, founders, and tech leaders who stay ahead of the curve.

What you'll receive:

🚀 Latest Development Trends
Stay updated with cutting-edge technologies, frameworks, and best practices

🤖 AI & Automation Insights  
Discover how AI is transforming software development and business operations

💡 Business Growth Strategies
Learn how technology can drive revenue, efficiency, and competitive advantage

📊 Real Case Studies
Behind-the-scenes look at successful projects and transformation stories

📚 RECENT POPULAR ARTICLES:

• How AI is Revolutionizing FinTech Development
  Exploring machine learning applications in financial services
  5 min read • 2,847 views

• The Complete Guide to MVP Development
  From idea validation to launch in 8 weeks  
  8 min read • 1,923 views

• 10 Costly Mistakes in Software Development
  How to avoid pitfalls that sink projects
  6 min read • 3,156 views

Read Our Latest Articles: {{blogUrl}}

What to expect:
📅 Weekly newsletter every Tuesday morning
🎯 Curated content tailored for tech leaders  
💌 Exclusive insights not available anywhere else
🎁 Early access to our resources and tools

Have a specific topic you'd like us to cover? Just reply to this email - we read every response!

Looking forward to sharing valuable insights with you.

Best regards,
Sarah Johnson
Content Director, Zoptal

P.S. Follow us on social media for daily tips:
Twitter: {{twitterUrl}}
LinkedIn: {{linkedinUrl}}
GitHub: {{githubUrl}}

---
You're receiving this because you subscribed to Zoptal newsletter.
Website: {{websiteUrl}}
Update Preferences: {{preferencesUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Subscriber\'s first name', required: true, example: 'Alex' },
      { name: 'subscriberCount', type: 'number', description: 'Total subscriber count', required: false, defaultValue: '5000' },
      { name: 'blogUrl', type: 'url', description: 'Blog/articles URL', required: false, defaultValue: 'https://zoptal.com/blog' },
      { name: 'websiteUrl', type: 'url', description: 'Main website URL', required: false, defaultValue: 'https://zoptal.com' },
      { name: 'twitterUrl', type: 'url', description: 'Twitter profile URL', required: false, defaultValue: 'https://twitter.com/ZoptalTech' },
      { name: 'linkedinUrl', type: 'url', description: 'LinkedIn profile URL', required: false, defaultValue: 'https://linkedin.com/company/zoptal' },
      { name: 'githubUrl', type: 'url', description: 'GitHub profile URL', required: false, defaultValue: 'https://github.com/zoptal' },
      { name: 'preferencesUrl', type: 'url', description: 'Email preferences URL', required: true, example: 'https://zoptal.com/preferences?token=xyz' },
      { name: 'unsubscribeUrl', type: 'url', description: 'Unsubscribe URL', required: true, example: 'https://zoptal.com/unsubscribe?token=xyz' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    isActive: true,
    stats: {
      sent: 2847,
      delivered: 2834,
      opened: 2156,
      clicked: 867,
      bounced: 13,
      unsubscribed: 8,
      openRate: 76.1,
      clickRate: 40.2,
      bounceRate: 0.5
    }
  },

  {
    id: 'welcome-consultation',
    name: 'Consultation Request Welcome',
    subject: 'Thank you for your consultation request! Here\'s what happens next 📋',
    type: 'welcome',
    category: 'consultation',
    tags: ['welcome', 'consultation', 'sales'],
    previewText: 'We\'ve received your consultation request and our team is already reviewing your requirements...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Consultation Request Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 20px; }
    .confirmation-box { background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%); color: #2d3748; padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; }
    .timeline-item { display: flex; align-items: flex-start; margin: 25px 0; position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: 20px; top: 45px; bottom: -20px; width: 2px; background: #e2e8f0; }
    .timeline-item:last-child::before { display: none; }
    .timeline-icon { background: #4facfe; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; z-index: 1; position: relative; }
    .timeline-content h3 { margin: 0 0 5px 0; color: #2d3748; }
    .timeline-content p { margin: 0; color: #4a5568; font-size: 14px; }
    .project-summary { background: #f7fafc; border-left: 4px solid #4facfe; padding: 20px; margin: 25px 0; border-radius: 8px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .team-member { display: flex; align-items: center; background: #f7fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .team-avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin-right: 15px; }
    .footer { background: #2d3748; color: #a0aec0; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #4facfe; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Request Received!</h1>
      <p style="color: #e0f2fe; margin: 10px 0 0 0;">We're excited to help bring your vision to life</p>
    </div>
    
    <div class="content">
      <div class="confirmation-box">
        <h2 style="margin: 0 0 10px 0;">✅ Consultation Request Confirmed</h2>
        <p style="margin: 0; font-size: 16px;">Reference #{{requestId}} • Submitted {{submissionDate}}</p>
      </div>
      
      <p>Hi {{firstName}},</p>
      
      <p>Thank you for reaching out to Zoptal! We've received your consultation request and our team is already reviewing your requirements. We're excited about the opportunity to help transform your business with custom software solutions.</p>
      
      <div class="project-summary">
        <h3 style="margin-top: 0; color: #2d3748;">📋 Your Project Summary</h3>
        <p><strong>Project Type:</strong> {{projectType}}</p>
        <p><strong>Industry:</strong> {{industry}}</p>
        <p><strong>Timeline:</strong> {{timeline}}</p>
        <p><strong>Budget Range:</strong> {{budgetRange}}</p>
        {{#if specialRequirements}}<p><strong>Special Requirements:</strong> {{specialRequirements}}</p>{{/if}}
      </div>
      
      <h3>🚀 What Happens Next?</h3>
      
      <div class="timeline-item">
        <div class="timeline-icon">1</div>
        <div class="timeline-content">
          <h3>Initial Review (Next 4 hours)</h3>
          <p>Our technical team reviews your requirements and prepares preliminary recommendations</p>
        </div>
      </div>
      
      <div class="timeline-item">
        <div class="timeline-icon">2</div>
        <div class="timeline-content">
          <h3>Personal Outreach (Within 24 hours)</h3>
          <p>Your dedicated project manager will contact you to schedule a detailed consultation call</p>
        </div>
      </div>
      
      <div class="timeline-item">
        <div class="timeline-icon">3</div>
        <div class="timeline-content">
          <h3>Strategy Session (Within 48 hours)</h3>
          <p>60-minute deep-dive call to understand your vision, challenges, and goals</p>
        </div>
      </div>
      
      <div class="timeline-item">
        <div class="timeline-icon">4</div>
        <div class="timeline-content">
          <h3>Custom Proposal (3-5 business days)</h3>
          <p>Detailed technical proposal with timeline, team structure, and investment details</p>
        </div>
      </div>
      
      <div class="team-member">
        <div class="team-avatar">SJ</div>
        <div>
          <h3 style="margin: 0 0 5px 0; color: #2d3748;">Sarah Johnson</h3>
          <p style="margin: 0; color: #4a5568; font-size: 14px;">Senior Project Manager • Your main point of contact</p>
          <p style="margin: 5px 0 0 0; color: #4a5568; font-size: 14px;">📧 sarah@zoptal.com • 📱 +1 (555) 123-4567</p>
        </div>
      </div>
      
      <center>
        <a href="{{scheduleUrl}}" class="cta-button">Schedule Your Call Now</a>
      </center>
      
      <h3>💡 While You Wait...</h3>
      <ul style="color: #4a5568;">
        <li><strong>Review our case studies:</strong> See how we've helped similar businesses</li>
        <li><strong>Check out our portfolio:</strong> Browse our recent project showcases</li>
        <li><strong>Read our process guide:</strong> Understand how we deliver successful projects</li>
        <li><strong>Prepare questions:</strong> Think about specific challenges you'd like to discuss</li>
      </ul>
      
      <div style="background: #fff5cd; border-left: 4px solid #f6ad55; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <p style="margin: 0; color: #744210;"><strong>⚡ Urgent project?</strong> If you need to start immediately, call Sarah directly at +1 (555) 123-4567 or reply to this email with "URGENT" in the subject line.</p>
      </div>
      
      <p>We're looking forward to learning more about your project and showing you how we can help achieve your goals.</p>
      
      <p>Best regards,<br>
      The Zoptal Team</p>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or call us at +1 (555) 123-4567</p>
      <p>
        <a href="{{websiteUrl}}">zoptal.com</a> | 
        <a href="{{portfolioUrl}}">Portfolio</a> | 
        <a href="{{caseStudiesUrl}}">Case Studies</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Consultation Request Received!

Hi {{firstName}},

✅ CONSULTATION REQUEST CONFIRMED
Reference #{{requestId}} • Submitted {{submissionDate}}

Thank you for reaching out to Zoptal! We've received your consultation request and our team is already reviewing your requirements. We're excited about the opportunity to help transform your business with custom software solutions.

📋 YOUR PROJECT SUMMARY
Project Type: {{projectType}}
Industry: {{industry}}
Timeline: {{timeline}}
Budget Range: {{budgetRange}}
{{#if specialRequirements}}Special Requirements: {{specialRequirements}}{{/if}}

🚀 WHAT HAPPENS NEXT?

1. Initial Review (Next 4 hours)
   Our technical team reviews your requirements and prepares preliminary recommendations

2. Personal Outreach (Within 24 hours)
   Your dedicated project manager will contact you to schedule a detailed consultation call

3. Strategy Session (Within 48 hours)
   60-minute deep-dive call to understand your vision, challenges, and goals

4. Custom Proposal (3-5 business days)
   Detailed technical proposal with timeline, team structure, and investment details

YOUR PROJECT MANAGER
Sarah Johnson - Senior Project Manager
📧 sarah@zoptal.com • 📱 +1 (555) 123-4567

Schedule Your Call Now: {{scheduleUrl}}

💡 WHILE YOU WAIT...
• Review our case studies: See how we've helped similar businesses
• Check out our portfolio: Browse our recent project showcases  
• Read our process guide: Understand how we deliver successful projects
• Prepare questions: Think about specific challenges you'd like to discuss

⚡ URGENT PROJECT?
If you need to start immediately, call Sarah directly at +1 (555) 123-4567 or reply to this email with "URGENT" in the subject line.

We're looking forward to learning more about your project and showing you how we can help achieve your goals.

Best regards,
The Zoptal Team

---
Questions? Reply to this email or call us at +1 (555) 123-4567
Website: {{websiteUrl}}
Portfolio: {{portfolioUrl}}
Case Studies: {{caseStudiesUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Client\'s first name', required: true, example: 'Michael' },
      { name: 'requestId', type: 'text', description: 'Unique request ID', required: true, example: 'REQ-2024-001' },
      { name: 'submissionDate', type: 'date', description: 'Form submission date', required: true, example: 'January 30, 2024' },
      { name: 'projectType', type: 'text', description: 'Type of project requested', required: true, example: 'Web Application' },
      { name: 'industry', type: 'text', description: 'Client\'s industry', required: false, example: 'FinTech' },
      { name: 'timeline', type: 'text', description: 'Desired timeline', required: false, example: '3-4 months' },
      { name: 'budgetRange', type: 'text', description: 'Budget range', required: false, example: '$50,000 - $100,000' },
      { name: 'specialRequirements', type: 'text', description: 'Special requirements or notes', required: false, example: 'Must be HIPAA compliant' },
      { name: 'scheduleUrl', type: 'url', description: 'Booking link for consultation', required: true, example: 'https://calendly.com/zoptal/consultation' },
      { name: 'websiteUrl', type: 'url', description: 'Main website URL', required: false, defaultValue: 'https://zoptal.com' },
      { name: 'portfolioUrl', type: 'url', description: 'Portfolio URL', required: false, defaultValue: 'https://zoptal.com/portfolio' },
      { name: 'caseStudiesUrl', type: 'url', description: 'Case studies URL', required: false, defaultValue: 'https://zoptal.com/case-studies' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T14:20:00Z',
    isActive: true,
    stats: {
      sent: 456,
      delivered: 452,
      opened: 389,
      clicked: 201,
      bounced: 4,
      unsubscribed: 1,
      openRate: 86.1,
      clickRate: 51.7,
      bounceRate: 0.9
    }
  }
];

export function getWelcomeTemplateByType(type: string): EmailTemplate | undefined {
  return welcomeTemplates.find(template => 
    template.category === type && template.isActive
  );
}

export function getAllWelcomeTemplates(): EmailTemplate[] {
  return welcomeTemplates.filter(template => template.isActive);
}