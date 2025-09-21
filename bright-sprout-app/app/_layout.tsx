import { LoadingProvider, useLoading } from './LoadingContext';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { useEffect, useState, ReactNode } from 'react'
import { app, auth, db } from '../firebaseConfig';
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import {  ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, useSegments, useRouter } from 'expo-router'
import { Provider } from 'components/Provider'
import { ChildProvider, useChild } from './ChildContext' // Import useChild
import { Spinner, useTheme, YStack } from 'tamagui'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Import collection, query, where, getDocs
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import { CustomHeader } from '../components/CustomHeader';
import { Sidebar } from '../components/Sidebar';
import { useAuth, AuthContext } from '../hooks/useAuth';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(app)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

import { AuthStatusProvider } from '../providers/AuthStatusProvider';

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
    console.log("Firebase App Initialized:", app.name);
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return (
    <Providers>
      <AuthStatusProvider>
        <SidebarProvider>
          <RootLayoutNav />
        </SidebarProvider>
      </AuthStatusProvider>
    </Providers>
  )
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ChildProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </ChildProvider>
    </Provider>
  )
}

const GlobalLoading = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0, 0, 0, 0.5)"
      justifyContent="center"
      alignItems="center"
      zIndex={999}
    >
      <Spinner size="large" color="$orange10" />
    </YStack>
  );
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const hideHeader = segments[0] === '(auth)';
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { userProfile, isLoading } = useAuth();
  console.log("RootLayoutNav - userProfile before Sidebar:", userProfile);
  console.log("sidebarOpen in RootLayoutNav:", sidebarOpen);

  const handleMenuPress = () => {
    console.log("handleMenuPress called: Opening sidebar");
    setSidebarOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSidebarOpen(false);
      router.replace('/(auth)/Login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return null; // Or a loading indicator
  }

  return (
    <ThemeProvider
      value={{
        dark: colorScheme === 'dark',
        colors: {
          primary: theme.primary.get(), // Using Tamagui's primary color
          background: theme.bg.get(), // Using Tamagui's background color
          card: theme.card.get(), // Using Tamagui's card color
          text: theme.color.get(),
          border: theme.borderColor.get(),
          notification: theme.red10.get(), // Assuming red for notifications
        },
      }}
    >

      <SafeAreaView style={{ flex: 1 }}>
        {!hideHeader && <CustomHeader onMenuPress={handleMenuPress} />}<Stack>
          <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/SignUp" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/ForgotPasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="Home" options={{ headerShown: false }}/>
          <Stack.Screen name="AddChildScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ManageChildrenScreen" options={{ headerShown: false }} />
          <Stack.Screen name="EditChildScreen" options={{ headerShown: false }} />
          <Stack.Screen name="EditProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SettingsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ChangePasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="BankingDetailsScreen" options={{ headerShown: false }} />
          

          <Stack.Screen
            name="modal"
          />
        </Stack><Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          handleLogout={handleLogout}
        />
        <GlobalLoading />
      </SafeAreaView>
    </ThemeProvider>
  );
}