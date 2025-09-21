
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useSegments, useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { AuthContext } from '../hooks/useAuth';
import { useChild } from '../app/ChildContext';

export function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const { activeChild } = useChild();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const childDocRef = doc(db, 'children', currentUser.uid);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          const childData = childDocSnap.data();
          const childProfile = { uid: currentUser.uid, email: currentUser.email, role: 'Child', name: childData.name || currentUser.email, ...childData };
          console.log('Setting role to Child:', childProfile);
          setUserProfile(childProfile);
        } else {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserProfile({ uid: currentUser.uid, email: currentUser.email, ...userDocSnap.data() });
          } else {
            setUserProfile({ uid: currentUser.uid, email: currentUser.email, role: 'Parent' });
          }
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (user && inAuthGroup) {
        router.replace('/Home');
      } else if (!user && !inAuthGroup) {
        router.replace('/(auth)/Login');
      }
    }
  }, [user, isLoading, segments]);

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
