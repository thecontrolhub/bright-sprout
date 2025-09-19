import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, ScrollView, H1, H3, Paragraph, Button, Input, Checkbox, styled } from 'tamagui'; // Keep ScrollView for the inner one
import { DecorativeCircle } from 'components/DecorativeCircle';


const SignUpContainer = styled(YStack, { // Changed to YStack
  name: 'SignUpContainer',
  flex: 1,
  overflow: 'hidden',
});

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

  const router = useRouter();

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
      router.replace('/Home');
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

  const renderRoleSelectionContent = () => ( // Renamed for clarity
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
      <H1 color="$green10" fontFamily="$heading" marginBottom="$2">BrightSprout</H1>
      <H3 color="$color" fontFamily="$heading" marginBottom="$1">Choose Your Role</H3>
      <Paragraph color="$color" fontFamily="$body" marginBottom="$4">How will you be using the app?</Paragraph>
      
      <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={() => handleRoleSelect('Parent')}>
        I am a Parent
      </Button>
      <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={() => handleRoleSelect('Learner')} disabled>
        I am a Learner
      </Button>
      <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={() => handleRoleSelect('Teacher')} disabled>
        I am a Teacher
      </Button>

      <Button chromeless onPress={() => router.push('/(auth)/Login')}>
          <Text fontFamily="$body">Back to Login</Text>
      </Button>
    </YStack>
  );

  const renderParentFormContent = () => ( // Renamed and now returns YStack
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
        <H3 color="$color" fontFamily="$heading" marginBottom="$1">Parent Sign Up</H3>
        <Paragraph color="$color" fontFamily="$body" marginBottom="$4">Create your account to get started.</Paragraph>

        <Input
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          size="$4"
          width="100%"
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />
        <Input
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          size="$4"
          width="100%"
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          size="$4"
          width="100%"
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />
        <Input
          placeholder="Contact Number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
          size="$4"
          width="100%"
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />
        <Input
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
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
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          size="$4"
          width="100%"
          marginVertical="$2"
          borderWidth={1}
          borderColor="$borderColor"
          fontFamily="$body"
        />

        <XStack width="100%" marginVertical="$2" alignItems="center">
            <Checkbox checked={termsAccepted} onCheckedChange={() => setTermsAccepted(!termsAccepted)} size="$4">
                <Checkbox.Indicator />
            </Checkbox>
            <Paragraph color="$color" fontFamily="$body" marginLeft="$2">I agree to the Terms and Conditions</Paragraph>
        </XStack>

        {error ? <Paragraph color="$red10" marginVertical="$2">{error}</Paragraph> : null}

        <Button size="$4" width="100%" color="$color" fontWeight="bold" onPress={handleSignUp} marginVertical="$2">
          Create Account
        </Button>

        <Button chromeless onPress={() => setStep('roleSelection')} marginVertical="$2">
          <Text fontFamily="$body">Back to Role Selection</Text>
        </Button>
    </YStack>
  );

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
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            {step === 'roleSelection' ? renderRoleSelectionContent() : renderParentFormContent()}
          </ScrollView>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}

