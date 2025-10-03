import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const MAX_FREE_USES = 5;

export default function DashboardScreen() {
  const [user, setUser] = useState(null);
  const [uses, setUses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadUserData();
      }
    });

    return unsubscribe;
  }, []);

  const loadUserData = async () => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUses(data.uses || 0);
      } else {
        // Create new user document
        await setDoc(userDocRef, {
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          uses: 0,
          createdAt: new Date(),
          githubConnected: false, // This will be updated when GitHub is connected
        });
        setUses(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = async () => {
    if (uses >= MAX_FREE_USES) {
      Alert.alert(
        'Premium Required',
        'You\'ve reached your free limit of 5 code reviews. Upgrade to premium for unlimited access!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => Alert.alert('Coming Soon', 'Premium features will be available soon!') }
        ]
      );
      return;
    }

    // Increment usage count
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        uses: increment(1)
      });
      setUses(prev => prev + 1);
      router.push('/code-review');
    } catch (error) {
      Alert.alert('Error', 'Failed to start review');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getRemainingUses = () => MAX_FREE_USES - uses;
  const isPremiumUser = uses >= MAX_FREE_USES;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.displayName || user?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Usage Status Card */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.usageHeader}>
              <MaterialIcons name="analytics" size={24} color="#2563eb" />
              <Text style={styles.usageTitle}>Usage Status</Text>
            </View>

            <View style={styles.usageInfo}>
              <Text style={styles.usageCount}>
                {uses} / {MAX_FREE_USES} Reviews Used
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(uses / MAX_FREE_USES) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.remainingUses}>
                {getRemainingUses()} reviews remaining
              </Text>
            </View>

            {isPremiumUser && (
              <View style={styles.premiumBanner}>
                <MaterialIcons name="star" size={20} color="#f59e0b" />
                <Text style={styles.premiumText}>Premium Required</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Main Action Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.actionHeader}>
              <MaterialIcons name="code" size={32} color="#2563eb" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Code Vibe Check</Text>
                <Text style={styles.actionSubtitle}>
                  Get AI-powered insights on your code quality and maintainability
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleStartReview}
              style={styles.startButton}
              disabled={isPremiumUser}
            >
              {isPremiumUser ? 'Upgrade to Continue' : 'Start Code Review'}
            </Button>
          </Card.Content>
        </Card>

        {/* Features Card */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Text style={styles.featuresTitle}>What you get:</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>AI-powered code analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Vibe score and suggestions</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>GitHub integration</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>Detailed recommendations</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Reviews Placeholder */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Text style={styles.recentTitle}>Recent Reviews</Text>
            <Text style={styles.recentPlaceholder}>
              Your code review history will appear here
            </Text>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusCard: {
    marginBottom: 20,
    elevation: 2,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1e293b',
  },
  usageInfo: {
    alignItems: 'center',
  },
  usageCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  remainingUses: {
    fontSize: 14,
    color: '#64748b',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 6,
  },
  actionCard: {
    marginBottom: 20,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#2563eb',
  },
  featuresCard: {
    marginBottom: 20,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  recentCard: {
    marginBottom: 20,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  recentPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});
