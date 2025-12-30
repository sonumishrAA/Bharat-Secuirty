const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Super Admin
    const adminEmail = 'admin@bharatsecurity.com';
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.admin.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                name: 'Super Admin',
                role: 'super_admin'
            }
        });
        console.log('Created Default Admin: admin@bharatsecurity.com / admin123');
    }

    // Seed Services
    const services = [
        {
            title: 'Web & App Pentesting',
            slug: 'web-pentest',
            type: 'web_pentest',
            icon: '🌐',
            shortDescription: 'Secure your web applications and APIs against modern threats.',
            fullDescription: 'In-depth security assessment of web applications and APIs. We identify OWASP Top 10 vulnerabilities, logic flaws, and zero-day exploits to ensure your digital assets are bulletproof.',
            features: JSON.stringify(['OWASP Top 10 Coverage', 'Business Logic Testing', 'API Security Audit', 'Remediation Support']),
            benefits: JSON.stringify(['Prevent data breaches', 'Ensure GDPR/PCI compliance', 'Build customer trust']),
            isActive: true
        },
        {
            title: 'Mobile Pentesting',
            slug: 'mobile-pentest',
            type: 'mobile_pentest',
            icon: '📱',
            shortDescription: 'Comprehensive security testing for iOS and Android applications.',
            fullDescription: 'We analyze your mobile apps for security flaws, including insecure data storage, weak authentication, and side-channel attacks. Protect your users on every device.',
            features: JSON.stringify(['iOS & Android Testing', 'Static & Dynamic Analysis', 'Binary Protection Checks', 'API Integration Testing']),
            benefits: JSON.stringify(['Secure user data', 'Prevent app cloning', 'Safe app store release']),
            isActive: true
        },
        {
            title: 'OSINT Investigations',
            slug: 'osint-investigations',
            type: 'osint',
            icon: '🕵️',
            shortDescription: 'Open Source Intelligence gathering to uncover hidden risks.',
            fullDescription: 'Leverage publicly available information to identify exposure. We simulate how attackers gather intelligence on your organization to prevent social engineering and targeted attacks.',
            features: JSON.stringify(['Digital Footprint Analysis', 'Email Breach Check', 'Social Media Profiling', 'Dark Web Monitoring']),
            benefits: JSON.stringify(['Understand your attack surface', 'Prevent spear-phishing', 'Protect brand reputation']),
            isActive: true
        },
        {
            title: 'Incident Response',
            slug: 'incident-response',
            type: 'incident_response',
            icon: '🚨',
            shortDescription: 'Rapid response to contain, analyze, and recover from cyberattacks.',
            fullDescription: 'When a breach occurs, every second counts. Our 24/7 IR team helps you contain the threat, analyze the root cause, and recover your systems with minimal downtime.',
            features: JSON.stringify(['24/7 Emergency Support', 'Forensic Analysis', 'Malware Containment', 'Post-Incident Reporting']),
            benefits: JSON.stringify(['Minimize financial loss', 'Reduce downtime', 'Legal & compliance support']),
            isActive: true
        },
        {
            title: 'Awareness Training',
            slug: 'awareness-training',
            type: 'training',
            icon: '🎓',
            shortDescription: 'Empower your team with cutting-edge cybersecurity knowledge.',
            fullDescription: 'Customized training programs for developers and staff. From secure coding practices to phishing awareness, we build a security-first culture in your organization.',
            features: JSON.stringify(['Secure Coding Workshops', 'Phishing Simulations', 'Red Team Demos', 'Executive Awareness']),
            benefits: JSON.stringify(['Reduce human error', 'Build security culture', 'Certified expertise']),
            isActive: true
        }
    ];

    // Clear existing services first to remove unwanted ones (optional but cleaner)
    await prisma.service.deleteMany({});

    for (const s of services) {
        await prisma.service.create({ data: s });
        console.log(`Created Service: ${s.title}`);
    }

    // Seed Case Studies
    // Seed Case Studies
    const caseStudiesData = [
        {
            title: 'Fintech Security Overhaul',
            slug: 'fintech-security-overhaul',
            clientName: 'Finance Corp',
            category: 'FinTech',
            logo: '🏦',
            impactMetric: '$2M+ Saved',
            summary: 'Prevented $2M+ potential losses by identifying critical vulnerabilities.',
            content: '<p>Prevented $2M+...</p>',
            coverImageUrl: '',
            isPublished: true
        },
        {
            title: 'Healthcare Data Protection',
            slug: 'healthcare-data-protection',
            clientName: 'HealthPlus',
            category: 'HealthCare',
            logo: '🏥',
            impactMetric: '100% HIPAA',
            summary: 'Secured 500K+ patient records by implementing zero-trust architecture.',
            content: '<p>Secured 500K+...</p>',
            coverImageUrl: '',
            isPublished: true
        },
        {
            title: 'E-commerce Fraud Prevention',
            slug: 'ecommerce-fraud-prevention',
            clientName: 'ShopSafe',
            category: 'E-commerce',
            logo: '🛒',
            impactMetric: '95% Fraud Drop',
            summary: 'Reduced fraudulent transactions by 95% through advanced ML-based anomaly detection.',
            content: '<p>Reduced...</p>',
            coverImageUrl: '',
            isPublished: true
        },
        {
            title: 'Government Infrastructure Hardening',
            slug: 'gov-infra-hardening',
            clientName: 'CyberGov',
            category: 'Government',
            logo: '🏛️',
            impactMetric: 'Zero Breaches',
            summary: 'Hardened critical infrastructure against nation-state threat actors and APTs.',
            content: '<p>Hardened critical infrastructure...</p>',
            coverImageUrl: '',
            isPublished: true
        },
        {
            title: 'Enterprise Cloud Migration',
            slug: 'enterprise-cloud-migration',
            clientName: 'Global Corp',
            category: 'Enterprise',
            logo: '🏢',
            impactMetric: '100% Compliance',
            summary: 'Secure migration of 500+ apps to AWS with automated compliance guardrails.',
            content: '<p>Secure migration...</p>',
            coverImageUrl: '',
            isPublished: true
        },
        {
            title: 'SaaS Platform Security',
            slug: 'saas-platform-security',
            clientName: 'NextGen SaaS',
            category: 'SaaS',
            logo: '🚀',
            impactMetric: 'SOC2 Certified',
            summary: 'Achieved SOC2 Type II certification in record time with our security roadmap.',
            content: '<p>Achieved SOC2...</p>',
            coverImageUrl: '',
            isPublished: true
        }
    ];

    // Clear existing to ensure updates
    await prisma.caseStudy.deleteMany({});

    for (const study of caseStudiesData) {
        await prisma.caseStudy.create({ data: study });
        console.log(`Created Case Study: ${study.title}`);
    }

    // Seed Homepage Content
    const homepageContent = [
        {
            sectionKey: 'stats',
            content: JSON.stringify({
                clients: 200,
                projects: 500,
                years: 8,
                team: 15
            })
        },
        {
            sectionKey: 'testimonials',
            content: JSON.stringify([
                {
                    id: 1,
                    name: "Rahul Sharma",
                    role: "CTO, Fintech India",
                    content: "Bharat Security's pentesting revealed critical flaws our internal team missed. Highly recommended!",
                    avatar: "👨‍💼"
                },
                {
                    id: 2,
                    name: "Anjali Gupta",
                    role: "CISO, HealthCare Plus",
                    content: "Their incident response team was a lifesaver during our ransomware scare. Professional and fast.",
                    avatar: "👩‍⚕️"
                },
                {
                    id: 3,
                    name: "Vikram Singh",
                    role: "Founder, E-com Startup",
                    content: "Best security partner for startups. They explained technical risks in business terms.",
                    avatar: "🚀"
                }
            ])
        }
    ];

    for (const hc of homepageContent) {
        const exists = await prisma.homepageContent.findUnique({ where: { sectionKey: hc.sectionKey } });
        if (!exists) {
            await prisma.homepageContent.create({ data: hc });
            console.log(`Created Homepage Content: ${hc.sectionKey}`);
        } else {
            await prisma.homepageContent.update({ where: { sectionKey: hc.sectionKey }, data: hc });
            console.log(`Updated Homepage Content: ${hc.sectionKey}`);
        }
    }

    // Seed Statistics
    const statistics = [
        {
            label: 'Clients Served',
            value: '200+',
            icon: '👥',
            order: 1,
            isActive: true
        },
        {
            label: 'Projects Completed',
            value: '500+',
            icon: '💼',
            order: 2,
            isActive: true
        },
        {
            label: 'Success Rate',
            value: '98%',
            icon: '🏆',
            order: 3,
            isActive: true
        },
        {
            label: 'Years of Experience',
            value: '8+',
            icon: '📅',
            order: 4,
            isActive: true
        },
        {
            label: 'Security Experts',
            value: '15+',
            icon: '🛡️',
            order: 5,
            isActive: true
        }
    ];

    for (const stat of statistics) {
        const exists = await prisma.statistic.findFirst({ where: { label: stat.label } });
        if (!exists) {
            await prisma.statistic.create({ data: stat });
            console.log(`Created Statistic: ${stat.label}`);
        } else {
            await prisma.statistic.update({
                where: { id: exists.id },
                data: stat
            });
            console.log(`Updated Statistic: ${stat.label}`);
        }
    }

    // Get admin for blog posts
    const admin = await prisma.admin.findFirst();

    // Seed Blog Categories
    const categories = [
        {
            name: 'Security Best Practices',
            slug: 'security-best-practices',
            description: 'Tips and guides for maintaining strong security',
            color: '#3B82F6',
            order: 1
        },
        {
            name: 'Threat Intelligence',
            slug: 'threat-intelligence',
            description: 'Latest security threats and how to mitigate them',
            color: '#EF4444',
            order: 2
        },
        {
            name: 'Case Studies',
            slug: 'case-studies',
            description: 'Real-world security success stories',
            color: '#10B981',
            order: 3
        },
        {
            name: 'Industry News',
            slug: 'industry-news',
            description: 'Latest cybersecurity news and trends',
            color: '#F59E0B',
            order: 4
        }
    ];

    for (const cat of categories) {
        const exists = await prisma.blogCategory.findUnique({ where: { slug: cat.slug } });
        if (!exists) {
            await prisma.blogCategory.create({ data: cat });
            console.log(`Created Blog Category: ${cat.name}`);
        }
    }

    // Seed Blog Tags
    const tags = [
        { name: 'Penetration Testing', slug: 'penetration-testing' },
        { name: 'Web Security', slug: 'web-security' },
        { name: 'Mobile Security', slug: 'mobile-security' },
        { name: 'Cloud Security', slug: 'cloud-security' },
        { name: 'OWASP', slug: 'owasp' },
        { name: 'Zero Day', slug: 'zero-day' },
        { name: 'Compliance', slug: 'compliance' }
    ];

    for (const tag of tags) {
        const exists = await prisma.blogTag.findUnique({ where: { slug: tag.slug } });
        if (!exists) {
            await prisma.blogTag.create({ data: tag });
            console.log(`Created Blog Tag: ${tag.name}`);
        }
    }

    // Seed Sample Blog Posts
    if (admin) {
        const securityCategory = await prisma.blogCategory.findUnique({ where: { slug: 'security-best-practices' } });
        const threatCategory = await prisma.blogCategory.findUnique({ where: { slug: 'threat-intelligence' } });
        const webSecTag = await prisma.blogTag.findUnique({ where: { slug: 'web-security' } });
        const owaspTag = await prisma.blogTag.findUnique({ where: { slug: 'owasp' } });

        const blogPosts = [
            {
                title: 'Top 10 Web Application Security Vulnerabilities in 2024',
                slug: 'top-10-web-security-vulnerabilities-2024',
                excerpt: 'Learn about the most critical web application security vulnerabilities and how to protect your applications from them.',
                content: '<h2>Introduction</h2><p>Web application security is more critical than ever. In this comprehensive guide, we explore the OWASP Top 10 vulnerabilities that every developer should know.</p><h2>1. Injection Attacks</h2><p>SQL injection and other injection flaws remain among the most dangerous vulnerabilities...</p><h2>2. Broken Authentication</h2><p>Authentication and session management flaws can allow attackers to compromise passwords, keys, or session tokens...</p>',
                authorId: admin.id,
                status: 'published',
                isPublished: true,
                publishedAt: new Date(),
                metaTitle: 'Top 10 Web Security Vulnerabilities | Bharat Security',
                metaDescription: 'Comprehensive guide to the most critical web application security vulnerabilities in 2024 and how to prevent them.',
                metaKeywords: 'web security, OWASP, vulnerabilities, penetration testing',
                categories: securityCategory ? { connect: [{ id: securityCategory.id }] } : undefined,
                tags: webSecTag && owaspTag ? { connect: [{ id: webSecTag.id }, { id: owaspTag.id }] } : undefined
            },
            {
                title: 'How to Build a Security-First Development Culture',
                slug: 'security-first-development-culture',
                excerpt: 'Discover strategies to embed security practices into your development workflow from day one.',
                content: '<h2>The Importance of Security Culture</h2><p>Building a security-first culture is essential for modern organizations. This article covers practical strategies...</p><h2>Key Strategies</h2><ul><li>Regular security training</li><li>Secure coding practices</li><li>Automated security testing</li></ul>',
                authorId: admin.id,
                status: 'published',
                isPublished: true,
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                metaTitle: 'Building a Security-First Development Culture',
                metaDescription: 'Learn how to embed security practices into your development workflow and build a security-first culture.',
                metaKeywords: 'security culture, secure coding, DevSecOps'
            },
            {
                title: 'Understanding Zero-Day Vulnerabilities',
                slug: 'understanding-zero-day-vulnerabilities',
                excerpt: 'A deep dive into zero-day vulnerabilities, how they are discovered, and how organizations can protect themselves.',
                content: '<h2>What is a Zero-Day Vulnerability?</h2><p>A zero-day vulnerability is a security flaw that is exploited before the vendor becomes aware of it...</p>',
                authorId: admin.id,
                status: 'draft',
                isPublished: false,
                metaTitle: 'Understanding Zero-Day Vulnerabilities',
                metaDescription: 'Deep dive into zero-day vulnerabilities and protection strategies.',
                categories: threatCategory ? { connect: [{ id: threatCategory.id }] } : undefined
            }
        ];

        for (const post of blogPosts) {
            const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
            if (!exists) {
                await prisma.blogPost.create({ data: post });
                console.log(`Created Blog Post: ${post.title}`);
            }
        }
    }

    // Seed Testimonials (Client Voices)
    const testimonials = [
        {
            clientName: 'Rahul Sharma',
            company: 'Fintech India',
            role: 'CTO',
            content: 'Bharat Security\'s penetration testing revealed critical flaws our internal team missed. Their expertise saved us from potential disasters. Highly recommended for any fintech company!',
            rating: 5,
            avatar: '👨‍💼',
            isActive: true,
            isFeatured: true,
            order: 1
        },
        {
            clientName: 'Anjali Gupta',
            company: 'HealthCare Plus',
            role: 'CISO',
            content: 'Their incident response team was a lifesaver during our ransomware scare. Professional, fast, and kept us informed throughout. We now have them on retainer.',
            rating: 5,
            avatar: '👩‍⚕️',
            isActive: true,
            isFeatured: true,
            order: 2
        },
        {
            clientName: 'Vikram Singh',
            company: 'E-com Startup',
            role: 'Founder & CEO',
            content: 'Best security partner for startups. They explained complex technical risks in business terms we understood. Exceptional value for the investment.',
            rating: 5,
            avatar: '🚀',
            isActive: true,
            isFeatured: true,
            order: 3
        },
        {
            clientName: 'Priya Mehta',
            company: 'TechCorp Solutions',
            role: 'VP Engineering',
            content: 'Comprehensive cloud security assessment helped us migrate to AWS with confidence. Their team identified misconfigurations we didn\'t even know existed.',
            rating: 5,
            avatar: '👩‍💻',
            isActive: true,
            isFeatured: true,
            order: 4
        }
    ];

    for (const testimonial of testimonials) {
        const exists = await prisma.testimonial.findFirst({
            where: { clientName: testimonial.clientName, company: testimonial.company }
        });
        if (!exists) {
            await prisma.testimonial.create({ data: testimonial });
            console.log(`Created Testimonial: ${testimonial.clientName} - ${testimonial.company}`);
        }
    }

    // Update Homepage Content with Proven Impact section
    const provenImpact = {
        sectionKey: 'proven-impact',
        content: JSON.stringify([
            {
                metric: '$10M+',
                label: 'Protected in Assets',
                icon: '💰'
            },
            {
                metric: '500K+',
                label: 'Patient Records Secured',
                icon: '🏥'
            },
            {
                metric: '95%',
                label: 'Fraud Reduction',
                icon: '🛡️'
            },
            {
                metric: '24/7',
                label: 'Response Time',
                icon: '⚡'
            }
        ])
    };

    const impactExists = await prisma.homepageContent.findUnique({
        where: { sectionKey: provenImpact.sectionKey }
    });
    if (!impactExists) {
        await prisma.homepageContent.create({ data: provenImpact });
        console.log('Created Homepage Section: Proven Impact');
    }

    // Seed Client Logos (Trusted By section)
    const clientLogos = [
        { name: 'FinTech Corp', logo: '🏦', category: 'Finance', order: 1 },
        { name: 'HealthCare Plus', logo: '🏥', category: 'Healthcare', order: 2 },
        { name: 'E-Commerce Hub', logo: '🛒', category: 'Retail', order: 3 },
        { name: 'Enterprise Solutions', logo: '🏢', category: 'Corporate', order: 4 },
        { name: 'TechStartup Inc', logo: '🚀', category: 'Startup', order: 5 },
        { name: 'GovSecure', logo: '🏛️', category: 'Government', order: 6 }
    ];

    for (const client of clientLogos) {
        const exists = await prisma.clientLogo.findFirst({
            where: { name: client.name }
        });
        if (!exists) {
            await prisma.clientLogo.create({ data: client });
            console.log(`Created Client Logo: ${client.name}`);
        }
    }

    // Seed Technologies (Tech Stack section)
    const technologies = [
        { name: 'Burp Suite', icon: '🔧', category: 'Tool', description: 'Web application security testing', order: 1 },
        { name: 'Metasploit', icon: '⚔️', category: 'Framework', description: 'Penetration testing framework', order: 2 },
        { name: 'Nessus', icon: '📊', category: 'Scanner', description: 'Vulnerability scanner', order: 3 },
        { name: 'Wireshark', icon: '📡', category: 'Network', description: 'Network protocol analyzer', order: 4 },
        { name: 'Kali Linux', icon: '🐧', category: 'OS', description: 'Security-focused Linux distribution', order: 5 },
        { name: 'Custom Tools', icon: '⚙️', category: 'Internal', description: 'Proprietary security tools', order: 6 }
    ];

    for (const tech of technologies) {
        const exists = await prisma.technology.findFirst({
            where: { name: tech.name }
        });
        if (!exists) {
            await prisma.technology.create({ data: tech });
            console.log(`Created Technology: ${tech.name}`);
        }
    }

    // Seed Process Steps (Methodology section)
    const processSteps = [
        { stepNumber: 1, title: 'Reconnaissance', description: 'Deep threat modeling and asset discovery to understand attack surface', icon: '🔍', order: 1 },
        { stepNumber: 2, title: 'Simulation', description: 'Real-world attack simulation and controlled exploitation', icon: '⚡', order: 2 },
        { stepNumber: 3, title: 'Analysis', description: 'Comprehensive vulnerability assessment and risk prioritization', icon: '📊', order: 3 },
        { stepNumber: 4, title: 'Remediation', description: 'Actionable reports with detailed mitigation steps', icon: '🛠️', order: 4 }
    ];

    for (const step of processSteps) {
        const exists = await prisma.processStep.findFirst({
            where: { title: step.title }
        });
        if (!exists) {
            await prisma.processStep.create({ data: step });
            console.log(`Created Process Step: ${step.title}`);
        }
    }

    // Update Statistics with suffix field
    await prisma.statistic.updateMany({
        where: { label: 'Security Audits' },
        data: { suffix: '+' }
    });
    await prisma.statistic.updateMany({
        where: { label: 'Vulnerabilities Found' },
        data: { suffix: '+' }
    });
    await prisma.statistic.updateMany({
        where: { label: 'Years Experience' },
        data: { suffix: '+' }
    });
    console.log('Updated Statistics with suffix field');

    // Create a sample client for testing
    const sampleClientEmail = 'demo@company.com';
    const existingClient = await prisma.client.findUnique({
        where: { email: sampleClientEmail }
    });
    if (!existingClient) {
        const hashedPassword = await bcrypt.hash('Demo@123', 10);
        await prisma.client.create({
            data: {
                email: sampleClientEmail,
                passwordHash: hashedPassword,
                name: 'Demo Client',
                company: 'Demo Company Ltd',
                phone: '+91 9876543210'
            }
        });
        console.log('Created Demo Client: demo@company.com / Demo@123');
    }

    // Seed Blog Categories
    const blogCategories = [
        { name: 'Cybersecurity', slug: 'cybersecurity', description: 'General cybersecurity topics', color: '#0ff', order: 1 },
        { name: 'Penetration Testing', slug: 'penetration-testing', description: 'Ethical hacking and pen-testing', color: '#f00', order: 2 },
        { name: 'Compliance', slug: 'compliance', description: 'Security compliance and regulations', color: '#00f', order: 3 },
        { name: 'Threat Intelligence', slug: 'threat-intelligence', description: 'Threat analysis and intelligence', color: '#ff0', order: 4 }
    ];

    for (const cat of blogCategories) {
        const exists = await prisma.blogCategory.findUnique({ where: { slug: cat.slug } });
        if (!exists) {
            await prisma.blogCategory.create({ data: cat });
            console.log(`Created Blog Category: ${cat.name}`);
        }
    }

    // Seed Blog Tags
    const blogTags = [
        { name: 'security', slug: 'security' },
        { name: 'hacking', slug: 'hacking' },
        { name: 'tips', slug: 'tips' },
        { name: 'awareness', slug: 'awareness' },
        { name: 'malware', slug: 'malware' },
        { name: 'phishing', slug: 'phishing' }
    ];

    for (const tag of blogTags) {
        const exists = await prisma.blogTag.findUnique({ where: { slug: tag.slug } });
        if (!exists) {
            await prisma.blogTag.create({ data: tag });
            console.log(`Created Blog Tag: ${tag.name}`);
        }
    }

    // Seed Sample Blog Posts
    const blogAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    const securityCategory = await prisma.blogCategory.findUnique({ where: { slug: 'cybersecurity' } });

    const blogPosts = [
        {
            title: '10 Essential Cybersecurity Tips for 2025',
            slug: '10-essential-cybersecurity-tips-2025',
            excerpt: 'Protect your business with these essential cybersecurity practices every organization should implement.',
            content: `## Introduction

In today's digital landscape, cybersecurity is more important than ever. Here are 10 essential tips to protect your organization.

## 1. Enable Multi-Factor Authentication (MFA)

MFA adds an extra layer of security beyond just passwords. Implement it across all critical systems.

## 2. Keep Software Updated

Regular updates patch security vulnerabilities. Enable automatic updates where possible.

## 3. Train Your Team

Human error is the leading cause of breaches. Regular security awareness training is essential.

## 4. Use Strong, Unique Passwords

Implement a password manager and enforce strong password policies.

## 5. Regular Backups

Maintain regular backups and test recovery procedures.

## Conclusion

Security is an ongoing process, not a one-time implementation.`,
            status: 'published',
            isPublished: true,
            publishedAt: new Date(),
            metaTitle: '10 Essential Cybersecurity Tips for 2025 | Bharat Security',
            metaDescription: 'Learn the top 10 cybersecurity best practices to protect your business in 2025.'
        },
        {
            title: 'Understanding Phishing Attacks: Prevention Guide',
            slug: 'understanding-phishing-attacks-prevention',
            excerpt: 'Learn how to identify and prevent phishing attacks that target your organization.',
            content: `## What is Phishing?

Phishing is a type of social engineering attack where attackers impersonate legitimate entities to steal sensitive information.

## Common Types of Phishing

- **Email Phishing**: Mass emails that appear to be from trusted sources
- **Spear Phishing**: Targeted attacks on specific individuals
- **Whaling**: Attacks targeting C-level executives
- **Smishing**: Phishing via SMS messages

## How to Identify Phishing

Look for these red flags:
- Urgent language creating panic
- Suspicious sender addresses
- Generic greetings
- Spelling and grammar errors
- Suspicious links or attachments

## Prevention Strategies

1. Implement email filtering
2. Deploy anti-phishing training
3. Use URL inspection tools
4. Enable SPF, DKIM, and DMARC`,
            status: 'published',
            isPublished: true,
            publishedAt: new Date(Date.now() - 86400000),
            metaTitle: 'Understanding Phishing Attacks | Bharat Security',
            metaDescription: 'Complete guide to understanding and preventing phishing attacks in your organization.'
        }
    ];

    for (const post of blogPosts) {
        const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
        if (!exists && blogAdmin) {
            await prisma.blogPost.create({
                data: {
                    ...post,
                    authorId: blogAdmin.id,
                    categories: securityCategory ? { connect: [{ id: securityCategory.id }] } : undefined
                }
            });
            console.log(`Created Blog Post: ${post.title}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
