import React from 'react';
import { YStack, H1, Paragraph } from 'tamagui';
import { Button } from 'tamagui';
import { useNavigation } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';

export default function HomeScreen() {
  const navigation = useNavigation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally, show an alert to the user
    }
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
      <H1 color="$green10" marginBottom="$2">Welcome Home!</H1>
      <Paragraph color="$color" marginBottom="$4">You are successfully logged in.</Paragraph>
      <Button onPress={handleLogout} size="$4" backgroundColor="$red10" color="$color" fontWeight="bold">
        Logout
      </Button>
    </YStack>
  );
}
