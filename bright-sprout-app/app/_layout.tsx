import { SidebarProvider, useSidebar } from './SidebarContext';
import { useEffect, useState, ReactNode } from 'react'
import { app, auth, db } from '../firebaseConfig';
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import {  ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, useSegments, useRouter } from 'expo-router'
import { Provider } from 'components/Provider'
import { ChildProvider } from './ChildContext'
import { useTheme, YStack } from 'tamagui'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore';
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

function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null); // Use 'any' for now, define UserProfile in useAuth.ts
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserProfile({ uid: currentUser.uid, email: currentUser.email, ...userDocSnap.data() });
        } else {
          // If user document doesn't exist, create a basic profile
          setUserProfile({ uid: currentUser.uid, email: currentUser.email, role: 'Parent' }); // Default to Parent
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (user && inAuthGroup) {
        // User is logged in and in auth group, redirect to home
        router.replace('/Home');
      } else if (!user && !inAuthGroup) {
        // User is not logged in and not in auth group, redirect to login
        router.replace('/(auth)/Login');
      }
    }
  }, [user, isLoading, segments]);

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

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
        {children}
      </ChildProvider>
    </Provider>
  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const hideHeader = segments[0] === '(auth)';
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { userProfile, isLoading } = useAuth();
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }}>
        {!hideHeader && <CustomHeader onMenuPress={handleMenuPress} />}
        <Stack>
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
            name="(tabs)"
          />

          <Stack.Screen
            name="modal"
          />
        </Stack>

        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          userProfile={userProfile}
          handleLogout={handleLogout}
        />
      </SafeAreaView>
    </ThemeProvider>
  );
}