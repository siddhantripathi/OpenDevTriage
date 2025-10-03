import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Card, Switch, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db, logout } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

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
        setUserData(data);
        setNotificationsEnabled(data.notificationsEnabled ?? true);
        setAnalyticsEnabled(data.analyticsEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const updateUserSettings = async (updates) => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, updates);
      setUserData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.memberSince}>
                  Member since {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Usage Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Usage Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData?.uses || 0}</Text>
                <Text style={styles.statLabel}>Reviews Used</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData?.githubConnected ? '✓' : '○'}</Text>
                <Text style={styles.statLabel}>GitHub Connected</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: (userData?.uses || 0) >= 5 ? '#f59e0b' : '#10b981' }]}>
                  {(userData?.uses || 0) >= 5 ? 'Premium' : 'Free'}
                </Text>
                <Text style={styles.statLabel}>Plan</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Preferences Card */}
        <Card style={styles.preferencesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>Push Notifications</Text>
                <Text style={styles.preferenceDescription}>
                  Receive notifications about your code reviews
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  updateUserSettings({ notificationsEnabled: value });
                }}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>Analytics</Text>
                <Text style={styles.preferenceDescription}>
                  Help improve the app by sharing usage data
                </Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={(value) => {
                  setAnalyticsEnabled(value);
                  updateUserSettings({ analyticsEnabled: value });
                }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Account Actions Card */}
        <Card style={styles.accountCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.accountAction}>
              <MaterialIcons name="edit" size={20} color="#2563eb" />
              <Text style={styles.accountActionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountAction}>
              <MaterialIcons name="security" size={20} color="#2563eb" />
              <Text style={styles.accountActionText}>Security Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountAction}>
              <MaterialIcons name="help" size={20} color="#2563eb" />
              <Text style={styles.accountActionText}>Help & Support</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Danger Zone</Text>

            <TouchableOpacity style={styles.dangerAction} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text style={styles.dangerActionText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteAccount}>
              <MaterialIcons name="delete-forever" size={20} color="#ef4444" />
              <Text style={styles.dangerActionText}>Delete Account</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.appName}>OpenDev Triage</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              The Vibe Code Cleanup App - Get AI-powered insights on your code quality and maintainability.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  userCard: {
    marginBottom: 20,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  preferencesCard: {
    marginBottom: 20,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  accountCard: {
    marginBottom: 20,
    elevation: 2,
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountActionText: {
    fontSize: 16,
    color: '#2563eb',
    marginLeft: 12,
  },
  dangerCard: {
    marginBottom: 20,
    elevation: 2,
    backgroundColor: '#fef2f2',
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  dangerActionText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
  },
  infoCard: {
    marginBottom: 20,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
});
