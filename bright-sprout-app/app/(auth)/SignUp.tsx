import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, ScrollView, styled } from 'tamagui'; // Keep ScrollView for the inner one
import {
  PrimaryButton,
  GhostButton,
  StyledButton,
} from '../../components/Button';
import { StyledInput } from '../../components/Input';
import { Title, Subtitle, BodyText } from '../../components/Typography';
import { StyledCheckbox } from '../../components/Checkbox';
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
    <YStack flex={1} >
      <Title mb="$2">BrightSprout</Title>
      <Subtitle mb="$2">Choose Your Role</Subtitle>
      <BodyText mb="$6">How will you be using the app?</BodyText>
      
      <PrimaryButton mb="$4" onPress={() => handleRoleSelect('Parent')}>
        I am a Parent
      </PrimaryButton>
      <StyledButton mb="$4" onPress={() => handleRoleSelect('Learner')} disabled>
        I am a Learner
      </StyledButton>
      <StyledButton mb="$4" onPress={() => handleRoleSelect('Teacher')} disabled>
        I am a Teacher
      </StyledButton>

      <GhostButton mt="$4" onPress={() => router.push('/(auth)/Login')}>
          <Text>Back to Login</Text>
      </GhostButton>
    </YStack>
  );

  const renderParentFormContent = () => ( // Renamed and now returns YStack
    <YStack flex={1}  >
        <Subtitle  >Parent Sign Up</Subtitle>
        <BodyText  >Create your account to get started.</BodyText>

        <StyledInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <StyledInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <StyledInput placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <StyledInput placeholder="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <StyledInput placeholder="Address" value={address} onChangeText={setAddress} />
        <StyledInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <StyledInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <XStack width="100%" >
            <StyledCheckbox checked={termsAccepted} onCheckedChange={() => setTermsAccepted(!termsAccepted)}>
                <StyledCheckbox.Indicator />
            </StyledCheckbox>
            <BodyText >I agree to the Terms and Conditions</BodyText>
        </XStack>

        {error ? <BodyText color="$red10" >{error}</BodyText> : null}

        <PrimaryButton onPress={handleSignUp}>
          Create Account
        </PrimaryButton>

        <GhostButton  onPress={() => setStep('roleSelection')}>
          <Text>Back to Role Selection</Text>
        </GhostButton>
    </YStack>
  );

  return (
    <SignUpContainer> {/* No contentContainerStyle here, as it's a YStack */}
      <StatusBar barStyle="dark-content" />
      <DecorativeCircle width={200} height={200} />
      <DecorativeCircle width={150} height={150} opacity={0.15}  />
      <DecorativeCircle width={80} height={80} opacity={0.08}   />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* The ScrollView is now inside KeyboardAvoidingView */}
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          {step === 'roleSelection' ? renderRoleSelectionContent() : renderParentFormContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SignUpContainer>
  );
}
