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
  Bell,
  CheckCircle2,
  MessageSquare,
  Star,
  Minimize2,
  Maximize2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import HealthCheck from "./HealthCheck";
import Profile from "./Profile";
import FeedbackSurvey from "./FeedbackSurvey";
import HealthOverview from "./HealthOverview";

export default function Dashboard() {
  const { 
    vitals = {}, 
    history = [], 
    recommendations = [], 
    completeRecommendation = () => {},
    user = null, 
    logout = () => {}, 
    demoMode = false 
  } = useVitals() || {};
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFeedbackMinimized, setIsFeedbackMinimized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFeedbackMinimized(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const cards = [
    {
      title: "Screen On Time",
      value: `${Math.floor(vitals.screenTime / 60)}h ${Math.floor(vitals.screenTime % 60)}m`,
      icon: <Clock className="text-purple-500" />,
      desc: "Daily digital usage",
      color: "from-purple-500/20 to-transparent"
    },
    {
      title: "Sleep Duration",
      value: `${vitals.sleep}h`,
      icon: <Moon className="text-indigo-500" />,
      desc: "Measured rest tonight",
      color: "from-indigo-500/20 to-transparent"
    },
    {
      title: "Walked Distance",
      value: `${vitals.distance}km`,
      icon: <MapPin className="text-emerald-500" />,
      desc: "Daily active movement",
      color: "from-emerald-500/20 to-transparent"
    },
    {
      title: "Activity Points",
      value: `${Math.round(vitals.distance * 100)}`,
      icon: <Zap className="text-amber-500" />,
      desc: "Calculated effort",
      color: "from-amber-500/20 to-transparent"
    }
  ];

  const getRecStatus = (rec) => {
    const minutesSince = (Date.now() - rec.lastDone) / 60000;
    const dueIn = Math.max(0, Math.round(rec.gap - minutesSince));
    return dueIn === 0 ? "Now" : `${dueIn}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex flex-col text-center md:text-left">
          <h1 className="text-3xl font-bold gradient-text">Vitals AI</h1>
          <p className="text-muted-foreground text-sm">Your digital wellbeing, automated.</p>
        </div>

        <div className="flex items-center glass-morphism p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["overview", "insights", "health", "profile"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-purple-600 text-white shadow-lg" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tab === "overview" ? "Dashboard" : tab === "insights" ? "Health Reports" : tab.replace("-", " ")}
            </button>
          ))}
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
          <button 
            onClick={() => setShowFeedback(true)}
            className="p-2 glass-morphism rounded-full hover:bg-white/10 transition-colors text-purple-400"
            title="App Feedback"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </nav>

      {activeTab === "overview" ? (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-card mb-8 overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Automated Health Tracking</h2>
                <p className="text-muted-foreground mb-6 max-w-lg">Your vitals are monitored in real-time to provide automated recovery and wellness insights.</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck size={14} /> System Encrypted
                  </span>
                  <span className={`px-3 py-1 ${demoMode ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'} rounded-full text-xs font-semibold text-center whitespace-nowrap`}>
                    {demoMode ? "Sample Data" : "Live Stream"}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="p-6 glass-morphism rounded-2xl text-center border-emerald-500/20 border">
                  <p className="text-2xl font-bold text-emerald-400">{vitals.distance}km</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Distance Today</p>
                </div>
                <div className="p-6 glass-morphism rounded-2xl text-center border-purple-500/20 border">
                  <p className="text-2xl font-bold text-purple-400">{vitals.sleep}h</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Sleep Quality</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent opacity-20" />
          </motion.div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="text-purple-500" size={20} /> 7-Day Health Insights
                </h2>
                <div className="flex gap-4 text-[10px] uppercase font-bold text-zinc-500">
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"/> Sleep</div>
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Distance</div>
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"/> Screen</div>
                </div>
              </div>
              
              <div className="glass-morphism p-8 h-80 flex flex-col relative overflow-hidden group">
                <div className="flex-1 flex justify-between px-1 gap-1 sm:gap-4 relative z-10 min-h-[200px]">
                  {history.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col group/bar h-full">
                      <div className="flex-1 flex items-end gap-[2px] sm:gap-1 w-full relative bg-white/[0.02] rounded-t-sm px-[1px]">
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${(h.sleep/10)*100}%` }} 
                          className="flex-1 bg-indigo-500/40 rounded-t-[1px] group-hover/bar:bg-indigo-500 transition-colors"
                        />
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${(h.distance/12)*100}%` }} 
                          className="flex-1 bg-emerald-500/40 rounded-t-[1px] group-hover/bar:bg-emerald-500 transition-colors"
                        />
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${(h.screenTime/600)*100}%` }} 
                          className="flex-1 bg-purple-500/40 rounded-t-[1px] group-hover/bar:bg-purple-500 transition-colors"
                        />
                      </div>
                      <p className="text-[9px] sm:text-[10px] mt-4 font-bold text-zinc-500 uppercase text-center">{h.day}</p>
                    </div>
                  ))}
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-between py-10 px-8 pointer-events-none opacity-5">
                   {[...Array(5)].map((_, i) => <div key={i} className="w-full h-[1px] bg-white"/>)}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                   <p className="text-[10px] text-zinc-500 leading-relaxed">
                     <span className="font-bold text-zinc-400">Note:</span> Insights are calculated based on your local device activity patterns (Sleep, Movement, Screen Usage) over the last 7 days.
                   </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center justify-between">
                Direct Recommendations
                <Zap size={16} className="text-amber-500" />
              </h2>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {recommendations.map((rec) => {
                    const status = getRecStatus(rec);
                    return (
                      <motion.div 
                        key={rec.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass-morphism p-5 flex items-center justify-between group cursor-pointer transition-all ${
                          status === "Now" ? "border-purple-500/30 bg-purple-500/5" : "hover:bg-white/5"
                        }`}
                        onClick={() => status === "Now" && completeRecommendation(rec.id)}
                      >
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${status === "Now" ? "text-white" : "text-zinc-400"}`}>
                            {rec.text}
                          </span>
                          <span className="text-[10px] text-zinc-600 mt-1 uppercase font-bold tracking-widest">
                            {status === "Now" ? "Due Immediately" : `Trigger in ${status}`}
                          </span>
                        </div>
                        <div className={`p-2 rounded-full transition-all ${
                          status === "Now" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "bg-white/5 text-zinc-600"
                        }`}>
                          {status === "Now" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <p className="text-[10px] text-amber-500/80 leading-relaxed font-medium">
                  Recommendations appear dynamically based on your digital habits to reduce screen fatigue and improve posture.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "insights" ? (
        <HealthOverview />
      ) : activeTab === "health" ? (
        <HealthCheck />
      ) : (
        <Profile />
      )}

      <motion.div
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-2"
      >
        <AnimatePresence mode="wait">
          {!isFeedbackMinimized ? (
            <motion.div
              layout
              key="expanded"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative group"
            >
              <button
                onClick={() => setIsFeedbackMinimized(true)}
                className="absolute -top-2 -left-2 w-6 h-6 bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Minimize"
              >
                <Minimize2 size={12} />
              </button>
              
              <button
                onClick={() => setShowFeedback(true)}
                className="p-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-500/20 flex items-center gap-3 transition-all hover:bg-purple-500"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div className="pr-2 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Founder Feedback</p>
                  <p className="text-sm font-black leading-none">Share Survey</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.button
              layout
              key="minimized"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFeedbackMinimized(false)}
              className="p-4 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center"
              title="Expand Feedback"
            >
              <MessageSquare size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedback(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <FeedbackSurvey onClose={() => setShowFeedback(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
