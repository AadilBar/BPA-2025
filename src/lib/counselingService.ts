import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/* =======================
   Types
======================= */

export interface Counselor {
  id: string;
  name: string;
  credentials: string;
  specialization: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  tags: string[];
  availability: {
    [key: string]: string[]; 
  };
}

export interface Appointment {
  id: string;
  counselorId: string;
  counselorName: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'online' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

/* =======================
   Counselors
======================= */

export const fetchCounselors = async (): Promise<Counselor[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'counselors'));
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Counselor, 'id'>),
    }));
  } catch (e) {
    console.error('Error fetching counselors:', e);
    return [];
  }
};

export const fetchCounselorById = async (
  counselorId: string
): Promise<Counselor | null> => {
  try {
    const ref = doc(db, 'counselors', counselorId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() as Omit<Counselor, 'id'>),
    };
  } catch (e) {
    console.error('Error fetching counselor:', e);
    return null;
  }
};

/* =======================
   Appointments
======================= */

export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<string | null> => {
  try {
    const ref = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (e) {
    console.error('Error creating appointment:', e);
    return null;
  }
};

export const fetchUserAppointments = async (
  userId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Appointment, 'id'>),
    }));

    // Sort on client side instead of server side
    return appointments.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (e) {
    console.error('Error fetching user appointments:', e);
    return [];
  }
};

export const fetchCounselorAppointments = async (
  counselorId: string,
  date: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('counselorId', '==', counselorId),
      where('date', '==', date),
      where('status', '==', 'scheduled')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Appointment, 'id'>),
    }));
  } catch (e) {
    console.error('Error fetching counselor appointments:', e);
    return [];
  }
};

export const cancelAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'cancelled',
    });
    return true;
  } catch (e) {
    console.error('Error cancelling appointment:', e);
    return false;
  }
};
