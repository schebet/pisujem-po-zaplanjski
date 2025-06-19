import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post, Author } from '../types';

interface PostCardProps {
  post: Post;
  author: Author;
  featured?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, featured = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Proveri da li post ima valjan slug
  if (!post.slug || post.slug.trim() === '') {
    console.warn('Post nema valjan slug:', post);
    return null; // Ne prikazuj post bez slug-a
  }

  return (
    <motion.article 
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className={`${featured ? 'md:flex' : ''}`}>
        <motion.div 
          className={`relative overflow-hidden ${featured ? 'md:w-1/2' : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Link to={`/post/${post.slug}`}>
            <img
              src={post.coverImage}
              alt={post.title}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                featured ? 'h-64 md:h-full' : 'h-48'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          {/* View count overlay */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{(post as any).view_count || 0}</span>
          </div>
        </motion.div>
        
        <div className={`p-6 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
          <motion.div 
            className="flex flex-wrap gap-2 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.tags.slice(0, 3).map((tag, index) => (
              <motion.span
                key={tag}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          <motion.h2 
            className={`font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors ${
              featured ? 'text-2xl lg:text-3xl' : 'text-xl'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to={`/post/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </motion.h2>

          <motion.p 
            className={`text-gray-600 mb-4 leading-relaxed ${
              featured ? 'text-lg' : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          <motion.div 
            className="flex items-center justify-between text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <User className="h-4 w-4" />
                <Link 
                  to={`/author/${author.id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {author.name}
                </Link>
              </motion.div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} min čitanja</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;