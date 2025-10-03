# OpenDevTriage

## Overview
OpenDevTriage is a React Native application built with Expo SDK 54. The app supports iOS, Android, and Web platforms using Metro bundler.

## Project Architecture

### Technology Stack
- **Framework**: Expo SDK 54
- **React**: 19.1.0
- **React Native**: 0.81.4
- **Bundler**: Metro (for all platforms)
- **Web Support**: react-dom and react-native-web

### Project Structure
```
/
├── assets/          # App assets (icons, splash screens)
├── App.js          # Main app component
├── index.js        # Entry point
├── app.json        # Expo configuration
├── metro.config.js # Metro bundler configuration
└── package.json    # Dependencies
```

## Development Setup

### Running the App

**Web (Development)**
The app runs on port 5000 using Metro bundler. The workflow is configured to:
- Start Expo web server on port 5000
- Bind to 0.0.0.0 for Replit compatibility
- Use Metro bundler for web (configured in app.json)

**iOS/Android**
Use Expo Go app to scan the QR code displayed in the console, or use the native build commands.

### Configuration Notes

1. **Metro Configuration** (`metro.config.js`):
   - Port set to 5000 for Replit compatibility
   - Uses default Expo Metro config

2. **Expo Configuration** (`app.json`):
   - Web bundler set to "metro" (Expo SDK 54+ default)
   - New architecture enabled
   - Supports iOS tablets and Android edge-to-edge

3. **Environment Variables**:
   - `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0` for Replit proxy compatibility

## Dependencies

### Core Dependencies
- expo: ~54.0.12
- react: 19.1.0
- react-native: 0.81.4
- react-dom: 19.1.0 (for web support)
- react-native-web: ^0.21.0 (for web support)
- expo-status-bar: ~3.0.8

### Node Version Note
Some packages require Node >= 20.19.4. The current environment uses Node 20.19.3, which may show warnings but the app still functions properly.

## Recent Changes
- **October 3, 2025**: Initial Replit setup
  - Configured Metro bundler for Expo SDK 54
  - Added web dependencies (react-dom, react-native-web)
  - Set up workflow to run on port 5000
  - Configured for Replit's proxy environment
