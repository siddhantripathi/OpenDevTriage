import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

// Debug Firebase config
console.log('Firebase config loaded:', {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '***' : 'missing',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: 'Sign In',
            headerShown: !user
          }}
        />
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'OpenDev Triage',
            headerShown: !!user
          }}
        />
        <Stack.Screen
          name="code-review"
          options={{
            title: 'Code Review',
            headerShown: !!user
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: !!user
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
