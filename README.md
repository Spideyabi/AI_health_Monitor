# Vitals AI - Digital Health & Wellbeing Dashboard

Vitals AI is a premium, automated health tracking and AI-driven diagnostic platform designed to provide users with a holistic view of their biological wellbeing. By aggregating daily biometric data and applying cognitive analysis, the system offers actionable insights for physical recovery, mental stress management, and nutritional optimization.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS for custom components)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- **Backend / Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Intelligence**: Custom Simulated AI Diagnostic Engine

## ✨ Key Features

### 1. Automated Health Dashboard
- Real-time monitoring of screen time, sleep duration, and walking distance.
- 7-day visual history tracking with dynamic animation.
- AI-driven "Direct Recommendations" that trigger based on physiological habits.

### 2. AI Health Analysis System
- Cognitive symptom analysis that correlates lifestyle (last meal, sleep quality) with clinical symptoms.
- Multi-tier diagnostics: **Home Recovery**, **Physician Consultation**, or **Emergency Hospitalization**.
- Geolocation-aware medical facility search with direct-dial and navigation support.

### 3. Comprehensive Health Overview
- 7-day biological averaging to detect long-term wellness trends.
- AI Mental Stress assessment (identifying "Digital Fatigue" or "Biological Strain").
- Personalized Metabolic Diet strategies and Vitamin/Supplement planning.

### 4. Interactive Experience
- Premium glass-morphism UI with fluid motion transitions.
- Intelligent Feedback system with auto-minimize functionality to reduce interface clutter.

## 🛠️ Implementation Details

### Biometric Intelligence
The `VitalsEngine.js` serves as the central reactive hub, calculating rolling 7-day averages for all tracked metrics to provide a stable baseline for AI diagnostics.

### AI Diagnostic Logic
The `aiHealthService.js` processes complex input arrays (Vitals + Symptoms + Timeline) against a clinical benchmark map to determine severity and likely underlying causes (e.g., Viral Infection vs. Digital Eye Strain).

### Component Architecture
The app follows a modular design pattern with high-reusability components:
- `HealthCheck.js`: Multi-step form for symptom assessment.
- `HealthOverview.js`: Advanced data visualization for long-term health trends.
- `VitalsProvider`: Global data sync and real-time vital simulation.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file with your MongoDB connection string.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---
*Disclaimer: Vitals AI is an intelligence-driven guidance tool. Always consult with a certified medical professional for official clinical diagnosis and treatment.*
