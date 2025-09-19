import React from 'react';
import { Platform, Dimensions, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { YStack, H4, Paragraph, Button, XStack, useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: any; // TODO: Define a proper type for userProfile
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange, userProfile, handleLogout }) => {
  const router = useRouter();
  const theme = useTheme(); // Add useTheme hook

  const sidebarTranslateX = Platform.OS !== 'web' ? useSharedValue(-SIDEBAR_WIDTH) : null;
  const overlayOpacity = Platform.OS !== 'web' ? useSharedValue(0) : null;

  React.useEffect(() => {
    if (Platform.OS !== 'web' && sidebarTranslateX && overlayOpacity) {
      sidebarTranslateX.value = withTiming(open ? 0 : -SIDEBAR_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(open ? 0.5 : 0, { duration: 300 });
    }
  }, [open]);

  const animatedSidebarStyle = Platform.OS !== 'web' && sidebarTranslateX ? useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarTranslateX!.value }],
    };
  }) : {};

  const animatedOverlayStyle = Platform.OS !== 'web' && overlayOpacity ? useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity!.value,
    };
  }) : {};

  const navigateAndClose = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  const SidebarContent = () => (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      <YStack alignItems="center" paddingVertical="$6" borderBottomWidth={1} borderBottomColor="$borderColor">
        {userProfile ? (
          <YStack alignItems="center">
            <Ionicons name="person-circle-outline" size={80} color={theme.color.get()} />
            <H4 color="$color" marginTop="$2" fontFamily="$heading">
              {'firstName' in userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.name}
            </H4>
            <Paragraph color="$color.secondary" fontFamily="$body">{userProfile.role}</Paragraph>
          </YStack>
        ) : (
          <YStack alignItems="center">
            <Ionicons name="person-circle-outline" size={80} color={theme.color.get()} />
            <H4 color="$color" marginTop="$2" fontFamily="$heading">Guest</H4>
            <Paragraph color="$color.secondary" fontFamily="$body">Please log in</Paragraph>
          </YStack>
        )}
      </YStack>
      <YStack space="$2" marginTop="$4">
        <Button chromeless icon={<Ionicons name="home-outline" size={24} color={theme.color.get()} />} onPress={() => navigateAndClose('/Home')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Home
        </Button>
        <Button chromeless icon={<Ionicons name="person-outline" size={24} color={theme.color.get()} />} onPress={() => navigateAndClose('/ProfileScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Profile
        </Button>
        <Button chromeless icon={<Ionicons name="settings-outline" size={24} color={theme.color.get()} />} onPress={() => navigateAndClose('/SettingsScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Settings
        </Button>
        {userProfile?.role !== "Child" && (
          <Button chromeless icon={<Ionicons name="people-outline" size={24} color={theme.color.get()} />} onPress={() => navigateAndClose('/ManageChildrenScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
            Children
          </Button>
        )}
        {userProfile?.role === "Child" && (
          <Button chromeless icon={<Ionicons name="book-outline" size={24} color={theme.color.get()} />} onPress={() => navigateAndClose('/VisualAssessmentScreen')} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
            My Learning
          </Button>
        )}
      </YStack>
      <YStack flex={1} justifyContent="flex-end" paddingBottom="$4">
        <Button chromeless icon={<Ionicons name="log-out-outline" size={24} color={theme.color.get()} />} onPress={handleLogout} justifyContent="flex-start" paddingLeft="$2" fontFamily="$body">
          Logout
        </Button>
      </YStack>
    </YStack>
  );

  return (
    <>
      {open && Platform.OS !== 'web' && (
        <Animated.View style={[{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.background.get(), opacity: 0.6, zIndex: 99 }, animatedOverlayStyle]}>
          <YStack flex={1} onPress={() => onOpenChange(false)} />
        </Animated.View>
      )}

      {open && Platform.OS === 'web' && (
         <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor={theme.background.get()} opacity={0.6} zIndex={99} onPress={() => onOpenChange(false)} />
      )}

      {Platform.OS !== 'web' ? (
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: '$background', zIndex: 100, borderRightWidth: 1, borderRightColor: '$borderColor' }, animatedSidebarStyle]}>
          <SidebarContent />
        </Animated.View>
      ) : (
        open && (
          <YStack position="absolute" top={0} left={0} bottom={0} width={SIDEBAR_WIDTH} backgroundColor="$background" zIndex={100} elevation={5}>
            <SidebarContent />
          </YStack>
        )
      )}
    </>
  );
};