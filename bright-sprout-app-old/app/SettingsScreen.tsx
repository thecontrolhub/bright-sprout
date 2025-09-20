import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { YStack, XStack, Text, Switch, Button, ScrollView } from 'tamagui';
import { useChild } from './ChildContext'; // Import useChild

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { activeChild } = useChild(); // Use the ChildContext

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <YStack space="$4">
          <Button
            onPress={() => router.push('/ChangePasswordScreen')}
            icon={<Ionicons name="lock-closed-outline" size={28} color="$green9" />}
            iconAfter={<Ionicons name="chevron-forward-outline" size={24} color="$gray8" />}
            justifyContent="space-between"
            width="100%"
            size="$4"
            chromeless
          >
            Change Password
          </Button>
          <XStack justifyContent="space-between" alignItems="center" width="100%" paddingVertical="$2">
            <XStack alignItems="center" space="$3">
              <Ionicons name="notifications-outline" size={28} color="$green9" />
              <Text fontSize="$6">Notifications</Text>
            </XStack>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled}>
              <Switch.Thumb animation="bouncy" />
            </Switch>
          </XStack>
          <Button
            onPress={() => Alert.alert('Help & Support', 'This feature is not yet implemented.')}
            icon={<Ionicons name="help-circle-outline" size={28} color="$green9" />}
            iconAfter={<Ionicons name="chevron-forward-outline" size={24} color="$gray8" />}
            justifyContent="space-between"
            width="100%"
            size="$4"
            chromeless
          >
            Help & Support
          </Button>
          {!activeChild && ( // Only show Banking Details if no active child is selected
            <Button
              onPress={() => router.push('/BankingDetailsScreen')}
              icon={<Ionicons name="card-outline" size={28} color="$green9" />}
              iconAfter={<Ionicons name="chevron-forward-outline" size={24} color="$gray8" />}
              justifyContent="space-between"
              width="100%"
              size="$4"
              chromeless
            >
              Banking Details
            </Button>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}