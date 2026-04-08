# EDS Health Tracker

A React Native app that integrates with Google Health Connect to track health data relevant to Ehlers-Danlos Syndrome (EDS) management.

## What it does

- Requests read access to heart rate and sleep data via Health Connect
- Displays record counts from the last 7 days
- Stub for sending data to a backend API (not yet implemented)

## Prerequisites

- Node.js 20+
- React Native CLI (`npx @react-native-community/cli`)
- Android Studio with an emulator or physical device
- Google Health Connect app installed on the device/emulator
- Health Connect requires Android 14+ (or the standalone Health Connect app on Android 9-13)

## Setup

```bash
npm install
npx react-native run-android
```

## Project structure

```
App.tsx                 # Main app component (permissions, data fetching, UI)
android/                # Android native project
  app/src/main/
    AndroidManifest.xml # Health Connect permissions and queries
```

## Current limitations

- Android only (no iOS HealthKit integration)
- Single-screen app with no navigation
- Displays record counts only, no charts or detailed values
- Backend integration is a placeholder
- No persistent storage for fetched data

## Stack

- React Native 0.81
- React 19
- react-native-health-connect
- TypeScript
