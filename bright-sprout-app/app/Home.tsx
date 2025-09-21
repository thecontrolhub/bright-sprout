import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useChild } from './ChildContext';
import { YStack, H2, H4, Paragraph, XStack, ScrollView, Text } from 'tamagui';

import { Leaf, Circle, GitFork, User, Footprints, Map, Lightbulb, UserCircle, CheckCircle, AlertCircle } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { DestructiveButton } from '../components/Button';
import { PrimaryButton } from '../components/StyledButton';
import { CustomProgressBar } from '../components/CustomProgressBar';
import { useLoading } from './LoadingContext';

const { width } = Dimensions.get('window');

interface UserProfile {
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  email?: string;
  contactNumber?: string;
  address?: string;
}

interface Lesson {
  title: string;
  icon: React.ElementType; // Change to React.ElementType
  progress: number;
  color: string;
}

const lessons: Lesson[] = [
  { title: 'Introduction to Photosynthesis', icon: Leaf, progress: 1, color: '#58CC02' },
  { title: 'The Cell Structure', icon: Circle, progress: 0.6, color: '#FFC107' },
  { title: 'Genetics and Heredity', icon: GitFork, progress: 0.2, color: '#F44336' },
  { title: 'The Human Body', icon: User, progress: 0, color: '#9C27B0' },
];

const badges = [
  { name: 'First Steps', icon: Footprints, color: '#58CC02' },
  { name: 'Explorer', icon: Map, color: '#FFC107' },
  { name: 'Mastermind', icon: Lightbulb, color: '#F44336' },
];

export default function HomeScreen() {
  const router = useRouter();
  const firebaseAuth = getAuth();
  const { activeChild, children, setActiveChild } = useChild();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const currentUser = auth.currentUser;
     

        if (currentUser) {
          const childDocRef = doc(db, 'children', currentUser.uid);
          const childDocSnap = await getDoc(childDocRef);

          if (childDocSnap.exists()) {
            const childData = childDocSnap.data();
            setUserProfile({
              name: childData.name,
              role: "Child",
            });
          } else {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as UserProfile;
              setUserProfile(userData);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Removed useFocusEffect for assessment check as per instructions.
  // If this functionality is still needed, it should be re-evaluated in the context of expo-router.


  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {activeChild ? (
          <YStack space="$4">
            <H2 color="$color" textAlign="center" fontFamily="$heading">Your Learning Path for {activeChild.name}</H2>

            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H4 color="$gray7" fontFamily="$heading">Overall Progress</H4>
              <YStack backgroundColor="$green2" borderRadius="$2" padding="$3" alignItems="center">
                <Paragraph color="$green10" fontFamily="$body">You've completed 3 out of 10 lessons!</Paragraph>
                <CustomProgressBar progress={0.3} color={"$primary"} unfilledColor={"$green4"} height={18} borderRadius={9} />
              </YStack>
            </YStack>

            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H4 color="$gray7" fontFamily="$heading">Current Lessons</H4>
              {lessons.map((lesson, index) => (
                <XStack key={index} alignItems="center" backgroundColor="$gray1" borderRadius="$3" padding="$3" space="$3" shadow="$sm" borderWidth="$0.5" borderColor="$gray3">
                  <YStack padding="$2" borderRadius="$2" backgroundColor={lesson.color}>
                    <lesson.icon size={32} color="#fff" />
                  </YStack>
                  <YStack flex={1}>
                    <Paragraph color="$color" fontWeight="bold" fontFamily="$body">{lesson.title}</Paragraph>
                    <CustomProgressBar progress={lesson.progress} color={lesson.color} unfilledColor={"$gray6"} />
                  </YStack>
                  {lesson.progress === 1 && <CheckCircle size={32} color={"$green9"} />}
                </XStack>
              ))}
            </YStack>

            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H4 color="$gray7" fontFamily="$heading">Earned Badges</H4>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                {badges.map((badge, index) => (
                  <YStack key={index} backgroundColor="$gray1" borderRadius="$3" padding="$3" marginRight="$3" alignItems="center" width={130} shadow="$sm" borderWidth="$0.5" borderColor="$gray3">
                    <badge.icon size={50} color={badge.color} />
                    <Paragraph color="$color" fontWeight="bold" textAlign="center" marginTop="$2" fontFamily="$body">{badge.name}</Paragraph>
                  </YStack>
                ))}
              </ScrollView>
            </YStack>
          </YStack>
        ) : children.length > 0 ? (
          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
            <H4 color="$gray7" fontFamily="$heading">Select a Child</H4>
            {children.map((child, index) => (
              <XStack key={index} alignItems="center" backgroundColor="$gray1" borderRadius="$3" padding="$3" space="$3" shadow="$sm" borderWidth="$0.5" borderColor="$gray3" onPress={() => setActiveChild(child)}>
                <UserCircle size={50} color={"$primary"} />
                <YStack flex={1}>
                  <Paragraph color="$gray7" fontWeight="bold" fontFamily="$body">{child.name}</Paragraph>
                  <Paragraph color="$gray7" fontWeight="bold" fontFamily="$body">Age: {child.age}</Paragraph>
                </YStack>
                {activeChild?.id === child.id && (
                  <CheckCircle size={30} color={"$primary"} />
                )}
              </XStack>
            ))}
          </YStack>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$gray1" borderRadius="$4" marginTop="$6" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
            <AlertCircle size={80} color="$gray7" />
            <Paragraph color="$gray7" marginBottom="$3" fontFamily="$body">No children added yet.</Paragraph>
            <PrimaryButton onPress={() => router.navigate('/AddChildScreen')}>Add Child</PrimaryButton>
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}