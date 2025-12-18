import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle, Eye, Send, AlertTriangle } from 'lucide-react';
import { db, auth } from '../firebase/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { getUserProfile } from '../utils/profileHelpers';

interface Comment {
  id: string;
  path: string; // Path to this comment in Firestore
  userId: string;
  authorDisplayName: string;
  authorProfilePic: string;
  content: string;
  createdAt: any;
  timeAgo: string;
  likes: number;
  replies: Comment[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  userId: string;
  authorDisplayName: string;
  authorProfilePic: string;
  category: string;
  tags: string[];
  triggers: string[];
  createdAt: any;
  timeAgo: string;
  replies: number;
  likes: number;
  views: number;
  isPinned: boolean;
}

export default function DiscussionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userLikedPosts, setUserLikedPosts] = useState<string[]>([]);
  const [userLikedComments, setUserLikedComments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDiscussion();
      fetchComments();
      incrementViews();
      if (auth.currentUser) {
        fetchUserLikes();
      }
    }
  }, [id]);

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

  const fetchDiscussion = async () => {
    try {
      if (!id) return;
      const docRef = doc(db, 'forum', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate();
        
        setDiscussion({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          authorDisplayName: data.authorDisplayName || 'Anonymous',
          authorProfilePic: data.authorProfilePic || '',
          category: data.category,
          tags: data.tags || [],
          triggers: data.triggers || [],
          createdAt: data.createdAt,
          timeAgo: createdAt ? getTimeAgo(createdAt) : 'just now',
          replies: data.replies || 0,
          likes: data.likes || 0,
          views: data.views || 0,
          isPinned: data.isPinned || false
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!id) return;
      const commentsRef = collection(db, 'forum', id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const commentsData: Comment[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate();
        
        // Fetch replies recursively
        const replies = await fetchRepliesRecursive(`forum/${id}/comments/${docSnap.id}`);
        
        commentsData.push({
          id: docSnap.id,
          path: `forum/${id}/comments/${docSnap.id}`,
          userId: data.userId,
          authorDisplayName: data.authorDisplayName || 'Anonymous',
          authorProfilePic: data.authorProfilePic || '',
          content: data.content,
          createdAt: data.createdAt,
          timeAgo: createdAt ? getTimeAgo(createdAt) : 'just now',
          likes: data.likes || 0,
          replies
        });
      }
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchRepliesRecursive = async (parentPath: string): Promise<Comment[]> => {
    try {
      const repliesRef = collection(db, parentPath, 'replies');
      const q = query(repliesRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const repliesData: Comment[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate();
        const currentPath = `${parentPath}/replies/${docSnap.id}`;
        
        // Recursively fetch nested replies
        const nestedReplies = await fetchRepliesRecursive(currentPath);
        
        repliesData.push({
          id: docSnap.id,
          path: currentPath,
          userId: data.userId,
          authorDisplayName: data.authorDisplayName || 'Anonymous',
          authorProfilePic: data.authorProfilePic || '',
          content: data.content,
          createdAt: data.createdAt,
          timeAgo: createdAt ? getTimeAgo(createdAt) : 'just now',
          likes: data.likes || 0,
          replies: nestedReplies
        });
      }
      
      return repliesData;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };

  const incrementViews = async () => {
    try {
      if (!id) return;
      const docRef = doc(db, 'forum', id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setUserLikedPosts(userProfile.likedPosts || []);
        setUserLikedComments(userProfile.likedComments || []);
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const toggleLike = async () => {
    if (!auth.currentUser || !id || !discussion) return;
    
    try {
      const userProfile = await getUserProfile();
      if (!userProfile?.docId) return;

      const postRef = doc(db, 'forum', id);
      const userRef = doc(db, 'Users', userProfile.docId);
      
      const isLiked = userLikedPosts.includes(id);
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, { likes: increment(-1) });
        await updateDoc(userRef, { likedPosts: arrayRemove(id) });
        setUserLikedPosts(prev => prev.filter(postId => postId !== id));
        setDiscussion({ ...discussion, likes: discussion.likes - 1 });
      } else {
        // Like
        await updateDoc(postRef, { likes: increment(1) });
        await updateDoc(userRef, { likedPosts: arrayUnion(id) });
        setUserLikedPosts(prev => [...prev, id]);
        setDiscussion({ ...discussion, likes: discussion.likes + 1 });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !id || !commentText.trim()) return;
    
    setSubmitting(true);
    try {
      const userProfile = await getUserProfile();
      const displayName = userProfile?.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous';
      const profilePic = userProfile?.profileImageUrl || '';
      
      const commentsRef = collection(db, 'forum', id, 'comments');
      await addDoc(commentsRef, {
        userId: auth.currentUser.uid,
        authorDisplayName: displayName,
        authorProfilePic: profilePic,
        content: commentText.trim(),
        createdAt: serverTimestamp(),
        likes: 0
      });
      
      // Increment reply count
      const postRef = doc(db, 'forum', id);
      await updateDoc(postRef, { replies: increment(1) });
      
      setCommentText('');
      await fetchComments();
      if (discussion) {
        setDiscussion({ ...discussion, replies: discussion.replies + 1 });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentPath: string) => {
    if (!auth.currentUser || !id || !replyTexts[commentPath]?.trim()) return;
    
    setSubmitting(true);
    try {
      const userProfile = await getUserProfile();
      const displayName = userProfile?.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous';
      const profilePic = userProfile?.profileImageUrl || '';
      
      const repliesRef = collection(db, commentPath, 'replies');
      await addDoc(repliesRef, {
        userId: auth.currentUser.uid,
        authorDisplayName: displayName,
        authorProfilePic: profilePic,
        content: replyTexts[commentPath].trim(),
        createdAt: serverTimestamp(),
        likes: 0
      });
      
      // Increment reply count
      const postRef = doc(db, 'forum', id);
      await updateDoc(postRef, { replies: increment(1) });
      
      setReplyTexts(prev => ({ ...prev, [commentPath]: '' }));
      setReplyingTo(null);
      await fetchComments();
      if (discussion) {
        setDiscussion({ ...discussion, replies: discussion.replies + 1 });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCommentLike = async (commentPath: string, _likes: number) => {
    if (!auth.currentUser) return;
    
    try {
      const userProfile = await getUserProfile();
      if (!userProfile?.docId) return;

      const commentRef = doc(db, commentPath);
      const userRef = doc(db, 'Users', userProfile.docId);
      
      const isLiked = userLikedComments.includes(commentPath);
      
      if (isLiked) {
        // Unlike
        await updateDoc(commentRef, { likes: increment(-1) });
        await updateDoc(userRef, { likedComments: arrayRemove(commentPath) });
        setUserLikedComments(prev => prev.filter(path => path !== commentPath));
      } else {
        // Like
        await updateDoc(commentRef, { likes: increment(1) });
        await updateDoc(userRef, { likedComments: arrayUnion(commentPath) });
        setUserLikedComments(prev => [...prev, commentPath]);
      }
      
      // Refresh comments to show updated likes
      await fetchComments();
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const CommentComponent = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          {comment.authorProfilePic ? (
            <img 
              src={comment.authorProfilePic} 
              alt={comment.authorDisplayName}
              className="w-10 h-10 rounded-full object-cover bg-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              👤
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-white font-semibold">{comment.authorDisplayName}</span>
              <span className="text-white/50 text-sm">• {comment.timeAgo}</span>
            </div>
            
            <p className="text-white/90 text-sm mb-3 break-words">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleCommentLike(comment.path, comment.likes)}
                disabled={!auth.currentUser}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  userLikedComments.includes(comment.path)
                    ? 'text-blue-400'
                    : 'text-white/60 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp 
                  size={14} 
                  fill={userLikedComments.includes(comment.path) ? 'currentColor' : 'none'}
                />
                <span>{comment.likes}</span>
              </button>
              
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.path ? null : comment.path)}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reply input */}
      {replyingTo === comment.path && (
        <div className="ml-8 mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyTexts[comment.path] || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setReplyTexts(prev => ({ ...prev, [comment.path]: newValue }));
              }}
              placeholder="Write a reply..."
              className="flex-1 bg-white/5 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-sm"
              disabled={submitting}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit(comment.path);
                }
                // Stop event propagation to prevent parent handlers
                e.stopPropagation();
              }}
            />
            <button
              onClick={() => handleReplySubmit(comment.path)}
              disabled={submitting || !replyTexts[comment.path]?.trim()}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Nested replies - infinite recursion */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => (
            <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <p className="text-white text-lg">Loading discussion...</p>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
      }}>
        <p className="text-white text-lg">Discussion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{
      background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Forum
        </button>

        {/* Main post */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/20 mb-6">
          {/* Category badge */}
          <div className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
            {discussion.category}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            {discussion.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            {discussion.authorProfilePic ? (
              <img 
                src={discussion.authorProfilePic} 
                alt={discussion.authorDisplayName}
                className="w-12 h-12 rounded-full object-cover bg-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                👤
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{discussion.authorDisplayName}</p>
              <p className="text-white/50 text-sm">{discussion.timeAgo}</p>
            </div>
          </div>

          {/* Triggers warning */}
          {discussion.triggers && discussion.triggers.length > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-yellow-200 font-semibold text-sm mb-1">Content Warning</p>
                  <p className="text-yellow-200/80 text-sm">
                    This post contains mentions of: {discussion.triggers.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="text-white/90 text-lg mb-6 whitespace-pre-wrap">
            {discussion.content}
          </div>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.tags.map(tag => (
                <span key={tag} className="text-sm text-white/50 bg-white/5 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats and actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-6">
              <button 
                onClick={toggleLike}
                disabled={!auth.currentUser}
                className={`flex items-center gap-2 transition-colors ${
                  userLikedPosts.includes(id || '') 
                    ? 'text-blue-400' 
                    : 'text-white/70 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp size={20} fill={userLikedPosts.includes(id || '') ? 'currentColor' : 'none'} />
                <span>{discussion.likes}</span>
              </button>
              
              <div className="flex items-center gap-2 text-white/70">
                <MessageCircle size={20} />
                <span>{discussion.replies}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/70">
                <Eye size={20} />
                <span>{discussion.views}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            Comments ({discussion.replies})
          </h2>

          {/* Comment input */}
          {auth.currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
                  rows={3}
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="mt-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-white/70">
                <button 
                  onClick={() => navigate('/signin')}
                  className="text-blue-400 hover:underline"
                >
                  Sign in
                </button> to join the discussion
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-white/50 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </div>

        {/* Help Footer Section */}
        <div className="flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 mt-8">
          <h2 className="md:text-5xl font-bold text-white mb-2 leading-tight">Still need more help?</h2>
          <p className="text-white font-semibold">Connect with a professional counselor</p>
          <button className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold rounded-full border border-white/30 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg">
            Book an appointment with us now
          </button>
        </div>
      </div>
    </div>
  );
}
