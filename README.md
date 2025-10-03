# OpenDev Triage - The Vibe Code Cleanup App

A multi-platform mobile and web application for code review and quality analysis using AI-powered insights.

## Features

- 🔐 **Multi-provider Authentication**: Google, Email/Password, and GitHub authentication
- 📱 **Cross-platform**: iOS, Android, and Web support
- 🤖 **AI-powered Code Analysis**: Get vibe scores and detailed feedback on your code
- 📊 **Usage Tracking**: Free tier with 5 uses, premium upgrade prompts
- 🔥 **Firebase Integration**: Real-time data sync and user management
- 🎨 **Modern UI**: Clean, responsive design with Material Design principles
- 🔄 **n8n Workflow Integration**: Extensible code analysis workflows

## Project Structure

```
OpenDevTriage/
├── app/                    # Expo Router app directory
│   ├── _layout.js         # Main app layout and navigation
│   ├── index.js           # Entry point with auth routing
│   ├── auth.js            # Authentication screen
│   ├── dashboard.js       # Main dashboard with usage tracking
│   ├── code-review.js     # Code analysis interface
│   └── settings.js        # User settings and preferences
├── firebase.js            # Firebase configuration and utilities
├── App.js                 # Expo Router entry point
└── package.json           # Project dependencies
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI**: `npm install -g @expo/cli`
3. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
4. **n8n Instance**: Set up n8n for code analysis workflows

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd OpenDevTriage
npm install
```

### 2. Firebase Configuration

1. Go to your Firebase project settings
2. Enable Authentication providers:
   - Email/Password
   - Google Sign-in
   - GitHub Sign-in
3. Enable Firestore Database
4. Update `.env` file with your Firebase config:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# n8n Configuration
EXPO_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

### 3. n8n Workflow Setup

1. Create an n8n workflow for code analysis
2. Set up a webhook trigger node
3. Add your code analysis logic (AI integration, linting, etc.)
4. The n8n webhook URL is now configured via environment variables in `.env` file.

The workflow should accept:
```json
{
  "code": "string",
  "language": "string",
  "timestamp": "ISO string"
}
```

And return:
```json
{
  "vibeScore": number,
  "issues": [
    {
      "title": "string",
      "description": "string",
      "severity": "high|medium|low",
      "line": number
    }
  ],
  "suggestions": ["string"],
  "summary": "string"
}
```

### 4. Build and Run

#### Web (Development)
```bash
npm run web
```

#### Mobile (Development)
```bash
# iOS
npm run ios

# Android
npm run android
```

#### Production Build
```bash
# Web
npm run build

# Mobile (requires EAS CLI)
npx eas build --platform all
```

## Authentication Flow

1. **User Registration/Login**: Support for email/password, Google, and GitHub
2. **GitHub Connection**: Required for all users to enable code repository access
3. **Usage Tracking**: Each code review increments usage counter (max 5 for free tier)
4. **Premium Prompt**: Shows upgrade message after 5 uses

## Free Tier Limitations

- **5 Code Reviews**: Users get 5 free code analyses
- **Premium Required**: After 5 uses, users must upgrade for unlimited access
- **Feature Limitation**: Premium features (detailed reports, advanced analytics) are locked

## User Profile Structure

Each user profile in Firestore contains:
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "uses": 0, // Current number of code reviews used (0-5)
  "createdAt": "timestamp",
  "githubConnected": false,
  "notificationsEnabled": true,
  "analyticsEnabled": true
}
```

## Technical Stack

- **Frontend**: React Native with Expo
- **Routing**: Expo Router
- **UI Components**: React Native Paper
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Backend Integration**: n8n workflows
- **HTTP Client**: Axios
- **Icons**: Material Icons (Expo Vector Icons)

## Development Notes

- The app uses Expo Router for file-based routing
- Firebase configuration needs to be updated with real credentials
- n8n webhook URL needs to be configured for code analysis
- GitHub authentication requires proper OAuth setup in Firebase
- Usage tracking is implemented with Firestore counters

## Deployment

### Web
- Deploy to Vercel, Netlify, or Firebase Hosting
- Update Firebase config for production

### Mobile
- Use EAS Build for production builds
- Configure app store listings
- Set up push notifications (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

Built with ❤️ for developers who care about code quality and vibes! 🚀
