import { useState, useEffect } from 'react';
import { supabase, dbHelpers } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Author = Database['public']['Tables']['authors']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

export const useAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addAuthor = async (author: Database['public']['Tables']['authors']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .insert([author])
        .select()
        .single();

      if (error) throw error;
      setAuthors(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateAuthor = async (id: string, updates: Database['public']['Tables']['authors']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAuthors(prev => prev.map(author => author.id === id ? data : author));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return { authors, loading, error, addAuthor, updateAuthor, refetch: fetchAuthors };
};

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .not('published_at', 'is', null)
        .not('slug', 'is', null)
        .neq('slug', '')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      // Filtriraj postove koji nemaju valjan slug
      const validPosts = (data || []).filter(post => 
        post.slug && 
        post.slug.trim() !== '' && 
        post.slug !== 'untitled-post'
      );
      
      setPosts(validPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueSlug = (title: string) => {
    if (!title || title.trim() === '') {
      throw new Error('Title is required for slug generation');
    }

    // Kreiranje slug-a koji je kompatibilan sa postojećim podacima
    const baseSlug = title
      .toLowerCase()
      .trim()
      // Zamena srpskih karaktera
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/đ/g, 'd')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      // Uklanjanje specijalnih karaktera
      .replace(/[^a-z0-9\s-]/g, '')
      // Zamena razmaka sa crticama
      .replace(/\s+/g, '-')
      // Uklanjanje višestrukih crtica
      .replace(/-+/g, '-')
      // Uklanjanje crtica sa početka i kraja
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      throw new Error('Unable to generate valid slug from title');
    }

    return baseSlug;
  };

  const addPost = async (post: Database['public']['Tables']['posts']['Insert']) => {
    try {
      if (!post.title || !post.author_id || post.author_id.trim() === '') {
        throw new Error('Title and author_id are required');
      }

      // Generisanje slug-a
      const baseSlug = generateUniqueSlug(post.title || '');
      let uniqueSlug = baseSlug;
      let counter = 0;

      // Provera jedinstvenosti slug-a
      while (true) {
        const { data: existingPosts, error: checkError } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', uniqueSlug);

        if (checkError) throw checkError;

        if (!existingPosts || existingPosts.length === 0) {
          break;
        }

        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...post,
          slug: uniqueSlug
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data.published_at && data.slug && data.slug.trim() !== '') {
        setPosts(prev => [data, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Database['public']['Tables']['posts']['Update']) => {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Post ID is required for update');
      }

      let finalUpdates = { ...updates };
      
      // Ako se ažurira naslov, generiši novi slug
      if (updates.title) {
        const baseSlug = generateUniqueSlug(updates.title);
        let uniqueSlug = baseSlug;
        let counter = 0;

        // Provera jedinstvenosti slug-a (isključujući trenutni post)
        while (true) {
          const { data: existingPosts, error: checkError } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', uniqueSlug)
            .neq('id', id);

          if (checkError) throw checkError;

          if (!existingPosts || existingPosts.length === 0) {
            break;
          }

          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }

        finalUpdates.slug = uniqueSlug;
      }

      const { data, error } = await supabase
        .from('posts')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (data.published_at && data.slug && data.slug.trim() !== '') {
        setPosts(prev => {
          const existing = prev.find(p => p.id === id);
          if (existing) {
            return prev.map(post => post.id === id ? data : post);
          } else {
            return [data, ...prev];
          }
        });
      } else {
        setPosts(prev => prev.filter(post => post.id !== id));
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Post ID is required for deletion');
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const incrementViews = async (postId: string) => {
    if (!postId || postId.trim() === '') {
      return;
    }

    await dbHelpers.incrementPostViews(postId);
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, view_count: post.view_count + 1 }
        : post
    ));
  };

  return { 
    posts, 
    loading, 
    error, 
    addPost, 
    updatePost, 
    deletePost, 
    incrementViews,
    refetch: fetchPosts 
  };
};

export const useSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await dbHelpers.searchPosts(query);
      
      // Filtriraj rezultate koji nemaju valjan slug
      const validResults = data.filter(post => 
        post.slug && 
        post.slug.trim() !== '' && 
        post.slug !== 'untitled-post'
      );
      
      setResults(validResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
};