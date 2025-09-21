import React from 'react';
import { Platform, Dimensions, StyleSheet } from 'react-native';
import { YStack, H4, Paragraph, Button, XStack, useTheme, ScrollView } from 'tamagui';
import { Home, User, Settings, Users, Book, LogOut, UserCircle, CheckCircle } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useChild } from '../app/ChildContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange, handleLogout }) => {
  const router = useRouter();
  const theme = useTheme();
  const { userProfile } = useAuth();
  const { activeChild, children, setActiveChild } = useChild();

  console.log('Sidebar userProfile:', userProfile);

  const navigateAndClose = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  const handleSelectChild = (child: any) => {
    setActiveChild(child);
    onOpenChange(false);
  };

  const SidebarContent = () => (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      <YStack alignItems="center" paddingVertical="$6" borderBottomWidth={1} borderBottomColor="$borderColor">
        {userProfile ? (
          <YStack alignItems="center">
            <UserCircle size={80} color="$success" />
            <H4 color="$color" marginTop="$2" fontFamily="$heading">
              {userProfile.name}
            </H4>
            <Paragraph color="$color.secondary" fontFamily="$body">{userProfile.role}</Paragraph>
          </YStack>
        ) : (
          <YStack alignItems="center">
            <UserCircle size={80} color="$success" />
            <H4 color="$color" marginTop="$2" fontFamily="$heading">Guest</H4>
            <Paragraph color="$color.secondary" fontFamily="$body">Please log in</Paragraph>
          </YStack>
        )}
      </YStack>
      <YStack space="$2" marginTop="$4">
        <Button chromeless icon={<Home size={24} color="$success" />} onPress={() => navigateAndClose('/Home')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Home
        </Button>
        <Button chromeless icon={<User size={24} color="$success" />} onPress={() => navigateAndClose('/ProfileScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Profile
        </Button>
        <Button chromeless icon={<Settings size={24} color="$success" />} onPress={() => navigateAndClose('/SettingsScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Settings
        </Button>
        {userProfile?.role !== "child" && (
          <Button chromeless icon={<Users size={24} color="$success" />} onPress={() => navigateAndClose('/ManageChildrenScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
            Children
          </Button>
        )}
        {userProfile?.role === "child" && (
          <Button chromeless icon={<Book size={24} color="$success" />} onPress={() => navigateAndClose('/VisualAssessmentScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
            My Learning
          </Button>
        )}
      </YStack>
      {userProfile?.role === 'Parent' && children.length > 0 && (
        <YStack space="$2" marginTop="$4">
          <H4 color="$color.secondary" fontFamily="$heading">Switch Child</H4>
          <ScrollView>
            {children.map((child) => (
              <Button
                key={child.id}
                chromeless
                icon={activeChild?.id === child.id ? <CheckCircle size={24} color="$success" /> : <UserCircle size={24} color="$success" />}
                onPress={() => handleSelectChild(child)}
                justifyContent="flex-start"
                paddingLeft="$2"
                fontFamily="$body"
              >
                {child.name}
              </Button>
            ))}
          </ScrollView>
        </YStack>
      )}
      <YStack flex={1} justifyContent="flex-end" paddingBottom="$4">
        <Button chromeless icon={<LogOut size={24} color="$success" />} onPress={handleLogout} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Logout
        </Button>
      </YStack>
    </YStack>
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={theme.background.get()}
        opacity={0.6}
        zIndex={99}
        onPress={() => onOpenChange(false)}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        width={SIDEBAR_WIDTH}
        backgroundColor="$background"
        zIndex={100}
        elevation={5}
        borderRightWidth={1}
        borderRightColor="$borderColor"
      >
        <SidebarContent />
      </YStack>
    </>
  );
};