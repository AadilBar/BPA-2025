import { Search, Plus, Pin, MessageCircle, ThumbsUp, TrendingUp, Users, MessageSquare, Heart } from 'lucide-react';
import { useState } from 'react';

interface Discussion {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  replies: number;
  likes: number;
  category: string;
  isPinned?: boolean;
  tags?: string[];
}

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const discussions: Discussion[] = [
    {
      id: 1,
      title: 'Welcome to Dream Community - Community Guidelines',
      content: 'Please read our community guidelines to ensure a safe and supportive environment for everyone. Learn about our values, rules, and how to report concerns.',
      author: 'DreamModerator',
      authorAvatar: '👤',
      timeAgo: '4 days ago',
      replies: 235,
      likes: 2145,
      category: 'Uplifty',
      isPinned: true,
      tags: ['guidelines', 'community']
    },
    {
      id: 2,
      title: 'Dealing with social anxiety at work - any tips?',
      content: "I've been struggling with social anxiety in my workplace and it's affecting my performance. I get nervous during meetings and avoid speaking up even when I have good ideas. Has anyone dealt with similar issues? What strategies helped you?",
      author: 'Sarah_M',
      authorAvatar: '👤',
      timeAgo: '2 hours ago',
      replies: 84,
      likes: 217,
      category: 'Uplifty',
      tags: ['anxiety', 'work']
    },
    {
      id: 3,
      title: 'Morning routines that actually help with mental health',
      content: "I've been experimenting with different morning routines to see what helps boost my mood. So far I've been working for me is: 10 min meditation, cold shower, journaling, and some light stretching. Has anyone else found specific routines throughout the day has been remarkable!",
      author: 'MindfulLiving',
      authorAvatar: '👤',
      timeAgo: '5 hours ago',
      replies: 156,
      likes: 438,
      category: 'Self-Care',
      tags: ['routine', 'wellness']
    },
    {
      id: 4,
      title: 'Small wins thread - celebrate your progress!',
      content: "Let's use this thread to celebrate small wins that often go unnoticed but are huge accomplishments. Share your recent small wins here! I'll start: I finally managed to stick with therapy for 6 months, something I never thought I'd...",
      author: 'HopefulUser',
      authorAvatar: '👤',
      timeAgo: '1 day ago',
      replies: 803,
      likes: 47,
      category: 'Depression',
      tags: ['progress', 'positivity']
    }
  ];

  const categories = ['Uplifty', 'Depression', 'Relationships', 'Recovery', 'Self-Care'];
  const trendingTopics = [
    { title: 'How therapy changed my perspective', category: 'Recovery', replies: 156 },
    { title: 'Meditation apps that actually work', category: 'Self-Care', replies: 243 },
    { title: 'Setting boundaries with family', category: 'Relationships', replies: 89 }
  ];

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
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2 justify-center">
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
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md"
              >
                <option>Most Recent</option>
                <option>Most Popular</option>
                <option>Most Replies</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md"
              >
                <option>All</option>
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">Time:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer backdrop-blur-md"
              >
                <option>All Time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 text-sm font-medium rounded-full px-4 py-2 transition-all duration-200 border border-white/20"
              >
                <span className="mr-2">💭</span>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Discussions */}
          <div className="lg:col-span-2 space-y-4">
            {discussions.map(discussion => (
              <div
                key={discussion.id}
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
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                        {discussion.authorAvatar}
                      </div>
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

                <button className="mt-4 text-sm text-white/60 hover:text-white transition-colors">
                  View replies →
                </button>
              </div>
            ))}

            <button className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/70 font-medium rounded-full py-3 transition-all duration-200 border border-white/10">
              Loading more discussions...
            </button>
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
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="hover:bg-white/5 p-3 rounded-full transition-all cursor-pointer">
                    <h4 className="text-white/90 text-sm font-semibold mb-1">{topic.title}</h4>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <span>{topic.category}</span>
                      <span>•</span>
                      <span>{topic.replies} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users size={18} />
                    <span className="text-sm">Members</span>
                  </div>
                  <span className="text-white font-bold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <MessageSquare size={18} />
                    <span className="text-sm">Discussions</span>
                  </div>
                  <span className="text-white font-bold">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <Heart size={18} />
                    <span className="text-sm">Replies</span>
                  </div>
                  <span className="text-white font-bold">15,672</span>
                </div>
              </div>
            </div>

            {/* Your Activity */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <div>
                  <h3 className="text-white font-bold">Your Activity</h3>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Discussions started</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Replies posted</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Helpful reactions</span>
                  <span className="text-white font-semibold">28</span>
                </div>
              </div>
              <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 rounded-full transition-all border border-white/20">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
