"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  X,
  Bug,
  Lightbulb,
  MousePointer2,
  Zap
} from "lucide-react";
import { useVitals } from "./VitalsEngine";

export default function FeedbackSurvey({ onClose }) {
  const { user } = useVitals() || {};
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    { id: "General", icon: <MessageSquare size={16} />, label: "General" },
    { id: "Bug Report", icon: <Bug size={16} />, label: "Bug" },
    { id: "Feature Request", icon: <Lightbulb size={16} />, label: "Feature" },
    { id: "UI/UX", icon: <MousePointer2 size={16} />, label: "Design" },
    { id: "Performance", icon: <Zap size={16} />, label: "Speed" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !message) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "guest@vitals.ai",
          name: user?.name || "Guest User",
          rating,
          category,
          message,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);
      }
    } catch (error) {
      console.error("Feedback error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="stats-card p-0 overflow-hidden max-w-lg w-full relative border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-[#0A0A0A]"
    >
      <div className="p-8 bg-gradient-to-br from-purple-600/20 to-zinc-900 border-b border-purple-500/10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">App Feedback</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Help us improve Vitals</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Rating */}
              <div className="text-center">
                <label className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500 mb-4 block">Rate your experience</label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-all duration-300 transform hover:scale-125"
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors ${
                          (hoverRating || rating) >= star 
                            ? "fill-amber-400 text-amber-400 shadow-amber-500/20" 
                            : "text-zinc-800"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500 mb-4 block">What is this about?</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                        category === cat.id 
                          ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                      }`}
                    >
                      {cat.icon}
                      <span className="text-[10px] font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-black text-zinc-500 mb-4 block">Tell us more</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] outline-none focus:border-purple-500/50 transition-all text-sm font-medium placeholder:text-zinc-700"
                  placeholder="Share your thoughts, suggestions or report an issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !message}
                className="w-full btn-primary py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Zap size={20} />
                  </motion.div>
                ) : (
                  <>
                    <Send size={18} />
                    Send Feedback
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2">Thank You!</h3>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                Your feedback has been sent to our developers. We appreciate your help in making Vitals better!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
