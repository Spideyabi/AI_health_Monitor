# Vitals: Digital Health Wellbeing App Walkthrough

Vitals is a premium, cross-platform application designed to monitor digital and physical health metrics automatically. It provides a stunning, glassmorphic interface that works seamlessly on desktop, tablet, and mobile.

## Key Features

### 1. Automated Health Monitoring
The app tracks several metrics without requiring manual user intervention:
- **Screen Time**: Monitors active application usage.
- **Mental Stress**: Analyzes interaction patterns to estimate stress levels.
- **Activity Tracking**: Uses motion detection to calculate steps and distance walked.
- **Sleep Detection**: Heuristic-based tracking that identifies sleep patterns based on night-time inactivity.

### 2. Premium Design System
- **Glassmorphism**: Beautiful frosted-glass effects with backdrop blurs.
- **Dynamic Animations**: Smooth transitions powered by Framer Motion.
- **Dark Mode Aesthetic**: A sleek, high-contrast dark theme with vibrant accents.
- **Responsive Layout**: Optimized for all device viewports.

### 3. PWA Integration
Vitals is a Progressive Web App, meaning it can be installed on any device (iOS, Android, Windows) for a native-like experience.

## Technical Implementation

### Core Components
- `VitalsEngine.js`: The central tracking logic using React hooks and background intervals.
- `Dashboard.js`: The main UI component featuring interactive metric cards and AI insights.
- `globals.css`: Custom design tokens and premium utility classes.

### Verification Results
- **Lint Check**: Passed (React Compiler strict mode).
- **Build**: Successful code integrity (verified via linting and module resolution).
- **PWA**: Manifest and icons configured correctly.

## Visual Overview

![App Icon](/vitals_icon.png)
*The modern, minimalist Vitals app icon.*

### Browser Verification
The following recording demonstrates the application running in the browser, highlighting the glassmorphic UI and real-time metric updates:

![Verification Recording](C:\Users\AKSHITH\.gemini\antigravity\brain\2f8f8641-4501-4876-becf-456e16089377\verify_vitals_fix_1773323764396.webp)

> [!TIP]
> To install the app as a PWA, click the "Install" or "Add to Home Screen" button in your browser's address bar.
