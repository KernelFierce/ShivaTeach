'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { useUser } from '@/firebase/provider';
import type { UserProfile } from '@/types/user-profile';

// --- Context Shape ---

interface UserProfileState {
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: Error | null;
}

const UserProfileContext = createContext<UserProfileState | undefined>(undefined);

// --- Provider Component ---

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = getFirestore();

  const [profileState, setProfileState] = useState<UserProfileState>({
    userProfile: null,
    isProfileLoading: true, // Initially loading
    profileError: null,
  });

  useEffect(() => {
    // If the authentication state is still loading, we wait.
    if (isAuthLoading) {
      setProfileState({ userProfile: null, isProfileLoading: true, profileError: null });
      return;
    }

    // If there is no authenticated user, there's no profile to fetch.
    if (!user) {
      setProfileState({ userProfile: null, isProfileLoading: false, profileError: null });
      return;
    }

    // Subscribe to the user's profile document in Firestore.
    const profileRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          // Combine the auth user data with the Firestore profile data.
          const profileData = {
              uid: user.uid,
              ...user,
              ...docSnap.data(),
          } as UserProfile;
          setProfileState({ userProfile: profileData, isProfileLoading: false, profileError: null });
        } else {
          // This case might happen if the Firestore doc isn't created yet.
          setProfileState({ userProfile: null, isProfileLoading: false, profileError: new Error('User profile document not found.') });
        }
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setProfileState({ userProfile: null, isProfileLoading: false, profileError: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, isAuthLoading, firestore]);

  return (
    <UserProfileContext.Provider value={profileState}>
      {children}
    </UserProfileContext.Provider>
  );
};

// --- Hook ---

/**
 * Provides the complete user profile from Firestore, including custom fields
 * like roles and preferredTimezone.
 * This is the primary hook to be used in the application for user data.
 */
export const useUserProfile = (): UserProfileState => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
