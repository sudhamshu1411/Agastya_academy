import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, AlertCircle, KeyRound, X } from "lucide-react";
import { supabase } from "../supabaseClient";

export function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<"login" | "signup">(modeParam === "signup" ? "signup" : "login");
  const [formData, setFormData] = useState({ identifier: "", password: "", fullName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const navigate = useNavigate();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    setResetStatus(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) {
        setResetStatus({ type: "error", msg: resetError.message });
      } else {
        setResetStatus({
          type: "success",
          msg: "Password recovery instructions have been sent to your email address.",
        });
      }
    } catch (err: any) {
      setResetStatus({ type: "error", msg: err.message || "Failed to send password reset email." });
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      setIsLoading(true);
      const targetRedirect = redirect
        ? `${window.location.origin}/${redirect.replace(/^\//, "")}`
        : `${window.location.origin}/dashboard`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar.events",
          redirectTo: targetRedirect,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError("Google Sign-In Error: " + (err.message || "Unable to initialize Google OAuth."));
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const trimmedEmail = formData.identifier.trim();
      
      if (mode === "signup") {
        const isFounder = trimmedEmail.toLowerCase() === 'sudhamshu1411@gmail.com';
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: formData.password,
          options: {
            data: {
              full_name: isFounder ? "Sudhamshu (Founder)" : formData.fullName,
              role: isFounder ? "founder" : "new user",
              phone: formData.phone
            }
          }
        });

        if (signUpError) {
          console.error("SignUp Error:", signUpError);
          if (signUpError.message.includes('rate limit')) {
            setError("We've restricted further sign-ups due to too many rapid attempts. Please try again shortly.");
          } else if (signUpError.message.toLowerCase().includes('already registered')) {
            setError("This email is already registered. Please switch to 'Sign In' to log into your account.");
          } else {
            setError("Sign-up Error: " + (signUpError.message || "Please ensure your email is correct and try again."));
          }
        } else {
          if (data?.user?.id && data?.session?.access_token && !data.session.access_token.startsWith('agastya-token-')) {
            const { error: profileErr } = await supabase.from('profiles').upsert([
              {
                id: data.user.id,
                email: trimmedEmail,
                full_name: isFounder ? "Sudhamshu (Founder)" : formData.fullName,
                role: isFounder ? "founder" : "new user",
                phone: formData.phone
              }
            ]);
            if (profileErr) {
              console.warn("Profile upsert warning:", profileErr.message);
            }
          }
          if (!data.session) {
            setSuccessMsg("Please check your email to verify your account before logging in.");
            setFormData({ ...formData, password: "" });
          } else {
            const targetPath = isFounder ? "/founder/dashboard" : "/dashboard";
            const finalRoute = (redirect && redirect !== "/") ? (redirect.startsWith("/") ? redirect : `/${redirect}`) : targetPath;
            navigate(finalRoute, { replace: true });
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: formData.password,
        });

        if (signInError) {
          setError("Invalid email or password. (" + signInError.message + ")");
        } else {
          let role = data.user?.user_metadata?.role;
          if (data.user?.id) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
            if (profile?.role) {
              role = profile.role;
            }
          }
          
          const isFounderEmail = trimmedEmail.toLowerCase() === 'sudhamshu1411@gmail.com';
          let targetPath = "/dashboard";
          if (role === 'founder' || isFounderEmail) targetPath = "/founder/dashboard";
          else if (role === 'faculty') targetPath = "/faculty/dashboard";
          else if (role === 'admin') targetPath = "/admin/dashboard";
          
          const finalRoute = (redirect && redirect !== "/") ? (redirect.startsWith("/") ? redirect : `/${redirect}`) : targetPath;
          navigate(finalRoute, { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Login Error details:", err);
      setError("Authentication error: " + (err.message || "Please try again later."));
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
              <>
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
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    required
                    className="w-full border-b border-slate-900 bg-transparent py-3 text-sm focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-300 font-mono"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </>
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
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(formData.identifier);
                      setResetStatus(null);
                      setIsResetModalOpen(true);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors tracking-wider uppercase font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-slate-900 text-white py-4 mt-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_var(--color-slate-900)] hover:shadow-[2px_2px_0px_var(--color-slate-900)] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
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

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border border-slate-900 text-slate-900 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" className="block shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              Continue with Google (Calendar Sync)
            </button>
          </div>

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
                Don't have an account? <button onClick={() => { setMode("signup"); setError(null); setSuccessMsg(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5 cursor-pointer">Sign Up Now</button>
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Already have an account? <button onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }} className="text-slate-900 font-bold border-b border-slate-900 pb-0.5 cursor-pointer">Login Here</button>
              </p>
            )}
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Not a student yet? <Link to="/admissions" className="text-slate-900 font-bold border-b border-slate-900 pb-0.5">Apply for Admission</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Password Recovery Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-md w-full p-8 relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-slate-900">Reset Password</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Account Recovery</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Enter your registered email address and we will send you a password reset link via Supabase Auth.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full border border-slate-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
              {resetStatus && (
                <div
                  className={`p-3 border text-xs flex items-start gap-2 ${
                    resetStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {resetStatus.type === "success" ? (
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{resetStatus.msg}</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 border border-slate-300 text-slate-600 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 bg-slate-900 text-white py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isResetting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
