import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { User, CreditCard, Ban, GitBranch } from '@tamagui/lucide-icons';
import { YStack, XStack, Paragraph, Text } from 'tamagui';
import { PrimaryButton } from '../components/StyledButton';
import { StyledInput } from '../components/StyledInput';

export default function BankingDetailsScreen() {
  const navigation = useNavigation();
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!accountHolder || !accountNumber || !bankName || !branchCode) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const bankingDetailsRef = doc(db, 'users', currentUser.uid, 'bankingDetails', 'details');
        await setDoc(bankingDetailsRef, {
          accountHolder,
          accountNumber,
          bankName,
          branchCode,
        });
        Alert.alert('Success', 'Banking details saved successfully.');
        navigation.goBack();
      } catch (error) {
        console.error('Error saving banking details:', error);
        Alert.alert('Error', 'Could not save banking details.');
      }
    }
    setLoading(false);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack flex={1} padding="$4">
        <XStack alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" marginBottom="$4">
          <User size={24} color="$color" marginRight="$2" />
          <StyledInput
            placeholder="Account Holder Name"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </XStack>
        <XStack alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" marginBottom="$4">
          <CreditCard size={24} color="$color" marginRight="$2" />
          <StyledInput
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </XStack>
        <XStack alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" marginBottom="$4">
          <Ban size={24} color="$color" marginRight="$2" />
          <StyledInput
            placeholder="Bank Name"
            value={bankName}
            onChangeText={setBankName}
          />
        </XStack>
        <XStack alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" marginBottom="$4">
          <GitBranch size={24} color="$color" marginRight="$2" />
          <StyledInput
            placeholder="Branch Code"
            value={branchCode}
            onChangeText={setBranchCode}
            keyboardType="numeric"
          />
        </XStack>
        <PrimaryButton onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : 'Save'}
        </PrimaryButton>
      </YStack>
    </YStack>
  );
}
