import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

/* =======================
   Types
======================= */

export interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  timestamp: string;
  userId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  readTime: number;
  date: string;
  tags: string[];
  featured?: boolean;
  likedBy?: string[];
  comments?: Comment[];
}

/* =======================
   Fetch
======================= */

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(collection(db, 'blogPosts'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<BlogPost, 'id'>),
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchBlogPostById = async (
  postId: string
): Promise<BlogPost | null> => {
  try {
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() as Omit<BlogPost, 'id'>),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

/* =======================
   Create / Update
======================= */

export const createBlogPost = async (
  post: Omit<BlogPost, 'id' | 'likedBy' | 'comments'>
): Promise<string | null> => {
  try {
    const ref = await addDoc(collection(db, 'blogPosts'), {
      ...post,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateBlogPost = async (
  postId: string,
  updates: Partial<Omit<BlogPost, 'id'>>
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'blogPosts', postId), updates);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

/* =======================
   Likes
======================= */

export const toggleLikePost = async (
  postId: string,
  userId: string,
  isLiked: boolean
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'blogPosts', postId), {
      likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

/* =======================
   Delete (soft)
======================= */

export const deleteBlogPost = async (postId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'blogPosts', postId), { deleted: true });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

/* =======================
   Comments
======================= */

export const addComment = async (
  postId: string,
  author: string,
  authorEmail: string,
  content: string,
  userId?: string
): Promise<boolean> => {
  try {
    const comment: Comment = {
      id: crypto.randomUUID(),
      author,
      authorEmail,
      content,
      timestamp: new Date().toISOString(),
      userId,
    };

    await updateDoc(doc(db, 'blogPosts', postId), {
      comments: arrayUnion(comment),
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const ref = doc(db, 'blogPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const post = snap.data() as Omit<BlogPost, 'id'>;
    const comment = post.comments?.find((c) => c.id === commentId);
    if (!comment) return false;

    const userEmail = auth.currentUser?.email;
    if (
      comment.userId !== userId &&
      userEmail !== 'amogh.shivanna@gmail.com'
    ) {
      return false;
    }

    await updateDoc(ref, {
      comments: arrayRemove(comment),
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};