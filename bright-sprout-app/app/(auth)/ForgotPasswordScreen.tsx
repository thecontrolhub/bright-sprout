import React, { useState } from 'react';
import { View, Alert, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; 
import { useNavigation } from 'expo-router';
import { YStack, H3, Paragraph, Input, Button, Text } from 'tamagui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (email === '') {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check Your Email', 'A password reset link has been sent to your email address.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} overflow="hidden"  >
        <StatusBar barStyle="dark-content" />
        {/* Background circles - kept as Views for now */}
        <View style={{ position: 'absolute', width: 200, height: 200, top: -50, left: -80, opacity: 0.1, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 150, height: 150, bottom: -60, right: -70, opacity: 0.15, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 80, height: 80, top: '30%', right: -30, opacity: 0.08, backgroundColor: '$green8', borderRadius: 1000 }} />

        <H3 color="$color" fontFamily="$heading">Reset Password</H3>
        <Paragraph color="$color" fontFamily="$body">Enter your email to receive a reset link.</Paragraph>

        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          size="$4"
          width="100%"

          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />

        <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={handleResetPassword}  fontFamily="$body">
          Send Reset Link
        </Button>

        <Button onPress={() => navigation.goBack()} chromeless >
          <Text  fontWeight="bold" fontFamily="$body">Back to Login</Text>
        </Button>
      </YStack>
    </KeyboardAvoidingView>
  );
}
