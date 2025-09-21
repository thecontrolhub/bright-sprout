import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db, functions } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { YStack, H4, Input, Button, ScrollView, Spinner, Select, Adapt, Sheet } from 'tamagui';
import { useChild } from './ChildContext'; // Import useChild
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useLoading } from './LoadingContext';

export default function EditChildScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradesList, setGradesList] = useState<string[]>([]);
  const { setIsLoading } = useLoading();
  const { activeChild } = useChild(); // Use the ChildContext

  useEffect(() => {
    if (activeChild) {
      // If a child is active, redirect to home screen
      Alert.alert("Access Denied", "Children do not have access to edit child profiles.");
      router.replace('/Home');
    }
  }, [activeChild, router]);

  useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true);
      try {
        const gradesDocRef = doc(db, 'config', 'app');
        const gradesDocSnap = await getDoc(gradesDocRef);
        if (gradesDocSnap.exists()) {
          const data = gradesDocSnap.data();
          if (data && data.grades && Array.isArray(data.grades)) {
            setGradesList(data.grades);
          }
        } else {
          console.log("No grades configuration found!");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        Alert.alert('Error', 'Could not fetch grades.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId) return;
      setIsLoading(true);
      try {
        const childDocRef = doc(db, 'children', childId);
        const childDocSnap = await getDoc(childDocRef);

        if (childDocSnap.exists()) {
          const childData = childDocSnap.data();
          setName(childData.name);
          setAge(childData.age.toString());
          setUsername(childData.username);
          setGrade(childData.grade || (gradesList.length > 0 ? gradesList[0] : '')); // Set grade, or first available, or empty
          setEmail(`${childData.username}.child@brightsprout.com`);
        } else {
          Alert.alert('Error', 'Child not found.');
          router.back();
        }
      } catch (error) {
        console.error("Error fetching child data:", error);
        Alert.alert('Error', 'Could not fetch child data.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (gradesList.length > 0) {
      fetchChildData();
    }
  }, [childId, gradesList]);

  const handleUpdateChild = async () => {
    if (!name || !age || !username || !grade) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!childId) return;

    setIsLoading(true);
    try {
      const childDocRef = doc(db, 'children', childId);
      await updateDoc(childDocRef, {
        name,
        age: parseInt(age, 10),
        username,
        grade,
      });

      if (newPassword) {
        const updateChildPassword = httpsCallable(functions, 'updateChildPassword');
        await updateChildPassword({ childUid: childId, newPassword });
      }

      Alert.alert('Success', 'Child updated successfully!');
      router.back();
    } catch (error) {
      console.error("Error updating child:", error);
      Alert.alert('Error', 'Could not update child.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <YStack space="$4">
          <YStack>
            <H4 color="$color">Child's Name</H4>
            <Input size="$4" placeholder="Enter child's name" value={name} onChangeText={setName} />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Age</H4>
            <Input size="$4" placeholder="Enter child's age" value={age} onChangeText={setAge} keyboardType="numeric" />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Username</H4>
            <Input size="$4" placeholder="Enter child's username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Email</H4>
            <Input size="$4" value={email} editable={false} backgroundColor="$gray6" />
          </YStack>
          <YStack>
            <H4 color="$color">New Password</H4>
            <Input size="$4" placeholder="Enter new password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          </YStack>
          <YStack>
            <H4 color="$color">Confirm New Password</H4>
            <Input size="$4" placeholder="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Grade</H4>
            <Select value={grade} onValueChange={setGrade}>
              <Select.Trigger width="100%" iconAfter={ChevronDown}>
                <Select.Value placeholder="Select a grade..." />
              </Select.Trigger>
              <Adapt when="sm" platform="touch">
                <Sheet modal dismissOnSnapToBottom>
                  <Sheet.Frame>
                    <Sheet.ScrollView>
                      <Adapt.Contents />
                    </Sheet.ScrollView>
                  </Sheet.Frame>
                  <Sheet.Overlay />
                </Sheet>
              </Adapt>
              <Select.Content>
                <Select.ScrollUpButton ai="center" jc="center" pos="relative" w="100%" h="$3">
                  <YStack zi={10}>
                    <ChevronUp size={20} />
                  </YStack>
                </Select.ScrollUpButton>
                <Select.Viewport minWidth={200}>
                  <Select.Group>
                    <Select.Label>Grades</Select.Label>
                    {useMemo(
                      () =>
                        gradesList.map((item, i) => {
                          return (
                            <Select.Item index={i} key={item} value={item.toLowerCase()}>
                              <Select.ItemText>{item}</Select.ItemText>
                            </Select.Item>
                          );
                        }),
                      [gradesList]
                    )}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton ai="center" jc="center" pos="relative" w="100%" h="$3">
                  <YStack zi={10}>
                    <ChevronDown size={20} />
                  </YStack>
                </Select.ScrollDownButton>
              </Select.Content>
            </Select>
          </YStack>
          <Button size="$4" backgroundColor="$green9" color="$color" fontWeight="bold" onPress={handleUpdateChild}>
            Save Changes
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}