"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Utensils,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Home,
  MapPin,
  ShieldCheck,
  Hospital,
  Save,
  Droplets,
  Moon,
  Apple,
  Coffee,
  EyeOff,
  Activity,
  Zap,
  Phone,
  Navigation
} from "lucide-react";

import { analyzeHealth } from "@/lib/aiHealthService";
import { Loader2, BrainCircuit, Sparkles, TrendingDown } from "lucide-react";
import { useVitals } from "./VitalsEngine";

export default function HealthCheck() {
  const { user, vitals } = useVitals() || {};
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [location, setLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  const [formData, setFormData] = useState({
    lastMeal: "",
    junkFood: "no",
    waterIntake: "normal",
    sleepHours: "",
    primarySymptom: "",
    symptomLocation: "",
    severity: "low",
    temperature: "normal",
    duration: "",
    onset: "gradual",
    consistency: "intermittent",
    allergies: "",
    conditions: ""
  });

  const steps = [
    { id: 1, title: "Lifestyle", icon: <Utensils size={18} /> },
    { id: 2, title: "Symptoms", icon: <Stethoscope size={18} /> },
    { id: 3, title: "Timeline", icon: <ClipboardList size={18} /> },
    { id: 4, title: "History", icon: <Hospital size={18} /> }
  ];

  const showTemperature = (symptom) => {
    return symptom.toLowerCase().includes("fever");
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyHospitals = async (lat, lng) => {
    const fetchWithRadius = async (radiusMeters) => {
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:${radiusMeters}, ${lat}, ${lng});
          node["amenity"="clinic"](around:${radiusMeters}, ${lat}, ${lng});
        );
        out 5;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    };

    try {
      let data = await fetchWithRadius(10000); // 10km

      if (!data.elements || data.elements.length === 0) {
        // Fallback to 15km if none found in 10Km
        data = await fetchWithRadius(15000); // 15km
      }

      if (data.elements && data.elements.length > 0) {
        return data.elements.map(el => {
          const dist = calculateDistance(lat, lng, el.lat, el.lon);
          return {
            name: el.tags?.name || "Local Medical Center",
            phone: el.tags?.phone || el.tags?.["contact:phone"] || "Phone Not Available",
            address: el.tags?.["addr:street"]
              ? `${el.tags?.["addr:housenumber"] || ""} ${el.tags?.["addr:street"]}`.trim()
              : "Location on Map",
            distance: `${dist.toFixed(1)} km`,
            rawDist: dist
          };
        })
          .sort((a, b) => a.rawDist - b.rawDist)
          .slice(0, 5); // Up to 5 hospitals
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    }

    // Fallback if API fails or absolutely no hospitals found even at 15km
    return [
      { name: "Nearest Regional Hospital", phone: "Phone Not Available", address: "Emergency Walk-In", distance: "Unknown" }
    ];
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1: return formData.lastMeal && formData.sleepHours;
      case 2: return formData.primarySymptom;
      case 3: return formData.duration;
      case 4: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  const handleBack = () => setStep(step - 1);

  const handleCalculateDiagnosis = async () => {
    setIsAnalyzing(true);

    let userLocation = null;
    if (navigator.geolocation) {
      try {
        userLocation = await new Promise((resolve, reject) => {
          // Add a 5-second timeout in case user ignores prompt
          const timeoutId = setTimeout(() => reject(new Error("Timeout")), 5000);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setLocation(loc);
              resolve(loc);
            },
            (err) => {
              clearTimeout(timeoutId);
              resolve(null); // Resolve null if user denies
            },
            { timeout: 5000 }
          );
        });
      } catch (err) {
        // userLocation remains null
      }
    }

    try {
      const aiInput = {
        age: user?.age || "Not specified",
        gender: user?.gender || "Not specified",
        vitals: vitals,
        lifestyle: `Sleep: ${formData.sleepHours}h. Last meal: ${formData.lastMeal}. Junk food: ${formData.junkFood}. Water: ${formData.waterIntake}.`,
        symptoms: `${formData.primarySymptom} ${formData.symptomLocation ? `in ${formData.symptomLocation}` : ""}. Severity: ${formData.severity}. Temp: ${formData.temperature}.`,
        timeline: `Duration: ${formData.duration}. Onset: ${formData.onset}. Consistency: ${formData.consistency}.`,
        history: `Allergies: ${formData.allergies || "None"}. History: ${formData.conditions || "None"}.`,
        severity: formData.severity
      };

      const result = await analyzeHealth(aiInput);
      setDiagnosis(result);
      if (result.type === 'hospital' || result.type === 'doctor') {
        if (userLocation) {
          const facilities = await fetchNearbyHospitals(userLocation.lat, userLocation.lng);
          setNearbyHospitals(facilities);
        } else {
          setNearbyHospitals([
            { name: "Nearest Regional Hospital", phone: "Not provided", address: "Emergency Walk-In", distance: "Unknown" },
            { name: "Local First Aid Clinic", phone: "Not provided", address: "Check Map for Route", distance: "Unknown" }
          ]);
        }
      }
      setStep(5);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!user?.email || !diagnosis) return;
    try {
      await fetch("/api/health/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          record: {
            ...formData,
            diagnosis
          }
        })
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {step < 5 && (
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.id ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" : "bg-zinc-900 text-zinc-500"
                }`}>
                {step > s.id ? <CheckCircle2 size={20} /> : s.icon}
              </div>
              <span className={`text-[10px] uppercase tracking-widest mt-2 font-bold ${step >= s.id ? "text-purple-400" : "text-zinc-600"
                }`}>{s.title}</span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="stats-card p-10"
          >
            <h2 className="text-2xl font-bold mb-8">Lifestyle & Habits</h2>

            <div className="space-y-6 mb-10">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Last Main Meal (e.g. Pasta, Salad)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all font-bold"
                  value={formData.lastMeal}
                  onChange={(e) => setFormData({ ...formData, lastMeal: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">Water Intake</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 outline-none focus:border-purple-500/50 transition-all text-zinc-300 font-bold"
                    value={formData.waterIntake}
                    onChange={(e) => setFormData({ ...formData, waterIntake: e.target.value })}
                  >
                    <option value="low">Low (&lt; 1L)</option>
                    <option value="normal">Normal (2L+)</option>
                    <option value="high">High (3L+)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">Sleep Last Night (Hours)</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 outline-none focus:border-purple-500/50 transition-all font-bold"
                    placeholder="e.g. 7"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Consumed Junk Food Recently?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, junkFood: opt })}
                      className={`flex-1 py-3 rounded-xl border capitalize font-bold transition-all ${formData.junkFood === opt ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-white/5 border-white/10 text-zinc-500"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!validateStep(1)}
                className="btn-primary group disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="stats-card p-10"
          >
            <h2 className="text-2xl font-bold mb-8">Symptoms & Severity</h2>

            <div className="space-y-6 mb-10">
              <div className="grid gap-6">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">Main Symptom</label>
                  <input
                    type="text"
                    placeholder="e.g. Fever, Headache"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all"
                    value={formData.primarySymptom}
                    onChange={(e) => setFormData({ ...formData, primarySymptom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">Symptom location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Stomach, Head"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all font-bold"
                    value={formData.symptomLocation}
                    onChange={(e) => setFormData({ ...formData, symptomLocation: e.target.value })}
                  />
                </div>
              </div>

              {showTemperature(formData.primarySymptom) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10"
                >
                  <label className="text-sm text-red-400/80 mb-2 block font-bold flex items-center gap-2">
                    <Activity size={14} /> Recorded Temperature
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-red-500/50 transition-all text-zinc-300 font-bold"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  >
                    <option value="normal">Normal (98.6°F)</option>
                    <option value="warm">Warm / Mild Fever</option>
                    <option value="fever">High Fever</option>
                  </select>
                </motion.div>
              )}

              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Severity</label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, severity: level })}
                      className={`flex-1 py-3 rounded-xl border transition-all capitalize font-bold ${formData.severity === level
                          ? level === 'low' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                            level === 'medium' ? "bg-amber-500/20 border-amber-500 text-amber-400" :
                              "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                          : "bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="flex items-center text-zinc-400 hover:text-white transition-colors font-bold">
                <ArrowLeft className="mr-2" size={18} /> Back
              </button>
              <button
                onClick={handleNext}
                className="btn-primary group"
              >
                Continue <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="stats-card p-10"
          >
            <h2 className="text-2xl font-bold mb-8">Medical Timeline</h2>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">How Long? (Duration)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all font-bold"
                    placeholder="e.g. 3 days"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-zinc-400 mb-2 block font-medium">Onset</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all text-zinc-300 font-bold"
                    value={formData.onset}
                    onChange={(e) => setFormData({ ...formData, onset: e.target.value })}
                  >
                    <option value="gradual">Gradual</option>
                    <option value="sudden">Sudden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Consistency</label>
                <div className="flex gap-2">
                  {['constant', 'intermittent', 'worsening'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, consistency: opt })}
                      className={`flex-1 py-3 rounded-xl border capitalize font-bold transition-all ${formData.consistency === opt ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-white/5 border-white/10 text-zinc-500"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="flex items-center text-zinc-400 hover:text-white transition-colors font-bold">
                <ArrowLeft className="mr-2" size={18} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!validateStep(3)}
                className="btn-primary group"
              >
                Continue <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="stats-card p-10"
          >
            <h2 className="text-2xl font-bold mb-8">Medical Context & History</h2>

            <div className="space-y-6 mb-10">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Existing Conditions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Asthma, Diabetes, None"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all font-bold"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block font-medium">Known Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Pollen, None"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500/50 transition-all font-bold"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="bg-purple-600/5 rounded-2xl p-6 border border-purple-500/10">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Finalizing will process your symptoms against clinical benchmarks. Ensure all reports are accurate.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="flex items-center text-zinc-400 hover:text-white transition-colors font-bold">
                <ArrowLeft className="mr-2" size={18} /> Back
              </button>
              <button
                onClick={handleCalculateDiagnosis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
                {isAnalyzing ? "Analyzing..." : "Review Result"}
              </button>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="stats-card p-10 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-20 h-20 bg-purple-600/10 rounded-3xl border border-purple-500/20 flex items-center justify-center">
                <BrainCircuit size={40} className="text-purple-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">AI Engine Processing</h2>
            <p className="text-zinc-500 max-w-sm mb-8">Our cognitive system is correlating your symptoms with clinical datasets and biometric patterns...</p>

            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && diagnosis && !isAnalyzing && (
          <motion.div
            key="diagnosis"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className={`stats-card p-0 overflow-hidden relative border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]`}>
              {/* Header Banner */}
              <div className={`p-8 md:p-12 relative ${diagnosis.type === 'hospital' ? 'bg-gradient-to-br from-red-600/20 to-zinc-900 border-b border-red-500/20' :
                  diagnosis.type === 'doctor' ? 'bg-gradient-to-br from-amber-600/20 to-zinc-900 border-b border-amber-500/20' :
                    'bg-gradient-to-br from-emerald-600/20 to-zinc-900 border-b border-emerald-500/20'
                }`}>
                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${diagnosis.type === 'hospital' ? 'bg-red-500 text-white shadow-red-500/20' :
                      diagnosis.type === 'doctor' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                        'bg-emerald-500 text-white shadow-emerald-500/20'
                    }`}>
                    {diagnosis.type === 'hospital' ? <Hospital size={40} /> :
                      diagnosis.type === 'doctor' ? <Stethoscope size={40} /> :
                        <Home size={40} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-purple-400 fill-purple-400" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-black text-purple-400">Cognitive Analysis Report</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{diagnosis.title}</h2>
                    <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed mb-4">{diagnosis.desc}</p>

                    {/* Cause of Illness Mention */}
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-fit">
                      <BrainCircuit size={18} className="text-purple-400" />
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 leading-none mb-1">Potential Cause</p>
                        <p className="text-sm font-bold text-white leading-none">{diagnosis.cause}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaved}
                    className={`mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isSaved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-white text-black hover:bg-zinc-200"
                      }`}
                  >
                    {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
                    {isSaved ? "Verified & Stored" : "Save to Archive"}
                  </button>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5 scale-[5] pointer-events-none">
                  {diagnosis.type === 'hospital' ? <AlertCircle /> : <Sparkles />}
                </div>
              </div>

              {/* Treatment Grid */}
              <div className="p-8 md:p-12 bg-black/40">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500 mb-8 flex items-center gap-2">
                  <TrendingDown size={14} /> Recommended Treatment Protocol
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {diagnosis.treatmentPlan && Object.entries(diagnosis.treatmentPlan).map(([key, item]) => (
                    <motion.div
                      key={key}
                      whileHover={{ y: -5 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                    >
                      <div className={`p-3 rounded-2xl bg-white/5 inline-block mb-4 ${item.color} group-hover:bg-white/10 transition-colors`}>
                        {key === 'hydration' && <Droplets size={24} />}
                        {key === 'sleep' && <Moon size={24} />}
                        {key === 'nutrition' && (item.icon === 'Soup' ? <Utensils size={24} /> : <Apple size={24} />)}
                        {key === 'rest' && (item.icon === 'EyeOff' ? <EyeOff size={24} /> : item.icon === 'Activity' ? <Activity size={24} /> : <Coffee size={24} />)}
                      </div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter mb-1">{key}</p>
                      <h4 className="text-2xl font-black tracking-tight">{item.target}</h4>
                      <p className="text-zinc-400 text-xs">{item.unit}</p>

                      {/* Decorative Gradient */}
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Action Steps */}
                  <div className="space-y-6">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500 flex items-center gap-2">
                      <ClipboardList size={14} /> Immediate Action Steps
                    </h3>
                    <div className="space-y-4">
                      {diagnosis.advice.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all hover:translate-x-1">
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0">
                            <span className="text-purple-400 font-black text-xs">{i + 1}</span>
                          </div>
                          <p className="text-zinc-300 text-sm leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contextual Insights / Hospital Search */}
                  <div className="space-y-8">
                    {(diagnosis.type === 'hospital' || diagnosis.type === 'doctor') && (
                      <div className="space-y-6">
                        <h3 className={`text-xs uppercase tracking-[0.2em] font-black flex items-center gap-2 ${diagnosis.type === 'hospital' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                          <Hospital size={14} /> Nearby Medical Facilities
                        </h3>
                        <div className="grid gap-4">
                          {nearbyHospitals.map((hospital, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={`stats-card p-6 bg-white/5 border hover:border-opacity-100 transition-all ${diagnosis.type === 'hospital' ? 'border-red-500/20 hover:border-red-500/40' : 'border-amber-500/20 hover:border-amber-500/40'
                                }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-lg">{hospital.name}</h4>
                                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin size={12} /> {hospital.address} • {hospital.distance}
                                  </p>
                                </div>
                                <div className={`p-2 rounded-lg ${diagnosis.type === 'hospital' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                  <Hospital size={20} />
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <a
                                  href={hospital.phone && hospital.phone !== "Phone Not Available" ? `tel:${hospital.phone.replace(/[^0-9+]/g, '')}` : "#"}
                                  onClick={(e) => (!hospital.phone || hospital.phone === "Phone Not Available") && e.preventDefault()}
                                  className={`flex-1 py-2 px-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${hospital.phone && hospital.phone !== "Phone Not Available"
                                      ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                      : "bg-white/5 border-white/10 text-zinc-600 opacity-50 cursor-not-allowed"
                                    }`}
                                >
                                  <Phone size={14} /> {(hospital.phone && hospital.phone !== "Phone Not Available") ? "Appt Call" : "No Number"}
                                </a>
                                <a
                                  href={`https://www.google.com/maps/search/${encodeURIComponent(hospital.name + " " + hospital.address)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex-1 py-2 px-4 rounded-xl text-white transition-all text-sm font-bold flex items-center justify-center gap-2 ${diagnosis.type === 'hospital' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'
                                    }`}
                                >
                                  <Navigation size={14} /> Map Direction
                                </a>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!diagnosis.doctor && diagnosis.type === 'home' && (
                      <div className="stats-card p-8 bg-black/40 border-purple-500/20">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-purple-400 mb-6 flex items-center gap-2">
                          <BrainCircuit size={14} /> AI Analysis Reasoning
                        </h3>
                        <div className="space-y-4">
                          {diagnosis.aiInsights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              <p className="text-zinc-500 text-xs leading-relaxed italic">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diagnosis.doctor && (
                      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-purple-900/40 relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Stethoscope size={32} className="text-white" />
                          </div>
                          <div>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-widest mb-1">Recommended Specialist</p>
                            <h3 className="text-2xl font-black text-white">{diagnosis.doctor}</h3>
                            <p className="text-white/80 text-xs mt-1">Specialized care path suggested</p>
                          </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-10">
                          <Stethoscope size={150} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setDiagnosis(null);
                  setIsSaved(false);
                  setFormData({
                    lastMeal: "", junkFood: "no", waterIntake: "normal", sleepHours: "",
                    primarySymptom: "", symptomLocation: "", severity: "low", temperature: "normal",
                    duration: "", onset: "gradual", consistency: "intermittent",
                    allergies: "", conditions: ""
                  });
                }}
                className="btn-primary px-10 py-4 shadow-xl shadow-purple-900/40 hover:-translate-y-1 transition-all"
              >
                Perform New Consultation
              </button>
              <p className="text-zinc-600 text-xs">AI recommendations are for guidance. Consult a doctor for clinical diagnosis.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
