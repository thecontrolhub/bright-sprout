import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  parentId: string;
  username: string;
  grade: string;
  baselineAssessmentCompleted?: boolean;
}

interface ChildContextType {
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
  children: ChildProfile[];
  setChildren: (children: ChildProfile[]) => void;
  updateBaselineAssessmentStatus: (childId: string, status: boolean, score: any) => Promise<void>;
  childLoading: boolean; // New state for loading status
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [childLoading, setChildLoading] = useState(true); // Initialize to true

  const updateBaselineAssessmentStatus = async (childId: string, status: boolean) => {
    try {
      const childRef = doc(db, 'children', childId);
      await updateDoc(childRef, {
        baselineAssessmentCompleted: status,
      });
      // Update the local state as well
      setChildrenList(prevChildren =>
        prevChildren.map(child =>
          child.id === childId ? { ...child, baselineAssessmentCompleted: status } : child
        )
      );
      if (activeChild && activeChild.id === childId) {
        setActiveChild(prevActiveChild => ({ ...prevActiveChild!, baselineAssessmentCompleted: status }));
      }
      console.log(`Baseline assessment status for child ${childId} updated to ${status}`);
    } catch (error) {
      console.error("Error updating baseline assessment status:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      setChildLoading(true); // Start loading
      if (user) {
        // First, check if the logged-in user is a child
        const childDocRef = doc(db, 'children', user.uid);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          // The logged-in user is a child
          const childData = { id: childDocSnap.id, ...childDocSnap.data() } as ChildProfile;
          setActiveChild(childData);
          setChildrenList([]); // A child user doesn't manage other children
          setChildLoading(false); // Done loading for child user
        } else {
          // The logged-in user is likely a parent, fetch their children
          setActiveChild(null); // Ensure activeChild is null for parents initially
          const q = query(collection(db, 'children'), where('parentId', '==', user.uid));
          const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const childrenData: ChildProfile[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as ChildProfile[];
            console.log("Fetched children for user", user.uid, ":", childrenData);
            setChildrenList(childrenData);
            setChildLoading(false); // Done loading for parent user
          });
          return () => unsubscribeSnapshot();
        }
      } else {
        setChildrenList([]);
        setActiveChild(null);
        setChildLoading(false); // Done loading if no user
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ChildContext.Provider value={{ activeChild, setActiveChild, children: childrenList, setChildren: setChildrenList, updateBaselineAssessmentStatus, childLoading }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
};