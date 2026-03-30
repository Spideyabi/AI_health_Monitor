"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Apple,
  Pill,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  Activity,
  ChevronRight,
  Info
} from "lucide-react";
import { generateHealthReport } from "@/lib/aiHealthService";
import { useVitals } from "./VitalsEngine";

export default function HealthOverview() {
  const { averages, user, isInitializing } = useVitals() || {};
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCalculated, setIsCalculated] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!averages) return;

      // Enforce 24-hour rule for real accounts
      if (user?.createdAt) {
        const createdTime = new Date(user.createdAt).getTime();
        const now = new Date().getTime();
        const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);

        if (hoursSinceCreation < 24) {
          setIsCalculated(false);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      const data = await generateHealthReport(averages);
      setReport(data);
      setIsLoading(false);
    };
    fetchReport();
  }, [averages, user]);

  if (isLoading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
        <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Compiling Health Overview...</p>
      </div>
    );
  }

  if (!isCalculated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 stats-card bg-white/5 border-amber-500/20 max-w-2xl mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          <Activity size={32} className="text-amber-500 opacity-50" />
        </div>
        <h2 className="text-2xl font-black mb-3">Analysis Pending</h2>
        <p className="text-zinc-400 mb-6 leading-relaxed max-w-md">
          Your Biological Health Report requires at least 24 hours of data to establish an accurate baseline.
        </p>
        <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-400">
          Still not being calculated. Please visit after 24 hrs.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="stats-card p-0 overflow-hidden relative border-none bg-gradient-to-br from-indigo-900/20 to-black ring-1 ring-white/10">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-amber-400">7-Day Biological Overview</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Biological Equilibrium</h2>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed italic">"{report.weeklyQuote}"</p>
          </div>
          <div className="w-48 h-48 rounded-full border-8 border-purple-500/20 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t-8 border-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-4xl font-black text-white">{report.averages.sleep}</p>
            <p className="text-[10px] uppercase font-black text-zinc-500">Avg Sleep</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="stats-card bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
              <Brain size={24} />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 ${report.stress.color} border border-current opacity-70`}>
              {report.stress.level}
            </div>
          </div>
          <h3 className="text-xl font-black mb-3 text-white">Mental Stress Load</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{report.stress.description}</p>
          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Risk Factor</p>
              <p className="font-bold text-sm">{report.averages.screenTime > 360 ? "Screen Fatigue" : "Physical Inertia"}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Target Action</p>
              <p className="font-bold text-sm text-purple-400">Meditation / Mobility</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="stats-card bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Apple size={24} />
            </div>
            <TrendingUp size={20} className="text-emerald-500 opacity-50" />
          </div>
          <h3 className="text-xl font-black mb-3 text-white">Metabolic Strategy</h3>
          <h4 className="text-emerald-400 font-bold mb-4">{report.nutrition.focus}</h4>
          <div className="space-y-3">
            {report.nutrition.nutrients.map((n, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {n}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="stats-card bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
              <Pill size={24} />
            </div>
            <ShieldCheck size={20} className="text-amber-500 opacity-50" />
          </div>
          <h3 className="text-xl font-black mb-3 text-white">Essential Micro-Nutrients</h3>
          <div className="space-y-3">
            {report.nutrition.vitamins.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-zinc-300">{v}</span>
                <ChevronRight size={14} className="text-zinc-600" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="stats-card border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black flex items-center gap-3">
            <Activity className="text-indigo-400" size={20} /> Metric Analysis Breakdown
          </h3>
          <Info size={16} className="text-zinc-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest">Vital Category</th>
                <th className="pb-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest text-center">Avg Value</th>
                <th className="pb-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest text-center">Benchmark</th>
                <th className="pb-4 text-[10px] uppercase font-black text-zinc-500 tracking-widest text-right">Health Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-6 font-bold text-white">Rest/Sleep Duration</td>
                <td className="py-6 text-center font-black text-indigo-400">{report.averages.sleep}h</td>
                <td className="py-6 text-center text-zinc-600 font-medium">7.5h</td>
                <td className="py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.averages.sleep >= 7 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {report.averages.sleep >= 7 ? "Optimal" : "Deficit"}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-6 font-bold text-white">Physical Mobility (Walked)</td>
                <td className="py-6 text-center font-black text-emerald-400">{report.averages.distance}km</td>
                <td className="py-6 text-center text-zinc-600 font-medium">5.0km</td>
                <td className="py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.averages.distance >= 4 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                    {report.averages.distance >= 4 ? "Active" : "Sedentary"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-6 font-bold text-white">Digital Consumption</td>
                <td className="py-6 text-center font-black text-purple-400">{report.averages.screenTime}m</td>
                <td className="py-6 text-center text-zinc-600 font-medium">&lt; 300m</td>
                <td className="py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.averages.screenTime < 360 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {report.averages.screenTime < 360 ? "Safe" : "Extreme"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
