import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, functions, db } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { YStack, H4, Input, Button, ScrollView, Text, Select, Adapt, Sheet } from 'tamagui';
import { useChild } from './ChildContext'; // Import useChild
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useLoading } from './LoadingContext';

export default function AddChildScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [gradesList, setGradesList] = useState<string[]>([]);
  const { activeChild } = useChild(); // Use the ChildContext
  const { setIsLoading } = useLoading();

  useEffect(() => {
    if (activeChild) {
      // If a child is active, redirect to home screen
      Alert.alert("Access Denied", "Children do not have access to add new children.");
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
            if (data.grades.length > 0) {
              setGrade(data.grades[0]); // Set initial grade to the first in the list
            }
          }
        } else {
          
        }
      } catch (error) {
        Alert.alert('Error', 'Could not fetch grades.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const handleAddChild = async () => {
    if (!name || !age || !username || !password || !grade) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      const ageNumber = parseInt(age, 10);
      if (isNaN(ageNumber)) {
        Alert.alert('Error', 'Please enter a valid age.');
        return;
      }

      

      setIsLoading(true);
      try {
        await currentUser.getIdToken(true);
        const addChild = httpsCallable(functions, 'addChildWithUsername');

        const result = await addChild({
          username,
          password,
          name,
          age: ageNumber,
          parentId: currentUser.uid,
          grade,
        });

        if (result.data && (result.data as any).success) {
          Alert.alert('Success', 'Child added successfully!');
          router.back();
        } else {
          Alert.alert('Error', (result.data as any)?.message || 'Failed to add child.');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Error", "No user is logged in. Please log in as a parent.");
      router.push('/(auth)/Login');
    }
  };
  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <YStack space="$4">
          <YStack>
            <H4 color="$color">Child's Name</H4>
            <Input size="$4" placeholder="Enter your child's name" value={name} onChangeText={setName} />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Age</H4>
            <Input size="$4" placeholder="Enter your child's age" value={age} onChangeText={setAge} keyboardType="numeric" />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Username</H4>
            <Input size="$4" placeholder="Enter child's username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          </YStack>
          <YStack>
            <H4 color="$color">Child's Password</H4>
            <Input size="$4" placeholder="Enter child's password" value={password} onChangeText={setPassword} secureTextEntry />
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
          <Button size="$4" backgroundColor="$green9" color="$color" fontWeight="bold" onPress={handleAddChild}>
            Add Child
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}