import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, ScrollView, H1, H3, Paragraph, Checkbox, styled } from 'tamagui'; // Re-added styled
import { PrimaryButton, GhostButton } from '../../components/StyledButton';
import { StyledInput } from '../../components/StyledInput';
// Removed import { StyledForm } from '../../components/StyledForm';
import { DecorativeCircle } from 'components/DecorativeCircle';


const SignUpContainer = styled(YStack, { // Re-added SignUpContainer
  name: 'SignUpContainer',
  flex: 1,
  overflow: 'hidden',
});

type Role = 'Parent' | 'Learner' | 'Teacher';
export default function SignUpScreen() {
  const [step, setStep] = useState('roleSelection');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false); // New state

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

    setLoading(true); // Set loading to true

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
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  const renderRoleSelectionContent = () => ( // Renamed for clarity
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
      <H1 color="$green10" fontFamily="$heading" marginBottom="$2">BrightSprout</H1>
      <H3 color="$color" fontFamily="$heading" marginBottom="$1">Choose Your Role</H3>
      <Paragraph color="$color" fontFamily="$body" marginBottom="$4">How will you be using the app?</Paragraph>
      
      <PrimaryButton onPress={() => handleRoleSelect('Parent')} disabled={loading}>
        I am a Parent
      </PrimaryButton>
      <PrimaryButton onPress={() => handleRoleSelect('Learner')} disabled={loading}>
        I am a Learner
      </PrimaryButton>
      <PrimaryButton onPress={() => handleRoleSelect('Teacher')} disabled={loading}>
        I am a Teacher
      </PrimaryButton>

      <GhostButton onPress={() => router.push('/(auth)/Login')}>
          Back to Login
      </GhostButton>
    </YStack>
  );

  const renderParentFormContent = () => ( // Renamed and now returns YStack
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
        <H3 color="$color" fontFamily="$heading" marginBottom="$1">Parent Sign Up</H3>
        <Paragraph color="$color" fontFamily="$body" marginBottom="$4">Create your account to get started.</Paragraph>

        <StyledInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <StyledInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <StyledInput placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <StyledInput placeholder="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <StyledInput placeholder="Address" value={address} onChangeText={setAddress} />
        <StyledInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <StyledInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <XStack width="100%" marginVertical="$2" alignItems="center">
            <Checkbox checked={termsAccepted} onCheckedChange={() => setTermsAccepted(!termsAccepted)} size="$4">
                <Checkbox.Indicator />
            </Checkbox>
            <Paragraph color="$color" fontFamily="$body" marginLeft="$2">I agree to the Terms and Conditions</Paragraph>
        </XStack>

        {error ? <Paragraph color="$red10" marginVertical="$2">{error}</Paragraph> : null}

        <PrimaryButton onPress={handleSignUp} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </PrimaryButton>

        <GhostButton onPress={() => setStep('roleSelection')}>
          Back to Role Selection
        </GhostButton>
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

        <YStack overflow="hidden" width="100%" maxWidth={400} space="$4"> {/* Reverted from StyledForm */}
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            {step === 'roleSelection' ? renderRoleSelectionContent() : renderParentFormContent()}
          </ScrollView>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}