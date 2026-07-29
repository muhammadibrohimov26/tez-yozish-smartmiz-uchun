import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { OWNER_EMAIL } from '../lib/owner';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null | undefined;
  profile: UserProfile | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      if (u) {
        const snap = await getDoc(doc(db, 'typingUsers', u.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          // Always recomputed from the auth token, never trusted from the document:
          // the profile doc is client-writable, so a stored flag proves nothing.
          data.isAdmin = u.email === OWNER_EMAIL;
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      const userRef = doc(db, 'typingUsers', u.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: u.uid,
          displayName: u.displayName || 'Foydalanuvchi',
          email: u.email || '',
          photoURL: u.photoURL || '',
          createdAt: serverTimestamp(),
          averageWpm: 0,
          bestWpm: 0,
          totalTests: 0,
          totalCorrectChars: 0,
        };
        if (u.email === OWNER_EMAIL) {
           newProfile.isAdmin = true;
        }
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      } else {
        const data = snap.data() as UserProfile;
        data.isAdmin = u.email === OWNER_EMAIL;
        setProfile(data);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', err);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
