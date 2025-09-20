import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Alert, Image } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useChild } from './ChildContext';
import { YStack, XStack, H2, Paragraph, Button, Input, Text, Spinner, ScrollView } from 'tamagui';
import ImagePickerButton from '../components/ImagePickerButton';

interface ParentProfile {
  firstName: string;
  lastName: string;
  contactNumber?: string;
  address?: string;
  avatar?: string;
}

interface ChildProfileEdit {
  name: string;
  avatar?: string;
}

const getInitials = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState(''); // For child's name
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { activeChild } = useChild();

  const fetchProfileData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (activeChild) {
        // Fetch child profile
        try {
          const childDocRef = doc(db, 'children', activeChild.id);
          const childDocSnap = await getDoc(childDocRef);
          if (childDocSnap.exists()) {
            const childData = childDocSnap.data() as ChildProfileEdit;
            setName(childData.name);
            if (childData.avatar) {
              setImage(childData.avatar);
            }
          } else {
            Alert.alert("Error", "Child profile not found.");
          }
        } catch (error) {
          console.error("Error fetching child profile:", error);
          Alert.alert("Error", "Could not fetch child profile.");
        }
      } else {
        // Fetch parent profile
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as ParentProfile;
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            if (userData.avatar) {
              setImage(userData.avatar);
            }
          } else {
            Alert.alert("Error", "User profile not found.");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          Alert.alert("Error", "Could not fetch user profile.");
        }
      }
    } else {
      router.replace('/(auth)/Login');
    }
    setLoading(false);
  }, [router, activeChild]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdateProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.replace('/(auth)/Login');
      return;
    }

    setUploading(true);
    let avatarUrl = image;
    if (image && image.startsWith('file://')) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        avatarUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        Alert.alert("Error", "Could not upload profile picture.");
        setUploading(false);
        return;
      }
    }

    try {
      if (activeChild) {
        // Update child profile
        const childDocRef = doc(db, 'children', activeChild.id);
        await updateDoc(childDocRef, {
          name,
          avatar: avatarUrl,
        });
      } else {
        // Update parent profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          avatar: avatarUrl,
        });
      }
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$green9" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <YStack alignItems="center" marginBottom="$4">
          {image ? (
            <Image source={{ uri: image }} style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 10 }} />
          ) : (
            <YStack width={150} height={150} borderRadius={75} backgroundColor="$green9" justifyContent="center" alignItems="center" marginBottom="$2">
              <Text color="$white" fontSize="$9" fontWeight="bold">
                {activeChild ? getInitials(name) : getInitials(firstName + " " + lastName)}
              </Text>
            </YStack>
          )}
          <ImagePickerButton onImagePicked={setImage} />
        </YStack>
        {activeChild ? (
          <YStack marginBottom="$4">
            <Paragraph fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">Name</Paragraph>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Enter child's name"
              backgroundColor="$gray1"
              paddingHorizontal="$3"
              paddingVertical="$3"
              borderRadius="$3"
              fontSize="$4"
              borderWidth={1}
              borderColor="$gray3"
            />
          </YStack>
        ) : (
          <>
            <YStack marginBottom="$4">
              <Paragraph fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">First Name</Paragraph>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                backgroundColor="$gray1"
                paddingHorizontal="$3"
                paddingVertical="$3"
                borderRadius="$3"
                fontSize="$4"
                borderWidth={1}
                borderColor="$gray3"
              />
            </YStack>
            <YStack marginBottom="$4">
              <Paragraph fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">Last Name</Paragraph>
              <Input
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                backgroundColor="$gray1"
                paddingHorizontal="$3"
                paddingVertical="$3"
                borderRadius="$3"
                fontSize="$4"
                borderWidth={1}
                borderColor="$gray3"
              />
            </YStack>
          </>
        )}
        <Button
          onPress={handleUpdateProfile}
          disabled={uploading}
          backgroundColor="$green9"
          paddingVertical="$4"
          borderRadius="$5"
          alignItems="center"
          marginTop="$4"
        >
          {uploading ? (
            <Spinner size="small" color="$white" />
          ) : (
            <Paragraph color="$white" fontSize="$5" fontWeight="bold">Save Changes</Paragraph>
          )}
        </Button>
      </ScrollView>
    </YStack>
  );
}