import { EmailTemplate } from './types';

export const emailTemplates: EmailTemplate[] = [
  // Welcome Series Templates
  {
    id: 'welcome-01',
    name: 'Welcome Email - Getting Started',
    subject: 'Welcome to Zoptal! Let\'s bring your ideas to life 🚀',
    type: 'welcome',
    category: 'onboarding',
    tags: ['welcome', 'getting-started', 'onboarding'],
    previewText: 'Thank you for joining Zoptal. Here\'s how we can help transform your business...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Zoptal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 20px; }
    .hero-text { font-size: 18px; color: #4a5568; margin-bottom: 30px; }
    .feature-box { background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .feature-title { font-weight: 600; color: #2d3748; margin-bottom: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .stats { background: #edf2f7; padding: 30px 20px; text-align: center; }
    .stat-item { display: inline-block; margin: 0 20px; }
    .stat-number { font-size: 24px; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 14px; color: #718096; }
    .footer { background: #2d3748; color: #a0aec0; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #81e6d9; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Zoptal!</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0;">Where ideas become powerful software solutions</p>
    </div>
    
    <div class="content">
      <p class="hero-text">
        Hi {{firstName}},
      </p>
      
      <p class="hero-text">
        Thank you for choosing Zoptal for your software development needs! We're thrilled to have you join our community of forward-thinking businesses who are transforming their operations with custom technology solutions.
      </p>
      
      <div class="feature-box">
        <div class="feature-title">🚀 What happens next?</div>
        <p>Our team will review your requirements and get back to you within 24 hours with a personalized proposal. In the meantime, here's what you can expect from working with us:</p>
      </div>
      
      <div class="feature-box">
        <div class="feature-title">⚡ Lightning-Fast Development</div>
        <p>Our agile methodology ensures rapid delivery without compromising quality. Most projects launch within 4-16 weeks.</p>
      </div>
      
      <div class="feature-box">
        <div class="feature-title">🎯 Dedicated Team</div>
        <p>You'll work with a dedicated team of senior developers, designers, and project managers committed to your success.</p>
      </div>
      
      <div class="feature-box">
        <div class="feature-title">📞 Direct Communication</div>
        <p>No middlemen or account managers. You'll have direct access to your development team through Slack, calls, and regular demos.</p>
      </div>
      
      <center>
        <a href="{{portalUrl}}" class="cta-button">Access Your Project Portal</a>
      </center>
      
      <p>Have questions? Simply reply to this email or schedule a call with our team. We're here to help!</p>
      
      <p>Best regards,<br>
      The Zoptal Team</p>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-number">500+</div>
        <div class="stat-label">Projects Delivered</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">98%</div>
        <div class="stat-label">Client Satisfaction</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">24/7</div>
        <div class="stat-label">Support Available</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Zoptal - Software Development That Drives Results</p>
      <p>
        <a href="{{websiteUrl}}">Visit our website</a> | 
        <a href="{{helpUrl}}">Help Center</a> | 
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Welcome to Zoptal!

Hi {{firstName}},

Thank you for choosing Zoptal for your software development needs! We're thrilled to have you join our community of forward-thinking businesses who are transforming their operations with custom technology solutions.

What happens next?
Our team will review your requirements and get back to you within 24 hours with a personalized proposal.

What you can expect from working with us:

⚡ Lightning-Fast Development
Our agile methodology ensures rapid delivery without compromising quality. Most projects launch within 4-16 weeks.

🎯 Dedicated Team  
You'll work with a dedicated team of senior developers, designers, and project managers committed to your success.

📞 Direct Communication
No middlemen or account managers. You'll have direct access to your development team through Slack, calls, and regular demos.

Access Your Project Portal: {{portalUrl}}

Have questions? Simply reply to this email or schedule a call with our team. We're here to help!

Best regards,
The Zoptal Team

---
Zoptal - Software Development That Drives Results
Visit our website: {{websiteUrl}}
Help Center: {{helpUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Recipient\'s first name', required: true, example: 'John' },
      { name: 'portalUrl', type: 'url', description: 'URL to client portal', required: true, example: 'https://portal.zoptal.com/abc123' },
      { name: 'websiteUrl', type: 'url', description: 'Main website URL', required: false, defaultValue: 'https://zoptal.com' },
      { name: 'helpUrl', type: 'url', description: 'Help center URL', required: false, defaultValue: 'https://zoptal.com/help' },
      { name: 'unsubscribeUrl', type: 'url', description: 'Unsubscribe URL', required: true, example: 'https://zoptal.com/unsubscribe?token=xyz' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    isActive: true,
    stats: {
      sent: 1247,
      delivered: 1238,
      opened: 986,
      clicked: 423,
      bounced: 9,
      unsubscribed: 5,
      openRate: 79.6,
      clickRate: 42.9,
      bounceRate: 0.7
    }
  },
  
  {
    id: 'welcome-02',
    name: 'Welcome Email - Our Process',
    subject: 'Here\'s how we\'ll build your dream software 🛠️',
    type: 'welcome',
    category: 'onboarding',
    tags: ['welcome', 'process', 'methodology'],
    previewText: 'Learn about our proven development process that has delivered 500+ successful projects...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Our Development Process</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 20px; }
    .process-step { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 20px 0; position: relative; }
    .process-step.active { border-color: #4facfe; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
    .step-number { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; position: absolute; top: -20px; left: 25px; }
    .step-title { font-size: 18px; font-weight: 600; color: #1a202c; margin: 10px 0; padding-left: 20px; }
    .step-description { color: #4a5568; padding-left: 20px; }
    .step-duration { color: #718096; font-size: 14px; font-weight: 500; padding-left: 20px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .guarantee-box { background: linear-gradient(135deg, #d4edd7 0%, #a8e6cf 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; }
    .footer { background: #2d3748; color: #a0aec0; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #4facfe; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Our Proven Process</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0;">From idea to launch in 4 simple steps</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      
      <p>Yesterday, you joined the Zoptal family. Today, let's walk through our proven development process that has successfully delivered over 500 projects for companies just like yours.</p>
      
      <div class="process-step active">
        <div class="step-number">1</div>
        <div class="step-title">🎯 Discovery & Planning</div>
        <div class="step-duration">1-2 weeks</div>
        <div class="step-description">
          We dive deep into your business goals, user needs, and technical requirements. Our team creates detailed specifications, wireframes, and a comprehensive project roadmap.
        </div>
      </div>
      
      <div class="process-step">
        <div class="step-number">2</div>
        <div class="step-title">🎨 Design & Prototyping</div>
        <div class="step-duration">2-3 weeks</div>
        <div class="step-description">
          Our designers create beautiful, user-friendly interfaces. You'll see interactive prototypes and provide feedback before we write a single line of code.
        </div>
      </div>
      
      <div class="process-step">
        <div class="step-number">3</div>
        <div class="step-title">⚡ Development & Testing</div>
        <div class="step-duration">4-16 weeks</div>
        <div class="step-description">
          Development happens in 2-week sprints with regular demos. You'll see progress constantly and can request changes as we build. Every feature is thoroughly tested.
        </div>
      </div>
      
      <div class="process-step">
        <div class="step-number">4</div>
        <div class="step-title">🚀 Launch & Support</div>
        <div class="step-duration">Ongoing</div>
        <div class="step-description">
          We handle deployment, monitoring, and provide 30-day bug-fix warranty. Optional maintenance plans ensure your software stays secure and up-to-date.
        </div>
      </div>
      
      <div class="guarantee-box">
        <h3 style="margin-top: 0; color: #2d3748;">Our 100% Satisfaction Guarantee</h3>
        <p style="margin-bottom: 0; color: #4a5568;">If you're not completely satisfied with our work at any milestone, we'll make it right or refund your money. That's our commitment to your success.</p>
      </div>
      
      <center>
        <a href="{{scheduleUrl}}" class="cta-button">Schedule Your Discovery Call</a>
      </center>
      
      <p>Ready to get started? Book your free discovery call, and let's turn your vision into reality.</p>
      
      <p>Best regards,<br>
      {{teamMemberName}}<br>
      {{teamMemberTitle}}</p>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or call us at +1 (555) 123-4567</p>
      <p>
        <a href="{{websiteUrl}}">zoptal.com</a> | 
        <a href="{{portfolioUrl}}">View Our Portfolio</a> | 
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Our Proven Process - From Idea to Launch

Hi {{firstName}},

Yesterday, you joined the Zoptal family. Today, let's walk through our proven development process that has successfully delivered over 500 projects for companies just like yours.

STEP 1: 🎯 Discovery & Planning (1-2 weeks)
We dive deep into your business goals, user needs, and technical requirements. Our team creates detailed specifications, wireframes, and a comprehensive project roadmap.

STEP 2: 🎨 Design & Prototyping (2-3 weeks)  
Our designers create beautiful, user-friendly interfaces. You'll see interactive prototypes and provide feedback before we write a single line of code.

STEP 3: ⚡ Development & Testing (4-16 weeks)
Development happens in 2-week sprints with regular demos. You'll see progress constantly and can request changes as we build. Every feature is thoroughly tested.

STEP 4: 🚀 Launch & Support (Ongoing)
We handle deployment, monitoring, and provide 30-day bug-fix warranty. Optional maintenance plans ensure your software stays secure and up-to-date.

Our 100% Satisfaction Guarantee
If you're not completely satisfied with our work at any milestone, we'll make it right or refund your money. That's our commitment to your success.

Schedule Your Discovery Call: {{scheduleUrl}}

Ready to get started? Book your free discovery call, and let's turn your vision into reality.

Best regards,
{{teamMemberName}}
{{teamMemberTitle}}

---
Questions? Reply to this email or call us at +1 (555) 123-4567
Website: {{websiteUrl}}
Portfolio: {{portfolioUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Recipient\'s first name', required: true, example: 'Sarah' },
      { name: 'scheduleUrl', type: 'url', description: 'Booking link for discovery call', required: true, example: 'https://calendly.com/zoptal/discovery' },
      { name: 'teamMemberName', type: 'text', description: 'Team member name', required: false, defaultValue: 'Sarah Johnson' },
      { name: 'teamMemberTitle', type: 'text', description: 'Team member title', required: false, defaultValue: 'Project Manager' },
      { name: 'websiteUrl', type: 'url', description: 'Main website URL', required: false, defaultValue: 'https://zoptal.com' },
      { name: 'portfolioUrl', type: 'url', description: 'Portfolio URL', required: false, defaultValue: 'https://zoptal.com/portfolio' },
      { name: 'unsubscribeUrl', type: 'url', description: 'Unsubscribe URL', required: true, example: 'https://zoptal.com/unsubscribe?token=xyz' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    isActive: true,
    stats: {
      sent: 1247,
      delivered: 1242,
      opened: 892,
      clicked: 267,
      bounced: 5,
      unsubscribed: 3,
      openRate: 71.8,
      clickRate: 29.9,
      bounceRate: 0.4
    }
  },

  // Nurture Campaign Templates
  {
    id: 'nurture-01',
    name: 'Case Study - FinTech Success',
    subject: 'How we helped {{companyName}} increase revenue by 300% 📈',
    type: 'nurture',
    category: 'case-study',
    tags: ['nurture', 'case-study', 'fintech', 'success-story'],
    previewText: 'Discover how our FinTech solution transformed a struggling startup into an industry leader...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FinTech Success Story</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .content { padding: 40px 20px; }
    .case-study-header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px; margin: 20px 0; }
    .metric-box { background: #f7fafc; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
    .metric-number { font-size: 36px; font-weight: 700; color: #667eea; margin-bottom: 5px; }
    .metric-label { color: #4a5568; font-weight: 500; }
    .challenge-box { background: #fed7d7; border-left: 4px solid #f56565; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .solution-box { background: #c6f6d5; border-left: 4px solid #48bb78; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #2d3748; color: #a0aec0; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer a { color: #81e6d9; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Success Story: FinTech Revolution</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0;">How we transformed a struggling startup</p>
    </div>
    
    <div class="content">
      <p>Hi {{firstName}},</p>
      
      <p>I wanted to share an incredible success story that perfectly illustrates what's possible when you combine innovative technology with strategic execution.</p>
      
      <div class="case-study-header">
        <h2 style="margin: 0 0 10px 0;">PayFlow Solutions</h2>
        <p style="margin: 0; opacity: 0.9;">From struggling startup to industry leader in 18 months</p>
      </div>
      
      <div class="challenge-box">
        <h3 style="margin-top: 0; color: #c53030;">The Challenge</h3>
        <p style="margin-bottom: 0;">PayFlow was losing customers due to slow, unreliable payment processing. Their legacy system couldn't handle peak loads, causing transaction failures and frustrated users. Revenue was declining by 15% quarterly.</p>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; margin: 30px 0;">
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">47s</div>
          <div class="metric-label">Avg Transaction Time</div>
        </div>
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">23%</div>
          <div class="metric-label">Failure Rate</div>
        </div>
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">-15%</div>
          <div class="metric-label">Quarterly Revenue</div>
        </div>
      </div>
      
      <div class="solution-box">
        <h3 style="margin-top: 0; color: #2f855a;">Our Solution</h3>
        <p style="margin-bottom: 0;">We rebuilt their entire payment infrastructure using modern microservices architecture, implemented real-time processing, and added intelligent fraud detection. The result? A platform that scales seamlessly and processes transactions in under 2 seconds.</p>
      </div>
      
      <h3>The Results After 18 Months:</h3>
      
      <div style="display: flex; flex-wrap: wrap; margin: 30px 0;">
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">1.3s</div>
          <div class="metric-label">Avg Transaction Time</div>
        </div>
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">0.1%</div>
          <div class="metric-label">Failure Rate</div>
        </div>
        <div class="metric-box" style="flex: 1; margin: 5px;">
          <div class="metric-number">+300%</div>
          <div class="metric-label">Revenue Growth</div>
        </div>
      </div>
      
      <blockquote style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0; font-style: italic; color: #4a5568;">
        "Zoptal didn't just build us software - they transformed our entire business. We went from losing customers to becoming the fastest-growing FinTech in our sector."
        <br><br>
        <strong>- Michael Chen, CEO of PayFlow Solutions</strong>
      </blockquote>
      
      <p><strong>Could your business benefit from a similar transformation?</strong></p>
      
      <p>Whether you're in FinTech, e-commerce, healthcare, or any other industry, the principles remain the same: modern architecture, scalable solutions, and user-focused design drive real business results.</p>
      
      <center>
        <a href="{{caseStudyUrl}}" class="cta-button">Read the Full Case Study</a>
      </center>
      
      <p>Want to discuss how we can achieve similar results for your business? Simply reply to this email or schedule a strategic consultation.</p>
      
      <p>Best regards,<br>
      David Chen<br>
      Lead Developer & Solutions Architect</p>
    </div>
    
    <div class="footer">
      <p>Ready to transform your business? Let's talk.</p>
      <p>
        <a href="{{websiteUrl}}">zoptal.com</a> | 
        <a href="{{portfolioUrl}}">View More Case Studies</a> | 
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Success Story: FinTech Revolution

Hi {{firstName}},

I wanted to share an incredible success story that perfectly illustrates what's possible when you combine innovative technology with strategic execution.

PAYFLOW SOLUTIONS
From struggling startup to industry leader in 18 months

THE CHALLENGE
PayFlow was losing customers due to slow, unreliable payment processing. Their legacy system couldn't handle peak loads, causing transaction failures and frustrated users. Revenue was declining by 15% quarterly.

Before Our Solution:
• 47s Average Transaction Time
• 23% Failure Rate  
• -15% Quarterly Revenue

OUR SOLUTION
We rebuilt their entire payment infrastructure using modern microservices architecture, implemented real-time processing, and added intelligent fraud detection. The result? A platform that scales seamlessly and processes transactions in under 2 seconds.

The Results After 18 Months:
• 1.3s Average Transaction Time
• 0.1% Failure Rate
• +300% Revenue Growth

"Zoptal didn't just build us software - they transformed our entire business. We went from losing customers to becoming the fastest-growing FinTech in our sector."
- Michael Chen, CEO of PayFlow Solutions

Could your business benefit from a similar transformation?

Whether you're in FinTech, e-commerce, healthcare, or any other industry, the principles remain the same: modern architecture, scalable solutions, and user-focused design drive real business results.

Read the Full Case Study: {{caseStudyUrl}}

Want to discuss how we can achieve similar results for your business? Simply reply to this email or schedule a strategic consultation.

Best regards,
David Chen
Lead Developer & Solutions Architect

---
Ready to transform your business? Let's talk.
Website: {{websiteUrl}}
Portfolio: {{portfolioUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Recipient\'s first name', required: true, example: 'Alex' },
      { name: 'companyName', type: 'text', description: 'Similar company name for subject personalization', required: false, defaultValue: 'a FinTech startup' },
      { name: 'caseStudyUrl', type: 'url', description: 'URL to full case study', required: true, example: 'https://zoptal.com/case-studies/payflow' },
      { name: 'websiteUrl', type: 'url', description: 'Main website URL', required: false, defaultValue: 'https://zoptal.com' },
      { name: 'portfolioUrl', type: 'url', description: 'Portfolio URL', required: false, defaultValue: 'https://zoptal.com/portfolio' },
      { name: 'unsubscribeUrl', type: 'url', description: 'Unsubscribe URL', required: true, example: 'https://zoptal.com/unsubscribe?token=xyz' }
    ],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    isActive: true,
    stats: {
      sent: 856,
      delivered: 847,
      opened: 583,
      clicked: 174,
      bounced: 9,
      unsubscribed: 7,
      openRate: 68.8,
      clickRate: 29.9,
      bounceRate: 1.1
    }
  },

  // Follow-up Templates
  {
    id: 'followup-01',
    name: 'Proposal Follow-up',
    subject: 'Quick question about your {{projectType}} project',
    type: 'follow-up',
    category: 'sales',
    tags: ['follow-up', 'proposal', 'sales'],
    previewText: 'Hi {{firstName}}, I wanted to follow up on the proposal we sent for your project...',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Following up on your project</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .content { padding: 40px 20px; }
    .highlight-box { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 15px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi {{firstName}},</p>
      
      <p>I hope this email finds you well. I wanted to follow up on the proposal we sent for your {{projectType}} project.</p>
      
      <p>I know you're busy, so I'll keep this brief. I wanted to address any questions or concerns you might have about:</p>
      
      <ul>
        <li>The technical approach we've outlined</li>
        <li>Project timeline and milestones</li>
        <li>Investment and payment terms</li>
        <li>Our team and development process</li>
      </ul>
      
      <div class="highlight-box">
        <h3 style="margin-top: 0; color: #2d3748;">Limited Time: Free Technical Consultation</h3>
        <p style="margin-bottom: 15px; color: #4a5568;">This week only, I'm offering a complimentary 30-minute technical consultation to discuss your project requirements and answer any questions about our proposal.</p>
        <a href="{{consultationUrl}}" class="cta-button">Book Your Free Consultation</a>
      </div>
      
      <p>Alternatively, if you'd prefer to discuss this over a quick phone call, just reply to this email with a few times that work for you, and I'll make it happen.</p>
      
      <p>No pressure at all - I just want to make sure you have all the information you need to make the best decision for your business.</p>
      
      <p>Best regards,<br>
      {{senderName}}<br>
      {{senderTitle}}</p>
      
      <p style="font-size: 14px; color: #6c757d;">P.S. If you've already moved forward with another provider or decided not to proceed, just let me know so I can remove you from follow-ups. I appreciate your time!</p>
    </div>
    
    <div class="footer">
      <p>Zoptal | +1 (555) 123-4567 | hello@zoptal.com</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #6c757d;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Hi {{firstName}},

I hope this email finds you well. I wanted to follow up on the proposal we sent for your {{projectType}} project.

I know you're busy, so I'll keep this brief. I wanted to address any questions or concerns you might have about:

• The technical approach we've outlined
• Project timeline and milestones  
• Investment and payment terms
• Our team and development process

LIMITED TIME: Free Technical Consultation

This week only, I'm offering a complimentary 30-minute technical consultation to discuss your project requirements and answer any questions about our proposal.

Book Your Free Consultation: {{consultationUrl}}

Alternatively, if you'd prefer to discuss this over a quick phone call, just reply to this email with a few times that work for you, and I'll make it happen.

No pressure at all - I just want to make sure you have all the information you need to make the best decision for your business.

Best regards,
{{senderName}}
{{senderTitle}}

P.S. If you've already moved forward with another provider or decided not to proceed, just let me know so I can remove you from follow-ups. I appreciate your time!

---
Zoptal | +1 (555) 123-4567 | hello@zoptal.com
Unsubscribe: {{unsubscribeUrl}}`,
    variables: [
      { name: 'firstName', type: 'text', description: 'Recipient\'s first name', required: true, example: 'Jennifer' },
      { name: 'projectType', type: 'text', description: 'Type of project (e.g., web app, mobile app)', required: true, example: 'web application' },
      { name: 'consultationUrl', type: 'url', description: 'Booking link for consultation', required: true, example: 'https://calendly.com/zoptal/consultation' },
      { name: 'senderName', type: 'text', description: 'Sender\'s name', required: true, example: 'Sarah Johnson' },
      { name: 'senderTitle', type: 'text', description: 'Sender\'s title', required: true, example: 'Project Manager' },
      { name: 'unsubscribeUrl', type: 'url', description: 'Unsubscribe URL', required: true, example: 'https://zoptal.com/unsubscribe?token=xyz' }
    ],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-25T16:20:00Z',
    isActive: true,
    stats: {
      sent: 324,
      delivered: 319,
      opened: 201,
      clicked: 67,
      bounced: 5,
      unsubscribed: 2,
      openRate: 63.0,
      clickRate: 33.3,
      bounceRate: 1.5
    }
  }
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id);
}

export function getTemplatesByType(type: EmailTemplate['type']): EmailTemplate[] {
  return emailTemplates.filter(template => template.type === type && template.isActive);
}

export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return emailTemplates.filter(template => template.category === category && template.isActive);
}

export function searchTemplates(query: string): EmailTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return emailTemplates.filter(template => 
    template.isActive && (
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.subject.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    )
  );
}