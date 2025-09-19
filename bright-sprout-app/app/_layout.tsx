import '../tamagui-web.css'

import { useEffect, useState } from 'react'
import { app, auth } from '../firebaseConfig';
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, useSegments, useRouter } from 'expo-router'
import { Provider } from 'components/Provider'
import { ChildProvider } from './ChildContext'
import { useTheme, YStack } from 'tamagui'
import { onAuthStateChanged, User } from 'firebase/auth'
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import { CustomHeader } from '../components/CustomHeader';

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
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      } else if (user && !inAuthGroup) {
        // User is logged in, redirect to home if not already there
        router.replace('/Home');
      } else if (!user && !inAuthGroup) {
        // User is not logged in and not in auth group, redirect to login
        router.replace('/(auth)/Login');
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
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
        <RootLayoutNav />
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
  const colorScheme = useColorScheme()
  const theme = useTheme()
  const segments = useSegments();
  const hideHeader = segments[0] === '(auth)';

  const handleMenuPress = () => {
    console.log("Menu icon pressed!");
    // Here you would typically open a sidebar or navigation drawer
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }}>
        {!hideHeader && <CustomHeader onMenuPress={handleMenuPress} />}
        <Stack>
          <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/SignUp" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/ForgotPasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="Home" options={{ headerShown: false }}/>
          <Stack.Screen
            name="(tabs)"
          />

          <Stack.Screen
            name="modal"
            options={{
              title: 'Tamagui + Expo',
              presentation: 'modal',
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              contentStyle: {
                backgroundColor: theme.background.val,
              },
            }}
          />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  )
}