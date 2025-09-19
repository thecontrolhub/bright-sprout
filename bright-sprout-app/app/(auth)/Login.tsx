import React, { useState } from 'react';
import { View, Alert, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; // Import db
import { getDocs, collection, query, where } from 'firebase/firestore'; // Import firestore functions
import { useNavigation } from 'expo-router'; // Use useNavigation from expo-router
import { StackNavigationProp } from '@react-navigation/stack'; // Use StackNavigationProp
import { YStack, H1, H3, Paragraph, Input, Button, XStack, Text } from 'tamagui';

type RootStackParamList = {
  '(auth)/Login': undefined;
  '(auth)/SignUp': undefined;
  '(auth)/ForgotPasswordScreen': undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, '(auth)/Login'>;

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
      <YStack flex={1} overflow="hidden" justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background">
        <StatusBar barStyle="dark-content" />
        {/* Background circles */}
        <YStack position="absolute" width={200} height={200} top={-50} left={-80} opacity={0.1} backgroundColor="$green8" borderRadius={1000} />
        <YStack position="absolute" width={150} height={150} bottom={-60} right={-70} opacity={0.15} backgroundColor="$green8" borderRadius={1000} />
        <YStack position="absolute" width={80} height={80} top="30%" right={-30} opacity={0.08} backgroundColor="$green8" borderRadius={1000} />

        <H1 color="$green10" fontFamily="$heading" marginBottom="$2">BrightSprout</H1>
        <H3 color="$color" fontFamily="$heading" marginBottom="$1">Welcome Back</H3>
        <Paragraph color="$color" fontFamily="$body" marginBottom="$4">Sign in to continue your learning journey.</Paragraph>

        <Input
          placeholder="Email or Username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          size="$4"
          width="100%"
          marginVertical="$2"
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
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />

        <Button
          onPress={() => navigation.navigate('(auth)/ForgotPasswordScreen')}
          chromeless
          marginVertical="$2"
        >
          <Text fontFamily="$body">Forgot Password?</Text>
        </Button>

        <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={handleLogin} fontFamily="$body" marginVertical="$2">
          Login
        </Button>

        <XStack marginVertical="$2">
          <Paragraph color="$color" fontFamily="$body">Don't have an account? </Paragraph>
          <Button onPress={() => navigation.navigate('(auth)/SignUp')} chromeless>
            <Text fontWeight="bold" fontFamily="$body">Sign Up</Text>
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
