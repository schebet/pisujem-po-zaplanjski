import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Tag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthors, usePosts } from '../hooks/useSupabase';
import SEOHead from '../components/SEOHead';
import SocialShare from '../components/SocialShare';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { authors, loading: authorsLoading } = useAuthors();
  const { posts, loading: postsLoading, incrementViews } = usePosts();

  // Pronađi post na osnovu slug-a
  const post = posts.find(p => {
    if (!p.slug || !slug) return false;
    
    // Direktno poređenje
    if (p.slug === slug) return true;
    
    // Normalizovano poređenje
    const normalizedPostSlug = p.slug.toLowerCase().trim();
    const normalizedParamSlug = slug.toLowerCase().trim();
    
    return normalizedPostSlug === normalizedParamSlug;
  });

  const author = post ? authors.find(a => a.id === post.author_id) : null;

  // Increment view count when post is loaded
  useEffect(() => {
    if (post && !postsLoading) {
      incrementViews(post.id);
    }
  }, [post, postsLoading, incrementViews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif">
            {paragraph.replace('# ', '')}
          </h1>
        );
      }
      
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-8 font-serif">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl md:text-2xl font-bold text-gray-900 mb-3 mt-6">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      
      if (paragraph.startsWith('- ')) {
        return (
          <li key={index} className="text-gray-700 leading-relaxed mb-2">
            {paragraph.replace('- ', '')}
          </li>
        );
      }
      
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4 text-lg">
          {paragraph.split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
          )}
        </p>
      );
    }).filter(Boolean);
  };

  if (postsLoading || authorsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post || !author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Članak nije pronađen</h1>
          <p className="text-gray-600 mb-6">
            {slug ? (
              <>Traženi članak sa slug-om "<span className="font-mono text-sm bg-gray-100 px-1 rounded">{slug}</span>" ne postoji ili nije objavljen.</>
            ) : (
              'Traženi članak ne postoji ili nije objavljen.'
            )}
          </p>
          <div className="space-y-3">
            <Link 
              to="/posts" 
              className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Vrati se na sve članke
            </Link>
            <br />
            <Link 
              to="/" 
              className="inline-block text-gray-600 hover:text-primary-600 transition-colors"
            >
              Idi na početnu stranu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const postUrl = `${window.location.origin}/post/${post.slug}`;

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        image={post.cover_image}
        url={postUrl}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        author={author.name}
        tags={post.tags}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.cover_image,
          "author": {
            "@type": "Person",
            "name": author.name,
            "url": `${window.location.origin}/author/${author.id}`
          },
          "publisher": {
            "@type": "Organization",
            "name": "Zaplanjske priče",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/favicon.svg`
            }
          },
          "datePublished": post.published_at,
          "dateModified": post.updated_at || post.published_at,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
          },
          "keywords": post.tags.join(', '),
          "wordCount": post.content.split(' ').length,
          "timeRequired": `PT${post.reading_time}M`
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Enhanced Animations */}
        <motion.div 
          className="relative h-96 md:h-[500px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-6 md:p-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              <Link
                to="/posts"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nazad na članke
              </Link>
              <motion.h1 
                className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {post.title}
              </motion.h1>
              <motion.div 
                className="flex flex-wrap items-center gap-4 text-white/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{author.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.published_at && formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.reading_time} min čitanja</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.view_count} pregleda</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content with Enhanced Layout */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-8 md:p-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Tags and Social Share */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <motion.span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </motion.span>
                ))}
              </div>
              <SocialShare
                url={postUrl}
                title={post.title}
                description={post.excerpt}
              />
            </div>

            {/* Article Content */}
            <motion.div 
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {formatContent(post.content)}
            </motion.div>

            {/* Author Bio with Enhanced Design */}
            <motion.div 
              className="border-t border-gray-200 mt-12 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-start space-x-4">
                <motion.img
                  src={author.avatar}
                  alt={author.name}
                  className="w-16 h-16 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <Link 
                      to={`/author/${author.id}`} 
                      className="hover:text-primary-600 transition-colors"
                    >
                      {author.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {author.bio}
                  </p>
                  {author.verified && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-2">
                      Верификован аутор
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PostDetail;