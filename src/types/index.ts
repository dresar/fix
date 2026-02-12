export interface SiteSettings {
  id?: number;
  theme: string;
  seoTitle: string;
  seoDesc: string;
  cdn_url?: string | null;
  maintenanceMode: boolean;
  maintenance_end_time?: string | null;
  ai_provider?: 'gemini' | 'groq';
}

export interface HomeContent {
  id?: number;
  greeting_id: string;
  greeting_en: string;
  roles_id: string; // JSON string
  roles_en: string; // JSON string
  heroImage?: string | null;
  heroImageFile?: string | null;
}

export interface AboutContent {
  id?: number;
  short_description_id: string;
  short_description_en: string;
  long_description_id: string;
  long_description_en: string;
  aboutImage?: string | null;
  aboutImageFile?: string | null;
}

export interface Profile {
  id?: number;
  fullName: string;
  greeting: string;
  role: string; // JSON string
  bio: string;
  heroImage?: string | null;
  heroImageFile?: string | null;
  aboutImage?: string | null;
  aboutImageFile?: string | null;
  resumeUrl?: string | null;
  resumeFile?: string | null;
  location: string;
  email: string;
  phone: string;
  stats_project_count?: string | null;
  stats_exp_years?: string | null;
  map_embed_url?: string | null;
}

export interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  icon?: string | null;
}

export interface SkillCategory {
  id?: number;
  name: string;
  slug: string;
}

export interface Skill {
  id?: number;
  name: string;
  category?: SkillCategory | number | null;
  percentage: number;
}

export interface Experience {
  id?: number;
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  location?: string | null;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  gpa?: string | null;
  logo?: string | null;
  description?: string | null;
  attachments: any[]; // JSON array
  gallery: any[]; // JSON array
}

export interface ProjectCategory {
  id?: number;
  name: string;
  slug: string;
}

export interface ProjectImage {
  id?: number;
  image: string;
  caption: string;
  order: number;
}

export interface Project {
  id?: number;
  title: string;
  description: string;
  content: string;
  thumbnail?: string | null;
  cover_image?: string | null;
  video_file?: string | null;
  techStack: string[];
  category?: ProjectCategory | number | null;
  demoUrl?: string | null;
  repoUrl?: string | null;
  video_url?: string | null;
  is_featured: boolean;
  links: any[]; // JSON array
  order: number;
  createdAt: string;
  updatedAt: string;
  is_published: boolean;
  publish_at?: string | null;
  images?: ProjectImage[];
}

export interface CertificateCategory {
  id?: number;
  name: string;
  slug: string;
}

export interface Certificate {
  id?: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialUrl?: string | null;
  image?: string | null;
  verified: boolean;
  credentialId?: string | null;
  category?: CertificateCategory | number | null;
}

export interface BlogCategory {
  id?: number;
  name: string;
  slug: string;
  description: string;
}

export interface BlogPost {
  id?: number;
  category?: BlogCategory | number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  coverImageFile?: string | null;
  tags: string[];
  is_published: boolean;
  publish_at?: string | null;
  published_at?: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: number;
  senderName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
