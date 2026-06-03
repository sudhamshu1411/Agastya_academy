import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getValidUsers } from "../lib/users"; // Keeping for mobile demo

export function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<"login" | "signup">(modeParam === "signup" ? "signup" : "login");
  const [method, setMethod] = useState<"email" | "mobile">("email");
  const [formData, setFormData] = useState({ identifier: "", password: "", fullName: "", role: "student" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [emailVerificationStep, setEmailVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!formData.identifier || !formData.password || !formData.fullName) {
          setError("All fields are required.");
          setIsLoading(false);
          return;
        }

        if (!emailVerificationStep && !import.meta.env.VITE_SUPABASE_URL) {
          // Trigger email verification using backend (Local only)
          try {
            const res = await fetch('/api/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.identifier })
            });

            const rawText = await res.text();
            let data;
            try {
              data = JSON.parse(rawText);
            } catch (e) {
              console.error("Invalid response from server:", rawText);
              throw new Error("The server is not running the backend API.");
            }

            if (!res.ok) throw new Error(data.error);
            setIsLoading(false);
            setEmailVerificationStep(true);
            return;
          } catch (err: any) {
            setError(err.message || 'Failed to send verification email. Configuration might be missing.');
            setIsLoading(false);
            return;
          }
        }

        if (emailVerificationStep && !import.meta.env.VITE_SUPABASE_URL) {
          try {
            const res = await fetch('/api/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.identifier, otp: verificationCode })
            });

            const rawText = await res.text();
            let data;
            try {
              data = JSON.parse(rawText);
            } catch (e) {
              throw new Error("Backend API not found.");
            }

            if (!res.ok) throw new Error(data.error);
          } catch (err: any) {
             setError(err.message || "Invalid verification code.");
             setIsLoading(false);
             return;
          }
        }

        setIsLoading(true);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.identifier,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: "new user"
            }
          }
        });

        if (signUpError && !signUpError.message.includes("User already registered")) {
          console.warn("Supabase sign-up error (ignored due to local fallback):", signUpError.message);
        } else if (import.meta.env.VITE_SUPABASE_URL && signUpData?.user && !signUpData?.session) {
          // Supabase sends a confirmation link. The user must click it to proceed.
          setError("A confirmation email has been sent. Please check your inbox and click the link to verify your account.");
          setIsLoading(false);
          return;
        }

        // Add to local mock database so it shows up in Founder/Admin dash if no Supabase
        const { registerUser } = await import("../lib/users");
        registerUser({
           email: formData.identifier.toLowerCase(),
           password: formData.password,
           fullName: formData.fullName,
           role: "new user"
        });

        const userEmail = formData.identifier.toLowerCase();
        localStorage.setItem("userRole", "new user");
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userFullName", formData.fullName || "");
        
        if (redirect === "admissions") {
          navigate("/admissions");
        } else {
          navigate("/dashboard");
        }
        return;
      }

      if (method === "email") {
        setIsLoading(true);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.identifier,
          password: formData.password,
        });

        let role = signInData?.user?.user_metadata?.role || "new user";
        let fullName = signInData?.user?.user_metadata?.full_name || "";

        const { getValidUsers } = await import("../lib/users");
        const users = getValidUsers();
        let localUser = users.find((u: any) => u.email.toLowerCase() === formData.identifier.toLowerCase());
        
        if (localUser) {
           role = localUser.role || role;
           fullName = localUser.fullName || fullName;
        }

        if (signInError) {
          // Because we do our own OTP, we bypass these errors and check the local mock database.
          if (localUser && localUser.password === formData.password) {
             // We already set role and fullName above
          } else {
             setError(signInError.message.includes("credentials") ? "Invalid credentials." : "Local auth fallback failed. Check credentials.");
             setIsLoading(false);
             return;
          }
        }
        
        // Removed hardcoded email checks to allow proper role reading from database

        const userEmail = formData.identifier.toLowerCase();
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userFullName", fullName);

        const destination = redirect === "admissions" ? "/admissions" : (
          role === "founder" ? "/founder/dashboard" :
          role === "faculty" ? "/faculty/dashboard" :
          role === "admin" ? "/admin/dashboard" : 
          (role === "new user" ? "/dashboard" : "/dashboard")
        );
        navigate(destination);
        return;
      } else {
        // Mobile Demo Implementation
        const users = getValidUsers();
        if (!otpStep) {
          const user = users.find((u: any) => u.phone === formData.identifier);
          if (user) {
            setOtpStep(true);
            setError(null);
          } else {
            setError("Mobile number not registered in the ERP system.");
          }
        } else {
          if (otp === "123456") {
            const user = users.find((u: any) => u.phone === formData.identifier);
            if (user) {
              localStorage.setItem("authToken", `mock_token_${user.role}_${Date.now()}`);
              localStorage.setItem("userRole", user.role);
              localStorage.setItem("userEmail", user.email);
              localStorage.setItem("userPhone", user.phone);
              localStorage.setItem("userFullName", user.fullName || "");
              
              const destination = redirect === "admissions" ? "/admissions" : (
                user.role === "founder" ? "/founder/dashboard" :
                user.role === "faculty" ? "/faculty/dashboard" :
                user.role === "admin" ? "/admin/dashboard" : "/dashboard"
              );
              navigate(destination);
            }
          } else {
            setError("Invalid OTP. For demo purposes use 123456.");
          }
        }
      }
    } catch (err) {
      setError("Authentication failed due to a system error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Left side */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 border-r border-slate-900 p-12 lg:p-24 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <Link to="/" className="relative z-10 flex flex-col text-white w-fit">
          <span className="font-serif italic text-3xl tracking-tighter leading-none">Agastya</span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold mt-2 opacity-50">Academy of Physics</span>
        </Link>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-12 bg-white/30"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/50">Student ERP</span>
          </div>
          <h1 className="font-serif text-5xl lg:text-7xl leading-[0.9] tracking-tight mb-8 text-white italic">
            Focus.<br/>
            Discipline.<br/>
            Results.
          </h1>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Access your daily micro-schedule, live classes, assignments, and continuous evaluation analytics.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-24 bg-slate-50 relative">
        <Link to="/" className="md:hidden absolute top-8 left-8 flex flex-col text-slate-900">
          <span className="font-serif italic text-2xl tracking-tighter leading-none">Agastya</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-serif italic text-slate-900 mb-4">
              {mode === "login" ? "Portal Access" : "Create Account"}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === "login" 
                 ? "Enter your credentials to access the Agastya ERP ecosystem."
                 : "Register a new profile to access the Agastya ERP ecosystem."}
            </p>
            {mode === "login" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 text-slate-700 text-sm font-mono">
                <strong>Demo Credentials:</strong><br />
                Student: student@agastya.edu / Password123!<br />
                Admin: admin@agastya.edu / Password123!<br />
                Faculty: faculty@agastya.edu / Password123!<br />
                Founder: founder@agastya.edu / Password123!<br />
                Mobile Login Demo: 9000000001 (OTP: 123456)
              </div>
            )}
          </div>

          {mode === "login" && (
            <div className="flex gap-4 border-b border-slate-300 mb-8">
              <button 
                className={`pb-3 text-[10px] uppercase tracking-widest font-bold font-mono transition-colors border-b-2 ${method === "email" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                onClick={() => { setMethod("email"); setOtpStep(false); setError(null); }}
              >
                Email Setup
              </button>
              <button 
                className={`pb-3 text-[10px] uppercase tracking-widest font-bold font-mono transition-colors border-b-2 ${method === "mobile" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                onClick={() => { setMethod("mobile"); setOtpStep(false); setError(null); }}
              >
                Mobile OTP
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {mode === "signup" && !emailVerificationStep && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                  Full Name
                </label>
                <input 
                  type="text"
                  required
                  className="w-full border-b border-slate-900 bg-transparent py-3 text-sm focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-300 font-mono"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            )}
            {((!otpStep || mode === "signup") && !emailVerificationStep) && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                {mode === "signup" ? "Email Address" : (method === "email" ? "Student Email" : "Registered Mobile Number")}
              </label>
              <input 
                type={mode === "signup" ? "email" : (method === "email" ? "email" : "tel")}
                required
                className="w-full border-b border-slate-900 bg-transparent py-3 text-sm focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-300 font-mono"
                placeholder={mode === "signup" ? "email@example.com" : (method === "email" ? "student@agastya.edu" : "9000000001")}
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
            )}
            
            {(mode === "signup" || (method === "email" && !otpStep)) && !emailVerificationStep && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  required
                  className="w-full border-b border-slate-900 bg-transparent py-3 text-sm focus:outline-none focus:border-slate-500 transition-colors font-mono placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                {mode === "login" && (
                  <div className="mt-3 flex justify-end">
                    <a href="#" className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors tracking-wider uppercase font-bold">Forgot Password?</a>
                  </div>
                )}
              </div>
            )}

            {mode === "signup" && emailVerificationStep && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                  Verify Email Address
                </label>
                <p className="text-sm text-slate-500 mb-4">A confirmation code was sent to <span className="font-bold text-slate-900">{formData.identifier}</span>.</p>
                <input 
                  type="text"
                  required
                  className="w-full border-b border-slate-900 bg-transparent py-3 text-lg tracking-[0.5em] focus:outline-none focus:border-slate-500 transition-colors font-mono text-center"
                  placeholder="------"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}

            {mode === "login" && method === "mobile" && otpStep && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="bg-amber-50 border border-amber-200 p-3 mb-4">
                  <p className="text-xs text-amber-800 font-mono">
                    <strong>Demo Mode Active:</strong> No actual SMS is sent. Please use the verification code <strong>123456</strong> to proceed.
                  </p>
                </div>
                <div className="flex justify-between gap-2 max-w-[240px]">
                   <input 
                    type="text"
                    required
                    maxLength={6}
                    className="w-full border-b border-slate-900 bg-transparent py-3 text-center tracking-[1em] text-lg focus:outline-none focus:border-slate-500 transition-colors font-mono placeholder:text-slate-300"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <button type="button" onClick={() => setOtpStep(false)} className="text-[10px] text-slate-500 hover:text-slate-900 tracking-wider uppercase font-bold transition-colors">Change Number</button>
                  <button type="button" className="text-[10px] text-emerald-600 hover:text-emerald-800 tracking-wider uppercase font-bold transition-colors">Resend OTP</button>
                </div>
              </div>
            )}

            <button disabled={isLoading} type="submit" className="w-full bg-slate-900 text-white py-4 mt-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_#1A1A1A] disabled:hover:translate-y-0 disabled:hover:translate-x-0">
              {isLoading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   {mode === "signup" ? "Creating Account..." : "Authenticating..."}
                 </span>
              ) : (
                mode === "signup" ? (
                  emailVerificationStep ? <><ShieldCheck className="w-4 h-4" /> Verify Email</> : <><ShieldCheck className="w-4 h-4" /> Create Account</>
                ) : (
                  method === "email" ? (
                    <><ShieldCheck className="w-4 h-4" /> Secure Login</>
                  ) : (
                    otpStep ? <><ShieldCheck className="w-4 h-4" /> Verify OTP</> : "Request OTP"
                  )
                )
              )}
            </button>
          </form>

          {error && (
             <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-3 flex items-start gap-3">
               <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
               <span className="text-xs">{error}</span>
             </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4">
            {mode === "login" ? (
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Don't have an account? <button onClick={() => { setMode("signup"); setError(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Sign Up Now</button>
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Already have an account? <button onClick={() => { setMode("login"); setError(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Login Here</button>
              </p>
            )}
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Not a student yet? <Link to="/admissions" className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Apply for Admission</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
