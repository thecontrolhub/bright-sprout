import React from 'react';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { DestructiveButton } from '../components/Button';
import { Title, BodyText } from '../components/Typography';

export default function HomeScreen() {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/Login');
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally, show an alert to the user
    }
  };

  return (
    <YStack flex={1}  >
      <Title >Welcome Home!</Title>
      <BodyText >You are successfully logged in.</BodyText>
      <DestructiveButton onPress={handleLogout}>
        Logout
      </DestructiveButton>
    </YStack>
  );
}
