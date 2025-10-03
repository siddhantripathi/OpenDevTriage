import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';
import { Card, Button, TextInput as PaperTextInput, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function CodeReviewScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [useRepoMode, setUseRepoMode] = useState(false);

  const languages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'C#', value: 'csharp' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'PHP', value: 'php' },
    { label: 'Ruby', value: 'ruby' },
  ];

  // Fetch user's repositories from GitHub
  const fetchUserRepositories = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    setLoadingRepos(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          type: 'owner',
          sort: 'updated',
          per_page: 50
        }
      });

      // Filter for public repositories only
      const publicRepos = response.data.filter(repo => !repo.private);
      setRepositories(publicRepos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      Alert.alert('Error', 'Failed to fetch repositories. Please check your GitHub connection.');
    } finally {
      setLoadingRepos(false);
    }
  };

  // Toggle between manual code input and repository selection
  const toggleMode = () => {
    setUseRepoMode(!useRepoMode);
    if (!useRepoMode) {
      fetchUserRepositories();
    }
  };

  const handleSubmitReview = async () => {
    // Validation based on mode
    if (useRepoMode) {
      if (!selectedRepo) {
        Alert.alert('Error', 'Please select a repository');
        return;
      }
    } else {
      if (!code.trim()) {
        Alert.alert('Error', 'Please enter some code to review');
        return;
      }
    }

    setLoading(true);
    try {
      const n8nWebhookUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL';

      let requestData;
      if (useRepoMode) {
        // Repository analysis mode
        const [owner, repo] = selectedRepo.split('/');
        requestData = {
          repository: repo,
          owner: owner,
          branch: 'main', // Default to main branch
          analysisType: 'full_repository',
          userId: auth.currentUser?.uid,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Single code analysis mode
        requestData = {
          code: code.trim(),
          language: selectedLanguage,
          analysisType: 'single_code',
          userId: auth.currentUser?.uid,
          timestamp: new Date().toISOString(),
        };
      }

      const response = await axios.post(n8nWebhookUrl, requestData);
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting code review:', error);
      Alert.alert(
        'Review Error',
        'Failed to analyze your code. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setResult(null);
    setCode('');
    router.back();
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card style={styles.resultCard}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <MaterialIcons name="analytics" size={24} color="#2563eb" />
            <Text style={styles.resultTitle}>Analysis Results</Text>
          </View>

          {result.vibeScore && (
            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>Vibe Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(result.vibeScore) }]}>
                  {result.vibeScore}/10
                </Text>
                <View style={[styles.scoreBar, { backgroundColor: getScoreColor(result.vibeScore, 0.2) }]}>
                  <View
                    style={[
                      styles.scoreFill,
                      {
                        width: `${(result.vibeScore / 10) * 100}%`,
                        backgroundColor: getScoreColor(result.vibeScore)
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {result.issues && result.issues.length > 0 && (
            <View style={styles.issuesSection}>
              <Text style={styles.issuesTitle}>Issues Found</Text>
              {result.issues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <MaterialIcons
                    name={getIssueIcon(issue.severity)}
                    size={20}
                    color={getIssueColor(issue.severity)}
                  />
                  <View style={styles.issueContent}>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                    {issue.line && (
                      <Text style={styles.issueLine}>Line {issue.line}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Suggestions</Text>
              {result.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}

          {result.summary && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!result ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#2563eb" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Code Review</Text>
              <TouchableOpacity onPress={toggleMode} style={styles.modeToggle}>
                <Text style={styles.modeToggleText}>
                  {useRepoMode ? 'Manual Mode' : 'Repo Mode'}
                </Text>
              </TouchableOpacity>
            </View>

            {useRepoMode ? (
              /* Repository Selection Mode */
              <Card style={styles.repoCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Select Repository</Text>
                  {loadingRepos ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={styles.loadingText}>Loading repositories...</Text>
                    </View>
                  ) : repositories.length > 0 ? (
                    <View style={styles.repoSelector}>
                      <ScrollView style={styles.repoList} showsVerticalScrollIndicator={false}>
                        {repositories.map((repo) => (
                          <TouchableOpacity
                            key={repo.id}
                            style={[
                              styles.repoItem,
                              selectedRepo === `${repo.owner.login}/${repo.name}` && styles.selectedRepoItem
                            ]}
                            onPress={() => setSelectedRepo(`${repo.owner.login}/${repo.name}`)}
                          >
                            <View style={styles.repoInfo}>
                              <Text style={styles.repoName}>{repo.name}</Text>
                              <Text style={styles.repoDescription}>
                                {repo.description || 'No description available'}
                              </Text>
                              <View style={styles.repoMeta}>
                                <Text style={styles.repoLanguage}>{repo.language}</Text>
                                <Text style={styles.repoStars}>⭐ {repo.stargazers_count}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.loadReposButton} onPress={fetchUserRepositories}>
                      <MaterialIcons name="refresh" size={20} color="#2563eb" />
                      <Text style={styles.loadReposText}>Load Repositories</Text>
                    </TouchableOpacity>
                  )}
                </Card.Content>
              </Card>
            ) : (
              /* Manual Code Input Mode */
              <>
                {/* Language Selection */}
                <Card style={styles.languageCard}>
                  <Card.Content>
                    <Text style={styles.sectionTitle}>Select Language</Text>
                    <View style={styles.languageChips}>
                      {languages.map((lang) => (
                        <Chip
                          key={lang.value}
                          selected={selectedLanguage === lang.value}
                          onPress={() => setSelectedLanguage(lang.value)}
                          style={[
                            styles.languageChip,
                            selectedLanguage === lang.value && styles.selectedChip
                          ]}
                        >
                          {lang.label}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}

            {/* Code Input - Only show in manual mode */}
            {!useRepoMode && (
              <Card style={styles.codeCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Paste Your Code</Text>
                  <PaperTextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter your code here for analysis..."
                    multiline
                    numberOfLines={12}
                    mode="outlined"
                    style={styles.codeInput}
                    textAlignVertical="top"
                  />
                  <Text style={styles.codeHint}>
                    Tip: You can paste code from GitHub, GitLab, or any code editor
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmitReview}
              loading={loading}
              disabled={loading || (!useRepoMode && !code.trim()) || (useRepoMode && !selectedRepo)}
              style={styles.submitButton}
              icon="send"
            >
              {loading
                ? 'Analyzing...'
                : useRepoMode
                  ? 'Analyze Repository'
                  : 'Analyze Code'
              }
            </Button>
          </>
        ) : (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#2563eb" />
              </TouchableOpacity>
              <Text style={styles.resultsTitle}>Review Results</Text>
              <TouchableOpacity
                onPress={() => setResult(null)}
                style={styles.newReviewButton}
              >
                <Text style={styles.newReviewText}>New Review</Text>
              </TouchableOpacity>
            </View>

            {/* Results */}
            {renderResult()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => setResult(null)}
                style={styles.secondaryButton}
              >
                Review Another Code
              </Button>
              <Button
                mode="contained"
                onPress={handleBackToDashboard}
                style={styles.primaryButton}
              >
                Back to Dashboard
              </Button>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const getScoreColor = (score, opacity = 1) => {
  if (score >= 8) return `rgba(16, 185, 129, ${opacity})`; // green
  if (score >= 6) return `rgba(245, 158, 11, ${opacity})`; // yellow
  if (score >= 4) return `rgba(239, 68, 68, ${opacity})`; // orange
  return `rgba(239, 68, 68, ${opacity})`; // red
};

const getIssueIcon = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'error';
    case 'medium':
    case 'warning':
      return 'warning';
    case 'low':
    case 'info':
      return 'info';
    default:
      return 'help';
  }
};

const getIssueColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return '#ef4444';
    case 'medium':
    case 'warning':
      return '#f59e0b';
    case 'low':
    case 'info':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

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
  modeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  newReviewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newReviewText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  languageCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  languageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    margin: 2,
  },
  selectedChip: {
    backgroundColor: '#2563eb',
  },
  codeCard: {
    marginBottom: 20,
    elevation: 2,
  },
  codeInput: {
    minHeight: 200,
    maxHeight: 400,
  },
  codeHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  repoCard: {
    marginBottom: 20,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  repoSelector: {
    maxHeight: 300,
  },
  repoList: {
    maxHeight: 250,
  },
  repoItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedRepoItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  repoInfo: {
    flex: 1,
  },
  repoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  repoDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 18,
  },
  repoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repoLanguage: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  repoStars: {
    fontSize: 12,
    color: '#64748b',
  },
  loadReposButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  loadReposText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    marginBottom: 20,
  },
  resultCard: {
    marginBottom: 20,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 6,
  },
  issuesSection: {
    marginBottom: 24,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  issueContent: {
    flex: 1,
    marginLeft: 12,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  issueLine: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
    flex: 1,
    marginLeft: 12,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
});
