import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Get Firebase config from environment variables
const getFirebaseConfig = () => {
  // Try different ways to access environment variables for web compatibility
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
                 Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY ||
                 Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY;

  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
                    Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
                    Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
                   Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
                   Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
                           Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
                           Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;

  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
                Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID ||
                Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID;

  const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
                       Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
                       Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

  return {
    apiKey,
    authDomain,
    projectId,
    messagingSenderId,
    appId,
    ...(measurementId && { measurementId })
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase (with error handling)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // If app already exists, use the existing one
  if (error.code === 'app/duplicate-app') {
    app = initializeApp(firebaseConfig, 'secondary');
  } else {
    throw error;
  }
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGithub = () => signInWithPopup(auth, githubProvider);
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

export default app;
