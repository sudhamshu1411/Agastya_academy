import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Building2, Users, GraduationCap, DollarSign, Settings, Database, Search, ShieldCheck, Download, Lock, FileOutput, Terminal, Video, FileText, Activity, UserPlus, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "motion/react";
import { getAdmissions, updateAdmissionStatus, deleteAdmissionByEmail, updateAdmissionByEmail, deleteAdmissionById } from "../lib/admissions";
import { getValidUsers, deleteUser, updateUserRole, updateUser } from "../lib/users";
import { ShieldAlert, Trash2, Edit2, Menu, X } from "lucide-react";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function FounderDashboard() {
  const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true";
  const originalRole = localStorage.getItem("originalUserRole") || localStorage.getItem("userRole");
  
  if (originalRole !== "founder" && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const userFullName = localStorage.getItem("userFullName") || "Director";
  const [activeTab, setActiveTab] = useState("executive");
  const [systemLocked, setSystemLocked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState("All");
  const [admissionsLogs, setAdmissionsLogs] = useState<any[]>([]);
  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentCohort, setEditStudentCohort] = useState("");

  useEffect(() => {
    setAdmissionsLogs(getAdmissions());
    setPortalUsers(getValidUsers());
  }, [activeTab]);

  const handleDeleteStudent = (email: string) => {
    deleteUser(email);
    deleteAdmissionByEmail(email);
    setPortalUsers(getValidUsers());
    setAdmissionsLogs(getAdmissions());
  };

  const startEditStudent = (student: any) => {
    setEditingStudent(student.email);
    setEditStudentName(student.name);
    setEditStudentCohort(student.batch);
  };

  const handleSaveStudent = (email: string) => {
    updateUser(email, { fullName: editStudentName });
    updateAdmissionByEmail(email, { studentName: editStudentName, cohort: editStudentCohort });
    setEditingStudent(null);
    setPortalUsers(getValidUsers());
    setAdmissionsLogs(getAdmissions());
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

  const handleUpdateStatus = (id: string, prevStatus: string) => {
    const log = admissionsLogs.find(a => a.id === id);
    const nextStatus = prevStatus === 'Pending Review' ? 'Interview Scheduled' 
      : prevStatus === 'Interview Scheduled' ? 'Admitted'
      : prevStatus === 'Admitted' ? 'Rejected' 
      : 'Pending Review';
    updateAdmissionStatus(id, nextStatus);
    
    if (log && log.email) {
      if (nextStatus === 'Admitted') {
        updateUserRole(log.email, 'student');
      } else if (prevStatus === 'Admitted') {
        updateUserRole(log.email, 'new user');
      }
      setPortalUsers(getValidUsers());
    }
    
    setAdmissionsLogs(getAdmissions());
  };

  const handleDeleteAdmission = (id: string, email: string) => {
    deleteAdmissionById(id);
    if (email) {
      deleteUser(email);
      setPortalUsers(getValidUsers());
    }
    setAdmissionsLogs(getAdmissions());
  };

  const revenueData = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 520000 },
    { month: "Mar", revenue: 480000 },
    { month: "Apr", revenue: 610000 },
    { month: "May", revenue: 590000 },
    { month: "Jun", revenue: 750000 },
  ];

  const allStudents = portalUsers
    .filter(u => u.role === "student")
    .map(u => {
      const log = admissionsLogs.find(a => a.email === u.email) || {};
      return {
        email: u.email,
        id: log.id || "N/A",
        name: u.fullName || log.studentName || "Unknown",
        batch: log.cohort || "N/A",
        feeStatus: log.status === "Admitted" ? "Paid" : "Pending",
        performance: "N/A"
      };
    });

  const dynamicFaculty = portalUsers.filter((u: any) => u.role === "faculty").map((f: any, idx) => ({
    id: `PF-0${idx + 1}`,
    name: f.fullName || "Demo Faculty",
    role: "Senior Faculty",
    subject: "Assigned Subject",
    cohorts: "Alpha, Beta",
    totalStudents: 30,
    avgScore: "80%"
  }));
  
  // if no dynamic faculty, provide default static fallback
  const facultyList = dynamicFaculty.length > 0 ? dynamicFaculty : [
    { id: "PF-01", name: "R.P Kumar", role: "Senior Faculty", subject: "Physics", cohorts: "Alpha, Beta", totalStudents: 29, avgScore: "81%" },
    { id: "PF-02", name: "M. Kumar", role: "Senior Faculty", subject: "Chemistry", cohorts: "Beta, Gamma", totalStudents: 45, avgScore: "78%" },
    { id: "PF-03", name: "S. Iyer", role: "HOD", subject: "Mathematics", cohorts: "Alpha", totalStudents: 15, avgScore: "88%" },
    { id: "PF-04", name: "K. Reddy", role: "Faculty", subject: "Biology", cohorts: "Crash '25", totalStudents: 50, avgScore: "72%" },
  ];

  const auditLogs = [
    { id: "LOG-0992", event: "Admin config variable updated: MFA_ENFORCED", type: "Configuration", user: "DIR-01", time: "10:45 AM", status: "Success" },
    { id: "LOG-0991", event: "Failed login attempt (Invalid credentials)", type: "Access", user: "Unknown", time: "10:12 AM", status: "Failed" },
    { id: "LOG-0990", event: "Master DB connection established via Node 3", type: "Database", user: "System", time: "09:30 AM", status: "Success" },
    { id: "LOG-0989", event: "Faculty payload modified (PF-02)", type: "Database", user: "ADMIN-04", time: "08:15 AM", status: "Success" },
    { id: "LOG-0988", event: "Multiple failed login attempts detected", type: "Access", user: "192.168.1.44", time: "03:44 AM", status: "Warning" },
    { id: "LOG-0987", event: "Automated Daily Backup Success", type: "Database", user: "System", time: "02:00 AM", status: "Success" },
  ];

  const filteredLogs = auditFilter === "All" ? auditLogs : auditLogs.filter(log => log.type === auditFilter);

  const tabVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const handleGenerateFacultyReport = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Agastya - Master Faculty Performance Report", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text("Confidential - Director's Office", 14, 35);
    
    const tableColumn = ["ID", "Name", "Role", "Subject", "Assigned Cohorts", "Total Students", "Student Avg Score"];
    const tableRows: any[] = [];
    
    facultyList.forEach(faculty => {
      const facultyData = [
        faculty.id,
        faculty.name,
        faculty.role,
        faculty.subject,
        faculty.cohorts,
        faculty.totalStudents.toString(),
        faculty.avgScore
      ];
      tableRows.push(facultyData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    
    doc.save("Agastya_Faculty_Performance_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Founder Sidebar */}
      <aside className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col fixed md:sticky top-0 ${isMobileMenuOpen ? 'h-screen' : 'h-auto'} md:h-screen z-40 border-r border-[#D4AF37]/30 transition-all`}>
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-white font-serif italic text-xl tracking-tighter leading-none flex items-center gap-2">
              Agastya <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            </h1>
            <p className="text-[9px] text-[#D4AF37] uppercase tracking-[0.3em] font-bold mt-1">Founder's Office</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        <div className={`flex-1 flex col flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex overflow-y-auto`}>
          <div className="flex-1 py-6 px-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Institution</div>
            <NavItem active={activeTab === 'executive'} onClick={() => { setActiveTab('executive'); setIsMobileMenuOpen(false); }} icon={<Building2 className="w-4 h-4"/>} label="Executive Summary" />
            <NavItem active={activeTab === 'finance'} onClick={() => { setActiveTab('finance'); setIsMobileMenuOpen(false); }} icon={<DollarSign className="w-4 h-4"/>} label="Financials & Revenue" />
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Master Data</div>
            <NavItem active={activeTab === 'admissions'} onClick={() => { setActiveTab('admissions'); setIsMobileMenuOpen(false); }} icon={<UserPlus className="w-4 h-4"/>} label="Admissions Log" />
            <NavItem active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }} icon={<Users className="w-4 h-4"/>} label="Global Student List" />
            <NavItem active={activeTab === 'faculty'} onClick={() => { setActiveTab('faculty'); setIsMobileMenuOpen(false); }} icon={<GraduationCap className="w-4 h-4"/>} label="Faculty Roster" />
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Academic Control</div>
            <NavItem active={activeTab === 'academics'} onClick={() => { setActiveTab('academics'); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Content & Assessments" />
            <NavItem active={activeTab === 'live'} onClick={() => { setActiveTab('live'); setIsMobileMenuOpen(false); }} icon={<Video className="w-4 h-4"/>} label="Live Operations" />
            <Link to="/founder/schedule" onClick={() => setIsMobileMenuOpen(false)}>
              <NavItem icon={<Calendar className="w-4 h-4"/>} label="Central Scheduler" active={false} onClick={() => {}} />
            </Link>
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Portal Control</div>
            <NavItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} icon={<ShieldAlert className="w-4 h-4"/>} label="User Access Directory" />
            <NavItem active={activeTab === 'database'} onClick={() => { setActiveTab('database'); setIsMobileMenuOpen(false); }} icon={<Database className="w-4 h-4"/>} label="Database Management" />
            <NavItem active={activeTab === 'audit'} onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} icon={<Terminal className="w-4 h-4"/>} label="System Audit Log" />
            <NavItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} icon={<Settings className="w-4 h-4"/>} label="Global Settings" />
          </div>
          
          <RoleSwitcher />
          <div className="p-4 border-t border-[#D4AF37]/20">
            <div className="flex items-center gap-3 px-3 py-2 text-white/60 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#D4AF37] flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37]">{userFullName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-widest">{userFullName}</p>
                <p className="text-[9px] text-[#D4AF37] font-mono">Level 0 Clearance</p>
              </div>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="flex w-full items-center justify-center px-3 py-2 text-slate-900 bg-[#D4AF37] hover:bg-[#F3E5AB] transition-colors text-[10px] uppercase tracking-widest font-bold mt-4 cursor-pointer">
              Exit Secure Portal
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full mt-[70px] md:mt-0 p-4 md:p-8 lg:p-12 relative">
        {systemLocked && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-8 border-2 border-red-500 shadow-[8px_8px_0px_#ef4444] text-center max-w-sm">
              <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-900 mb-2">System Lockdown Active</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-mono">Global access restricted.</p>
              <button onClick={() => setSystemLocked(false)} className="bg-slate-900 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold w-full hover:bg-slate-800 transition-colors">
                Override Lockdown
              </button>
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 border-b border-slate-900 pb-6 gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Master Control Active
            </p>
            <h2 className="text-4xl font-serif text-slate-900 italic">Director's Dashboard</h2>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Global search..." className="pl-10 pr-4 py-2 border border-slate-900 bg-white text-sm font-mono focus:outline-none placeholder:text-slate-400 w-64 shadow-[4px_4px_0px_#1A1A1A]" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'executive' && (
            <motion.div 
              key="executive"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Global KPIs */}
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
              >
                <KpiCard title="Total ARR (Actualized)" value="₹3.4M" subtext="+12% YOY Growth" />
                <KpiCard title="Active Enrollments" value="842" subtext="Across 12 branches" />
                <KpiCard title="Faculty Payroll" value="24" subtext="Staffed teachers" />
                <KpiCard title="System Integrity" value="100%" subtext="Servers optimal" isSecure />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Chart */}
                <motion.div 
                  variants={itemVariants}
                  className="lg:col-span-2 bg-white border border-slate-900 p-8 shadow-[8px_8px_0px_#1A1A1A]"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em]">H1 Revenue Trajectory</h3>
                    <button className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] hover:text-slate-900 transition-colors">
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }} tickFormatter={(value) => `₹${value/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          formatter={(value: number) => `₹${value.toLocaleString()}`}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Master Controls */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-900 text-white border border-[#D4AF37]/30 p-8 shadow-[8px_8px_0px_#D4AF37]"
                >
                  <h3 className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4"/> Global Overrides
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">Emergency Actions</p>
                      <button 
                        onClick={() => setSystemLocked(true)}
                        className="w-full bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3 h-3" /> Institute System Lockdown
                      </button>
                      <p className="text-[9px] text-white/40 mt-2 font-mono leading-relaxed">Instantly suspends all student and faculty portal access.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">Data Management</p>
                      <button className="w-full bg-white text-slate-900 hover:bg-slate-200 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2">
                        <Download className="w-3 h-3" /> Backup Complete DB
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        {/* Global Student Master Data Viewer */}
        {activeTab === 'students' && (
          <motion.div 
            key="students"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <Database className="w-4 h-4"/> Master Student Register
              </h3>
              <div className="flex gap-2">
                <button className="bg-slate-100 text-slate-900 px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-slate-300 hover:bg-slate-200 transition-colors">
                  Filter Active
                </button>
                <button className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors">
                  Export Log
                </button>
              </div>
            </motion.div>

            <motion.table variants={itemVariants} className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">ID</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Name</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Cohort</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Academics</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Finance Status</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((student, idx) => {
                  const isEditing = editingStudent === student.email;
                  return (
                  <motion.tr variants={itemVariants} key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{student.id}</td>
                    
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {isEditing ? (
                        <input
                          autoFocus
                          className="border border-slate-300 p-1 w-full text-sm font-normal"
                          value={editStudentName}
                          onChange={(e) => setEditStudentName(e.target.value)}
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">
                      {isEditing ? (
                        <select 
                          className="border border-slate-300 p-1 w-full text-xs" 
                          value={editStudentCohort}
                          onChange={(e) => setEditStudentCohort(e.target.value)}
                        >
                          <option value="Alpha">Alpha</option>
                          <option value="Alpha RM">Alpha RM</option>
                          <option value="Beta">Beta</option>
                          <option value="Gamma">Gamma</option>
                          <option value="Crash '25">Crash '25</option>
                          <option value="Target NEET">Target NEET</option>
                          <option value="N/A">N/A</option>
                        </select>
                      ) : (
                        student.batch
                      )}
                    </td>
                    
                    <td className="py-4 px-4 text-xs font-mono">{student.performance} Avg</td>
                    
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${student.feeStatus === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : student.feeStatus === 'Overdue' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingStudent(null)} 
                            className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveStudent(student.email)} 
                            className="bg-slate-900 text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditStudent(student)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            handleDeleteStudent(student.email);
                          }} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )})}
              </tbody>
            </motion.table>
          </motion.div>
        )}

        {/* Global Faculty Roster */}
        {activeTab === 'faculty' && (
          <motion.div 
            key="faculty"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <GraduationCap className="w-4 h-4"/> Faculty Roster & Performance
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerateFacultyReport}
                  className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <FileOutput className="w-3 h-3" /> Generate Report (PDF)
                </button>
              </div>
            </motion.div>

            <motion.table variants={itemVariants} className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">ID</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Name</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Role & Subject</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Assigned Cohorts</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Total Pax</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Avg Output</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((faculty, idx) => (
                  <motion.tr variants={itemVariants} key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{faculty.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">{faculty.name}</td>
                    <td className="py-4 px-4">
                      <div className="text-[10px] uppercase tracking-widest font-bold mb-1">{faculty.role}</div>
                      <div className="text-xs text-slate-500">{faculty.subject}</div>
                    </td>
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">{faculty.cohorts}</td>
                    <td className="py-4 px-4 text-xs font-mono">{faculty.totalStudents}</td>
                    <td className="py-4 px-4 text-xs font-mono font-bold text-emerald-700">{faculty.avgScore}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-slate-900 transition-colors">View Profile</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </motion.div>
        )}

        {/* Global Admissions Log */}
        {activeTab === 'admissions' && (
          <motion.div 
            key="admissions"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <UserPlus className="w-4 h-4"/> Global Admissions & Enquiries
              </h3>
              <div className="flex gap-2">
                <button className="bg-slate-100 text-slate-900 px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-slate-300 hover:bg-slate-200 transition-colors">
                  Filter Active
                </button>
                <button className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors">
                  Export Log
                </button>
              </div>
            </motion.div>

            <motion.table variants={itemVariants} className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">App ID</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Date</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Student Name</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Portal Role</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Target Cohort</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Contact</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissionsLogs.map((log, idx) => {
                  const userAccount = portalUsers.find(u => u.email === log.email);
                  return (
                  <motion.tr variants={itemVariants} key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">{log.id}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{log.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {log.studentName}
                      <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-1">Prev: {log.previousSchool}</p>
                    </td>
                    <td className="py-4 px-4">
                      {userAccount ? (
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${
                          userAccount.role === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          userAccount.role === 'founder' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-amber-900' :
                          userAccount.role === 'faculty' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          userAccount.role === 'new user' ? 'border-slate-300 bg-slate-100 text-slate-500' :
                          'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}>
                          {userAccount.role}
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">No Account</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">{log.cohort}</td>
                    <td className="py-4 px-4 text-xs font-mono">{log.parentContact}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${
                        log.status === 'Admitted' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 
                        log.status === 'Rejected' ? 'border-red-200 bg-red-50 text-red-700' : 
                        log.status === 'Interview Scheduled' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                        'border-amber-200 bg-amber-50 text-amber-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-slate-900 hover:underline transition-colors block">View Application</button>
                        <button onClick={() => handleUpdateStatus(log.id, log.status)} className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 hover:text-emerald-800 transition-colors block">
                          {log.status === 'Pending Review' ? 'Schedule Intrv' : log.status === 'Interview Scheduled' ? 'Admit' : log.status === 'Admitted' ? 'Reject' : 'Reset to Pending'}
                        </button>
                        <button onClick={() => handleDeleteAdmission(log.id, log.email)} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-red-600 transition-colors block mt-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )})}
              </tbody>
            </motion.table>
          </motion.div>
        )}

        {activeTab === 'database' && (
          <motion.div 
            key="database"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                <Database className="w-4 h-4" /> Database Operations Hub
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Total Payload Size</p>
                  <p className="text-2xl font-serif italic text-slate-900">428.5 GB</p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Active Connections</p>
                  <p className="text-2xl font-serif italic text-slate-900">1,204</p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Sys. Latency</p>
                  <p className="text-2xl font-serif italic text-emerald-600">14ms</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-300 p-6 relative">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-4">Manual Overrides</h4>
                  <div className="space-y-4">
                    <button 
                      onClick={() => alert("Initiating complete master database backup to cold storage...")}
                      className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                      Trigger Master DB Backup
                    </button>
                    <button 
                      onClick={() => alert("Syncing distributed nodes... Please allow 2-5 minutes.")}
                      className="w-full bg-slate-50 text-slate-900 border border-slate-900 font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                    >
                      Synchronize Edge Nodes
                    </button>
                    <button 
                      onClick={() => {
                        alert("System cache purged.");
                      }}
                      className="w-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                      Purge Redis Cache
                    </button>
                  </div>
                </div>

                <div className="border border-slate-300 p-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-4">Recent Migrations</h4>
                  <div className="space-y-4">
                    <AuditItem text="Automated Daily Backup Success" time="02:00 AM Today" />
                    <AuditItem text="Syllabus Schema V4 Applied" time="Yesterday, 11:45 PM" />
                    <AuditItem text="Purged orphaned auth tokens" time="3 days ago" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Settings Viewer */}
        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Global Platform Settings
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Registered Institution Name</label>
                    <input type="text" defaultValue="Agastya Academy" className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-serif italic text-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Current Academic Cycle</label>
                    <input type="text" defaultValue="2026-2027 Phase I" className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Support Email Contact</label>
                    <input type="email" defaultValue="admin@agastya-edu.in" className="w-full border-b border-slate-300 py-2 focus:outline-none focus:border-slate-900 transition-colors font-mono text-sm" />
                  </div>
                  
                  <button onClick={() => alert("Global configuration saved successfully.")} className="bg-[#D4AF37] text-slate-900 px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#F3E5AB] transition-colors mt-4">
                    Save Variables
                  </button>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-900 mb-4 pb-2 border-b border-slate-200">Subsystem Toggles</h4>
                   
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-bold text-sm text-slate-900">Student Portal Access</p>
                       <p className="text-[10px] text-slate-500 font-mono">Allow students to log in and view content.</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-bold text-sm text-slate-900">Admissions Pipeline</p>
                       <p className="text-[10px] text-slate-500 font-mono">Public application form visibility.</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-bold text-sm text-slate-900">Automated SMS/Email Notifications</p>
                       <p className="text-[10px] text-slate-500 font-mono">Trigger external messaging (Billing applies).</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between opacity-50">
                     <div>
                       <p className="font-bold text-sm text-slate-900">MFA Enforced (Staff)</p>
                       <p className="text-[10px] text-slate-500 font-mono">Requires enterprise identity provider.</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                   </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Event Audit Log */}
        {activeTab === 'audit' && (
          <motion.div 
            key="audit"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-2 sm:p-8 overflow-x-auto"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 border-b border-slate-200 pb-6">
              <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <Terminal className="w-4 h-4"/> Real-Time Audit Log
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {['All', 'Access', 'Database', 'Configuration'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setAuditFilter(filter)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-colors ${auditFilter === filter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-900 hover:text-slate-900'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Log ID</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Timestamp</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Event Signature</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Actor</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Type</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{log.id}</td>
                    <td className="py-4 px-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest">{log.time}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 text-xs">{log.event}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">{log.user}</td>
                    <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">{log.type}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${log.status === 'Success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : log.status === 'Failed' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Global Academic Content & Assessments Control */}
        {activeTab === 'academics' && (
          <motion.div 
            key="academics"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Global Content & Assessments Registry
                </h3>
                <div className="flex gap-2">
                  <span className="bg-amber-100 text-amber-900 px-3 py-2 text-[9px] uppercase font-bold tracking-widest border border-amber-200">
                    Hierarchy: Director Override
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Global Assignments/Quizzes */}
                <motion.div variants={itemVariants} className="border border-slate-300 p-6">
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
                </motion.div>

                {/* System-Wide Resources */}
                <motion.div variants={itemVariants} className="border border-slate-300 p-6">
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
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Live Operations Control */}
        {activeTab === 'live' && (
          <motion.div 
            key="live"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
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
                <motion.div variants={itemVariants} className="bg-slate-900 text-white p-6 shadow-[4px_4px_0px_#1A1A1A]">
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
                </motion.div>

                <motion.div variants={itemVariants} className="bg-slate-900 text-white p-6 shadow-[4px_4px_0px_#1A1A1A]">
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
                </motion.div>
                
                <motion.div variants={itemVariants} className="bg-white border border-slate-300 p-6">
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
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
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
                          className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border focus:outline-none cursor-pointer ${
                            u.role === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            u.role === 'founder' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-amber-900' :
                            u.role === 'faculty' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                            u.role === 'new user' ? 'border-slate-300 bg-slate-100 text-slate-500' :
                            'border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                          value={u.role}
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
          </motion.div>
        )}

        {(activeTab !== 'executive' && activeTab !== 'finance' && activeTab !== 'students' && activeTab !== 'faculty' && activeTab !== 'admissions' && activeTab !== 'database' && activeTab !== 'settings' && activeTab !== 'audit' && activeTab !== 'academics' && activeTab !== 'live' && activeTab !== 'users') && (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300"
          >
            <Building2 className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-xl font-serif italic text-slate-700 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-sm font-mono text-slate-500 max-w-md text-center">Super-admin controls for this module are routed through the internal secure intranet.</p>
            <button onClick={() => setActiveTab('executive')} className="mt-6 border-b border-slate-900 text-slate-900 text-[10px] uppercase font-bold tracking-widest pb-1 hover:opacity-70 transition-opacity">Return to Executive View</button>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-[11px] uppercase tracking-widest font-semibold border-l-2 ${active ? 'bg-slate-800 text-[#D4AF37] border-[#D4AF37]' : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function KpiCard({ title, value, subtext, isSecure = false }: { title: string, value: string | number, subtext: string, isSecure?: boolean }) {
  return (
    <div className={`border p-6 shadow-[6px_6px_0px_#1A1A1A] ${isSecure ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-slate-900' : 'bg-white border-slate-900 text-slate-900'}`}>
      <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-4 ${isSecure ? 'text-[#D4AF37]' : 'text-slate-500'}`}>{title}</h3>
      <div className="text-4xl font-serif italic mb-2 text-slate-900">{value}</div>
      <p className="text-[10px] font-mono tracking-widest text-slate-500">{subtext}</p>
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
