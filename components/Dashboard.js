"use client";

import { useVitals } from "@/components/VitalsEngine";
import { 
  Activity, 
  Clock, 
  Zap, 
  Moon, 
  MapPin, 
  ShieldCheck,
  ChevronRight,
  User,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { useState } from "react";
import HealthCheck from "./HealthCheck";
import Profile from "./Profile";

export default function Dashboard() {
  const { vitals = {}, user = null, logout = () => {} } = useVitals() || {};
  const [activeTab, setActiveTab] = useState("overview");

  const cards = [
    {
      title: "Screen Time",
      value: `${Math.floor(vitals.screenTime / 60)}h ${Math.floor(vitals.screenTime % 60)}m`,
      icon: <Clock className="text-purple-500" />,
      desc: "Usage across devices",
      color: "from-purple-500/20 to-transparent"
    },
    {
      title: "Mental Stress",
      value: `${Math.round(vitals.stressLevel)}%`,
      icon: <Zap className="text-pink-500" />,
      desc: "Calm / Balanced",
      color: "from-pink-500/20 to-transparent"
    },
    {
      title: "Rest & Sleep",
      value: `${vitals.sleepQuality}%`,
      icon: <Moon className="text-blue-500" />,
      desc: "Deep Recovery",
      color: "from-blue-500/20 to-transparent"
    },
    {
      title: "Daily Distance",
      value: `${vitals.distance.toFixed(2)} km`,
      icon: <MapPin className="text-emerald-500" />,
      desc: `${vitals.steps} steps taken`,
      color: "from-emerald-500/20 to-transparent"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <nav className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex flex-col text-center md:text-left">
          <h1 className="text-3xl font-bold gradient-text">Vitals AI</h1>
          <p className="text-muted-foreground text-sm">Your digital wellbeing, automated.</p>
        </div>

        <div className="flex items-center glass-morphism p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "overview" 
                ? "bg-purple-600 text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("health")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "health" 
                ? "bg-purple-600 text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Health Check
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "profile" 
                ? "bg-purple-600 text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            My Profile
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-xs font-semibold">{user?.name || "Guest"}</p>
            <button 
              onClick={logout}
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest font-bold"
            >
              Sign Out
            </button>
          </div>
          <button className="p-2 glass-morphism rounded-full hover:bg-white/10 transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      {activeTab === "overview" ? (
        <>
          {/* Hero Stress Monitor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-card mb-8 overflow-hidden relative"
          >
            {/* ... component content ... */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Overall Wellbeing</h2>
                <p className="text-muted-foreground mb-6">Your mental and physical metrics are currently optimal.</p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> System Secure
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-semibold">
                    AI Analysis Active
                  </span>
                </div>
              </div>
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 rounded-full border-b-4 border-purple-500 animate-spin" 
                    style={{ animationDuration: '3s' }}
                  />
                  <span className="text-3xl font-bold">{Math.round((100 - vitals.stressLevel + vitals.sleepQuality) / 2)}%</span>
                </div>
                <p className="text-center mt-2 text-xs text-muted-foreground group-hover:text-purple-400 cursor-default">Health Score</p>
              </div>
            </div>
            {/* Animated Background Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent opacity-20" />
          </motion.div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`stats-card bg-gradient-to-b ${card.color}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {card.icon}
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </div>
                <h3 className="text-muted-foreground text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-2xl font-bold mb-2">{card.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-purple-500" size={20} /> Activity Insights
              </h2>
              <div className="glass-morphism p-6 h-64 flex items-center justify-center text-muted-foreground italic relative overflow-hidden">
                <div className="text-center z-10">
                  <p>User behavior patterns detected...</p>
                  <p className="text-xs mt-2 not-italic">Syncing with system sensors for real-time accuracy.</p>
                </div>
                {/* Mock Graph Background */}
                <div className="absolute inset-0 flex items-end justify-between px-4 opacity-10">
                  {[40, 70, 45, 90, 65, 30, 85, 50, 75, 40, 60, 80, 55, 95, 45, 70, 35, 80, 60, 90, 40, 75, 50, 85].map((h, i) => (
                    <div key={i} className="w-1 bg-white" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Recommendations</h2>
              <div className="space-y-4">
                {[
                  { text: "Take a 5-minute eye break", time: "Now" },
                  { text: "Hydrate: Drink 200ml water", time: "15m ago" },
                  { text: "Stand up and stretch", time: "30m ago" }
                ].map((rec, i) => (
                  <div key={i} className="glass-morphism p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5">
                    <span className="text-sm">{rec.text}</span>
                    <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-1 rounded">{rec.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "health" ? (
        <HealthCheck />
      ) : (
        <Profile />
      )}
    </div>
  );
}
