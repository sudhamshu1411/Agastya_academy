import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../lib/auth";

import { BookOpen, Calendar, Clock, LogOut, CheckCircle2, Circle, Activity, FileText, ChevronRight, AlertCircle, Bell, CreditCard, UserCheck, Download, Menu, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { motion } from "motion/react";
import { getMaterials, getAssessments, getNotices, getMeetings, getAttendanceLogs, getStudentAttendancePercentage } from "../lib/store";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function StudentDashboard() {
  const userRole = localStorage.getItem("userRole") || "student";
  const userFullName = localStorage.getItem("userFullName") || "Rahul Sharma";
  const userEmail = localStorage.getItem("userEmail") || "student@agastya.edu";
  const [activeTab, setActiveTab] = useState(userRole === "new user" ? "demo_dashboard" : "dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch(e) {
      console.error(e);
    }
    localStorage.clear();
    navigate("/");
  };

  const [materials, setMaterials] = useState(getMaterials());
  const [assessments, setAssessments] = useState(getAssessments());
  const [notices, setNotices] = useState(getNotices());
  const [meetings, setMeetings] = useState(getMeetings());
  const [viewingMaterial, setViewingMaterial] = useState<any>(null);
  const [viewingExam, setViewingExam] = useState<any>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<string|null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  useEffect(() => {
    setMaterials(getMaterials());
    setAssessments(getAssessments());
    setNotices(getNotices());
    setMeetings(getMeetings());
    
    const handleStorageChange = () => {
      setMeetings(getMeetings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isDemo = userRole === "new user" && activeTab.startsWith("demo_");
  const displayedTab = activeTab.replace("demo_", "");

  const [tasks, setTasks] = useState([
    { id: 1, time: "06:00 AM", title: "Formula Revision: Mechanics", type: "Self Study", completed: true, active: false },
    { id: 2, time: "09:00 AM", title: "Live Class: Rotational Dynamics", type: "Lecture", completed: false, active: true },
    { id: 3, time: "02:00 PM", title: "DPP-14: Rotational Motion (30 MCQs)", type: "Assignment", completed: false, active: false },
    { id: 4, time: "07:00 PM", title: "PYQ Practice (2018-2023)", type: "Evaluation", completed: false, active: false },
  ]);

  const performanceData = [
    { day: "01", score: 65, accuracy: 70 },
    { day: "05", score: 68, accuracy: 72 },
    { day: "10", score: 74, accuracy: 75 },
    { day: "15", score: 72, accuracy: 74 },
    { day: "20", score: 80, accuracy: 82 },
    { day: "25", score: 85, accuracy: 84 },
    { day: "30", score: 88, accuracy: 86 },
  ];

  const timeData = [
    { subject: "Mechanics", hours: 45 },
    { subject: "Electrodynamics", hours: 32 },
    { subject: "Thermodynamics", hours: 26 },
    { subject: "Modern Physics", hours: 18 },
  ];

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b'];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed, active: false };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar ERP Menu */}
      <aside className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col fixed md:sticky top-0 ${isMobileMenuOpen ? 'h-screen' : 'h-auto'} md:h-screen z-40 border-r border-slate-900 transition-all`}>
        <div className="p-6 border-b border-white/20 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-white font-serif italic text-xl tracking-tighter leading-none">Agastya</h1>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold mt-1">Portal</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        <div className={`flex-1 flex col flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex overflow-y-auto`}>
          <div className="flex-1 py-6 px-4 space-y-1 text-sm font-medium">
            {userRole === "new user" && (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Portal Access</div>
                <NavItem active={activeTab === "pending"} onClick={() => { setActiveTab("pending"); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Pending Status" />
                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Preview</div>
                <NavItem active={activeTab === "demo_dashboard"} onClick={() => { setActiveTab("demo_dashboard"); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Demo Dashboard" />
                <NavItem active={activeTab === "demo_activities"} onClick={() => { setActiveTab("demo_activities"); setIsMobileMenuOpen(false); }} icon={<Calendar className="w-4 h-4"/>} label="Demo Live & Tasks" />
                <NavItem active={activeTab === "demo_materials"} onClick={() => { setActiveTab("demo_materials"); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Demo Materials" />
                <NavItem active={activeTab === "demo_exams"} onClick={() => { setActiveTab("demo_exams"); setIsMobileMenuOpen(false); }} icon={<Clock className="w-4 h-4"/>} label="Demo Exams" />
                <NavItem active={activeTab === "demo_analytics"} onClick={() => { setActiveTab("demo_analytics"); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Demo Performance" />
              </>
            )}

            {userRole !== "new user" && (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Academics</div>
                <NavItem active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Dashboard" />
                <NavItem active={activeTab === "activities"} onClick={() => { setActiveTab("activities"); setIsMobileMenuOpen(false); }} icon={<Calendar className="w-4 h-4"/>} label="Live & Tasks" />
                <NavItem active={activeTab === "materials"} onClick={() => { setActiveTab("materials"); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Study Materials" />
                
                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Evaluation</div>
                <NavItem active={activeTab === "exams"} onClick={() => { setActiveTab("exams"); setIsMobileMenuOpen(false); }} icon={<Clock className="w-4 h-4"/>} label="Exams & Quizzes" />
                <NavItem active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Performance" />
                
                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Administration</div>
                <NavItem active={activeTab === "attendance"} onClick={() => { setActiveTab("attendance"); setIsMobileMenuOpen(false); }} icon={<UserCheck className="w-4 h-4"/>} label="Attendance" />
                <NavItem active={activeTab === "payments"} onClick={() => { setActiveTab("payments"); setIsMobileMenuOpen(false); }} icon={<CreditCard className="w-4 h-4"/>} label="Payments" />
                <Link to="/admin/schedule" onClick={() => setIsMobileMenuOpen(false)}>
                  <NavItem icon={<Calendar className="w-4 h-4"/>} label="Central Scheduler" />
                </Link>
              </>
            )}
          </div>
          
          <RoleSwitcher />
          <div className="p-4 border-t border-white/20">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-white/60 hover:text-white transition-colors text-[11px] uppercase tracking-widest font-semibold text-left">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 lg:ml-0 md:ml-0 mt-[70px] md:mt-0">
        <header className="flex justify-between items-end mb-10 border-b border-slate-900 pb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Welcome back,</p>
            <h2 className="text-4xl font-serif text-slate-900 italic">{userFullName}</h2>
            {userRole !== "new user" && (
                <p className="text-sm font-mono text-slate-600 mt-2 border border-slate-900 inline-block px-2 py-0.5">ID: TRG-26-X15</p>
            )}
          </div>
          {userRole !== "new user" && (
              <div className="hidden text-right md:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Attendance</p>
                <p className="text-3xl font-serif italic text-slate-900">98.5%</p>
              </div>
          )}
        </header>

        {userRole === "new user" && activeTab === "pending" && (
            <div className="bg-amber-50 border border-amber-200 p-8 shadow-[8px_8px_0px_#1A1A1A] mt-10 text-center">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif italic text-amber-900 mb-2">Account Pending Verification</h3>
              <p className="text-amber-700 text-sm max-w-md mx-auto">
                Your portal access is currently pending approval. Please wait for an administrator or founder to assign you the correct access role.
              </p>
            </div>
        )}

        {isDemo && (
             <div className="bg-blue-50 border border-blue-200 p-4 shadow-[4px_4px_0px_#1A1A1A] text-blue-900 flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 opacity-80" />
                 <p className="text-sm font-bold">Demo Mode: This is a restricted preview of the student portal.</p>
               </div>
             </div>
        )}

        <div className={isDemo ? "opacity-80 pointer-events-none select-none" : ""}>

        {notices.length > 0 && (
          <div className="bg-slate-900 text-white p-4 mb-8 shadow-[6px_6px_0px_#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                 <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400 mb-1">Latest Global Notice</p>
                 <p className="text-sm font-medium">{notices[0].msg}</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">{notices[0].time}</span>
          </div>
        )}

        {displayedTab === "dashboard" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
            
            {/* Live Class Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A] border border-slate-900 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 border border-slate-700 rounded-full opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="inline-flex items-center gap-2 px-2 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 bg-red-500 animate-pulse"></span> Starting in 15 mins
                  </span>
                  <h3 className="text-2xl font-serif italic mb-2">Rotational Dynamics - Advanced Problem Solving</h3>
                  <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-8">Faculty: R.P Kumar</p>
                  
                  <button 
                    onClick={() => {
                      alert("Opening Google Meet room for Rotational Dynamics...");
                      window.open("https://meet.new", "_blank");
                    }}
                    className="bg-white text-slate-900 px-6 py-3 font-bold shadow hover:bg-slate-200 transition-colors flex items-center gap-2 text-[11px] uppercase tracking-widest"
                  >
                    Join Google Meet <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
                <div className="hidden sm:flex flex-col items-end text-slate-400 text-xs font-mono tracking-widest">
                  <span className="font-bold text-white">09:00 AM</span>
                  <span className="opacity-50">11:30 AM</span>
                </div>
              </div>
            </motion.div>

            {/* Daily Micro Schedule */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4"/> Daily Micro-Schedule
                </span>
                <span className="h-px flex-1 bg-slate-900"></span>
              </div>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A]"
              >
                {tasks.map(task => (
                  <motion.div key={task.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <TaskItem 
                      time={task.time} 
                      title={task.title} 
                      type={task.type} 
                      completed={task.completed} 
                      active={task.active}
                      onToggle={() => toggleTask(task.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Performance Snapshot */}
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
              <h3 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-[0.3em]">Performance Snapshot</h3>
              
              <div className="space-y-6">
                <StatBar label="Physics Aggregate" value={82} color="bg-slate-900" />
                <StatBar label="Daily Quizzes" value={95} color="bg-slate-600" />
                <StatBar label="Test Series (Grand)" value={78} color="bg-slate-400" />
              </div>
              
              <button onClick={() => setActiveTab('analytics')} className="w-full mt-8 py-3 border border-slate-900 text-[11px] uppercase tracking-widest font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors">
                View Full Analytics
              </button>
            </div>

            {/* Recent Uploads */}
            {(displayedTab === "dashboard" || displayedTab === "materials") && (
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
              <h3 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-[0.3em]">Recent Materials</h3>
              <div className="space-y-4">
                {materials.slice(0, 4).map((m: any) => (
                  <MaterialItem key={m.id} title={String(m.title)} date={String(m.date || "Today")} onClick={() => setViewingMaterial(m)} />
                ))}
              </div>
            </div>
            )}

          </div>
        </div>
        </div>
        )}

        {/* Isolated Live & Tasks View */}
        {displayedTab === "activities" && (
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4"/> Active Command Center
                </span>
                <span className="h-px flex-1 bg-slate-900"></span>
              </div>
              
              {/* Live Classes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {meetings.map((meeting: any, idx: number) => (
                  <motion.div 
                    key={meeting.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={idx === 0 ? "bg-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A] border border-slate-900 text-white relative overflow-hidden" : "bg-white p-8 shadow-[8px_8px_0px_#1A1A1A] border border-slate-900 relative"}
                  >
                    {idx === 0 && <div className="absolute top-0 right-0 w-32 h-32 border border-slate-700 rounded-full opacity-50 -mr-10 -mt-10 pointer-events-none"></div>}
                    <div className="flex items-start justify-between relative z-10 flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        {idx === 0 ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 bg-red-500 animate-pulse"></span> Starting Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-widest mb-6">
                            Upcoming
                          </span>
                        )}
                        <h3 className={`text-2xl font-serif italic ${idx === 0 ? 'mb-2' : 'text-slate-900 mb-2'}`}>{meeting.title}</h3>
                        <p className={`${idx === 0 ? 'text-slate-400' : 'text-slate-500'} text-xs font-mono uppercase tracking-widest mb-8`}>
                           Target: {meeting.target}
                        </p>
                        
                        <button 
                          onClick={() => meeting.link && meeting.link !== "No Link generated" ? window.open(meeting.link, "_blank") : null}
                          disabled={!meeting.link || meeting.link === "No Link generated"}
                          className={idx === 0 ? "bg-white text-slate-900 px-6 py-3 font-bold shadow hover:bg-slate-200 transition-colors flex items-center gap-2 text-[11px] uppercase tracking-widest disabled:opacity-50" : "bg-slate-100 text-slate-900 px-6 py-3 font-bold shadow flex items-center gap-2 text-[11px] uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-50"}
                        >
                          Join Session <ChevronRight className="w-4 h-4"/>
                        </button>
                      </div>
                      <div className={`flex flex-col items-start md:items-end ${idx === 0 ? 'text-slate-400 text-white' : 'text-slate-500 text-slate-900'} text-xs font-mono tracking-widest shrink-0`}>
                        <span className="font-bold">{meeting.time}</span>
                        <span className="opacity-50">{meeting.durationMinutes} mins</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Comprehensive Task Manager */}
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 px-4 md:px-0">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-1">Master Task Register</h3>
                    <p className="text-xs text-slate-500 font-mono tracking-widest">Today's Agenda</p>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1">
                      {tasks.filter(t => t.completed).length} Completed
                    </span>
                    <span className="border border-slate-200 bg-slate-50 px-2 py-1">
                      {tasks.filter(t => !t.completed).length} Pending
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {tasks.map((task, idx) => (
                    <motion.div 
                      key={task.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border p-4 md:p-6 transition-all flex flex-col md:flex-row md:items-center gap-6 justify-between cursor-pointer group ${
                        task.completed ? 'border-slate-200 bg-slate-50/50' : 
                        task.active ? 'border-slate-900 shadow-[4px_4px_0px_#1A1A1A] bg-white' : 'border-slate-300 hover:border-slate-900 bg-white'
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-start md:items-center gap-6 flex-1">
                         <div className="w-16 shrink-0 pt-1 md:pt-0">
                           <span className={`font-mono text-xs ${task.completed ? 'text-slate-400' : task.active ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                             {task.time}
                           </span>
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                             <span className={`text-[9px] uppercase tracking-widest font-bold px-2 border ${
                               task.type === 'Live Class' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                               task.type === 'Self Study' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                               task.type === 'Evaluation' ? 'bg-red-50 text-red-900 border-red-200' :
                               'bg-slate-100 text-slate-600 border-slate-200'
                             }`}>
                               {task.type}
                             </span>
                             {task.active && !task.completed && (
                               <span className="text-[9px] uppercase tracking-widest font-bold text-red-500 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> In Progress
                               </span>
                             )}
                           </div>
                           <h4 className={`text-sm md:text-base ${
                             task.completed ? 'text-slate-400 line-through' :
                             task.active ? 'text-slate-900 font-bold' : 'text-slate-800 font-medium'
                           }`}>
                             {task.title}
                           </h4>
                         </div>
                      </div>
                      
                      <div className="pl-22 md:pl-0 shrink-0 flex items-center gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 border transition-colors ${
                          task.completed ? 'bg-slate-900 border-slate-900 text-white' :
                          'bg-transparent border-slate-300 group-hover:border-slate-900 text-transparent'
                        }`}>
                          <CheckCircle2 className={`w-4 h-4 md:w-5 md:h-5 ${task.completed ? 'text-white' : 'text-slate-200 group-hover:text-slate-300'}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {displayedTab === "analytics" && (
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4"/> 30-Day Analytics
            </span>
            <span className="h-px flex-1 bg-slate-900"></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trends */}
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em]">Performance Score Trends</h3>
                <span className="text-[10px] font-mono text-slate-500">Last 30 Days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Trends */}
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em]">Accuracy Rate</h3>
                <span className="text-[10px] font-mono text-slate-500">Last 30 Days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#334155" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} domain={[50, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#334155" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Time Spent */}
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A] lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em]">Time Investment by Subject</h3>
                <span className="text-[10px] font-mono text-slate-500">Cumulative Hours</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="hours" fill="#0f172a" radius={[2, 2, 0, 0]}>
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Isolated Materials View */}
        {displayedTab === "materials" && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4"/> Full Study Library
              </span>
              <span className="h-px flex-1 bg-slate-900"></span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((m: any) => (
                <div key={m.id} onClick={() => setViewingMaterial(m)} className="bg-white border border-slate-900 shadow-[4px_4px_0px_#1A1A1A] p-6 hover:-translate-y-1 transition-transform cursor-pointer">
                  <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center mb-4"><BookOpen className="w-5 h-5"/></div>
                  <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{m.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Added: {m.date || "Just now"} • {m.size}</p>
                  <div className="w-full bg-slate-100 h-1"><div className="bg-slate-900 h-full w-[100%]"></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams & Quizzes View */}
        {displayedTab === "exams" && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4"/> Assessment Center
              </span>
              <span className="h-px flex-1 bg-slate-900"></span>
            </div>

            {/* Upcoming Quizzes */}
            <div className="mb-12">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Upcoming Scheduled</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessments.map((asm: any, idx: number) => (
                  <motion.div 
                    key={asm.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className={`border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-6 ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold mb-3 ${idx === 0 ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {idx === 0 ? 'Live Active' : asm.due}
                        </span>
                        <h4 className={`font-serif italic text-xl mb-1 ${idx === 0 ? '' : 'text-slate-900'}`}>{asm.title}</h4>
                        <p className={`text-[10px] font-mono tracking-widest uppercase ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>ID: ASM-{asm.id.toString().slice(-4)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-serif italic ${idx === 0 ? '' : 'text-slate-900'}`}>{asm.type === 'Quiz' ? '1:00:00' : 'No Limit'}</p>
                        <p className={`text-[9px] uppercase tracking-widest ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>Time Limit</p>
                      </div>
                    </div>
                    <div className={`flex justify-between items-center pt-6 border-t ${idx === 0 ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-xs uppercase tracking-widest font-bold ${idx === 0 ? 'text-slate-300' : 'text-slate-600'}`}>{asm.batch}</span>
                      <button onClick={() => setViewingExam(asm)} className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${idx === 0 ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                        {idx === 0 ? 'Enter Exam' : 'View'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Past Performance / Results */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Recent Results</h3>
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">Date</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">Assessment Name</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">Subject</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-500">Score</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">May 25, 2026</td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">Unit Test: Integration</td>
                      <td className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-600">Mathematics</td>
                      <td className="py-4 px-6 text-sm font-mono font-bold text-emerald-700">85/100</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setViewingAnalysis("Unit Test: Integration")} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-slate-900 transition-colors">View Analysis</button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">May 18, 2026</td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">Minor Test 4</td>
                      <td className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-600">Aggregate</td>
                      <td className="py-4 px-6 text-sm font-mono font-bold text-slate-700">210/300</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setViewingAnalysis("Minor Test 4")} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-slate-900 transition-colors">View Analysis</button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">May 10, 2026</td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">Weekly Quiz (Electrodynamics)</td>
                      <td className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-600">Physics</td>
                      <td className="py-4 px-6 text-sm font-mono font-bold text-red-600">45/100</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => setViewingAnalysis("Weekly Quiz (Electrodynamics)")} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-slate-900 transition-colors">View Analysis</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {displayedTab === "attendance" && (() => {
          const userLogs = getAttendanceLogs().filter((log: any) => log.email === userEmail);
          const presentDaysCount = userLogs.filter((log: any) => log.status === 'Present').length;
          const absentDaysCount = userLogs.filter((log: any) => log.status === 'Absent').length;
          const overallAttendanceRate = getStudentAttendancePercentage(userEmail);
          const sortedLogs = [...userLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return (
            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4"/> Attendance Report
                </span>
                <span className="h-px flex-1 bg-slate-900"></span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Overall Attendance</h3>
                  <p className="text-4xl font-serif italic text-slate-900">{overallAttendanceRate}%</p>
                  <div className="w-full bg-slate-100 h-1.5 mt-4">
                    <div className="bg-slate-900 h-full" style={{ width: `${overallAttendanceRate}%` }}></div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-900 p-6 shadow-[8px_8px_0px_#064e3b]">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 mb-2">Present Days</h3>
                  <p className="text-4xl font-serif italic text-emerald-950">{presentDaysCount}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 mt-4">Current Academic Year</p>
                </div>
                <div className="bg-red-50 border border-red-900 p-6 shadow-[8px_8px_0px_#7f1d1d]">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-red-800 mb-2">Absent Days</h3>
                  <p className="text-4xl font-serif italic text-red-950">{absentDaysCount}</p>
                  <button onClick={() => alert("Initiating leave request process...")} className="mt-4 text-[10px] uppercase tracking-widest font-bold text-red-900 underline hover:text-red-700 transition">Request Leave</button>
                </div>
              </div>

              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-900">Recent Logs (Past 7 Days)</h3>
                   <button onClick={() => alert("Downloading full attendance CSV...")} className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"><Download className="w-3 h-3"/> Export</button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Date</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500 text-xs italic">
                          No attendance logs have been recorded for your account yet.
                        </td>
                      </tr>
                    ) : (
                      sortedLogs.map((log: any) => {
                        const dateObj = new Date(log.date);
                        const formattedDate = dateObj.toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                        return (
                          <tr key={log.id} className="border-b border-slate-200">
                            <td className="py-3 px-4 font-mono text-xs text-slate-900">{formattedDate}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold ${
                                log.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-500">{log.recordedBy}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {displayedTab === "payments" && (
          <div className="mt-12 space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4"/> Fee & Payments
              </span>
              <span className="h-px flex-1 bg-slate-900"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 text-white p-8 shadow-[8px_8px_0px_#1A1A1A]">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Total Due Balance</h3>
                <p className="text-4xl font-serif italic mb-6">₹ 45,000</p>
                <button onClick={() => setShowPaymentModal(true)} className="w-full bg-white text-slate-900 px-6 py-3 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  Pay Now
                </button>
              </div>
              
              <div className="bg-white border border-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A]">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Payment Summary (Year 1)</h3>
                 <div className="space-y-4 mt-6">
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                     <span className="text-sm font-mono text-slate-600">Total Program Fee</span>
                     <span className="text-sm font-bold text-slate-900">₹ 1,50,000</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                     <span className="text-sm font-mono text-emerald-600">Total Paid</span>
                     <span className="text-sm font-bold text-emerald-700">₹ 1,05,000</span>
                   </div>
                   <div className="flex justify-between pb-2">
                     <span className="text-sm font-mono text-red-600">Remaining</span>
                     <span className="text-sm font-bold text-red-700">₹ 45,000</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-6">
               <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-6">Payment History / Receipts</h3>
               <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Transaction Date</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Description</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Amount</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-mono text-xs text-slate-900">Jan 10, 2026</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">Installment #2</td>
                    <td className="py-4 px-4 text-sm font-mono font-bold text-emerald-700 text-right">₹ 55,000</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => alert("Downloading Receipt #RCT-2026-002...")} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 transition underline">Download</button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-mono text-xs text-slate-900">Aug 15, 2025</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">Admission Fee + Installment #1</td>
                    <td className="py-4 px-4 text-sm font-mono font-bold text-emerald-700 text-right">₹ 50,000</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => alert("Downloading Receipt #RCT-2025-891...")} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 transition underline">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* Material Viewer Modal */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full max-w-6xl bg-white flex flex-col border border-slate-900 shadow-[16px_16px_0px_#1A1A1A]"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-900 bg-slate-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-900 text-sm">{viewingMaterial.title}</h3>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 bg-slate-200 px-2 py-0.5">{viewingMaterial.size}</span>
              </div>
              <button 
                onClick={() => setViewingMaterial(null)}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors"
                title="Close Viewer"
              >
                Close Viewer [X]
              </button>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {viewingMaterial.url ? (
                viewingMaterial.fileType?.includes('video') ? (
                  <video src={viewingMaterial.url} controls autoPlay className="w-full h-full object-contain bg-black" />
                ) : viewingMaterial.fileType?.includes('image') ? (
                  <img src={viewingMaterial.url} className="w-full h-full object-contain" alt={viewingMaterial.title} />
                ) : (
                  <iframe src={viewingMaterial.url} className="w-full h-full border-none" title={viewingMaterial.title} />
                )
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-xl font-serif italic text-slate-600 mb-2">Simulated Document Viewer</p>
                  <p className="text-xs uppercase font-mono tracking-widest text-slate-400">Content for {viewingMaterial.title} would appear here</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-900 bg-slate-50 flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-slate-500">
              <span>Agastya Portal V1.0</span>
              <button onClick={() => {
                if(viewingMaterial.url) {
                  const a = document.createElement('a');
                  a.href = viewingMaterial.url;
                  a.download = viewingMaterial.title;
                  a.click();
                } else {
                  alert("Downloading " + viewingMaterial.title);
                }
              }} className="font-bold text-slate-900 hover:underline">Download Material ↓</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Exam Viewer Modal */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full max-w-6xl bg-white flex flex-col shadow-[16px_16px_0px_#1A1A1A]"
          >
            <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1 block">Live Assessment</span>
                <h3 className="font-serif italic text-2xl">{viewingExam.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Time Remaining</span>
                <span className="font-serif text-xl text-amber-400">45:12</span>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden text-slate-900">
              {viewingExam.url ? (
                viewingExam.fileType?.includes('video') ? (
                  <video src={viewingExam.url} controls autoPlay className="w-full h-full object-contain bg-black" />
                ) : viewingExam.fileType?.includes('image') ? (
                  <img src={viewingExam.url} className="w-full h-full object-contain" alt={viewingExam.title} />
                ) : (
                  <iframe src={viewingExam.url} className="w-full h-full border-none" title={viewingExam.title} />
                )
              ) : (
                <div className="text-center p-12 flex flex-col items-center justify-center h-full">
                  <Clock className="w-16 h-16 text-slate-300 mb-6" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Simulated Exam Portal</h2>
                  <p className="text-slate-500 text-sm max-w-sm">This is where the exam platform would securely render questions for {viewingExam.type}.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewingExam(null)} className="px-8 py-3 bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition shadow-[4px_4px_0px_#450a0a] hover:shadow-[2px_2px_0px_#450a0a]">
                End / Exit Exam
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Analysis Viewer Modal */}
      {viewingAnalysis && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 p-4 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif italic text-slate-900">Performance Analysis: <span className="font-sans font-bold">{viewingAnalysis}</span></h2>
            <button onClick={() => setViewingAnalysis(null)} className="px-6 py-2 border border-slate-900 text-slate-900 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-900 hover:text-white transition">Close Analysis</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
               <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6">Subject Breakdown</h3>
               <div className="h-48 flex items-end gap-2">
                 <div className="flex-1 bg-slate-200 h-full relative group"><div className="absolute bottom-0 w-full bg-slate-900 min-h-[10%]" style={{ height: '80%' }}></div><span className="absolute -bottom-6 w-full text-center text-[9px] font-mono">PHY</span></div>
                 <div className="flex-1 bg-slate-200 h-full relative group"><div className="absolute bottom-0 w-full bg-slate-600 min-h-[10%]" style={{ height: '65%' }}></div><span className="absolute -bottom-6 w-full text-center text-[9px] font-mono">CHM</span></div>
                 <div className="flex-1 bg-slate-200 h-full relative group"><div className="absolute bottom-0 w-full bg-slate-400 min-h-[10%]" style={{ height: '90%' }}></div><span className="absolute -bottom-6 w-full text-center text-[9px] font-mono">MTH</span></div>
               </div>
            </div>
            <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
               <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6">Key Insights</h3>
               <ul className="space-y-4 text-sm text-slate-700">
                 <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/> Excellent pacing in Mathematics, finished 15 minutes early.</li>
                 <li className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-600 shrink-0"/> Below average accuracy in Organic Chemistry questions.</li>
                 <li className="flex items-start gap-3"><Activity className="w-5 h-5 text-blue-600 shrink-0"/> Overall rank: 42nd out of 340 students.</li>
               </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-900 shadow-[16px_16px_0px_#1A1A1A] p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {paymentSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif italic text-slate-900 mb-2">Payment Successful</h2>
                <p className="text-slate-500 text-sm mb-6">Receipt #RCT-2026-904 has been generated.</p>
                <div className="bg-slate-50 border border-slate-200 p-4 w-full mb-6 font-mono text-xs text-left">
                  <div className="flex justify-between mb-2"><span>Amount</span> <span className="font-bold">₹ 45,000</span></div>
                  <div className="flex justify-between mb-2"><span>Date</span> <span>{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>Method</span> <span>Net Banking</span></div>
                </div>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentSuccess(false);
                  }}
                  className="w-full bg-slate-900 text-white py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Secure Checkout</h2>
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </div>
                
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Payment Amount</p>
                  <p className="text-3xl font-serif italic text-slate-900 border-b-2 border-slate-900 pb-2">₹ 45,000</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Select Method</label>
                    <select className="w-full border border-slate-200 p-3 text-sm focus:border-slate-900 outline-none transition-colors">
                      <option>Net Banking (HDFC/SBI/ICICI)</option>
                      <option>UPI ID / QR Code</option>
                      <option>Credit / Debit Card</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 border border-slate-900 text-slate-900 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setProcessingPayment(true);
                      setTimeout(() => {
                        setProcessingPayment(false);
                        setPaymentSuccess(true);
                      }, 2000);
                    }}
                    className="flex-[2] bg-slate-900 text-white py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors relative"
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      "Confirm Payment"
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-[11px] uppercase tracking-widest font-semibold border-l-2 ${active ? 'bg-slate-800 text-white border-white' : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function TaskItem({ time, title, type, completed, active, onToggle }: any) {
  return (
    <div className={`flex justify-between items-center p-5 border-b border-slate-900 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${active ? 'bg-slate-50' : ''}`} onClick={onToggle}>
      <div className="flex-1 flex gap-4 md:gap-8 items-center">
        <div className="w-20 shrink-0 font-mono text-[10px] text-slate-500">{time}</div>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold w-24">{type}</span>
          <h4 className={`text-sm ${completed ? 'text-slate-400 line-through' : 'text-slate-900 font-bold'}`}>{title}</h4>
        </div>
      </div>
      <div className="shrink-0 ml-4 flex items-center justify-center w-6 h-6">
        {completed ? (
          <div className="w-3 h-3 bg-slate-900"></div>
        ) : (
          <div className={`w-3 h-3 border ${active ? 'border-slate-900 bg-slate-900/10' : 'border-slate-400'}`}></div>
        )}
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold mb-2">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-mono">{value}%</span>
      </div>
      <div className="h-1 bg-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

function MaterialItem({ title, date, onClick }: { title: string, date: string, onClick?: () => void, key?: any }) {
  return (
    <div onClick={onClick} className="flex items-start gap-3 group cursor-pointer border-b border-slate-200 last:border-0 pb-4">
      <div className="p-2 border border-slate-900 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
        <FileText className="w-3 h-3" />
      </div>
      <div className="flex flex-col justify-center h-full pt-1">
        <p className="text-xs font-bold text-slate-900 group-hover:text-slate-500 transition-colors line-clamp-1">{title}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{date}</p>
      </div>
    </div>
  );
}
