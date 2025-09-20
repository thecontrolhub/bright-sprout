
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomHeader from './components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { auth, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type BankingDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BankingDetails'>;

export default function BankingDetailsScreen() {
  const navigation = useNavigation<BankingDetailsScreenNavigationProp>();
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
    <View style={styles.container}>
      <CustomHeader title="Banking Details" onMenuPress={() => navigation.goBack()} iconType="back" />
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#ccc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Account Holder Name"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="card-outline" size={24} color="#ccc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="business-outline" size={24} color="#ccc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankName}
            onChangeText={setBankName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="git-branch-outline" size={24} color="#ccc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Branch Code"
            value={branchCode}
            onChangeText={setBranchCode}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#58CC02',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
