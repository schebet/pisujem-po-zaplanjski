export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  email: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  featured: boolean;
}