import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          name: string;
          bio: string;
          avatar: string;
          email: string;
          social_links: {
            twitter?: string;
            linkedin?: string;
            website?: string;
          } | null;
          verified: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio: string;
          avatar: string;
          email: string;
          social_links?: {
            twitter?: string;
            linkedin?: string;
            website?: string;
          } | null;
          verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string;
          avatar?: string;
          email?: string;
          social_links?: {
            twitter?: string;
            linkedin?: string;
            website?: string;
          } | null;
          verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          cover_image: string;
          author_id: string;
          published_at: string | null;
          reading_time: number;
          tags: string[];
          featured: boolean;
          view_count: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          cover_image: string;
          author_id: string;
          published_at?: string | null;
          reading_time: number;
          tags: string[];
          featured?: boolean;
          view_count?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          cover_image?: string;
          author_id?: string;
          published_at?: string | null;
          reading_time?: number;
          tags?: string[];
          featured?: boolean;
          view_count?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_categories: {
        Row: {
          id: string;
          post_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          category_id?: string;
          created_at?: string;
        };
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          viewer_ip: string | null;
          user_agent: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          viewer_ip?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          viewer_ip?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          progress_percentage: number;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          progress_percentage?: number;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          progress_percentage?: number;
          last_read_at?: string;
        };
      };
    };
    Views: {
      post_statistics: {
        Row: {
          id: string;
          title: string;
          slug: string;
          view_count: number;
          published_at: string | null;
          status: string;
          author_name: string;
          total_views: number;
          unique_view_days: number;
          avg_reading_progress: number;
        };
      };
      author_statistics: {
        Row: {
          id: string;
          name: string;
          email: string;
          verified: boolean;
          created_at: string;
          last_login: string | null;
          total_posts: number;
          published_posts: number;
          draft_posts: number;
          total_views: number;
          avg_views_per_post: number;
        };
      };
    };
    Functions: {
      increment_post_view_count: {
        Args: {
          post_id_param: string;
          viewer_ip_param?: string;
          user_agent_param?: string;
        };
        Returns: void;
      };
      search_posts: {
        Args: {
          search_query: string;
        };
        Returns: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          cover_image: string;
          author_id: string;
          published_at: string;
          reading_time: number;
          tags: string[];
          featured: boolean;
          view_count: number;
          rank: number;
        }[];
      };
    };
  };
};

// Helper functions for common database operations
export const dbHelpers = {
  // Increment post view count
  async incrementPostViews(postId: string) {
    const { error } = await supabase.rpc('increment_post_view_count', {
      post_id_param: postId,
      viewer_ip_param: null, // You can implement IP detection if needed
      user_agent_param: navigator.userAgent
    });
    
    if (error) {
      console.error('Error incrementing post views:', error);
    }
  },

  // Search posts with full-text search
  async searchPosts(query: string) {
    const { data, error } = await supabase.rpc('search_posts', {
      search_query: query
    });
    
    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }
    
    return data || [];
  },

  // Get post statistics
  async getPostStatistics() {
    const { data, error } = await supabase
      .from('post_statistics')
      .select('*')
      .order('total_views', { ascending: false });
    
    if (error) {
      console.error('Error fetching post statistics:', error);
      return [];
    }
    
    return data || [];
  },

  // Get author statistics
  async getAuthorStatistics() {
    const { data, error } = await supabase
      .from('author_statistics')
      .select('*')
      .order('total_views', { ascending: false });
    
    if (error) {
      console.error('Error fetching author statistics:', error);
      return [];
    }
    
    return data || [];
  },

  // Update reading progress
  async updateReadingProgress(postId: string, userId: string, progressPercentage: number) {
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        post_id: postId,
        user_id: userId,
        progress_percentage: progressPercentage,
        last_read_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error updating reading progress:', error);
    }
  },

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  },

  // Get posts by category
  async getPostsByCategory(categorySlug: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_categories!inner(
          categories!inner(slug)
        )
      `)
      .eq('post_categories.categories.slug', categorySlug)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }
    
    return data || [];
  }
};