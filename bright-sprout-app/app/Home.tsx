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
import { useLoading } from '../providers/LoadingContext';

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

// New interfaces for Learning Course
interface LearningCourseModule {
  title: string;
  description: string;
  activities: string[];
  resources: string[];
}

interface LearningCourse {
  courseTitle: string;
  courseDescription: string;
  modules: LearningCourseModule[];
}

interface LearningPathData {
  learningCourse: LearningCourse;
  // Add other properties of AdaptiveAssessmentResponse if needed for display
}

const badges = [
  { name: 'First Steps', icon: Footprints, color: '#58CC02' },
  { name: 'Explorer', icon: Map, color: '#FFC107' },
  { name: 'Mastermind', icon: Lightbulb, color: '#F44336' },
];

// Skeleton component for Home screen
const HomeSkeleton = () => (
  <YStack space="$4" padding="$4">
    <YStack height={30} width="70%" backgroundColor="$gray3" borderRadius="$2" alignSelf="center" />

    <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
      <YStack height={20} width="50%" backgroundColor="$gray3" borderRadius="$2" />
      <YStack height={60} backgroundColor="$gray3" borderRadius="$2" />
    </YStack>

    <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
      <YStack height={20} width="40%" backgroundColor="$gray3" borderRadius="$2" />
      {[1, 2, 3].map((i) => (
        <XStack key={i} alignItems="center" backgroundColor="$gray3" borderRadius="$3" padding="$3" space="$3" height={60} />
      ))}
    </YStack>

    <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
      <YStack height={20} width="45%" backgroundColor="$gray3" borderRadius="$2" />
      <XStack space="$3">
        {[1, 2, 3].map((i) => (
          <YStack key={i} backgroundColor="$gray3" borderRadius="$3" padding="$3" width={130} height={100} />
        ))}
      </XStack>
    </YStack>
  </YStack>
);

export default function HomeScreen() {
  const router = useRouter();
  const firebaseAuth = getAuth();
  const { activeChild, children, setActiveChild } = useChild();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { setIsLoading: setGlobalIsLoading } = useLoading(); // Rename to avoid conflict
  const [isHomeLoading, setIsHomeLoading] = useState(true); // Local loading state
  const [childLearningPath, setChildLearningPath] = useState<LearningPathData | null>(null);

  useEffect(() => {
    const fetchUserProfileAndLearningPath = async () => {
      setIsHomeLoading(true); // Start local loading
      setGlobalIsLoading(true); // Start global loading
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
            // Fetch learning path if available
            if (childData.learningPath) {
              setChildLearningPath(childData.learningPath as LearningPathData);
            }
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
        setIsHomeLoading(false); // End local loading
        setGlobalIsLoading(false); // End global loading
      }
    };
    fetchUserProfileAndLearningPath();
  }, [activeChild]); // Depend on activeChild to refetch when it changes

  useEffect(() => {
    if (activeChild && !activeChild.baselineAssessmentCompleted) {
      router.replace('/VisualAssessmentScreen');
    }
  }, [activeChild, router]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {isHomeLoading ? (
          <HomeSkeleton />
        ) : activeChild ? (
          <YStack space="$4">
            <>
              <H2 color="$color" textAlign="center" fontFamily="$heading">Your Learning Path for {activeChild.name}</H2>

              {activeChild.baselineAssessmentCompleted && activeChild.baselineResults && activeChild.baselineAssessment ? (
                <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
                  <H4 color="$gray7" fontFamily="$heading">Baseline Assessment Results</H4>
                  <Paragraph color="$color" fontFamily="$body">
                    Score: {activeChild.baselineResults.score} / {activeChild.baselineResults.totalQuestions}
                  </Paragraph>
                  <Paragraph color="$color" fontFamily="$body">
                    Completed On: {new Date(activeChild.baselineResults.timestamp).toLocaleDateString()}
                  </Paragraph>
                  {/* Optionally, add a button to view detailed results or retake */}
                </YStack>
              ) : (
                <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
                  <H4 color="$gray7" fontFamily="$heading">Baseline Assessment</H4>
                  <Paragraph color="$color" fontFamily="$body">
                    Baseline assessment not yet completed. Please complete it to unlock your personalized learning path.
                  </Paragraph>
                  <PrimaryButton onPress={() => router.replace('/VisualAssessmentScreen')}>Start Baseline Assessment</PrimaryButton>
                </YStack>
              )}
            </>

            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H4 color="$gray7" fontFamily="$heading">Overall Progress</H4>
              {childLearningPath && childLearningPath.learningCourse ? (
                <YStack backgroundColor="$green2" borderRadius="$2" padding="$3" alignItems="center">
                  <Paragraph color="$green10" fontFamily="$body">
                    You've completed 0 out of {childLearningPath.learningCourse.modules.length} modules!
                  </Paragraph>
                  <CustomProgressBar progress={0} color={"$primary"} unfilledColor={"$green4"} height={18} borderRadius={9} />
                </YStack>
              ) : (
                <Paragraph color="$color" fontFamily="$body">No learning course available yet.</Paragraph>
              )}
            </YStack>
            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H4 color="$gray7" fontFamily="$heading">Current Lessons</H4>
              {childLearningPath && childLearningPath.learningCourse && childLearningPath.learningCourse.modules.length > 0 ? (
                childLearningPath.learningCourse.modules.map((module, index) => (
                  <XStack key={index} alignItems="center" backgroundColor="$gray1" borderRadius="$3" padding="$3" space="$3" shadow="$sm" borderWidth="$0.5" borderColor="$gray3">
                    {/* Placeholder for module icon, can be added later */}
                    <YStack padding="$2" borderRadius="$2" backgroundColor="$blue5">
                      <Leaf size={32} color="#fff" />
                    </YStack>
                    <YStack flex={1}>
                      <Paragraph color="$color" fontWeight="bold" fontFamily="$body">{module.title}</Paragraph>
                      <Paragraph color="$color" fontFamily="$body" fontSize="$2">{module.description}</Paragraph>
                      {/* Placeholder for module progress, can be added later */}
                      <CustomProgressBar progress={0} color={"$primary"} unfilledColor={"$gray6"} />
                    </YStack>
                    {/* Placeholder for completion checkmark */}
                  </XStack>
                ))
              ) : (
                <Paragraph color="$color" fontFamily="$body">No current lessons available.</Paragraph>
              )}
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