import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader, PenTool, Plus, UserPlus } from 'lucide-react';
import PostCard from '../components/PostCard';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useAuthors, usePosts } from '../hooks/useSupabase';

const Posts: React.FC = () => {
  const { user } = useAuth();
  const { authors, loading: authorsLoading } = useAuthors();
  const { posts, loading: postsLoading } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getAuthor = (authorId: string) => {
    return authors.find(author => author.id === authorId);
  };

  const transformPost = (post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.cover_image,
    authorId: post.author_id,
    publishedAt: post.published_at,
    readingTime: post.reading_time,
    tags: post.tags,
    featured: post.featured
  });

  const transformAuthor = (author: any) => ({
    id: author.id,
    name: author.name,
    bio: author.bio,
    avatar: author.avatar,
    email: author.email,
    socialLinks: author.social_links
  });

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (postsLoading || authorsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Учитава се садржај...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Сви чланци
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Истражите богату колекцију прича, чланака и есеја о традицији и култури Запланског краја
              </p>
            </div>
            
            {user ? (
              <div className="flex justify-center md:justify-end">
                <Link
                  to="/write"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Напиши чланак
                </Link>
              </div>
            ) : (
              <div className="flex justify-center md:justify-end">
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Постаните аутор
                </button>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Претражите чланке..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white min-w-[200px]"
                >
                  <option value="">Све категорије</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600">
              Приказано {filteredPosts.length} од {posts.length} чланака
            </p>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const author = getAuthor(post.author_id);
                if (!author) return null;
                return (
                  <PostCard
                    key={post.id}
                    post={transformPost(post)}
                    author={transformAuthor(author)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-sm p-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Нема резултата
                </h3>
                <p className="text-gray-600 mb-6">
                  Покушајте са другим појмовима претраге или уклоните филтере.
                </p>
                {user ? (
                  <Link
                    to="/write"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PenTool className="h-5 w-5 mr-2" />
                    Напиши први чланак
                  </Link>
                ) : (
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Постаните аутор
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};

export default Posts;