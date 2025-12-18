import { Search, Plus, Pin, MessageCircle, ThumbsUp, TrendingUp, Eye } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getUserProfile } from '../utils/profileHelpers';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

interface Discussion {
  id: string;
  title: string;
  content: string;
  userId: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  replies: number;
  likes: number;
  category: string;
  isPinned?: boolean;
  tags?: string[];
  triggers?: string[];
  views: number;
  createdAt: any;
}

export default function Forum() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [hideSensitive, setHideSensitive] = useState<boolean>(false);
  const [userTriggers, setUserTriggers] = useState<string[]>([]);

  // Fetch discussions from Firebase
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const forumRef = collection(db, 'forum');
        const q = query(forumRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        // Map discussions using stored display info (no Users collection access needed)
        const discussionsData: Discussion[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calculate time ago
          const createdAt = data.createdAt?.toDate();
          const timeAgo = createdAt ? getTimeAgo(createdAt) : 'just now';
          
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            userId: data.userId,
            author: data.authorDisplayName || 'Anonymous',
            authorAvatar: data.authorProfilePic || '',
            timeAgo,
            replies: data.replies || 0,
            likes: data.likes || 0,
            category: data.category,
            isPinned: data.isPinned || false,
            tags: data.tags || [],
            triggers: data.triggers || [],
            views: data.views || 0,
            createdAt: data.createdAt
          };
        });
        
        setAllDiscussions(discussionsData);
        setDiscussions(discussionsData);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
    // load current user's profile triggers for sensitive filtering
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile && profile.triggers) {
          setUserTriggers(profile.triggers.map((t: string) => t.toString()));
        }
      } catch (err) {
        console.warn('Failed to load user profile for triggers:', err);
      }
    };

    loadProfile();
  }, []);

  // Filter and sort discussions
  useEffect(() => {
    let filtered = [...allDiscussions];

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d => {
        const titleMatch = d.title?.toLowerCase().includes(q);
        // search the main content/body and also common alternate field names just in case
        const contentFields = [d.content, (d as any).body, (d as any).description, (d as any).post];
        const contentMatch = contentFields.some(field => typeof field === 'string' && field.toLowerCase().includes(q));
        const tagsMatch = d.tags?.some(tag => tag.toLowerCase().includes(q));
        const authorMatch = d.author?.toLowerCase().includes(q);
        return Boolean(titleMatch || contentMatch || tagsMatch || authorMatch);
      });
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    // Apply time filter
    if (timeFilter !== 'All Time' && filtered.length > 0) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'Today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'This Week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'This Month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(d => {
        const createdAt = d.createdAt?.toDate();
        return createdAt && createdAt >= filterDate;
      });
    }

    // Apply sensitive content filter (hide posts that contain triggers the user selected)
    if (hideSensitive && userTriggers && userTriggers.length > 0) {
      const userTriggersLower = userTriggers.map(t => t.toLowerCase());
      filtered = filtered.filter(d => {
        const postTriggers = (d.triggers || []).map(t => t.toLowerCase());
        return !postTriggers.some(pt => userTriggersLower.includes(pt));
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'Most Popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'Most Replies':
        filtered.sort((a, b) => b.replies - a.replies);
        break;
      case 'Most Recent':
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }

    setDiscussions(filtered);
  }, [searchQuery, selectedCategory, sortBy, timeFilter, allDiscussions, hideSensitive, userTriggers]);

  // Reset visible count when filters/search/all discussions change
  useEffect(() => {
    setVisibleCount(4);
  }, [searchQuery, selectedCategory, sortBy, timeFilter, allDiscussions]);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, discussions.length));
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  };

  const categories = ['Uplifty', 'Depression', 'Relationships', 'Recovery', 'Self-Care', 'Informational'];
  // Compute trending posts from all discussions (weighted by replies and likes)
  const trendingPosts = useMemo(() => {
    if (!allDiscussions || allDiscussions.length === 0) return [] as Discussion[];

    // Score formula: replies * 2 + likes + 3 * log10(views + 1)
    // Log-scaling views prevents very high view counts from dominating the score.
    const score = (d: Discussion) => (d.replies || 0) * 2 + (d.likes || 0) + 3 * Math.log10((d.views || 0) + 1);

    return [...allDiscussions]
      .sort((a, b) => score(b) - score(a))
      .slice(0, 5);
  }, [allDiscussions]);

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">Community Forums</h1>
          <p className="text-white/70 text-lg">You're not alone. Share, listen, heal together.</p>
          <p className="text-white/50 text-sm mt-2">Safe space to connect with others on similar journeys, find support, and share experiences in judgment-free environment</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Search discussions, topics, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
            <button 
              onClick={() => navigate('/forum/create')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              New Discussion
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option className="bg-[#6A1E55] text-white">Most Recent</option>
                <option className="bg-[#6A1E55] text-white">Most Popular</option>
                <option className="bg-[#6A1E55] text-white">Most Replies</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option className="bg-[#6A1E55] text-white">All</option>
                {categories.map(cat => <option key={cat} className="bg-[#6A1E55] text-white">{cat}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Time:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option className="bg-[#6A1E55] text-white">All Time</option>
                <option className="bg-[#6A1E55] text-white">Today</option>
                <option className="bg-[#6A1E55] text-white">This Week</option>
                <option className="bg-[#6A1E55] text-white">This Month</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideSensitive}
                  onChange={() => setHideSensitive(prev => !prev)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 focus:ring-0"
                />
                <span className="text-white/70 text-sm">Hide posts matching my triggers</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Discussions */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center text-white/70 py-12">
                <p>Loading discussions...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center text-white/70 py-12">
                <p>No discussions yet. Be the first to start one!</p>
              </div>
            ) : (
              discussions.slice(0, visibleCount).map(discussion => (
              <div
                key={discussion.id}
                onClick={() => navigate(`/forum/${discussion.id}`)}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10 hover:bg-white/15 transition-all duration-300 cursor-pointer ${discussion.isPinned ? 'border-yellow-500/40' : ''}`}
              >
                {discussion.isPinned && (
                  <div className="flex items-center gap-2 text-yellow-400/90 text-sm font-semibold mb-3">
                    <Pin size={16} />
                    <span>Pinned</span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">{discussion.title}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{discussion.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {discussion.authorAvatar ? (
                        <img 
                          src={discussion.authorAvatar} 
                          alt={discussion.author}
                          className="w-8 h-8 rounded-full object-cover bg-white/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                          👤
                        </div>
                      )}
                      <span className="text-white/80 text-sm font-medium">{discussion.author}</span>
                    </div>
                    <span className="text-white/50 text-sm">• {discussion.timeAgo}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-white/70">
                      <ThumbsUp size={16} />
                      <span className="text-sm">{discussion.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/70">
                      <MessageCircle size={16} />
                      <span className="text-sm">{discussion.replies}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/70">
                      <Eye size={16} />
                      <span className="text-sm">{discussion.views}</span>
                    </div>
                  </div>
                </div>

                {discussion.tags && (
                  <div className="flex gap-2 mt-3">
                    {discussion.tags.map(tag => (
                      <span key={tag} className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )))}

            {!loading && discussions.length > 0 && visibleCount < discussions.length && (
              <button onClick={loadMore} className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/70 font-medium rounded-full py-3 transition-all duration-200 border border-white/10">
                View more discussions
              </button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Guidelines */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">Community Guidelines</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Be respectful and kind to all members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Keep discussions supportive and constructive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Share mindfully - respect confidentiality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Report any concerns to moderation team</span>
                </li>
              </ul>
              <button className="mt-4 text-sm text-white/60 hover:text-white transition-colors">
                Read full Guidelines →
              </button>
            </div>

            {/* Trending Discussions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md flex items-center gap-2">
                <TrendingUp size={20} />
                Trending Discussions
              </h3>
              <div className="space-y-3">
                {trendingPosts.length === 0 ? (
                  <div className="text-white/60 text-sm">No trending discussions yet.</div>
                ) : (
                  trendingPosts.map((post, idx) => (
                    <div key={post.id || idx} onClick={() => navigate(`/forum/${post.id}`)} className="hover:bg-white/5 p-3 rounded-full transition-all cursor-pointer">
                      <h4 className="text-white/90 text-sm font-semibold mb-1 line-clamp-2">{post.title}</h4>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.replies} replies</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Removed Community Stats and Your Activity — replaced by dynamic Trending Discussions above */}
          </div>
        </div>

        {/* Help Footer Section */}
        <section className="mt-16 mb-8">
          <div className="flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
            <h2 className="md:text-5xl font-bold text-white mb-2 leading-tight">Still need more help?</h2>
            <p className="text-white font-semibold">Connect with a professional counselor</p>
            <button className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold rounded-full border border-white/30 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg">
              Book an appointment with us now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
