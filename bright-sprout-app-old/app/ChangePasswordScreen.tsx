import React, { useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { YStack, Input, Button, ScrollView, Text } from 'tamagui';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    const user = auth.currentUser;
    if (user && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password updated successfully!');
        router.back();
      } catch (error: any) {
        console.error("Error changing password:", error);
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert("Error", "User not authenticated or email not available.");
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <YStack space="$4">
          <YStack>
            <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">Current Password</Text>
            <Input
              size="$4"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              secureTextEntry
            />
          </YStack>
          <YStack>
            <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">New Password</Text>
            <Input
              size="$4"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              secureTextEntry
            />
          </YStack>
          <YStack>
            <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$2">Confirm New Password</Text>
            <Input
              size="$4"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirm your new password"
              secureTextEntry
            />
          </YStack>
          <Button size="$4" backgroundColor="$green9" color="$color" fontWeight="bold" onPress={handleChangePassword}>
            Save Changes
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}