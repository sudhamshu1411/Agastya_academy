import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Clock, Calendar, Video, CheckCircle2, User, CircleAlert, CalendarPlus, Users, Trash2, Edit, AlertCircle, Search, HelpCircle, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createMeetingEvent } from "../lib/calendar";
import { saveMeeting, updateMeeting, deleteMeeting, getMeetings, getBatches, subscribeToStore, syncAll } from "../lib/store";
import { fetchProfiles } from "../lib/users";
import { getAdmissions } from "../lib/admissions";

export function Scheduler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);

  const [meetingType, setMeetingType] = useState("Live Class");
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [targetSearch, setTargetSearch] = useState("");
  const [customTargetName, setCustomTargetName] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);

  // For editing
  const [editingMeetingId, setEditingMeetingId] = useState<string | number | null>(null);
  const [editLinkOption, setEditLinkOption] = useState("generate"); // "generate" or "manual"
  const [manualLink, setManualLink] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Physics");

  const subjects = [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "General/Mentoring"
  ];

  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>(getMeetings());
  const [globalBatches, setGlobalBatches] = useState<any[]>(getBatches());
  const [studentTargets, setStudentTargets] = useState<any[]>([
    { id: 's1', name: "Rahul Sharma", batch: "Target NEET 2026 - Alpha", email: "rahul@agastya.edu", lastPTM: "Recent" },
    { id: 's2', name: "Ananya Patel", batch: "Target NEET 2026 - Alpha", email: "ananya@agastya.edu", lastPTM: "Recent" },
    { id: 's3', name: "Priya Singh", batch: "Target NEET 2026 - Beta", email: "priya@agastya.edu", lastPTM: "Recent" },
  ]);

  const loadDynamicTargets = async () => {
    try {
      const [profiles, admissions] = await Promise.all([fetchProfiles(), getAdmissions()]);
      const combinedStudents: any[] = [];
      const seenEmails = new Set<string>();

      profiles
        .filter((u: any) => u.role === "student" || u.role === "new user")
        .forEach((u: any) => {
          const emailKey = (u.email || "").toLowerCase();
          if (emailKey) seenEmails.add(emailKey);
          const adm = admissions.find((a: any) => (a.email || "").toLowerCase() === emailKey);
          combinedStudents.push({
            id: u.id || u.email,
            name: u.fullName || adm?.studentName || u.email,
            email: u.email,
            batch: adm?.cohort || "Target NEET 2026 - Alpha",
            lastPTM: adm?.status || "Registered"
          });
        });

      admissions.forEach((a: any) => {
        const emailKey = (a.email || "").toLowerCase();
        if (emailKey && seenEmails.has(emailKey)) return;
        if (emailKey) seenEmails.add(emailKey);
        combinedStudents.push({
          id: a.id || a.email,
          name: a.studentName || a.email,
          email: a.email,
          batch: a.cohort || "Applicant",
          lastPTM: a.status || "Pending Review"
        });
      });

      if (combinedStudents.length > 0) {
        setStudentTargets(combinedStudents);
      }
    } catch (e) {
      console.warn("Could not load dynamic student targets:", e);
    }
  };

  useEffect(() => {
    syncAll();
    loadDynamicTargets();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      setNeedsAuth(!session?.provider_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user);
      setNeedsAuth(!session?.provider_token);
      setScheduledMeetings(getMeetings());
      setGlobalBatches(getBatches());
    });

    const unsubscribeStore = subscribeToStore(() => {
      setScheduledMeetings(getMeetings());
      setGlobalBatches(getBatches());
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeStore();
    };
  }, []);

  const handleLogin = async () => {
    setStatusMessage(null);
    try {
      setIsLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: window.location.href,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Login failed:', err);
      setStatusMessage({
        type: "error",
        text: `Failed to sign in with Google: ${err.message}`
      });
      setIsLoggingIn(false);
    }
  };

  const handleLogoutGoogle = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const rawTargets = meetingType === "Live Class" ? globalBatches : studentTargets;
  const targets = rawTargets.filter((t) =>
    (t.name || "").toLowerCase().includes(targetSearch.toLowerCase()) ||
    (t.batch || "").toLowerCase().includes(targetSearch.toLowerCase())
  );

  const handleAddCustomTarget = () => {
    if (!customTargetName.trim()) return;
    const customObj = {
      id: `custom-${Date.now()}`,
      name: customTargetName.trim(),
      batch: meetingType === "Live Class" ? "Custom Cohort" : "Individual Student",
      lastPTM: "Direct Entry"
    };
    setSelectedTarget(customObj);
    setCustomTargetName("");
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!selectedTarget || !meetingDate || !meetingTime) {
      setStatusMessage({ type: "error", text: "Please select a target, date, and start time." });
      return;
    }

    if (editLinkOption === "manual" && !manualLink.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a valid Google Meet URL or switch to Auto-Generate." });
      return;
    }

    const dateTimeString = `${meetingDate}T${meetingTime}:00`;
    let title = "";
    let description = "";

    if (meetingType === "Live Class") {
      title = `Live Class: ${selectedSubject} - ${selectedTarget.name}`;
      description = `Automated Live Class session for ${selectedTarget.name} (${selectedSubject}). Join below.`;
    } else if (meetingType === "PTM") {
      title = `PTM: ${selectedTarget.name} (${selectedSubject}) - Agastya Academy`;
      description = `Automated Parent-Teacher Meeting for ${selectedTarget.name} (${selectedSubject}). Join below.`;
    } else {
      title = `Interview: ${selectedTarget.name} (${selectedSubject})`;
      description = `Automated Admission/Academic Interview session for ${selectedTarget.name}. Join below.`;
    }

    if (editingMeetingId) {
      setIsScheduling(true);
      try {
        let finalLink = "";
        if (editLinkOption === "generate") {
          const eventData = await createMeetingEvent(title, description, dateTimeString, durationMinutes);
          finalLink = eventData.hangoutLink || "";
        } else {
          finalLink = manualLink.trim();
        }

        await updateMeeting(editingMeetingId, {
          title,
          type: meetingType,
          target: selectedTarget.name,
          subject: selectedSubject,
          date: meetingDate,
          time: meetingTime,
          durationMinutes: durationMinutes,
          link: finalLink || "No Link generated",
        });

        setScheduledMeetings(getMeetings());
        setEditingMeetingId(null);
        setSelectedTarget(null);
        setMeetingDate("");
        setMeetingTime("");
        setManualLink("");
        setSelectedSubject("Physics");
        setStatusMessage({ type: "success", text: "Session updated and synced across all portals." });
      } catch (error: any) {
        console.error("Editing failed: ", error);
        setStatusMessage({ type: "error", text: `Failed to update session: ${error.message}` });
      } finally {
        setIsScheduling(false);
      }
      return;
    }

    setIsScheduling(true);
    try {
      let finalLink = "";
      if (editLinkOption === "generate") {
        const eventData = await createMeetingEvent(title, description, dateTimeString, durationMinutes);
        finalLink = eventData.hangoutLink || "";
      } else {
        finalLink = manualLink.trim();
      }

      const newMeeting = {
        id: Date.now().toString(),
        title: title,
        type: meetingType,
        target: selectedTarget.name,
        subject: selectedSubject,
        date: meetingDate,
        time: meetingTime,
        durationMinutes: durationMinutes,
        link: finalLink || "No Link generated",
        completed: false
      };

      await saveMeeting(newMeeting);
      setScheduledMeetings(getMeetings());
      setSelectedTarget(null);
      setMeetingDate("");
      setMeetingTime("");
      setManualLink("");
      setSelectedSubject("Physics");
      setStatusMessage({
        type: "success",
        text: `Scheduled "${title}" and synced Google Meet link to Supabase.`
      });
    } catch (error: any) {
      console.error("Scheduling failed: ", error);
      setStatusMessage({ type: "error", text: `Failed to schedule meeting: ${error.message}` });
    } finally {
      setIsScheduling(false);
    }
  };

  const confirmDeleteMeeting = async () => {
    if (deleteTargetId === null) return;
    setStatusMessage(null);
    try {
      await deleteMeeting(deleteTargetId);
      setScheduledMeetings(getMeetings());
      setDeleteTargetId(null);
      setStatusMessage({ type: "success", text: "Meeting removed from schedule." });
    } catch (err: any) {
      setDeleteTargetId(null);
      setStatusMessage({ type: "error", text: `Failed to delete meeting: ${err.message}` });
    }
  };

  const startEdit = (meeting: any) => {
    setStatusMessage(null);
    setEditingMeetingId(meeting.id);
    setMeetingType(meeting.type);
    const pool = meeting.type === "Live Class" ? globalBatches : studentTargets;
    const targetObj = pool.find((t) => t.name === meeting.target) || { id: 'custom', name: meeting.target };
    setSelectedTarget(targetObj);
    setSelectedSubject(meeting.subject || "Physics");
    setMeetingDate(meeting.date);
    setMeetingTime(meeting.time);
    setDurationMinutes(meeting.durationMinutes || 30);
    if (meeting.link && meeting.link.startsWith("http")) {
      setEditLinkOption("manual");
      setManualLink(meeting.link);
    } else {
      setEditLinkOption("generate");
      setManualLink("");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Faculty, Admin, and Founder all have full scheduling & editing access
  const canSchedule =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/founder') ||
    location.pathname.startsWith('/faculty');

  const activeRoleLabel = location.pathname.startsWith('/founder')
    ? 'Founder Panel'
    : location.pathname.startsWith('/admin')
    ? 'Admin Console'
    : 'Faculty Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-white/20 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-serif italic text-2xl tracking-tighter leading-none hover:opacity-80 transition-opacity">Agastya</Link>
          <span className="h-4 w-px bg-white/30"></span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mt-1">
            {activeRoleLabel} · Central Scheduler
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          {user && (
            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
              <span className="text-xs font-mono opacity-60 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogin}
                className="text-[10px] uppercase tracking-widest font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="Refresh Google Calendar OAuth Token"
              >
                Reconnect Google
              </button>
              <button
                onClick={handleLogoutGoogle}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mb-2">
              {activeRoleLabel} · Google Calendar & Meet Engine
            </p>
            <h1 className="text-4xl font-serif italic text-slate-900 mb-2">Automation Scheduler</h1>
            <p className="text-slate-600 text-sm max-w-2xl">
              Create and edit Google Meet links for batch Live Classes, subject-specific Parent-Teacher Meetings (PTMs), and individual Student Interviews.
            </p>
          </div>
          <button
            onClick={() => setShowOAuthGuide(!showOAuthGuide)}
            className="px-4 py-2.5 border border-slate-900 bg-white text-slate-900 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" /> Google OAuth & Setup Guide
          </button>
        </div>

        {showOAuthGuide && (
          <div className="mb-8 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif italic text-xl text-slate-900">Google OAuth & Calendar Verification Checklist</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Required for Google Sign-In & Automatic Google Meet Link Generation</p>
              </div>
              <button onClick={() => setShowOAuthGuide(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700 leading-relaxed">
              <div className="border border-slate-200 p-4 bg-slate-50">
                <p className="font-bold uppercase tracking-widest text-[10px] text-slate-900 mb-2">1. Fix "Error 403: access_denied"</p>
                <p>
                  In <strong>Google Cloud Console → Google Auth Platform → Audience</strong>, either click <strong>Publish App</strong> (to exit Testing mode) OR add your email under <strong>Test users</strong>. Also enable the <strong>Google Calendar API</strong> in APIs & Services → Library.
                </p>
              </div>
              <div className="border border-slate-200 p-4 bg-slate-50">
                <p className="font-bold uppercase tracking-widest text-[10px] text-slate-900 mb-2">2. Authorized Redirect URIs</p>
                <p>
                  In <strong>Google Cloud Console → Clients</strong>, ensure your Supabase callback URL (<code className="font-mono text-[11px] bg-white px-1 border">https://&lt;project-ref&gt;.supabase.co/auth/v1/callback</code>) is listed under Authorized Redirect URIs.
                </p>
              </div>
              <div className="border border-slate-200 p-4 bg-slate-50">
                <p className="font-bold uppercase tracking-widest text-[10px] text-slate-900 mb-2">3. Supabase URL Configuration</p>
                <p>
                  In <strong>Supabase Dashboard → Authentication → URL Configuration</strong>, add this app's URL (<code className="font-mono text-[11px] bg-white px-1 border">{window.location.origin}/**</code>) to <strong>Redirect URLs</strong> so OAuth returns directly to the Scheduler.
                </p>
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className={`mb-8 p-4 border flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3 text-xs font-medium">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs font-bold uppercase tracking-widest ml-4 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {canSchedule && needsAuth ? (
          <div className="bg-white border border-slate-900 p-12 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-900">
              <CalendarPlus className="w-8 h-8 text-slate-900" />
            </div>
            <h2 className="text-2xl font-serif italic text-slate-900 mb-3">Google Calendar OAuth Required</h2>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              To schedule or edit Live Classes, PTMs, and Student Interviews with real Google Meet rooms, please authenticate with your Google account and grant Calendar event permissions.
            </p>
            
            <button 
              onClick={handleLogin} 
              disabled={isLoggingIn}
              className="w-full relative flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-all shadow-[4px_4px_0px_var(--color-slate-900)] disabled:opacity-50 cursor-pointer"
            >
              <div className="absolute left-5 bg-white p-1">
                <svg width="16" height="16" viewBox="0 0 48 48" className="block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              {isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}
            </button>

            <button
              onClick={() => setShowOAuthGuide(true)}
              className="mt-6 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Seeing "Access Blocked (Error 403)"? View Fix Instructions
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${canSchedule ? 'lg:grid-cols-3' : ''} gap-8`}>
            {/* Target List */}
            {canSchedule && (
            <div className="lg:col-span-1 bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-6 h-fit">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-3">1. Session Category</h3>
              <div className="grid grid-cols-3 gap-1.5 mb-6 bg-slate-100 p-1 border border-slate-200">
                {[
                  { id: "Live Class", label: "Live Class" },
                  { id: "PTM", label: "PTM" },
                  { id: "Interview", label: "Interview" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMeetingType(tab.id);
                      setSelectedTarget(null);
                    }}
                    className={`py-2 text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      meetingType === tab.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-3">
                2. Select {meetingType === "Live Class" ? "Cohort Batch" : "Student"}
              </h3>

              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  placeholder={`Filter ${meetingType === "Live Class" ? "batches" : "students"}...`}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {targets.map((target) => (
                  <div 
                    key={target.id} 
                    onClick={() => setSelectedTarget(target)}
                    className={`p-3.5 border cursor-pointer transition-colors ${
                      selectedTarget?.name === target.name
                        ? 'border-slate-900 bg-slate-100 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{target.name}</h4>
                    </div>
                    {meetingType !== "Live Class" ? (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>{target.batch}</span>
                        <span>{target.lastPTM}</span>
                      </div>
                    ) : (
                      target.syllabus && (
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Focus: {target.syllabus}</p>
                      )
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                  Or Enter Custom {meetingType === "Live Class" ? "Batch" : "Student Name"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTargetName}
                    onChange={(e) => setCustomTargetName(e.target.value)}
                    placeholder={meetingType === "Live Class" ? "e.g. Crash Batch 2026" : "e.g. Vikram Aditya"}
                    className="flex-1 border border-slate-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTarget}
                    className="px-3 py-2 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Scheduler Form */}
            <div className={`${canSchedule ? 'lg:col-span-2' : 'col-span-1'} space-y-8`}>
              {canSchedule && (
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                    <CalendarPlus className="w-4 h-4"/> {editingMeetingId ? "Edit Scheduled Session" : "Configure Google Meet Session"}
                  </h3>
                  {editingMeetingId && (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-1 border border-amber-300 font-bold">
                      Editing Mode
                    </span>
                  )}
                </div>
                
                {selectedTarget ? (
                  <form onSubmit={handleSchedule} className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center shrink-0">
                          {meetingType === "Live Class" ? <Users className="w-5 h-5"/> : <User className="w-5 h-5"/>}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                            {meetingType} Target ({meetingType === "Live Class" ? "Batch" : "Individual Student"})
                          </p>
                          <p className="font-serif italic text-xl text-slate-900 leading-none">{selectedTarget.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Subject:</label>
                        <select 
                          value={selectedSubject} 
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="bg-white border border-slate-900 px-3 py-1.5 focus:outline-none text-slate-900 text-xs font-mono font-bold uppercase tracking-wider"
                        >
                          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Date</label>
                        <input 
                          type="date" 
                          required
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent tabular-nums" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Start Time</label>
                        <input 
                          type="time" 
                          required
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent tabular-nums" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Duration (mins)</label>
                        <input 
                          type="number" 
                          required
                          min="15"
                          step="15"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent tabular-nums" 
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 mt-6">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-4">Google Meet Link Provisioning</label>
                      <div className="flex flex-wrap gap-6 mb-4">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                          <input 
                            type="radio" 
                            name="linkOption" 
                            value="generate" 
                            checked={editLinkOption === "generate"} 
                            onChange={() => setEditLinkOption("generate")} 
                            className="accent-slate-900"
                          />
                          Auto-Generate via Google Calendar API
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                          <input 
                            type="radio" 
                            name="linkOption" 
                            value="manual" 
                            checked={editLinkOption === "manual"} 
                            onChange={() => setEditLinkOption("manual")} 
                            className="accent-slate-900"
                          />
                          Paste / Edit Custom Google Meet Link
                        </label>
                      </div>
                      
                      {editLinkOption === "manual" && (
                        <div>
                          <input 
                            type="url" 
                            required
                            placeholder="https://meet.google.com/abc-defg-hij"
                            value={manualLink}
                            onChange={(e) => setManualLink(e.target.value)}
                            className="w-full border border-slate-900 px-4 py-3 focus:outline-none transition-colors font-mono text-sm bg-slate-50" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        type="submit" 
                        disabled={isScheduling}
                        className="flex-1 bg-slate-900 text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_var(--color-slate-900)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isScheduling ? 'Saving to Supabase...' : editingMeetingId ? 'Update Session & Link' : `Schedule ${meetingType}`}
                      </button>
                      
                      {editingMeetingId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingMeetingId(null);
                            setSelectedTarget(null);
                            setMeetingDate("");
                            setMeetingTime("");
                            setManualLink("");
                            setEditLinkOption("generate");
                            setSelectedSubject("Physics");
                          }}
                          disabled={isScheduling}
                          className="px-8 py-4 bg-slate-100 text-slate-700 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-200 transition-colors border border-slate-300 disabled:opacity-50 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200">
                    <CircleAlert className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">
                      Select a {meetingType === "Live Class" ? "Cohort Batch" : "Student"} from the left panel to schedule or edit a {meetingType}.
                    </p>
                  </div>
                )}
              </div>
              )}

              {/* Scheduled Meetings Log */}
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4"/> Global Schedule Registry ({scheduledMeetings.length})
                  </h3>
                </div>
                
                {scheduledMeetings.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-slate-300 text-slate-500 text-xs font-mono">
                    No sessions scheduled yet. Create a Live Class, PTM, or Interview above.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                    {scheduledMeetings.map((meeting) => (
                      <div key={meeting.id} className="border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-400 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">
                            <span>{meeting.type}</span>
                            <span>·</span>
                            <span>{meeting.subject || "Physics"}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">{meeting.durationMinutes} mins</span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm mb-1">{meeting.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono tabular-nums">
                            Target: {meeting.target} · {meeting.date} at {meeting.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {meeting.link && meeting.link.startsWith("http") ? (
                            <a 
                              href={meeting.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-emerald-50 text-emerald-800 px-4 py-2 border border-emerald-300 text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Meet
                            </a>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 px-4 py-2 border border-slate-200 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 whitespace-nowrap">
                              <Video className="w-3.5 h-3.5" /> No Link
                            </span>
                          )}
                          
                          {canSchedule && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(meeting)}
                                className="p-2 border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                                title="Edit Session & Meet Link"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(meeting.id)}
                                className="p-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-sm w-full p-8">
            <h3 className="font-serif italic text-2xl text-slate-900 mb-2">Delete Scheduled Session?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will permanently remove the session from Supabase and all connected dashboards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 border border-slate-300 text-slate-700 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMeeting}
                className="flex-1 bg-red-600 text-white py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
