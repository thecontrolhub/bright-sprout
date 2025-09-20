import React, { useEffect } from 'react';
import { FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChild } from './ChildContext';
import { db } from '../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { YStack, XStack, Text, Button, Paragraph, H4 } from 'tamagui';

export default function ManageChildrenScreen() {
  const router = useRouter();
  const { children, setActiveChild, activeChild } = useChild(); // Get activeChild

  

  const handleDeleteChild = async (childId: string) => {
    Alert.alert(
      "Delete Child",
      "Are you sure you want to delete this child profile? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "children", childId));
              Alert.alert("Success", "Child profile deleted successfully.");
              // Optionally, if the deleted child was the active child, clear it
              setActiveChild(null);
            } catch (error) {
              console.error("Error deleting child:", error);
              Alert.alert("Error", "Could not delete child profile.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderChildItem = ({ item }: { item: ChildProfile }) => (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderRadius="$4"
      padding="$3"
      marginBottom="$3"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.1}
      shadowRadius={2}
      elevation={3}
    >
      <Ionicons name="person-circle-outline" size={60} color="$green9" />
      <YStack flex={1} marginLeft="$3">
        <H4 color="$color">{item.name}</H4>
        <Paragraph color="$color.secondary">Username: {item.username}</Paragraph>
        <Paragraph color="$color.secondary">Age: {item.age}</Paragraph>
      </YStack>
      <XStack>
        <Button chromeless icon={<Ionicons name="pencil-outline" size={24} color="$blue9" />} onPress={() => router.push({ pathname: '/EditChildScreen', params: { childId: item.id } })} />
        <Button chromeless icon={<Ionicons name="trash-outline" size={24} color="$red9" />} onPress={() => handleDeleteChild(item.id)} />
      </XStack>
    </XStack>
  );

  return (
    <YStack flex={1} backgroundColor="$backgroundFocus">
      <YStack flex={1} padding={20}>
        <Button
          icon={<Ionicons name="add-circle-outline" size={24} color="$color" />}
          backgroundColor="$green9"
          color="$color"
          fontWeight="bold"
          marginBottom="$4"
          onPress={() => router.push('/AddChildScreen')}
        >
          Add New Child
        </Button>

        {children.length > 0 ? (
          <FlatList
            data={children}
            renderItem={renderChildItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background" borderRadius="$4" marginTop="$6" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.1} shadowRadius={4} elevation={5}>
            <Ionicons name="people-outline" size={80} color="$gray8" />
            <Paragraph color="$color.secondary" marginBottom="$2">No children added yet.</Paragraph>
            <Paragraph color="$color.tertiary">Tap "Add New Child" to get started.</Paragraph>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}



