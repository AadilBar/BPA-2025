import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { createBlogPost } from '../lib/blogService';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddBlogPost() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Amogh Shivanna',
    category: 'Wellness',
    readTime: 5,
    tags: [] as string[],
    featured: false
  });

  const categories = ['Mental Health', 'Self-Care', 'Mindfulness', 'Relationships', 'Wellness', 'Technology'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email;
        const adminStatus = userEmail === 'amogh.shivanna@gmail.com';
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          navigate('/blog');
        }
      } else {
        navigate('/blog');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewPost(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewPost(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title || !newPost.excerpt || !newPost.content) {
      alert('Please fill in all required fields (Title, Excerpt, and Content)');
      return;
    }

    if (newPost.readTime < 1) {
      alert('Read time must be at least 1 minute');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title: newPost.title.trim(),
        excerpt: newPost.excerpt.trim(),
        content: newPost.content.trim(),
        author: newPost.author,
        category: newPost.category,
        readTime: Number(newPost.readTime),
        date: new Date().toISOString(),
        tags: newPost.tags,
        featured: newPost.featured || false
      };
      
      console.log('Submitting post data:', postData);
      
      const postId = await createBlogPost(postData);
      
      if (postId) {
        alert('Blog post created successfully!');
        navigate('/blog');
      } else {
        alert('Failed to create blog post. Please check the console for errors and ensure you have the correct Firebase permissions.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(`An error occurred while creating the blog post: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">Create New Blog Post</h1>
          <p className="text-white/70 text-lg">Share your insights with the community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-white/90 text-sm font-semibold mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={newPost.title}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
              placeholder="Enter blog post title..."
              required
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="block text-white/90 text-sm font-semibold mb-2">
              Excerpt <span className="text-red-400">*</span>
            </label>
            <textarea
              name="excerpt"
              value={newPost.excerpt}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all resize-none"
              placeholder="Brief summary of your post..."
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-white/90 text-sm font-semibold mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              name="content"
              value={newPost.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all resize-none"
              placeholder="Write your blog post content here..."
              required
            />
          </div>

          {/* Category and Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={newPost.category}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0A0F2A]">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2">Read Time (minutes)</label>
              <input
                type="number"
                name="readTime"
                value={newPost.readTime}
                onChange={handleInputChange}
                min="1"
                max="60"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-white/90 text-sm font-semibold mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newPost.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-white/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={newPost.featured}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-white focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-white/90 text-sm font-semibold flex items-center gap-2">
                <Sparkles size={16} />
                Mark as Featured Post
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Post...' : 'Publish Blog Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
