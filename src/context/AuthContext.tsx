import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerDetails: (phone: string, address?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'david35e@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const isDefaultAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userRole: 'customer' | 'admin' = isDefaultAdmin ? 'admin' : 'customer';

          // Check if admin doc exists
          const adminDocRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminDocRef);
          if (adminSnap.exists() || isDefaultAdmin) {
            userRole = 'admin';
            setIsAdmin(true);

            // Ensure admin record exists in /admins collection
            if (!adminSnap.exists()) {
              await setDoc(adminDocRef, {
                id: currentUser.uid,
                email: currentUser.email || '',
                role: 'admin',
                grantedAt: new Date().toISOString(),
              }).catch(() => {
                // If rule denies or background, fallback gracefully
              });
            }
          } else {
            setIsAdmin(false);
          }

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);
            if (data.role === 'admin' || isDefaultAdmin) {
              setIsAdmin(true);
            }
          } else {
            // Create user profile
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'לקוח יקר',
              role: userRole,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Auth state profile fetch warning:', err);
          // Set fallback profile from auth object
          setProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'לקוח',
            role: isDefaultAdmin ? 'admin' : 'customer',
            createdAt: new Date().toISOString(),
          });
          setIsAdmin(isDefaultAdmin);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCustomerDetails = async (phone: string, address?: string) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = {
        ...profile,
        phone,
        ...(address ? { address } : {}),
      };
      await setDoc(userRef, updated, { merge: true });
      setProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        loginWithGoogle,
        logout,
        updateCustomerDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
