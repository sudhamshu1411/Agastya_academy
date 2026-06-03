import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { googleSignIn } from "../lib/auth";
import { supabase } from "../lib/supabase";

export function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        let role = user.user_metadata?.role || "student";
        
        // Hardcoded hack for founder
        if (user.email === "sudhamshu1411@gmail.com" || user.email === "sudhamshu1411@gamil.com") {
          role = "founder";
        }

        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userFullName", user.user_metadata?.full_name || user.email?.split('@')[0] || "");

        const destination = redirect === "admissions" ? "/admissions" : (
          role === "founder" ? "/founder/dashboard" :
          role === "faculty" ? "/faculty/dashboard" :
          role === "admin" ? "/admin/dashboard" : "/dashboard"
        );
        navigate(destination);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirect]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await googleSignIn();
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
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
              Portal Access
            </h2>
            <p className="text-slate-500 text-sm">
              Sign in with your Google account to access the Agastya ERP ecosystem.
            </p>
          </div>

          <button 
            disabled={isLoading} 
            onClick={handleGoogleLogin} 
            className="w-full bg-slate-900 text-white py-4 mt-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <span className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Authenticating...
               </span>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Sign in with Google</>
            )}
          </button>

          {error && (
             <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-3 flex items-start gap-3">
               <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
               <span className="text-xs">{error}</span>
             </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Not a student yet? <Link to="/admissions" className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Apply for Admission</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
