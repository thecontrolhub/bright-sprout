import React, { useState } from 'react';
import { View, Alert, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../firebaseConfig';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { YStack, H1, H3, Paragraph, Input, Button, XStack, Text, ScrollView, Checkbox } from 'tamagui';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

type Role = 'Parent' | 'Learner' | 'Teacher';

export default function SignUpScreen() {
  const [step, setStep] = useState('roleSelection');
  const [role, setRole] = useState<Role | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSignUp = async () => {
    setError(''); // Clear previous errors
    // Basic validation
    if (!email || !password || !firstName || !lastName || !contactNumber || !address) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions to continue.');
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        role: role,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        contactNumber: contactNumber,
        address: address,
        createdAt: new Date(),
      });

      Alert.alert('Account Created', 'Your account has been created successfully.');
      // Call the Cloud Function to send a welcome email
      // This part is commented out as Firebase Functions need to be deployed separately.
      // const functions = getFunctions();
      // const sendWelcomeEmail = httpsCallable(functions, 'sendWelcomeEmail');
      // try {
      //   await sendWelcomeEmail({ email: user.email, firstName: firstName });
      //   console.log('Welcome email function called successfully.');
      // } catch (emailError: any) {
      //   console.error('Error calling welcome email function:', emailError);
      // }
      navigation.navigate('Home');
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            setError('This email address is already in use.');
        } else if (error.code === 'auth/weak-password') {
            setError('The password is too weak. Please use at least 6 characters.');
        } else {
            setError(error.message);
        }
    }
  };

  const renderRoleSelection = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$4">
      <H1 color="$green10" marginBottom="$2" fontFamily="$heading">BrightSprout</H1>
      <H3 color="$color" marginBottom="$2" fontFamily="$heading">Choose Your Role</H3>
      <Paragraph color="$color" marginBottom="$6" textAlign="center" fontFamily="$body">How will you be using the app?</Paragraph>
      
      <Button size="$4" width="100%" marginBottom="$4" onPress={() => handleRoleSelect('Parent')} backgroundColor="$primary" color="$color" fontWeight="bold" fontFamily="$body">
        I am a Parent
      </Button>
      <Button size="$4" width="100%" marginBottom="$4" onPress={() => handleRoleSelect('Learner')} disabled fontFamily="$body">
        I am a Learner
      </Button>
      <Button size="$4" width="100%" marginBottom="$4" onPress={() => handleRoleSelect('Teacher')} disabled fontFamily="$body">
        I am a Teacher
      </Button>

      <Button onPress={() => navigation.navigate('Login')} chromeless marginTop="$4">
          <Text color="$accent" fontWeight="bold" fontFamily="$body">Back to Login</Text>
      </Button>
    </YStack>
  );

  const renderParentForm = () => (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <H3 color="$color" marginBottom="$2" textAlign="center" fontFamily="$heading">Parent Sign Up</H3>
        <Paragraph color="$color" marginBottom="$6" textAlign="center" fontFamily="$body">Create your account to get started.</Paragraph>

        <Input size="$4" width="100%" marginBottom="$3" placeholder="First Name" value={firstName} onChangeText={setFirstName} fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Last Name" value={lastName} onChangeText={setLastName} fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Address" value={address} onChangeText={setAddress} fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry fontFamily="$body" />
        <Input size="$4" width="100%" marginBottom="$3" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry fontFamily="$body" />

        <XStack alignItems="center" width="100%" marginTop="$2" marginBottom="$4">
            <Checkbox checked={termsAccepted} onCheckedChange={() => setTermsAccepted(!termsAccepted)} size="$4">
                <Checkbox.Indicator />
            </Checkbox>
            <Paragraph marginLeft="$2" fontFamily="$body">I agree to the Terms and Conditions</Paragraph>
        </XStack>

        {error ? <Paragraph color="$red10" textAlign="center" marginBottom="$2" fontFamily="$body">{error}</Paragraph> : null}

        <Button size="$4" width="100%" backgroundColor="$primary" color="$color" fontWeight="bold" onPress={handleSignUp} fontFamily="$body">
          Create Account
        </Button>

        <Button onPress={() => setStep('roleSelection')} chromeless marginTop="$4">
          <Text color="$accent" fontWeight="bold" fontFamily="$body">Back to Role Selection</Text>
        </Button>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="$backgroundFocus" overflow="hidden">
        <StatusBar barStyle="dark-content" />
        <View style={{ position: 'absolute', width: 200, height: 200, top: -50, left: -80, opacity: 0.1, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 150, height: 150, bottom: -60, right: -70, opacity: 0.15, backgroundColor: '$green8', borderRadius: 1000 }} />
        <View style={{ position: 'absolute', width: 80, height: 80, top: '30%', right: -30, opacity: 0.08, backgroundColor: '$green8', borderRadius: 1000 }} />
        {step === 'roleSelection' ? renderRoleSelection() : renderParentForm()}
      </YStack>
    </KeyboardAvoidingView>
  );
}
