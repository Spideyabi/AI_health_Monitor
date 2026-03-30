"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Github, Loader2, Zap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useVitals } from "@/components/VitalsEngine";
import { useRouter } from "next/navigation";

export default function AuthForm({ type = "login" }) {
  const isLogin = type === "login";
  const { login, signup } = useVitals() || {};
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error("Please fill in all fields");
        }
        await login(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("Please fill in all fields");
        }
        await signup(formData.name, formData.email, formData.password);
      }
      router.push("/");
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-morphism p-8 relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Enter your credentials to access your vitals."
                : "Join Vitals AI to start monitoring your wellbeing."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-purple-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-purple-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-purple-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow mt-8 group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Get Started"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0b0b0b] px-4 text-[10px] text-muted-foreground uppercase tracking-widest absolute">Or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="py-3 bg-white/5 border border-white/10 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-sm group"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <User size={18} className="text-muted-foreground group-hover:text-purple-400 transition-colors" />
                </div>
                {isLogin ? "Create Account" : "Log In"}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  await login("demo@vitals.ai", "password123");
                  router.push("/");
                }}
                className="py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-600/20 transition-all text-sm text-purple-400"
              >
                <Zap size={18} className="fill-purple-400/20" />
                Try Demo
              </button>
            </div>
          </div>


        </div>
      </motion.div>
    </div>
  );
}
