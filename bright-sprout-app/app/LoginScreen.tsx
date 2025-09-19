import React, { useState } from 'react';
import { View, Alert, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Import db
import { getDocs, collection, query, where } from 'firebase/firestore'; // Import firestore functions
import { useNavigation } from 'expo-router'; // Use useNavigation from expo-router
import { StackNavigationProp } from '@react-navigation/stack'; // Use StackNavigationProp
import { YStack, H1, H3, Paragraph, Input, Button, XStack, Text } from 'tamagui';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (identifier === '' || password === '') {
      Alert.alert('Missing Information', 'Please enter both email/username and password.');
      return;
    }

    try {
      // Check if the identifier is a username (does not contain @)
      if (!identifier.includes('@')) {
        // Firebase Functions are not directly available in the client-side SDK without a backend setup.
        // For now, we'll assume email login. If username login is required, a Firebase Function would be needed.
        Alert.alert('Login Failed', 'Username login is not yet implemented. Please use email.');
        return;
      } else {
        // Assume it's an email for parent login
        await signInWithEmailAndPassword(auth, identifier, password);
        navigation.navigate('Home');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="$backgroundFocus" overflow="hidden" alignItems="center" justifyContent="center" paddingHorizontal="$4">
        <StatusBar barStyle="dark-content" />
        {/* Background circles - kept as Views for now */}
        <View style={{ position: 'absolute', width: 200, height: 200, top: -50, left: -80, opacity: 0.1, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 150, height: 150, bottom: -60, right: -70, opacity: 0.15, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 80, height: 80, top: '30%', right: -30, opacity: 0.08, backgroundColor: '$green8', borderRadius: 1000 }} />

        <H1 color="$green10" marginBottom="$4" fontFamily="$heading">BrightSprout</H1>
        <H3 color="$color" marginBottom="$2" fontFamily="$heading">Welcome Back</H3>
        <Paragraph color="$color" marginBottom="$6" textAlign="center" fontFamily="$body">Sign in to continue your learning journey.</Paragraph>

        <Input
          placeholder="Email or Username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          size="$4"
          width="100%"
          marginBottom="$3"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$4"
          width="100%"
          marginBottom="$3"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />

        <Button
          onPress={() => navigation.navigate('ForgotPassword' as any)}
          chromeless
          alignSelf="flex-end"
          marginBottom="$3"
        >
          <Text color="$accent" fontFamily="$body">Forgot Password?</Text>
        </Button>

        <Button size="$4" width="100%" backgroundColor="$primary" color="$color" fontWeight="bold" onPress={handleLogin} fontFamily="$body">
          Login
        </Button>

        <XStack marginTop="$6">
          <Paragraph color="$color" fontFamily="$body">Don't have an account? </Paragraph>
          <Button onPress={() => navigation.navigate('SignUp')} chromeless padding="$0">
            <Text color="$accent" fontWeight="bold" fontFamily="$body">Sign Up</Text>
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
