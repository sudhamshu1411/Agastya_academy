import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, UserCircle2, ShieldCheck } from "lucide-react";
import { saveAdmission } from "../lib/admissions";
import { getValidUsers, registerUser } from "../lib/users";

export function Admissions() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("userRole"));
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appId, setAppId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, we don't auto-redirect, we just leave them on Step 1.
    // If they ARE authenticated and on Step 1, we let them see they are signed in (Step 1 Portal Account).
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    firstName: localStorage.getItem("userFullName")?.split(" ")[0] || "",
    lastName: localStorage.getItem("userFullName")?.split(" ").slice(1).join(" ") || "",
    email: localStorage.getItem("userEmail") || "",
    mobile: localStorage.getItem("userPhone") || "",
    parentName: "",
    school: "",
    grade: "",
    targetYear: "",
    batch: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userFullName");
    setIsAuthenticated(false);
    setFormData(prev => ({
      ...prev,
      firstName: "",
      lastName: "",
      email: "",
      mobile: ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    setAppId(newId);
    
    saveAdmission({
      id: newId,
      email: formData.email,
      studentName: `${formData.firstName} ${formData.lastName}`.trim(),
      previousSchool: formData.school,
      cohort: formData.batch === 'alpha' ? 'Alpha' : formData.batch === 'crash' ? "Crash '25" : "Target NEET",
      parentContact: formData.mobile,
      status: "Pending Review",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 pt-20 flex justify-center items-center">
        <div className="max-w-md w-full bg-white p-12 border border-slate-900 shadow-[12px_12px_0px_#1A1A1A]">
          <div className="w-16 h-16 border border-slate-900 text-slate-900 flex items-center justify-center mb-8 bg-slate-50 shadow-[4px_4px_0px_#1A1A1A]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif italic text-slate-900 mb-4">Application Received.</h2>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Your admission request has been submitted successfully. Our academic directors will review your application and contact you within 24-48 hours with next steps.
          </p>
          <div className="bg-slate-50 border border-slate-200 p-4 mb-8">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1">Application ID</p>
            <p className="font-mono text-slate-900">{appId}</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="w-full bg-slate-900 text-white py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-8 bg-slate-900"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">Enrollment</span>
            <span className="h-px w-8 bg-slate-900"></span>
          </div>
          <h1 className="text-5xl font-serif text-slate-900 mb-6 italic">Admission Application</h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
            Given our strict 15-member batch constraint, admission is selective. Please fill out the details carefully.
          </p>
        </div>

        <div className="bg-white border border-slate-900 shadow-[12px_12px_0px_#1A1A1A] overflow-hidden flex flex-col md:flex-row">
          
          {/* Progress Tracker Sidebar */}
          <div className="w-full md:w-1/3 bg-slate-900 text-slate-300 p-8 lg:p-12 border-b md:border-b-0 md:border-r border-slate-900">
            <h3 className="text-white font-serif italic text-2xl mb-8">Application Progress</h3>
            <ul className="space-y-8 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-slate-700">
              <li className={`flex gap-4 relative z-10 ${step >= 1 ? 'text-white' : 'text-slate-500 opacity-50'}`}>
                <div className={`w-6 h-6 shrink-0 flex items-center justify-center -translate-x-[11px] ${step > 1 ? 'bg-slate-900' : 'bg-slate-900'}`}>
                  {step > 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 border ${step === 1 ? 'border-white' : 'border-slate-500'}`}></div>}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Step 01</p>
                  <p className="font-serif italic text-lg opacity-80">Portal Account</p>
                </div>
              </li>
              <li className={`flex gap-4 relative z-10 ${step >= 2 ? 'text-white' : 'text-slate-500 opacity-50'}`}>
                <div className={`w-6 h-6 shrink-0 flex items-center justify-center -translate-x-[11px] ${step > 2 ? 'bg-slate-900' : 'bg-slate-900'}`}>
                  {step > 2 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 border ${step === 2 ? 'border-white' : 'border-slate-500'}`}></div>}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Step 02</p>
                  <p className="font-serif italic text-lg opacity-80">Student Profile</p>
                </div>
              </li>
              <li className={`flex gap-4 relative z-10 ${step >= 3 ? 'text-white' : 'text-slate-500 opacity-50'}`}>
                <div className={`w-6 h-6 shrink-0 flex items-center justify-center -translate-x-[11px] ${step > 3 ? 'bg-slate-900' : 'bg-slate-900'}`}>
                  {step > 3 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 border ${step === 3 ? 'border-white' : 'border-slate-500'}`}></div>}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Step 03</p>
                  <p className="font-serif italic text-lg opacity-80">Academic Details</p>
                </div>
              </li>
              <li className={`flex gap-4 relative z-10 ${step >= 4 ? 'text-white' : 'text-slate-500 opacity-50'}`}>
                <div className={`w-6 h-6 shrink-0 flex items-center justify-center -translate-x-[11px] ${step > 4 ? 'bg-slate-900' : 'bg-slate-900'}`}>
                   <div className={`w-3 h-3 border ${step === 4 ? 'border-white' : 'border-slate-500'}`}></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Step 04</p>
                  <p className="font-serif italic text-lg opacity-80">Batch Selection</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Form Content */}
          <div className="w-full md:w-2/3 p-8 lg:p-12 bg-white">
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); if (step === 1 && !isAuthenticated) { navigate('/login?redirect=admissions'); } else { setStep(step + 1); } }}>
              
              {/* Step 1 */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  {isAuthenticated ? (
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-6 p-6 border border-slate-200 bg-slate-50">
                        <div className="w-12 h-12 bg-slate-900 text-white flex justify-center items-center rounded-full shrink-0">
                          <UserCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Signed in as</p>
                          <p className="font-serif italic text-xl text-slate-900">{localStorage.getItem("userFullName") || "User"}</p>
                          <p className="text-sm font-mono text-slate-600">{localStorage.getItem("userEmail") || "user@example.com"}</p>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-emerald-600 ml-auto opacity-50" />
                      </div>
                      <p className="text-slate-500 text-sm mb-4">Your application progress will be saved to this account.</p>
                      <button 
                        type="button" 
                        onClick={handleSignOut}
                        className="text-[10px] uppercase tracking-widest font-bold text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50 hover:border-red-600 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h2 className="text-2xl font-serif italic text-slate-900 mb-4">Portal Access Required</h2>
                      <p className="text-slate-500 text-sm mb-6">Please sign in or create an account to start your application and save your progress.</p>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Step 2 */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} readOnly required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-slate-50 cursor-not-allowed text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Mobile Number (WhatsApp)</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Parent/Guardian Name</label>
                    <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Current School / College Name</label>
                    <input type="text" name="school" value={formData.school} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Current Grade / Standard</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} required className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent appearance-none rounded-none cursor-pointer">
                      <option value="" disabled>Select Grade</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                      <option value="dropper">Dropper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Target NEET Year</label>
                    <div className="flex gap-4 mt-3">
                      {['2025', '2026', '2027'].map(year => (
                        <label key={year} className="flex-1 cursor-pointer">
                          <input type="radio" name="targetYear" value={year} checked={formData.targetYear === year} onChange={handleChange} className="peer sr-only" required />
                          <div className="border border-slate-200 text-center py-3 text-sm font-mono peer-checked:border-slate-900 peer-checked:bg-slate-50 transition-all hover:bg-slate-50">
                            NEET {year}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="bg-slate-50 border border-slate-200 p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed font-mono">Note: Admission is confirmed only after fee payment. Only 4 seats remaining in Target NEET 2026 Batch Alpha.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block cursor-pointer relative">
                      <input type="radio" name="batch" value="alpha" checked={formData.batch === 'alpha'} onChange={handleChange} className="peer sr-only" required />
                      <div className="border border-slate-200 p-5 peer-checked:border-slate-900 peer-checked:shadow-[6px_6px_0px_#1A1A1A] transition-all hover:border-slate-900 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif italic text-xl text-slate-900">Target NEET 2026 - Alpha</h4>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 bg-amber-50 px-2 py-1">Filling Fast</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-mono">2-Year Comprehensive Program. Starts July 1st.</p>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-900 border-t border-slate-100 pt-4">
                          <span>Offline Mode</span>
                          <span>₹1,20,000 / yr</span>
                        </div>
                      </div>
                    </label>

                    <label className="block cursor-pointer relative">
                      <input type="radio" name="batch" value="crash" checked={formData.batch === 'crash'} onChange={handleChange} className="peer sr-only" required />
                      <div className="border border-slate-200 p-5 peer-checked:border-slate-900 peer-checked:shadow-[6px_6px_0px_#1A1A1A] transition-all hover:border-slate-900 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif italic text-xl text-slate-900">NEET Crash Course '25</h4>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-2 py-1">Open</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 font-mono">6-Month Intensive Revision. Starts December.</p>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-900 border-t border-slate-100 pt-4">
                          <span>Hybrid Mode</span>
                          <span>₹45,000</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-200">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="text-[11px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Back
                  </button>
                ) : <div></div>}
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_#1A1A1A]">
                  {step === 4 ? "Submit Application" : step === 1 && !isAuthenticated ? "Sign In / Register" : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
