"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";

const VitalsContext = createContext({
  vitals: { screenTime: 0, stressLevel: 0, steps: 0, distance: 0, sleepQuality: 0, isTracking: false },
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  updateProfile: async () => ({ success: false }),
  setUser: () => {}
});

export function VitalsProvider({ children }) {
  const [vitals, setVitals] = useState({
    screenTime: 0, // in minutes
    stressLevel: 24, // 0-100
    steps: 0,
    distance: 0, // in km
    sleepQuality: 85, // 0-100
    isTracking: true,
  });

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const lastActivityRef = useRef(typeof Date !== 'undefined' ? Date.now() : 0);

  // Initialize Auth from Storage
  useEffect(() => {
    const storedUser = localStorage.getItem("vitals_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Handle non-JSON responses (like 500 error pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Received non-JSON response. Check if MONGODB_URI is set.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("vitals_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // Handle non-JSON responses 
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Received non-JSON response. Check if MONGODB_URI is set.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("vitals_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("vitals_user");
  };

  const updateProfile = async (profileData) => {
    if (!user?.email) return { success: false, message: "No user logged in" };
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, profileData }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("vitals_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    if (!vitals.isTracking || !isAuthenticated) return;

    // Simulate real-time screen time increase
    const interval = setInterval(() => {
      setVitals((prev) => ({
        ...prev,
        screenTime: prev.screenTime + 0.1, // Increment screen time
        // Higher activity (simulated by interaction) increases stress slightly
        stressLevel: Math.min(100, Math.max(0, prev.stressLevel + (Math.random() - 0.45) * 2))
      }));
    }, 6000); // Update every 6 seconds for simulation

    return () => clearInterval(interval);
  }, [vitals.isTracking]);

  // Activity detection for Distance/Steps
  useEffect(() => {
    if (typeof window === "undefined" || !vitals.isTracking) return;

    const handleMotion = () => {
      lastActivityRef.current = Date.now();
      // Simulate walking if motion detected (in a real app we'd use Geolocation/Sensors)
      if (Math.random() > 0.8) {
        setVitals(prev => ({
          ...prev,
          steps: prev.steps + 1,
          distance: prev.distance + 0.0008 // roughly 0.8m per step
        }));
      }
    };

    window.addEventListener("mousemove", handleMotion);
    window.addEventListener("keypress", handleMotion);

    return () => {
      window.removeEventListener("mousemove", handleMotion);
      window.removeEventListener("keypress", handleMotion);
    };
  }, [vitals.isTracking]);

  // Automated Sleep Detection (Heuristic: Long period of inactivity at night)
  useEffect(() => {
    const sleepCheck = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const idleTime = (Date.now() - lastActivityRef.current) / 1000 / 60; // in minutes

      // If idle for > 30 mins during night hours
      if (idleTime > 30 && (hours >= 22 || hours <= 6)) {
        setVitals(prev => ({ ...prev, sleepQuality: Math.min(100, prev.sleepQuality + 1) }));
      }
    }, 60000);

    return () => clearInterval(sleepCheck);
  }, []);

  return (
    <VitalsContext.Provider value={{ 
      vitals, 
      setVitals, 
      user, 
      isAuthenticated, 
      isInitializing,
      login, 
      signup, 
      logout,
      updateProfile,
      setUser
    }}>
      {children}
    </VitalsContext.Provider>
  );
}

export const useVitals = () => {
  const context = useContext(VitalsContext);
  if (!context) return {};
  return context;
};
