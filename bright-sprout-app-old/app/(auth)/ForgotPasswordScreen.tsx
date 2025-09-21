import React, { useState } from 'react';
import { View, Alert, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; 
import { useNavigation } from 'expo-router';
import { YStack, H3, Paragraph, Text } from 'tamagui'; // Removed Input, Button
import { PrimaryButton, GhostButton } from '../../components/StyledButton'; // New import
import { StyledInput } from '../../components/StyledInput'; // New import

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // New state
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (email === '') {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    setLoading(true); // Set loading to true
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check Your Email', 'A password reset link has been sent to your email address.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background">
        <StatusBar barStyle="dark-content" />
        {/* Background circles */}
        <YStack position="absolute" width={200} height={200} top={-50} left={-80} opacity={0.1} backgroundColor="$green8" borderRadius={1000} />
        <YStack position="absolute" width={150} height={150} bottom={-60} right={-70} opacity={0.15} backgroundColor="$green8" borderRadius={1000} />
        <YStack position="absolute" width={80} height={80} top="30%" right={-30} opacity={0.08} backgroundColor="$green8" borderRadius={1000} />

        <YStack overflow="hidden" width="100%" maxWidth={400} space="$4">
          <H3 color="$color" fontFamily="$heading" marginBottom="$1">Reset Password</H3>
          <Paragraph color="$color" fontFamily="$body" marginBottom="$4">Enter your email to receive a reset link.</Paragraph>

          <StyledInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PrimaryButton onPress={handleResetPassword} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </PrimaryButton>

          <GhostButton onPress={() => navigation.goBack()}>
            Back to Login
          </GhostButton>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}