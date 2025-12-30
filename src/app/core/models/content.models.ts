
export interface Service {
    id: string;
    title: string;
    slug: string;
    type?: string;
    icon: string; // Emoji for now, or URL
    shortDescription: string;
    fullDescription: string;
    features: string[];
    benefits: string[];
    isActive: boolean;
}

export interface CaseStudy {
    id: string;
    title: string;
    client: string;
    date: string | Date;
    excerpt: string;
    content: string;
    image: string;
    result: string;
    logo?: string;
    category?: string;
    description?: string;
    impact?: string;
}

export interface Inquiry {
    id: string;
    name: string;
    email: string;
    company?: string;
    serviceInterest?: string;
    message: string;
    status: 'New' | 'Contacted' | 'Closed';
    date: Date;
}
