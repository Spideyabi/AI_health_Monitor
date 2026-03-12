# Vitals: AI-Powered Health Wellbeing App

A premium, cross-platform (PWA) application designed to monitor digital and physical health metrics automatically, providing deep insights into mental stress and physical activity.

## User Review Required

> [!IMPORTANT]
> Since this is a web-based application, system-level screen time monitoring (outside the app itself) is restricted by browser security policies. To provide a comprehensive experience, I will:
> 1. Use **Active Session Tracking** for the application itself.
> 2. Implement a **Usage Simulator** that models realistic system-wide trends for demonstration.
> 3. Use the **Geolocation API** for distance tracking (requires user permission).
> 4. Use **Device Motion/Inactivity** for automated sleep detection.

## Proposed Changes

### Project Setup
- [NEW] Initialize Next.js project with Tailwind CSS and Framer Motion.
- [NEW] Configure `next-pwa` for mobile/tablet installation.

### Core Architecture
- [NEW] `VitalsEngine`: A central hook/service that aggregates data from Geolocation, Device Motion, and session duration.
- [NEW] `StressAnalyzer`: Heuristic-based engine that correlates usage intensity, time of day, and physical activity to score mental stress.

### Components
- `Dashboard`: Glassmorphic overview with animated charts.
- `HealthMonitor`: Real-time display of sensors (Steps, Stress, Sleep).
- `Insights`: AI-driven recommendations based on captured data.

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build`.
- Verify PWA manifest and service worker registration.

### Manual Verification
- Test responsive layout on Desktop, Tablet (simulated), and Mobile viewports.
- Verify Geolocation tracking start/stop.
- Observe "Stress Gauge" updates based on interaction frequency.
