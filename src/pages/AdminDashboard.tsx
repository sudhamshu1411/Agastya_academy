import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, BarChart3, Calendar, Settings, AlertCircle, LayoutDashboard, FileText, Bell, Search, CheckCircle2, MoreHorizontal, ShieldAlert, Trash2, Menu, X, Database, Mail, FolderInput, Video, GraduationCap, UploadCloud, Paperclip } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getValidUsers, deleteUser, updateUserRole } from "../lib/users";
import { getAdmissions, deleteAdmissionByEmail, updateAdmissionByEmail } from "../lib/admissions";
import { getNotices, saveNotice, getInterventions, logIntervention, getStudentAttendancePercentage } from "../lib/store";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function AdminDashboard() {
  const userFullName = localStorage.getItem("userFullName") || "M. Kumar";
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  const [admissionsLogs, setAdmissionsLogs] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentBatchFilter, setStudentBatchFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailBody, setBulkEmailBody] = useState("");
  
  const [isBulkBatchModalOpen, setIsBulkBatchModalOpen] = useState(false);
  const [bulkBatchTarget, setBulkBatchTarget] = useState("");

  const [curriculumTasks, setCurriculumTasks] = useState([
    { id: '1', title: 'Update Physics Syllabus', description: 'Align with new board pattern', batch: 'Alpha', dueDate: '2026-07-15', status: 'pending', attachments: [] as File[] },
    { id: '2', title: 'Prepare Chemistry Mock', description: 'Full syllabus mock test', batch: 'Beta', dueDate: '2026-06-18', status: 'completed', attachments: [] as File[] },
  ]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setTaskFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setTaskFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  const removeTaskFile = (index: number) => {
    setTaskFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openTaskModal = (task: any = null) => {
    setCurrentTask(task);
    setTaskFiles(task?.attachments || []);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask = {
      id: currentTask?.id || Date.now().toString(),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      batch: formData.get("batch") as string,
      dueDate: formData.get("dueDate") as string,
      status: formData.get("status") as string,
      attachments: taskFiles
    };
    
    if (currentTask) {
      setCurriculumTasks(prev => prev.map(t => t.id === currentTask.id ? newTask : t));
    } else {
      setCurriculumTasks(prev => [...prev, newTask]);
    }
    setIsTaskModalOpen(false);
  };

  const handleToggleTaskStatus = (id: string) => {
    setCurriculumTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };
  
  const handleDeleteTask = (id: string) => {
    if(window.confirm('Are you sure you want to delete this task?')) {
        setCurriculumTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  useEffect(() => {
    setPortalUsers(getValidUsers());
    setAdmissionsLogs(getAdmissions());
    setNotices(getNotices());
    setAlerts(getInterventions().filter((i:any) => !i.logged));
    setSelectedStudentEmails([]); // Clear selection when tab changes
  }, [activeTab]);

  const toggleSelectStudent = (email: string) => {
    setSelectedStudentEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleDeleteUser = (email: string) => {
    deleteUser(email);
    deleteAdmissionByEmail(email);
    setPortalUsers(getValidUsers());
    setAdmissionsLogs(getAdmissions());
  };

  const handleUpdateUserRole = (email: string, role: string) => {
    updateUserRole(email, role);
    setPortalUsers(getValidUsers());
  };

  const handleResolveAlert = (id: number) => {
    logIntervention(id, "Resolved by Admin");
    setAlerts(getInterventions().filter((i:any) => !i.logged));
  };

  const handleBroadcast = () => {
    const msg = window.prompt("Enter notice broadcast message to all students:");
    if (msg) {
      saveNotice(msg);
      setNotices(getNotices());
      alert("Broadcast sent successfully!");
    }
  };

  const handleFinalize = () => {
    alert("Day output finalized.");
  };

  const performanceData = [
    { name: "Alpha", avgScore: 88, attendance: 96 },
    { name: "Beta", avgScore: 74, attendance: 85 },
    { name: "Gamma", avgScore: 82, attendance: 90 },
    { name: "Crash '25", avgScore: 68, attendance: 75 },
  ];

  const getStudentPerformanceHistory = (studentName: string) => {
    if (studentName.includes("Vikram")) {
      return [
        { id: 1, title: "Mechanics DPP 07", date: "May 29, 2026", type: "DPP", score: 35, maxScore: 100, status: "Graded" },
        { id: 2, title: "Mechanics DPP 06", date: "May 25, 2026", type: "DPP", score: 40, maxScore: 100, status: "Graded" },
        { id: 3, title: "Mechanics DPP 05", date: "May 20, 2026", type: "DPP", score: 38, maxScore: 100, status: "Graded" },
        { id: 4, title: "Basic Kinematics Quiz", date: "May 10, 2026", type: "Quiz", score: 45, maxScore: 100, status: "Graded" },
      ];
    } else if (studentName.includes("Rahul")) {
      return [
        { id: 1, title: "Rotational Dynamics Quiz", date: "May 28, 2026", type: "Quiz", score: 85, maxScore: 100, status: "Graded" },
        { id: 2, title: "Rotational Dynamics DPP 03", date: "May 24, 2026", type: "DPP", score: 92, maxScore: 100, status: "Graded" },
        { id: 3, title: "Mechanics Midterm Test", date: "May 18, 2026", type: "Test", score: 88, maxScore: 100, status: "Graded" },
        { id: 4, title: "Vectors & Laws of Motion DPP 02", date: "May 08, 2026", type: "DPP", score: 87, maxScore: 100, status: "Graded" },
      ];
    } else if (studentName.includes("Sneha")) {
      return [
        { id: 1, title: "Rotational Dynamics Quiz", date: "May 28, 2026", type: "Quiz", score: null, maxScore: 100, status: "Pending" },
        { id: 2, title: "Mechanics DPP 07", date: "May 26, 2026", type: "DPP", score: 95, maxScore: 100, status: "Graded" },
        { id: 3, title: "Mechanics DPP 06", date: "May 19, 2026", type: "DPP", score: 89, maxScore: 100, status: "Graded" },
        { id: 4, title: "Math & Vectors Quiz", date: "May 12, 2026", type: "Quiz", score: 93, maxScore: 100, status: "Graded" },
      ];
    } else {
      return [
        { id: 1, title: "Syllabus Assessment 01", date: "May 25, 2026", type: "Test", score: 85, maxScore: 100, status: "Graded" },
        { id: 2, title: "Weekly Revision Quiz 03", date: "May 20, 2026", type: "Quiz", score: 78, maxScore: 100, status: "Graded" },
        { id: 3, title: "Weekly Revision Quiz 02", date: "May 15, 2026", type: "Quiz", score: 92, maxScore: 100, status: "Graded" },
        { id: 4, title: "Foundation DPP 05", date: "May 05, 2026", type: "DPP", score: 85, maxScore: 100, status: "Graded" },
      ];
    }
  };

  const allStudents = portalUsers
    .filter(u => u.role === "student")
    .map(u => {
      const log = admissionsLogs.find(a => a.email === u.email) || {};
      const name = u.fullName || log.studentName || "Unknown";
      let performanceAvg = "85%";
      if (name.includes("Vikram")) {
        performanceAvg = "38%";
      } else if (name.includes("Rahul")) {
        performanceAvg = "88%";
      } else if (name.includes("Sneha")) {
        performanceAvg = "92%";
      }
      return {
        email: u.email,
        id: log.id || "N/A",
        name,
        batch: log.cohort || "N/A",
        feeStatus: log.status === "Admitted" ? "Paid" : "Pending",
        performance: performanceAvg
      };
    });

  const uniqueBatches = Array.from(new Set(allStudents.map(s => s.batch))).filter(b => b && b !== "N/A");

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesBatch = studentBatchFilter === "All" || s.batch === studentBatchFilter;
    return matchesSearch && matchesBatch;
  });

  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentEmails.includes(s.email));
  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredEmails = filteredStudents.map(s => s.email);
      setSelectedStudentEmails(prev => prev.filter(e => !filteredEmails.includes(e)));
    } else {
      const filteredEmails = filteredStudents.map(s => s.email);
      setSelectedStudentEmails(prev => Array.from(new Set([...prev, ...filteredEmails])));
    }
  };

  const handleSendBulkEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentEmails.length === 0) return;
    const selectedStudentsList = allStudents.filter(s => selectedStudentEmails.includes(s.email));
    alert(`Bulk Email Dispatched!\n\nSubject: "${bulkEmailSubject}"\nSent to ${selectedStudentEmails.length} students:\n${selectedStudentsList.map(s => `• ${s.name} (${s.email})`).join('\n')}`);
    setBulkEmailSubject("");
    setBulkEmailBody("");
    setIsBulkEmailModalOpen(false);
    setSelectedStudentEmails([]);
  };

  const handleBulkChangeBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentEmails.length === 0 || !bulkBatchTarget) return;
    
    selectedStudentEmails.forEach(email => {
      updateAdmissionByEmail(email, { cohort: bulkBatchTarget });
    });
    
    setAdmissionsLogs(getAdmissions());
    setSelectedStudentEmails([]);
    setIsBulkBatchModalOpen(false);
    setBulkBatchTarget("");
    alert(`Cohort Update Success!\nSelected students have been transferred to: ${bulkBatchTarget}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col fixed md:sticky top-0 ${isMobileMenuOpen ? 'h-screen' : 'h-auto'} md:h-screen z-40 border-r border-slate-900 transition-all`}>
        <div className="p-6 border-b border-white/20 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-white font-serif italic text-xl tracking-tighter leading-none">Agastya</h1>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold mt-1">Admin Console</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        <div className={`flex-1 flex col flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex overflow-y-auto`}>
          <div className="flex-1 py-6 px-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Management</div>
            <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard className="w-4 h-4"/>} label="Overview" />
            <NavItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} icon={<ShieldAlert className="w-4 h-4"/>} label="User Directory & Access" />
            <NavItem active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }} icon={<Users className="w-4 h-4"/>} label="Global Student List" />
            <NavItem active={activeTab === 'curriculum'} onClick={() => { setActiveTab('curriculum'); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Curriculum Tasks" />
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Academic Control</div>
            <NavItem active={activeTab === 'academics'} onClick={() => { setActiveTab('academics'); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Content & Assessments" />
            <NavItem active={activeTab === 'live'} onClick={() => { setActiveTab('live'); setIsMobileMenuOpen(false); }} icon={<Video className="w-4 h-4"/>} label="Live Operations" />
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Operations</div>
            <NavItem active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} icon={<BarChart3 className="w-4 h-4"/>} label="Analytics Engine" />
            <Link to="/admin/schedule" onClick={() => setIsMobileMenuOpen(false)}>
              <NavItem icon={<Calendar className="w-4 h-4"/>} label="Central Scheduler" />
            </Link>
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">System</div>
            <NavItem icon={<Settings className="w-4 h-4"/>} label="Portal Settings" />
          </div>
          
          <RoleSwitcher />
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3 px-3 py-2 text-white/60 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-white">{userFullName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-widest">{userFullName}</p>
                <p className="text-[9px] text-white/60 font-mono">Super Admin</p>
              </div>
            </div>
            <Link to="/login" className="flex items-center justify-center w-full px-3 py-2 text-slate-900 bg-white hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-widest font-bold mt-4">
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full mt-[70px] md:mt-0 p-4 md:p-8 lg:p-12">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 border-b border-slate-900 pb-6 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">System Status: Nominal</p>
            <h2 className="text-4xl font-serif text-slate-900 italic">Central Command</h2>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Lookup student..." className="pl-10 pr-4 py-2 border border-slate-900 bg-white text-sm font-mono focus:outline-none placeholder:text-slate-400 w-64 shadow-[4px_4px_0px_#1A1A1A]" />
            </div>
            <button className="w-10 h-10 border border-slate-900 bg-white flex items-center justify-center shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] transition-transform relative">
              <Bell className="w-4 h-4 text-slate-900" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Area based on Tabs */}
        {activeTab === 'overview' && (
          <>
            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <KpiCard title="Total Enrollment" value="142" subtext="Across 4 active cohorts" />
              <KpiCard title="Average Engagement" value="94.2%" subtext="+2.1% from last week" />
              <KpiCard title="Tasks Completed" value="1,845" subtext="Today's aggregate" />
              <KpiCard title="Pending Applications" value="28" subtext="Requires review" alert />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Action Required Banner */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white border border-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-900" /> Requires Intervention
                    </h3>
                    <button className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-900">View All</button>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm font-mono border-2 border-dashed border-slate-200">
                      System nominal. No pending alerts.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map(alert => (
                        <div key={alert.id} className="flex items-center justify-between p-4 border border-slate-200 hover:border-slate-400 transition-colors bg-slate-50">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs uppercase tracking-widest">{alert.name || alert.student}</p>
                              <p className="text-[10px] font-mono text-slate-500 mt-1">{alert.issue}</p>
                            </div>
                          </div>
                          <button onClick={() => handleResolveAlert(alert.id)} className="px-4 py-2 border border-slate-900 text-[9px] uppercase font-bold hover:bg-slate-900 hover:text-white transition-colors">Resolve</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Performance Chart */}
                <div className="bg-white border border-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A]">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Cohort Analytics Matrix</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} />
                        <Tooltip 
                          cursor={{fill: '#F5F2ED'}}
                          contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                        <Bar dataKey="avgScore" name="Avg Score" fill="#1A1A1A" maxBarSize={40} />
                        <Bar dataKey="attendance" name="Attendance %" fill="#8C7B65" maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="space-y-8">
                <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Execution Panel</h3>
                  <div className="space-y-3">
                    <button onClick={handleBroadcast} className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                      <FileText className="w-4 h-4" /> Global Notice Broadcast
                    </button>
                    <Link to="/admin/schedule" className="w-full bg-slate-50 border border-slate-900 text-slate-900 font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                      <Calendar className="w-4 h-4" /> Schedule Meetings
                    </Link>
                    <button onClick={handleFinalize} className="w-full bg-slate-50 border border-slate-900 text-slate-900 font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Finalize Day Output
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-900 p-6">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Audit Trail</h3>
                  <div className="space-y-4">
                    {notices.map((n: any, i) => (
                       <div key={i}><AuditItem text={`Broadcast sent: "${n.msg}"`} time={n.time} /></div>
                    ))}
                    <AuditItem text="DPP-15 Uploaded to Alpha Batch" time="10 mins ago" />
                    <AuditItem text="Automated absence SMS triggered (x4)" time="1 hour ago" />
                    <AuditItem text="Database sync complete" time="3 hours ago" />
                    <AuditItem text="System updated to v2.4.1" time="Yesterday" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-900" /> Portal Active Users
              </h3>
            </div>
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Full Name</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Email Address</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Phone</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Access Role</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Admission Status</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portalUsers.map((u, idx) => {
                  const admissionLog = admissionsLogs.find(a => a.email === u.email);
                  return (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">{u.fullName || "—"}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{u.email}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{u.phone}</td>
                    <td className="py-4 px-4">
                        <select 
                          className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border focus:outline-none cursor-not-allowed opacity-70 ${
                            u.role === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            u.role === 'founder' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                            u.role === 'faculty' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            u.role === 'new user' ? 'border-slate-300 bg-slate-100 text-slate-500' :
                            'border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                          value={u.role}
                          disabled={true}
                          onChange={(e) => handleUpdateUserRole(u.email, e.target.value)}
                        >
                          <option value="new user">New User</option>
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Administrator</option>
                          <option value="founder">Founder</option>
                        </select>
                    </td>
                    <td className="py-4 px-4">
                      {admissionLog ? (
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${
                          admissionLog.status === 'Admitted' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
                          admissionLog.status === 'Rejected' ? 'border-red-200 bg-red-50 text-red-700' : 
                          admissionLog.status === 'Interview Scheduled' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>
                          {admissionLog.status}
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                       <button onClick={() => handleDeleteUser(u.email)} className="text-slate-400 hover:text-red-600 transition-colors pointer p-1">
                         <Trash2 className="w-4 h-4 ml-auto" />
                       </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <Database className="w-4 h-4"/> Global Student List
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <select 
                  value={studentBatchFilter}
                  onChange={(e) => setStudentBatchFilter(e.target.value)}
                  className="w-full sm:w-40 px-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white font-mono text-[10px] uppercase tracking-widest font-bold"
                >
                  <option value="All">ALL BATCHES</option>
                  {uniqueBatches.map((b: any) => (
                    <option key={b} value={b}>{String(b).toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Action Panel */}
            {selectedStudentEmails.length > 0 && (
              <div className="bg-slate-900 text-white p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-900 shadow-[4px_4px_0px_#475569] animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-400 p-1.5 text-slate-900 font-mono text-xs font-bold">
                    {selectedStudentEmails.length}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-white/50 block">Bulk Student Operations</span>
                    <p className="text-xs font-bold font-mono uppercase tracking-wider">{selectedStudentEmails.length === 1 ? '1 student' : `${selectedStudentEmails.length} students`} selected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={() => setIsBulkEmailModalOpen(true)}
                    className="bg-white hover:bg-slate-200 text-slate-900 border border-transparent px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Mail className="w-3 h-3" /> Send Email
                  </button>
                  <button 
                    onClick={() => {
                      setBulkBatchTarget(uniqueBatches[0] || "Alpha");
                      setIsBulkBatchModalOpen(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white border border-white/20 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <FolderInput className="w-3 h-3" /> Change Batch
                  </button>
                  <button 
                    onClick={() => setSelectedStudentEmails([])}
                    className="text-white/60 hover:text-white text-[9px] uppercase tracking-widest font-semibold px-2 py-1.5 font-mono cursor-pointer"
                  >
                    Clear Selected
                  </button>
                </div>
              </div>
            )}

            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="cursor-pointer accent-slate-900 w-4 h-4 rounded border-slate-300 focus:ring-slate-900"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                    />
                  </th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">ID</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Name</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Cohort</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Academics</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Attendance</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Finance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => {
                    const isSelected = selectedStudentEmails.includes(student.email);
                    return (
                    <tr key={idx} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-slate-50/80 font-medium' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="cursor-pointer accent-slate-900 w-4 h-4 rounded border-slate-300 focus:ring-slate-900"
                        checked={isSelected}
                        onChange={() => toggleSelectStudent(student.email)}
                      />
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{student.id}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="font-bold text-slate-900 text-sm hover:text-slate-600 hover:underline transition-colors focus:outline-none text-left"
                      >
                        {student.name}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">
                      {student.batch}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono">{student.performance} Avg</td>
                    <td className="py-4 px-4 text-xs font-mono">
                      {getStudentAttendancePercentage(student.email)}%
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${student.feeStatus === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : student.feeStatus === 'Overdue' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {student.feeStatus}
                      </span>
                    </td>
                  </tr>
                  )
                })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-sm italic">
                      No students match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Global Content & Assessments Registry
                </h3>
                <div className="flex gap-2">
                  <span className="bg-amber-100 text-amber-900 px-3 py-2 text-[9px] uppercase font-bold tracking-widest border border-amber-200">
                    Hierarchy: Admin Override
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Global Assignments/Quizzes */}
                <div className="border border-slate-300 p-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-200">System-Wide Active Assessments</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5">Quiz</span>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">Owner: PF-01</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900">Rotational Dynamics Quiz 4</h5>
                        <p className="text-[10px] text-slate-500 font-mono">Alpha Batch • Due: 2 Days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 hover:underline transition-colors">Edit</button>
                        <button className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-700 hover:underline transition-colors">Delete</button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5">DPP</span>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">Owner: PF-02</span>
                        </div>
                        <h5 className="font-bold text-sm text-slate-900">Mechanics DPP 08</h5>
                        <p className="text-[10px] text-slate-500 font-mono">All Classes • Due: Tomorrow</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 hover:underline transition-colors">Edit</button>
                        <button className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-700 hover:underline transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System-Wide Resources */}
                <div className="border border-slate-300 p-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-200">Global Storage Resources</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 border-b border-transparent group-hover:border-slate-900 inline-block transition-colors cursor-pointer">Mechanics Final Notes.pdf</h5>
                        <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex gap-2"><span>2.4 MB</span> <span>Owner: PF-01</span></p>
                      </div>
                      <button className="text-slate-400 hover:text-red-600 transition-colors text-[10px] uppercase tracking-widest font-bold">Purge File</button>
                    </div>
                    <div className="flex justify-between items-center group">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 border-b border-transparent group-hover:border-slate-900 inline-block transition-colors cursor-pointer">Thermodynamics Ref Sheet.pdf</h5>
                        <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex gap-2"><span>1.1 MB</span> <span>Owner: PF-02</span></p>
                      </div>
                      <button className="text-slate-400 hover:text-red-600 transition-colors text-[10px] uppercase tracking-widest font-bold">Purge File</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Live Operations Control */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-serif italic text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" /> Curriculum Task Manager
              </h3>
              <button 
                onClick={() => openTaskModal(null)}
                className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A]"
              >
                + Create Task
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curriculumTasks.map(task => (
                <div key={task.id} className="bg-white border border-slate-300 p-6 shadow-[4px_4px_0px_#1A1A1A] flex flex-col h-full">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold mb-3 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                      {task.status}
                    </span>
                    <h4 className="font-bold text-lg text-slate-900 leading-tight mb-2">{task.title}</h4>
                    <p className="text-xs text-slate-600 mb-4">{task.description}</p>
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Paperclip className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Batch</p>
                        <p className="text-xs font-bold text-slate-700">{task.batch}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Due Date</p>
                        <p className="text-xs font-bold text-slate-700">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleToggleTaskStatus(task.id)} className={`flex-1 py-2 flex items-center justify-center border transition-colors text-[10px] uppercase font-bold tracking-widest ${task.status === 'completed' ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`} title="Toggle Status">
                         {task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                       </button>
                       <button onClick={() => openTaskModal(task)} className="w-9 flex items-center justify-center border border-slate-300 hover:bg-slate-100 transition-colors" title="Edit Task">
                         <FileText className="w-4 h-4 text-slate-600" />
                       </button>
                       <button onClick={() => handleDeleteTask(task.id)} className="w-9 flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-500 transition-colors" title="Delete Task">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {curriculumTasks.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold uppercase tracking-widest">No Curriculum Tasks</p>
                <p className="text-xs mt-1">Create a new task to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Global Live Operations Control */}
        {activeTab === 'live' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <Video className="w-4 h-4" /> Live Institutional Streams
                </h3>
                <div className="flex gap-2">
                  <span className="bg-red-50 text-red-900 border border-red-200 px-3 py-2 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 animate-pulse rounded-full"></span> 2 Active Sessions
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-white p-6 shadow-[4px_4px_0px_#1A1A1A]">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="inline-flex items-center gap-2 px-2 py-1 bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-widest mb-3">
                         <span className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full"></span> Live
                       </span>
                       <h4 className="font-serif italic text-xl">Rotational Dynamics</h4>
                       <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">Host: PF-01 (R.P Kumar)</p>
                     </div>
                     <span className="font-mono text-xs opacity-70">09:00 AM</span>
                   </div>
                   <div className="flex gap-2 mt-6">
                     <button className="flex-1 bg-white text-slate-900 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-200 transition-colors">Join as Observer</button>
                     <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-colors">Force Terminate</button>
                   </div>
                </div>

                <div className="bg-slate-900 text-white p-6 shadow-[4px_4px_0px_#1A1A1A]">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="inline-flex items-center gap-2 px-2 py-1 bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-widest mb-3">
                         <span className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full"></span> Live
                       </span>
                       <h4 className="font-serif italic text-xl">Mechanics DPP Discussion</h4>
                       <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">Host: PF-03 (S. Iyer)</p>
                     </div>
                     <span className="font-mono text-xs opacity-70">09:30 AM</span>
                   </div>
                   <div className="flex gap-2 mt-6">
                     <button className="flex-1 bg-white text-slate-900 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-200 transition-colors">Join as Observer</button>
                     <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-colors">Force Terminate</button>
                   </div>
                </div>
                
                <div className="bg-white border border-slate-300 p-6">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="inline-flex items-center gap-2 px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-widest mb-3">
                         Upcoming
                       </span>
                       <h4 className="font-serif italic text-slate-900 text-xl">Doubt Clearing Session</h4>
                       <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Host: PF-02 (M. Kumar)</p>
                     </div>
                     <span className="font-mono text-xs opacity-70">02:00 PM</span>
                   </div>
                   <div className="flex mt-6">
                     <button className="w-full border-t border-slate-200 pt-4 text-center text-slate-500 text-[10px] uppercase font-bold tracking-widest hover:text-red-600 transition-colors">Cancel Session (Admin Override)</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'students' && activeTab !== 'academics' && activeTab !== 'live' && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
            <LayoutDashboard className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-xl font-serif italic text-slate-700 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-sm font-mono text-slate-500 max-w-md text-center">This module is part of the extended ERP features and is currently running offline processes.</p>
            <button onClick={() => setActiveTab('overview')} className="mt-6 border-b border-slate-900 text-slate-900 text-[10px] uppercase font-bold tracking-widest pb-1 hover:opacity-70 transition-opacity">Return to Overview</button>
          </div>
        )}
      </main>

      {/* Curriculum Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#1A1A1A] max-w-md w-full p-8 relative">
            <button 
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif italic text-2xl text-slate-900 mb-6 border-b-2 border-slate-900 inline-block pr-8 pb-1">
              {currentTask ? 'Edit Task' : 'New Task'}
            </h3>
            
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Title</label>
                <input required type="text" name="title" defaultValue={currentTask?.title || ""} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Description</label>
                <textarea required name="description" defaultValue={currentTask?.description || ""} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Batch</label>
                  <input required type="text" name="batch" defaultValue={currentTask?.batch || ""} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Due Date</label>
                  <input required type="date" name="dueDate" defaultValue={currentTask?.dueDate || ""} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                </div>
              </div>
              
              {/* File Uploader */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Attachments</label>
                <div 
                  className={`border-2 border-dashed ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300'} p-6 flex flex-col items-center justify-center transition-colors relative`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*,.pdf" />
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 text-center relative z-10 pointer-events-none">Drag & Drop Files Here<br/><span className="text-[9px] font-mono lowercase">or click to browse</span></p>
                </div>
                
                {taskFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {taskFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2">
                         <div className="flex items-center gap-2 overflow-hidden">
                           <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                           <span className="text-xs font-mono text-slate-700 truncate">{f.name}</span>
                         </div>
                         <button type="button" onClick={() => removeTaskFile(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                           <X className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Status</label>
                <select name="status" defaultValue={currentTask?.status || "pending"} className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-slate-900 text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_#1A1A1A] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Academic Performance Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#1A1A1A] max-w-lg w-full p-8 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block mb-1">Academy Database // Student Profile</span>
              <h3 className="font-serif italic text-3xl text-slate-900">{selectedStudent.name}</h3>
              <p className="text-sm font-mono text-slate-500 mt-1">ID: {selectedStudent.id} • Email: {selectedStudent.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-4">
                <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">Batch Cohort</span>
                <p className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">{selectedStudent.batch}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4">
                <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">Financial State</span>
                <span className={`inline-block px-2 py-0.5 mt-0.5 text-[9px] uppercase tracking-widest font-bold border ${selectedStudent.feeStatus === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : selectedStudent.feeStatus === 'Overdue' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  {selectedStudent.feeStatus}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4">
                <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">Attendance Rate</span>
                <p className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  {getStudentAttendancePercentage(selectedStudent.email)}%
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Academic History & Assessments</span>
                <span className="text-lg font-serif italic text-slate-900 bg-slate-100 px-3 py-1 border border-slate-200 font-bold">{selectedStudent.performance} Average Score</span>
              </div>

              <div className="space-y-3">
                {getStudentPerformanceHistory(selectedStudent.name).map((item: any) => (
                  <div key={item.id} className="border border-slate-200 p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${
                          item.type === 'Quiz' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          item.type === 'DPP' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{item.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <div className="text-right">
                      {item.status === 'Graded' ? (
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-sm font-bold font-mono text-slate-900">{item.score}</span>
                          <span className="text-[9px] font-mono text-slate-400">/ {item.maxScore}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-8 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Bulk Email Modal */}
      {isBulkEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#1A1A1A] max-w-lg w-full p-8 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setIsBulkEmailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block mb-1">Bulk Operations // Communication Envoys</span>
              <h3 className="font-serif italic text-3xl text-slate-900">Broadcast Email</h3>
              <p className="text-xs font-mono text-slate-500 mt-1">To: {selectedStudentEmails.length} Selected Recipient{selectedStudentEmails.length === 1 ? '' : 's'}</p>
            </div>

            <form onSubmit={handleSendBulkEmail} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-700 mb-1 font-mono">Email Subject</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Important Update Regarding DPPs and Tests"
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-900 text-sm focus:outline-none focus:ring-0 focus:border-slate-700 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-700 mb-1 font-mono">Message Container</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Dear student, please find below the core updates for this week..."
                  value={bulkEmailBody}
                  onChange={(e) => setBulkEmailBody(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-900 text-sm focus:outline-none focus:ring-0 focus:border-slate-700 font-sans"
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsBulkEmailModalOpen(false)}
                  className="w-full sm:w-auto border border-slate-300 text-slate-700 font-bold text-[10px] uppercase tracking-widest py-3 px-6 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-8 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Batch Modal */}
      {isBulkBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-sans">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#1A1A1A] max-w-md w-full p-8 relative">
            <button 
              onClick={() => setIsBulkBatchModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block mb-1">Bulk Operations // Registry Shifter</span>
              <h3 className="font-serif italic text-3xl text-slate-900">Transfer Cohort</h3>
              <p className="text-xs font-mono text-slate-500 mt-1">Reassigning {selectedStudentEmails.length} student{selectedStudentEmails.length === 1 ? '' : 's'}</p>
            </div>

            <form onSubmit={handleBulkChangeBatch} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-700 mb-2 font-mono">Target Batch Cohort</label>
                <select
                  value={bulkBatchTarget}
                  onChange={(e) => setBulkBatchTarget(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-900 text-xs focus:outline-none bg-white font-mono uppercase tracking-widest font-bold"
                >
                  {uniqueBatches.map((b: any) => (
                    <option key={b} value={b}>{String(b).toUpperCase()}</option>
                  ))}
                  <option value="Target NEET">TARGET NEET</option>
                  <option value="Alpha RM">ALPHA RM</option>
                  <option value="Beta">BETA</option>
                  <option value="Gamma">GAMMA</option>
                  <option value="Crash '25">CRASH '25</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsBulkBatchModalOpen(false)}
                  className="w-full sm:w-auto border border-slate-300 text-slate-700 font-bold text-[10px] uppercase tracking-widest py-3 px-6 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-8 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderInput className="w-4 h-4" /> update batch
                </button>
              </div>
            </form>
          </div>
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

function KpiCard({ title, value, subtext, alert = false }: { title: string, value: string | number, subtext: string, alert?: boolean }) {
  return (
    <div className={`border p-6 shadow-[6px_6px_0px_#1A1A1A] ${alert ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-900 text-slate-900'}`}>
      <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-4 ${alert ? 'text-white/60' : 'text-slate-500'}`}>{title}</h3>
      <div className={`text-4xl font-serif italic mb-2 ${alert ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <p className={`text-[10px] font-mono tracking-widest ${alert ? 'text-amber-400' : 'text-slate-500'}`}>{subtext}</p>
    </div>
  );
}

function AuditItem({ text, time }: { text: string, time: string }) {
  return (
    <div className="border-l-2 border-slate-300 pl-3 pb-4 last:pb-0 relative">
      <div className="absolute w-2 h-2 rounded-full bg-slate-900 -left-[5px] top-1"></div>
      <p className="text-xs font-bold text-slate-900 mb-1">{text}</p>
      <p className="text-[9px] uppercase tracking-widest font-mono text-slate-500">{time}</p>
    </div>
  );
}
