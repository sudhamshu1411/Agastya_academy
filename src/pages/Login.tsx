import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase, _testUrl } from "../supabaseClient";

export function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<"login" | "signup">(modeParam === "signup" ? "signup" : "login");
  const [formData, setFormData] = useState({ identifier: "", password: "", fullName: "" });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const isFounder = formData.identifier.toLowerCase().trim() === 'sudhamshu1411@gmail.com';
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.identifier,
          password: formData.password,
          options: {
            data: {
              full_name: isFounder ? "Sudhamshu (Founder)" : formData.fullName,
              role: isFounder ? "founder" : "new user"
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('rate limit')) {
            setError("We've restricted further sign-ups due to too many rapid attempts. Please try again or use the test credentials.");
          } else {
            setError("We encountered an error during sign-up. Please ensure your email is correct and try again.");
          }
        } else {
          // Manually insert into profiles just in case there is no trigger
          if (data?.user?.id) {
            await supabase.from('profiles').insert([
              {
                id: data.user.id,
                email: formData.identifier,
                full_name: isFounder ? "Sudhamshu (Founder)" : formData.fullName,
                role: isFounder ? "founder" : "new user"
              }
            ]);
          }
          // Success! Redirect to home dashboard
          if (!data.session) {
            setSuccessMsg("Please check your email to verify your account before logging in.");
            setFormData({ ...formData, password: "" });
          } else {
            let targetPath = isFounder ? "/founder/dashboard" : "/dashboard";
            const finalRoute = (redirect && redirect !== "/") ? redirect : targetPath;
            navigate(finalRoute, { replace: true });
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.identifier,
          password: formData.password,
        });

        if (signInError) {
          setError("Invalid email or password. Please try again.");
        } else {
          // Success! Redirect based on role
          const role = data.user?.user_metadata?.role;
          const isFounderEmail = formData.identifier.toLowerCase().trim() === 'sudhamshu1411@gmail.com';
          let targetPath = "/dashboard";
          if (role === 'founder' || isFounderEmail) targetPath = "/founder/dashboard";
          else if (role === 'faculty') targetPath = "/faculty/dashboard";
          else if (role === 'admin') targetPath = "/admin/dashboard";
          
          const finalRoute = (redirect && redirect !== "/") ? redirect : targetPath;
          navigate(finalRoute, { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Login Error details:", err);
      // Removed sbUrl from being exposed in the UI
      setError("An unexpected authentication error occurred. Please try again later.");
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
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {mode === "signup" && (
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
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                Email Address
              </label>
              <input 
                type="email"
                required
                className="w-full border-b border-slate-900 bg-transparent py-3 text-sm focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-300 font-mono"
                placeholder="email@example.com"
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
            
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

            <button disabled={isLoading} type="submit" className="w-full bg-slate-900 text-white py-4 mt-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_#1A1A1A] disabled:hover:translate-y-0 disabled:hover:translate-x-0">
              {isLoading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   {mode === "signup" ? "Creating Account..." : "Authenticating..."}
                 </span>
              ) : (
                mode === "signup" ? <><ShieldCheck className="w-4 h-4" /> Create Account</> : <><ShieldCheck className="w-4 h-4" /> Secure Login</>
              )}
            </button>
          </form>

          {successMsg && (
             <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-3 flex items-start gap-3">
               <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
               <span className="text-xs">{successMsg}</span>
             </div>
          )}

          {error && (
             <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-3 flex items-start gap-3">
               <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
               <span className="text-xs">{error}</span>
             </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4">
            {mode === "login" ? (
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Don't have an account? <button onClick={() => { setMode("signup"); setError(null); setSuccessMsg(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Sign Up Now</button>
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Already have an account? <button onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Login Here</button>
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
