import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, useIsFocused } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { YStack, H2, H4, Paragraph, Button, ScrollView, Spinner, Image, Text, XStack } from 'tamagui';
import { useChild } from './ChildContext'; // Import useChild

interface ParentProfile {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  avatar?: string;
}

interface ChildProfileDisplay {
  name: string;
  age: number;
  grade: string;
  username: string;
  avatar?: string;
  role: string; // Add role for consistency
}

type DisplayProfile = ParentProfile | ChildProfileDisplay;

interface Achievement {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const achievements: Achievement[] = [
  { title: 'Course Starter', icon: 'rocket-outline', color: '#58CC02' },
  { title: 'Quick Learner', icon: 'flash-outline', color: '#FFC107' },
  { title: 'Master of Photosynthesis', icon: 'leaf-outline', color: '#F44336' },
];

const getInitials = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

export default function ProfileScreen() {
  const router = useRouter();
  const [displayProfile, setDisplayProfile] = useState<DisplayProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const { activeChild } = useChild(); // Use the ChildContext

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    if (activeChild) {
      // Fetch child profile
      try {
        const childDocRef = doc(db, 'children', activeChild.id);
        const childDocSnap = await getDoc(childDocRef);
        if (childDocSnap.exists()) {
          const data = childDocSnap.data();
          setDisplayProfile({
            name: data.name,
            age: data.age,
            grade: data.grade,
            username: data.username,
            avatar: data.avatar,
            role: "Child", // Explicitly set role for display
          } as ChildProfileDisplay);
        } else {
          Alert.alert("Error", "Child profile not found.");
        }
      } catch (error) {
        console.error("Error fetching child profile:", error);
        Alert.alert("Error", "Could not fetch child profile.");
      }
    } else {
      // Fetch parent profile
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setDisplayProfile(userDocSnap.data() as ParentProfile);
          } else {
            Alert.alert("Error", "User profile not found.");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          Alert.alert("Error", "Could not fetch user profile.");
        }
      }
    }
    setLoading(false);
  }, [router, activeChild]);

  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
    }
  }, [isFocused, fetchProfileData]);

  if (loading) {
    return <Spinner size="large" color="$green9" />;
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <CustomHeader title="Profile" onMenuPress={() => router.back()} iconType="back" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {displayProfile ? (
          <YStack space="$4">
            <YStack alignItems="center" space="$2">
              {displayProfile.avatar ? (
                <Image source={{ uri: displayProfile.avatar }} width={150} height={150} borderRadius={75} />
              ) : (
                <YStack width={150} height={150} borderRadius={75} backgroundColor="$green9" justifyContent="center" alignItems="center">
                  <Text fontSize={60} color="$color" fontWeight="bold">
                    {'name' in displayProfile ? getInitials(displayProfile.name) : getInitials(displayProfile.firstName + " " + displayProfile.lastName)}
                  </Text>
                </YStack>
              )}
              <H2 color="$color">
                {'name' in displayProfile ? displayProfile.name : `${displayProfile.firstName} ${displayProfile.lastName}`}
              </H2>
              <Paragraph color="$color.secondary">{displayProfile.role}</Paragraph>
              {'age' in displayProfile && <Paragraph color="$color.secondary">Age: {displayProfile.age}</Paragraph>}
              {'grade' in displayProfile && <Paragraph color="$color.secondary">Grade: {displayProfile.grade}</Paragraph>}
              {'username' in displayProfile && <Paragraph color="$color.secondary">Username: {displayProfile.username}</Paragraph>}
              <Button size="$3" theme="active" onPress={() => router.push('/EditProfileScreen')}>Edit Profile</Button>
            </YStack>
            <YStack space="$2" backgroundColor="$background" padding="$4" borderRadius="$4" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={4} elevation={5}>
              <H4 color="$color.secondary">Achievements</H4>
              <YStack space="$2">
                {achievements.map((achievement, index) => (
                  <XStack key={index} alignItems="center" backgroundColor="$background" borderRadius="$3" padding="$3" space="$3" shadowColor="#000" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} elevation={3}>
                    <Ionicons name={achievement.icon} size={40} color={achievement.color} />
                    <Paragraph color="$color" fontWeight="bold">{achievement.title}</Paragraph>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background" borderRadius="$4" marginTop="$6" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={4} elevation={5}>
            <Ionicons name="alert-circle-outline" size={80} color="$gray8" />
            <Paragraph color="$color.secondary" marginBottom="$3">No user profile found.</Paragraph>
            <Button backgroundColor="$green9" color="$color" fontWeight="bold" onPress={() => router.push('/(auth)/Login')}>
              Go to Login
            </Button>
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}