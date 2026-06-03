import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../lib/auth";

import { Users, BarChart3, Calendar, Settings, AlertCircle, LayoutDashboard, FileText, Bell, Search, CheckCircle2, MoreHorizontal, ShieldAlert, Trash2, Menu, X, Database, Mail, FolderInput } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getValidUsers, deleteUser, updateUserRole } from "../lib/users";
import { getAdmissions, deleteAdmissionByEmail, updateAdmissionByEmail } from "../lib/admissions";
import { getNotices, saveNotice, getInterventions, logIntervention, getStudentAttendancePercentage } from "../lib/store";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function AdminDashboard() {
  const navigate = useNavigate();
  const userFullName = localStorage.getItem("userFullName") || "M. Kumar";
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch(e) {
      console.error(e);
    }
    localStorage.clear();
    navigate("/");
  };

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
            <button onClick={handleLogout} className="flex items-center justify-center w-full px-3 py-2 text-slate-900 bg-white hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-widest font-bold mt-4">
              Sign Out
            </button>
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

        {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'students' && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
            <LayoutDashboard className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-xl font-serif italic text-slate-700 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-sm font-mono text-slate-500 max-w-md text-center">This module is part of the extended ERP features and is currently running offline processes.</p>
            <button onClick={() => setActiveTab('overview')} className="mt-6 border-b border-slate-900 text-slate-900 text-[10px] uppercase font-bold tracking-widest pb-1 hover:opacity-70 transition-opacity">Return to Overview</button>
          </div>
        )}
      </main>

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
