import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Calendar, User, Clock, Tag, MessageCircle, Send, Trash2 } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { fetchBlogPostById, toggleLikePost, addComment, deleteComment, type BlogPost } from '../lib/blogService';
import { onAuthStateChanged } from 'firebase/auth';

export default function BlogPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setCommentName(user.displayName || user.email?.split('@')[0] || 'Anonymous');
        setCommentEmail(user.email || '');
        setIsAdmin(user.email === 'amogh.shivanna@gmail.com');
      } else {
        setUserId(null);
        setCommentName('');
        setCommentEmail('');
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        navigate('/blog');
        return;
      }

      try {
        const fetchedPost = await fetchBlogPostById(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          if (userId) {
            setIsLiked(fetchedPost.likedBy?.includes(userId) || false);
          }
        } else {
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, userId, navigate]);

  const handleToggleLike = async () => {
    if (!userId || !auth.currentUser) {
      alert('Please log in to like posts');
      return;
    }

    if (!post) return;

    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!isLiked);

    try {
      const success = await toggleLikePost(post.id, auth.currentUser.uid, wasLiked);
      if (success) {
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            likedBy: wasLiked
              ? prev.likedBy?.filter(id => id !== auth.currentUser!.uid) || []
              : [...(prev.likedBy || []), auth.currentUser!.uid]
          };
        });
      } else {
        // Revert on failure
        setIsLiked(wasLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(wasLiked);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert('Please log in to comment');
      return;
    }

    if (!commentContent.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!postId) return;

    setIsSubmittingComment(true);
    try {
      const userName = auth.currentUser.displayName || 
                       auth.currentUser.email?.split('@')[0] || 
                       'Anonymous User';
      const userEmail = auth.currentUser.email || 'no-email@example.com';

      const success = await addComment(
        postId,
        userName,
        userEmail,
        commentContent.trim(),
        auth.currentUser.uid
      );

      if (success) {
        // Refresh post to get updated comments
        const updatedPost = await fetchBlogPostById(postId);
        if (updatedPost) {
          setPost(updatedPost);
        }
        setCommentContent('');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('An error occurred while adding your comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId || !userId || !auth.currentUser) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const success = await deleteComment(postId, commentId, auth.currentUser.uid);
      if (success) {
        // Refresh post to get updated comments
        const updatedPost = await fetchBlogPostById(postId);
        if (updatedPost) {
          setPost(updatedPost);
        }
      } else {
        alert('Failed to delete comment. You may not have permission.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred while deleting the comment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const sortedComments = [...(post.comments || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>

        {/* Article Card */}
        <article className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden mb-8">
          {/* Header */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-white/20 text-white/90 text-sm font-semibold px-4 py-2 rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm border border-white/20"
                  >
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white/5 border-t border-white/10 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleLike}
                disabled={!auth.currentUser}
                className={`flex items-center gap-2 transition-all duration-200 group ${
                  isLiked 
                    ? 'text-red-400' 
                    : 'text-white/70 hover:text-red-400'
                } ${!auth.currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!auth.currentUser ? 'Login to like' : ''}
              >
                <Heart
                  size={24}
                  fill={isLiked ? 'currentColor' : 'none'}
                  className={`transition-all duration-200 ${
                    isLiked 
                      ? 'scale-110 animate-pulse' 
                      : 'group-hover:scale-110'
                  }`}
                />
                <span className="text-lg font-medium">
                  {post.likedBy?.length || 0} {(post.likedBy?.length || 0) === 1 ? 'Like' : 'Likes'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-200 border border-white/20 hover:scale-105 active:scale-95"
              >
                <Share2 size={20} />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/20 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Comments ({sortedComments.length})
          </h2>

          {/* Comment Form */}
          {auth.currentUser ? (
            <form onSubmit={handleSubmitComment} className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Leave a Comment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={commentName}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={commentEmail}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all opacity-75"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Comment <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all resize-none"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingComment}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-white/70 mb-4">Please log in to leave a comment</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                Log In
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {sortedComments.length === 0 ? (
              <p className="text-white/60 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{comment.author}</p>
                        <p className="text-white/50 text-xs">
                          {new Date(comment.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {auth.currentUser && (comment.userId === auth.currentUser.uid || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-white/50 hover:text-red-400 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <p className="text-white/90 leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
