import { Search, Heart, Share2, Calendar, User, ArrowRight, BookOpen, Sparkles, TrendingUp, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { fetchBlogPosts, toggleLikePost, type BlogPost } from '../lib/blogService';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [minLikes, setMinLikes] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const categories = ['All', 'Mental Health', 'Self-Care', 'Mindfulness', 'Relationships', 'Wellness', 'Technology'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await fetchBlogPosts();
        setBlogPosts(posts);
        if (userId) {
          const liked = posts
            .filter(post => post.likedBy?.includes(userId))
            .map(post => post.id);
          setLikedPosts(liked);
        }
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogPosts();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const userEmail = auth.currentUser?.email;
      setIsAdmin(userEmail === 'amogh.shivanna@gmail.com');
    }
  }, [userId]);

  const toggleLike = async (postId: string) => {
    if (!userId || !auth.currentUser) {
      alert('Please log in to like posts');
      return;
    }

    const isLiked = likedPosts.includes(postId);
    
    // Optimistic update
    setLikedPosts(prev =>
      isLiked
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );

    // Update the blog posts state for immediate UI feedback
    setBlogPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likedBy: isLiked
            ? post.likedBy?.filter(id => id !== auth.currentUser!.uid) || []
            : [...(post.likedBy || []), auth.currentUser!.uid]
        };
      }
      return post;
    }));

    try {
      const success = await toggleLikePost(postId, auth.currentUser.uid, isLiked);
      if (!success) {
        // Revert on failure
        setLikedPosts(prev =>
          isLiked
            ? [...prev, postId]
            : prev.filter(id => id !== postId)
        );
        setBlogPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likedBy: isLiked
                ? [...(post.likedBy || []), auth.currentUser!.uid]
                : post.likedBy?.filter(id => id !== auth.currentUser!.uid) || []
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setLikedPosts(prev =>
        isLiked
          ? [...prev, postId]
          : prev.filter(id => id !== postId)
      );
      setBlogPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likedBy: isLiked
              ? [...(post.likedBy || []), auth.currentUser!.uid]
              : post.likedBy?.filter(id => id !== auth.currentUser!.uid) || []
          };
        }
        return post;
      }));
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const likesCount = post.likedBy?.length || 0;
    const matchesLikes = likesCount >= minLikes;
    return matchesCategory && matchesSearch && matchesLikes;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'most-liked') {
      return (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
    }
    return 0;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <p className="text-white text-lg">Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">Wellness Blog</h1>
            {isAdmin && (
              <button
                onClick={() => navigate('/add-blog')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                New Post
              </button>
            )}
          </div>
          <p className="text-white/70 text-lg">Expert insights and practical tips for mental health and wellbeing</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Search articles, topics, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border ${
                  selectedCategory === category
                    ? 'bg-white/25 text-white border-white/40 shadow-lg'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort and Like Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-white/70 text-sm font-medium block mb-2">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'most-liked')}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30 transition-all"
              >

                <option value="newest" className="bg-[#0A0F2A]">Newest First</option>
                <option value="oldest" className="bg-[#0A0F2A]">Oldest First</option>
                <option value="most-liked" className="bg-[#0A0F2A]">Most Liked</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-white/70 text-sm font-medium block mb-2">Minimum Likes:</label>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-white/50" />
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="50"
                  value={minLikes}
                  onChange={(e) => setMinLikes(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/50"
                />
                <span className="text-white/70 text-sm font-medium w-12">{minLikes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {selectedCategory === 'All' && searchQuery === '' && minLikes === 0 && featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles size={24} />
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <ArrowRight size={20} className="text-white/50 group-hover:text-white/80 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen size={24} />
            {selectedCategory === 'All' && searchQuery === '' ? 'Latest Articles' : 'Articles'}
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-xl shadow-black/10">
              <p className="text-white/70 text-lg">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10 hover:bg-white/15 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="bg-white/20 text-white/80 text-xs font-medium px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white/90 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{post.author}</span>
                      </div>
                      <span>{post.readTime} min</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                        className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-all duration-200 group"
                      >
                        <Heart
                          size={18}
                          fill={likedPosts.includes(post.id) ? 'currentColor' : 'none'}
                          className={`transition-all duration-200 ${
                            likedPosts.includes(post.id) 
                              ? 'text-red-400 scale-110' 
                              : 'group-hover:scale-110'
                          }`}
                        />
                        <span className={`text-sm font-medium transition-colors ${
                          likedPosts.includes(post.id) ? 'text-red-400' : ''
                        }`}>
                          {post.likedBy?.length || 0}
                        </span>
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

    
        {/* Add New Post Button - Visible only to admin */}
        
      </div>
    </div>
  );
}