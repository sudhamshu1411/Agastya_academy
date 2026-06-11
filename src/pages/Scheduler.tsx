import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Calendar, Video, CheckCircle2, ChevronRight, User, CircleAlert, MonitorPlay, CalendarPlus, Users, Trash2, Edit } from "lucide-react";
import { supabase } from "../lib/supabase";
import { createMeetingEvent } from "../lib/calendar";
import { saveMeeting, updateMeeting, deleteMeeting, getMeetings, getBatches } from "../lib/store";

export function Scheduler() {
  const navigate = useNavigate();
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const [meetingType, setMeetingType] = useState("PTM");
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  // For editing
  const [editingMeetingId, setEditingMeetingId] = useState<string | number | null>(null);
  const [editLinkOption, setEditLinkOption] = useState("generate"); // or "manual"
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      setNeedsAuth(!session?.provider_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user);
      setNeedsAuth(!session?.provider_token);
      setScheduledMeetings([...getMeetings()]);
    });

    const interval = setInterval(() => {
      setScheduledMeetings([...getMeetings()]);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: window.location.href,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Login failed:', err);
      alert(`Failed to sign in with Google: ${err.message}`);
      setIsLoggingIn(false);
    }
  };

  const handleLogoutGoogle = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  const students = [
    { id: 1, name: "Rahul Sharma", batch: "Target NEET 2026 - Alpha", lastPTM: "2026-04-15" },
    { id: 2, name: "Ananya Patel", batch: "Target NEET 2026 - Alpha", lastPTM: "2026-03-22" },
    { id: 4, name: "Priya Singh", batch: "Target NEET 2026 - Alpha", lastPTM: "2026-05-10" },
  ];

  const targets = meetingType === "Live Class" ? globalBatches : students;

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !meetingDate || !meetingTime) return;

    if (editingMeetingId) {
      let finalLink = "";
      setIsScheduling(true);
      try {
        if (editLinkOption === "generate") {
          const dateTimeString = `${meetingDate}T${meetingTime}:00`;
          let title = meetingType === "Live Class" ? `Live Class: ${selectedSubject} - ${selectedTarget.name}` : `Meeting: ${selectedTarget.name}`;
          if (meetingType === 'PTM') title = `PTM: ${selectedTarget.name} (${selectedSubject})`;
          const eventData = await createMeetingEvent(title, "Edited automated meeting", dateTimeString, durationMinutes);
          finalLink = eventData.hangoutLink || "";
        } else {
          finalLink = manualLink;
        }

        await updateMeeting(editingMeetingId, {
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
      } catch (error: any) {
        console.error("Editing failed: ", error);
        alert(`Failed to edit meeting: ${error.message}`);
      } finally {
        setIsScheduling(false);
      }
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to schedule a ${durationMinutes}-minute ${meetingType} with ${selectedTarget.name}?`
    );
    if (!confirmed) return;
    
    const dateTimeString = `${meetingDate}T${meetingTime}:00`;
    let title = "";
    let description = "";
    
    if (meetingType === "Live Class") {
       title = `Live Class: ${selectedSubject} - ${selectedTarget.name}`;
       description = `Automated Live Class session for ${selectedTarget.name} (${selectedSubject}). Join below.`;
    } else if (meetingType === "PTM") {
       title = `PTM: ${selectedTarget.name} (${selectedSubject}) - Agastya Academy`;
       description = `Automated Parent-Teacher Meeting for ${selectedTarget.name}. Join below.`;
    } else {
       title = `Interview: ${selectedTarget.name}`;
       description = `Automated Interview session for ${selectedTarget.name}. Join below.`;
    }

    setIsScheduling(true);
    let finalLink = "";
    try {
      if (editLinkOption === "generate") {
        const eventData = await createMeetingEvent(title, description, dateTimeString, durationMinutes);
        finalLink = eventData.hangoutLink || "";
      } else {
        finalLink = manualLink;
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
      setScheduledMeetings(getMeetings()); // refresh from store
      setSelectedTarget(null);
      setMeetingDate("");
      setMeetingTime("");
      setManualLink("");
      setSelectedSubject("Physics");
    } catch (error: any) {
      console.error("Scheduling failed: ", error);
      alert(`Failed to schedule meeting: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(id);
      setScheduledMeetings(getMeetings());
    }
  };

  const startEdit = (meeting: any) => {
    setEditingMeetingId(meeting.id);
    setMeetingType(meeting.type);
    // Try to find the target object
    let targetObj = targets.find(t => t.name === meeting.target) || { id: 'custom', name: meeting.target };
    setSelectedTarget(targetObj);
    setSelectedSubject(meeting.subject || "Physics");
    setMeetingDate(meeting.date);
    setMeetingTime(meeting.time);
    setDurationMinutes(meeting.durationMinutes);
    if (meeting.link && meeting.link.includes("meet.google.com")) {
      setEditLinkOption("generate");
    } else {
      setEditLinkOption("manual");
      setManualLink(meeting.link === "No Link generated" ? "" : meeting.link);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canSchedule = location.pathname.startsWith('/admin') || location.pathname.startsWith('/founder');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-white/20 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-serif italic text-2xl tracking-tighter leading-none hover:opacity-80 transition-opacity">Agastya</Link>
          <span className="h-4 w-px bg-white/30"></span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 mt-1">Workspace // Scheduler</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-6">
              <button onClick={() => navigate(-1)} className="text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-white transition-colors">
                ← Back
              </button>
              <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                <span className="text-xs font-mono opacity-60 hidden sm:inline">{user.email}</span>
                {canSchedule && <button onClick={handleLogoutGoogle} className="text-[10px] uppercase tracking-widest font-bold text-slate-300 hover:text-white transition-colors">Sign Out</button>}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        
        <div className="mb-12">
          <h1 className="text-4xl font-serif italic text-slate-900 mb-4">Automation Scheduler</h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            {canSchedule ? "Schedule Live Classes, PTMs, and Interviews directly to your Google Calendar. This tool automatically generates unique Google Meet links and syncs them across all dashboards." : "View the schedule of Live Classes, PTMs, and Interviews below."}
          </p>
        </div>

        {canSchedule && needsAuth ? (
          <div className="bg-white border border-slate-900 p-12 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarPlus className="w-8 h-8 text-slate-900" />
            </div>
            <h2 className="text-2xl font-serif italic text-slate-900 mb-4">Calendar Access Required</h2>
            <p className="text-slate-600 text-sm mb-8">
              Sign in with your Google account to enable automated scheduling and Google Meet link generation.
            </p>
            
            <button 
              onClick={handleLogin} 
              disabled={isLoggingIn}
              className="w-full relative flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded shadow-sm text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
            >
              <div className="absolute left-4">
                <svg width="18" height="18" viewBox="0 0 48 48" className="block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${canSchedule ? 'lg:grid-cols-3' : ''} gap-8`}>
            {/* Target List */}
            {canSchedule && (
            <div className="lg:col-span-1 bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-6 h-fit">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-4">Event Type</h3>
              <select 
                 className="w-full border-b border-slate-300 py-2 mb-6 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                 value={meetingType}
                 onChange={(e) => { setMeetingType(e.target.value); setSelectedTarget(null); }}
              >
                 <option value="PTM">Parent-Teacher Meeting</option>
                 <option value="Live Class">Live Class</option>
                 <option value="Interview">Student Interview</option>
              </select>

              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Select Target</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {targets.map(target => (
                  <div 
                    key={target.id} 
                    onClick={() => setSelectedTarget(target)}
                    className={`p-4 border cursor-pointer transition-colors ${selectedTarget?.id === target.id ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{target.name}</h4>
                    </div>
                    {meetingType !== "Live Class" && (
                      <>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-3">{(target as any).batch}</p>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                          <Clock className="w-3 h-3" /> Last PTM: {(target as any).lastPTM}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Scheduler Form */}
            <div className={`${canSchedule ? 'lg:col-span-2' : 'col-span-1'} space-y-8`}>
              {canSchedule && (
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3">
                  <CalendarPlus className="w-4 h-4"/> Schedule Session
                </h3>
                
                {selectedTarget ? (
                  <form onSubmit={handleSchedule} className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 p-4 flex gap-4 items-center mb-8">
                      <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center shrink-0">
                        {meetingType === "Live Class" ? <Users className="w-5 h-5"/> : <User className="w-5 h-5"/>}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Target {meetingType === "Live Class" ? "Batch" : "Student"}</p>
                        <p className="font-serif italic text-lg text-slate-900 leading-none mb-2">{selectedTarget.name}</p>
                        <div className="flex gap-2 items-center text-sm mt-3">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Subject:</label>
                          <select 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-transparent border-b border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 font-medium pb-1"
                          >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
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
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Start Time</label>
                        <input 
                          type="time" 
                          required
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent" 
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
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                          className="w-full border-b border-slate-300 py-3 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent" 
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 mt-6">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-4">Meeting Link Option</label>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="linkOption" 
                            value="generate" 
                            checked={editLinkOption === "generate"} 
                            onChange={() => setEditLinkOption("generate")} 
                            className="accent-slate-900"
                          />
                          Auto-Generate via Google Calendar
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="linkOption" 
                            value="manual" 
                            checked={editLinkOption === "manual"} 
                            onChange={() => setEditLinkOption("manual")} 
                            className="accent-slate-900"
                          />
                          Manual Link
                        </label>
                      </div>
                      
                      {editLinkOption === "manual" && (
                        <div>
                          <input 
                            type="url" 
                            placeholder="https://meet.google.com/xyz-abcd-efg"
                            value={manualLink}
                            onChange={(e) => setManualLink(e.target.value)}
                            className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm bg-transparent" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button 
                        type="submit" 
                        disabled={isScheduling}
                        className="flex-1 bg-slate-900 text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_var(--color-slate-900)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isScheduling ? 'Saving...' : editingMeetingId ? 'Update Session' : `Book ${durationMinutes}-Min Session`}
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
                         className="px-8 py-4 bg-slate-100 text-slate-700 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-slate-200 transition-colors border border-slate-300 disabled:opacity-50"
                       >
                         Cancel
                       </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200">
                    <CircleAlert className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Select a target from the list to schedule a {meetingType}.</p>
                  </div>
                )}
              </div>
              )}

              {/* Scheduled Meetings Log */}
              {scheduledMeetings.length > 0 && (
                <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4"/> Global Schedule Log
                  </h3>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {scheduledMeetings.map(meeting => (
                      <div key={meeting.id} className="border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1 block">
                            {meeting.type} • {meeting.durationMinutes} mins
                          </span>
                          <p className="font-bold text-slate-900 text-sm mb-1">{meeting.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2 md:mb-0">
                            {meeting.date} at {meeting.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {meeting.link && meeting.link.startsWith("http") ? (
                            <a 
                              href={meeting.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-emerald-50 text-emerald-700 px-4 py-2 border border-emerald-200 text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
                            >
                              <Video className="w-3 h-3" /> Meet Link
                            </a>
                          ) : (
                            <button 
                              onClick={() => alert("Meeting link is not generated for this session.")}
                              className="bg-slate-100 text-slate-400 px-4 py-2 border border-slate-200 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 cursor-not-allowed"
                            >
                              <Video className="w-3 h-3" /> No Link
                            </button>
                          )}
                          
                          {canSchedule && (
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(meeting)} className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(meeting.id)} className="p-2 border border-slate-200 text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
