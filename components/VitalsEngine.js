"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";

const VitalsContext = createContext({
  vitals: { sleep: 0, distance: 0, screenTime: 0 },
  history: [],
  recommendations: [],
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => { },
  updateProfile: async () => ({ success: false }),
  setUser: () => { },
  completeRecommendation: () => { }
});

export function VitalsProvider({ children }) {
  const [vitals, setVitals] = useState({
    sleep: 7.2,
    distance: 4.8,
    screenTime: 0
  });

  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([
    { id: 1, text: "Take a 5-minute eye break", type: "screen", gap: 60, lastDone: Date.now() - 3600000 },
    { id: 2, text: "Hydrate: Drink 200ml water", type: "health", gap: 120, lastDone: Date.now() - 7200000 },
    { id: 3, text: "Stand up and stretch", type: "activity", gap: 45, lastDone: Date.now() - 1800000 }
  ]);

  const [demoMode, setDemoMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const lastActivityRef = useRef(typeof Date !== 'undefined' ? Date.now() : 0);

  const ensureFullHistory = (realData = [], isDemo = false) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    // Create a map of existing data by date
    const dataMap = {};
    realData.forEach(item => {
      dataMap[item.date] = item;
    });

    // Generate/Fill 7-day window
    const fullWeek = Array.from({ length: 7 }, (_, i) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (6 - i));
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayName = days[targetDate.getDay()];

      if (dataMap[dateStr]) {
        return { ...dataMap[dateStr], day: dayName };
      } else {
        if (isDemo) {
          return {
            day: dayName,
            date: dateStr,
            sleep: parseFloat((Math.random() * 2 + 6).toFixed(1)),
            distance: parseFloat((Math.random() * 4 + 1).toFixed(1)),
            screenTime: Math.floor(Math.random() * 200) + 60,
            isPlaceholder: true
          };
        } else {
          return {
            day: dayName,
            date: dateStr,
            sleep: 0,
            distance: 0,
            screenTime: 0,
            isPlaceholder: false
          };
        }
      }
    });

    return fullWeek;
  };

  const syncVitalsToDB = async (currentVitals, email) => {
    if (!email) return;
    try {
      await fetch("/api/vitals/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, vitals: currentVitals }),
      });
    } catch (err) {
      console.error("Failed to sync vitals to DB:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      const storedUser = localStorage.getItem("vitals_user");
      const isDemo = !storedUser;
      setDemoMode(isDemo);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        try {
          const res = await fetch(`/api/vitals/history?email=${parsedUser.email}`);
          const data = await res.json();
          if (data.success) {
            setHistory(ensureFullHistory(data.history, false));

            const todayStr = new Date().toISOString().split('T')[0];
            const latest = data.history.find(r => r.date === todayStr);
            if (latest) {
              setVitals({ sleep: latest.sleep, distance: latest.distance, screenTime: latest.screenTime });
            }
          } else {
            setHistory(ensureFullHistory([], false));
          }
        } catch (err) {
          setHistory(ensureFullHistory([], false));
        }
      } else {
        setHistory(ensureFullHistory([], true));
      }

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      setIsInitializing(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const interval = setInterval(() => {
        syncVitalsToDB(vitals, user.email);
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, vitals]);

  useEffect(() => {
    const checkRecs = setInterval(() => {
      const now = Date.now();
      recommendations.forEach(rec => {
        const minutesSince = (now - rec.lastDone) / 60000;
        if (minutesSince >= rec.gap) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Vitals Alert", { body: rec.text, icon: "/favicon.ico" });
          }
        }
      });
      setRecommendations([...recommendations]);
    }, 60000);
    return () => clearInterval(checkRecs);
  }, [recommendations]);

  const completeRecommendation = (id) => {
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, lastDone: Date.now() } : r
    ));
  };

  useEffect(() => {
    if (demoMode) {
      const generateRandomStats = () => {
        setVitals({
          sleep: parseFloat((Math.random() * (9 - 4) + 4).toFixed(1)),
          distance: parseFloat((Math.random() * (12 - 1.5) + 1.5).toFixed(1)),
          screenTime: Math.floor(Math.random() * 480)
        });
      };
      generateRandomStats();
      const interval = setInterval(generateRandomStats, 30000);
      return () => clearInterval(interval);
    }
  }, [demoMode]);

  useEffect(() => {
    if (!demoMode && isAuthenticated && user?.email) {
      let intervalId;

      const updateScreenTime = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          setVitals(v => ({ ...v, screenTime: v.screenTime + 1 }));
        }
      };

      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        intervalId = setInterval(updateScreenTime, 60000);
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          if (!intervalId) intervalId = setInterval(updateScreenTime, 60000);
        } else {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      };

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }

      return () => {
        if (intervalId) clearInterval(intervalId);
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
    }
  }, [demoMode, isAuthenticated, user]);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      setUser(data.user);
      setIsAuthenticated(true);
      setDemoMode(false);
      localStorage.setItem("vitals_user", JSON.stringify(data.user));

      // Fetch history immediately after login
      const histRes = await fetch(`/api/vitals/history?email=${data.user.email}`);
      const histData = await histRes.json();
      if (histData.success) {
        setHistory(ensureFullHistory(histData.history, false));
      } else {
        setHistory(ensureFullHistory([], false));
      }

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
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      setUser(data.user);
      setIsAuthenticated(true);
      setDemoMode(false);
      localStorage.setItem("vitals_user", JSON.stringify(data.user));
      setHistory(ensureFullHistory([], false));
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    if (user?.email) syncVitalsToDB(vitals, user.email);
    setUser(null);
    setIsAuthenticated(false);
    setDemoMode(true);
    setHistory(ensureFullHistory([], true));
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

  const getHealthAverages = () => {
    if (history.length === 0) return { sleep: 0, distance: 0, screenTime: 0 };

    // Only average actual recorded days (exclude placeholders and zeroed empty days)
    const activeDays = history.filter(h => !h.isPlaceholder && (h.sleep > 0 || h.distance > 0 || h.screenTime > 0));

    if (activeDays.length === 0) return { sleep: 0, distance: 0, screenTime: 0 };

    const count = activeDays.length;
    const sums = activeDays.reduce((acc, curr) => ({
      sleep: acc.sleep + curr.sleep,
      distance: acc.distance + curr.distance,
      screenTime: acc.screenTime + curr.screenTime
    }), { sleep: 0, distance: 0, screenTime: 0 });

    return {
      sleep: parseFloat((sums.sleep / count).toFixed(1)),
      distance: parseFloat((sums.distance / count).toFixed(1)),
      screenTime: Math.round(sums.screenTime / count)
    };
  };

  return (
    <VitalsContext.Provider value={{
      vitals,
      history,
      averages: getHealthAverages(),
      recommendations,
      completeRecommendation,
      user,
      isAuthenticated,
      isInitializing,
      demoMode,
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
