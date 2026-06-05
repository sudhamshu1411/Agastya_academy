import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, LogOut, CheckCircle2, Circle, Activity, FileText, ChevronRight, Users, AlertCircle, Video, Menu, X, UserCheck, UploadCloud, File, Image as ImageIcon, Film } from "lucide-react";
import { motion } from "motion/react";
import { getAssessments, saveAssessment, deleteAssessment, getMaterials, saveMaterial, revokeMaterial, getSubmissions, gradeSubmission, getInterventions, logIntervention, getMeetings, getBatches, saveBatch, getAttendanceLogs, saveAttendanceLogs, getStudentAttendancePercentage } from "../lib/store";
import { getValidUsers } from "../lib/users";
import { getAdmissions } from "../lib/admissions";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function FacultyDashboard() {
  const navigate = useNavigate();
  const userFullName = "R.P Kumar";
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [meetings, setMeetings] = useState(getMeetings());
  const classes = meetings; // showing all meetings including PTM and Interviews

  const [batches, setBatches] = useState(getBatches());
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [newCohortData, setNewCohortData] = useState({ name: "", syllabus: "" });
  const [rosterView, setRosterView] = useState<number | null>(null);

  // --- Attendance States ---
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceBatch, setAttendanceBatch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const handleOpenAttendance = async (batchName: string) => {
    const portalUsers = getValidUsers();
    const admissionsLogs = await getAdmissions();
    
    const studentsInBatch = portalUsers
      .filter((u: any) => u.role === "student")
      .map((u: any) => {
        const log = admissionsLogs.find((a: any) => a.email === u.email) || {};
        const name = u.fullName || log.studentName || "Unknown";
        return {
          email: u.email,
          name,
          batch: log.cohort || "N/A"
        };
      })
      .filter((s: any) => {
        const bNameLower = batchName.toLowerCase();
        const sBatchLower = s.batch.toLowerCase();
        
        return sBatchLower === bNameLower || 
               bNameLower.includes(sBatchLower) || 
               sBatchLower.includes(bNameLower) ||
               (bNameLower.includes("alpha") && sBatchLower.includes("alpha")) ||
               (bNameLower.includes("beta") && sBatchLower.includes("beta")) ||
               (bNameLower.includes("gamma") && sBatchLower.includes("gamma"));
      });

    const initialRecords = studentsInBatch.map((s: any) => ({
      email: s.email,
      name: s.name,
      status: "Present" as "Present" | "Absent"
    }));

    setAttendanceBatch(batchName);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setAttendanceRecords(initialRecords);
    setIsAttendanceModalOpen(true);
  };

  const handleToggleAttendance = (email: string) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.email === email) {
        return {
          ...rec,
          status: rec.status === "Present" ? "Absent" : "Present"
        };
      }
      return rec;
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceRecords.length === 0) {
      alert("No student records found to save attendance.");
      return;
    }
    
    const logsToSave = attendanceRecords.map(r => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: r.email,
      studentName: r.name,
      batch: attendanceBatch,
      date: attendanceDate,
      status: r.status,
      recordedBy: userFullName
    }));

    saveAttendanceLogs(logsToSave);
    setIsAttendanceModalOpen(false);
    alert(`Success!\n\nAttendance successfully saved for "${attendanceBatch}" under date ${attendanceDate}.\nPresent: ${attendanceRecords.filter(r => r.status === 'Present').length}, Absent: ${attendanceRecords.filter(r => r.status === 'Absent').length}`);
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", batch: "" });
  const [uploadFileContext, setUploadFileContext] = useState<{file: File | null, isDragging: boolean}>({file: null, isDragging: false});

  const [isDppModalOpen, setIsDppModalOpen] = useState(false);
  const [dppData, setDppData] = useState({ title: "", type: "DPP", batch: "", due: "" });
  const [dppFileContext, setDppFileContext] = useState<{file: File | null, isDragging: boolean}>({file: null, isDragging: false});

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, description: string, onConfirm: () => void} | null>(null);

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortData.name) return;
    const newBatch = {
      id: Date.now(),
      name: newCohortData.name,
      size: 0,
      avgScore: 0,
      syllabus: newCohortData.syllabus || "Pending Setup"
    };
    saveBatch(newBatch);
    setBatches(getBatches());
    setIsCohortModalOpen(false);
    setNewCohortData({ name: "", syllabus: "" });
  };

  const handleUploadNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.title) return;
    
    const finalize = (fileUrl: string | null = null, fileType: string | null = null) => {
      const newRes = { 
        id: Date.now(), 
        title: uploadData.title, 
        size: uploadFileContext.file ? `${(uploadFileContext.file.size / 1024 / 1024).toFixed(2)} MB` : "0.5 MB", 
        batch: uploadData.batch || "All Batches",
        url: fileUrl || "https://pdfobject.com/pdf/sample.pdf",
        fileType: fileType || "application/pdf"
      };
      saveMaterial(newRes);
      setResources(getMaterials());
      setIsUploadModalOpen(false);
      setUploadData({ title: "", batch: "" });
      setUploadFileContext({ file: null, isDragging: false });
    };

    if (uploadFileContext.file) {
      if (uploadFileContext.file.size > 1.5 * 1024 * 1024) { // over 1.5MB use object url (temporary)
        finalize(URL.createObjectURL(uploadFileContext.file), uploadFileContext.file.type);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => finalize(ev.target?.result as string, uploadFileContext.file!.type);
        reader.readAsDataURL(uploadFileContext.file);
      }
    } else {
      finalize();
    }
  };

  const handlePublishDpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dppData.title) return;
    
    const finalize = (fileUrl: string | null = null, fileType: string | null = null) => {
      const newAsm = { 
        id: Date.now(), 
        type: dppData.type, 
        due: dppData.due || "Tomorrow", 
        title: dppData.title, 
        batch: dppData.batch || "All Classes", 
        color: dppData.type === 'Quiz' ? 'amber' : dppData.type === 'DPP' ? 'blue' : 'emerald',
        url: fileUrl || "https://pdfobject.com/pdf/sample.pdf",
        fileType: fileType || "application/pdf"
      };
      saveAssessment(newAsm);
      setAssessments(getAssessments());
      setIsDppModalOpen(false);
      setDppData({ title: "", type: "DPP", batch: "", due: "" });
      setDppFileContext({ file: null, isDragging: false });
    };

    if (dppFileContext.file) {
      if (dppFileContext.file.size > 1.5 * 1024 * 1024) {
        finalize(URL.createObjectURL(dppFileContext.file), dppFileContext.file.type);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => finalize(ev.target?.result as string, dppFileContext.file!.type);
        reader.readAsDataURL(dppFileContext.file);
      }
    } else {
      finalize();
    }
  };

  const [submissions, setSubmissions] = useState(getSubmissions());
  const [urgentStudents, setUrgentStudents] = useState(getInterventions());
  const [assessments, setAssessments] = useState(getAssessments());
  const [resources, setResources] = useState(getMaterials());
  const [viewingMaterial, setViewingMaterial] = useState<any>(null);
  const [viewingExam, setViewingExam] = useState<any>(null);
  
  useEffect(() => {
    setSubmissions(getSubmissions());
    setUrgentStudents(getInterventions());
    setAssessments(getAssessments());
    setResources(getMaterials());
    setMeetings(getMeetings());
    
    const handleStorageChange = () => {
      setMeetings(getMeetings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Faculty Sidebar */}
      <aside className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col fixed md:sticky top-0 ${isMobileMenuOpen ? 'h-screen' : 'h-auto'} md:h-screen z-40 border-r border-slate-900 transition-all`}>
        <div className="p-6 border-b border-white/20 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-white font-serif italic text-xl tracking-tighter leading-none">Agastya</h1>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold mt-1">Faculty Portal</p>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        <div className={`flex-1 flex col flex-col ${isMobileMenuOpen ? 'block' : 'hidden'} md:flex overflow-y-auto`}>
          <div className="flex-1 py-6 px-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Instruction</div>
            <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} icon={<Activity className="w-4 h-4"/>} label="Overview & Schedule" />
            <NavItem active={activeTab === 'batches'} onClick={() => { setActiveTab('batches'); setIsMobileMenuOpen(false); }} icon={<Users className="w-4 h-4"/>} label="My Batches" />
            
            <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Evaluation</div>
            <NavItem active={activeTab === 'evaluations'} onClick={() => { setActiveTab('evaluations'); setIsMobileMenuOpen(false); }} icon={<CheckCircle2 className="w-4 h-4"/>} label="Submissions & Grading" />
            <NavItem active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }} icon={<AlertCircle className="w-4 h-4"/>} label="Student Interventions" />
            <NavItem active={activeTab === 'materials'} onClick={() => { setActiveTab('materials'); setIsMobileMenuOpen(false); }} icon={<FileText className="w-4 h-4"/>} label="Content & Uploads" />
          </div>
          
          <RoleSwitcher />
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3 px-3 py-2 text-white/60 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-white">{userFullName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-widest">{userFullName}</p>
                <p className="text-[9px] text-white/60 font-mono">Senior Faculty</p>
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Welcome Back, {userFullName}</p>
            <h2 className="text-4xl font-serif text-slate-900 italic">Instruction Dashboard</h2>
          </div>
          <div className="flex gap-4 items-center">
            <div className="px-4 py-2 bg-slate-100 border border-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">On Duty</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Today's Schedule */}
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <Calendar className="w-4 h-4"/> Upcoming Itinerary
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <div className="space-y-4">
                  {classes.map((cls, idx) => (
                    <div key={idx} className="border border-slate-200 p-4 hover:border-slate-400 transition-colors bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-300 px-2 py-0.5 bg-white">{cls.type}</span>
                          <span className="text-[10px] font-mono uppercase text-slate-500">{cls.date} • {cls.time}</span>
                        </div>
                        <h4 className="font-serif italic text-xl text-slate-900 mt-2 mb-1">{cls.title}</h4>
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-500">{cls.target || cls.batch}</p>
                      </div>
                      <div className="flex items-center">
                        {cls.link && cls.link.startsWith("http") ? (
                          <a href={cls.link} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 h-fit">
                            <Video className="w-4 h-4" /> Start Meet
                          </a>
                        ) : (
                          <button onClick={() => alert("Meeting link is not generated for this session.")} className="bg-slate-200 text-slate-500 px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 h-fit cursor-not-allowed">
                            <Video className="w-4 h-4" /> No Link
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Attention */}
              <div className="bg-red-50 border border-red-900 shadow-[8px_8px_0px_#7f1d1d] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-900" />
                  <h3 className="font-bold text-red-900 uppercase text-[10px] tracking-[0.3em]">Critical Analytics Warnings</h3>
                </div>
                
                <div className="space-y-3">
                  {urgentStudents.filter(s => !s.logged).length > 0 ? urgentStudents.filter(s => !s.logged).map(student => (
                    <div key={student.id} className="bg-white border border-red-200 p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">{student.name}</p>
                          <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500">{student.batch}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{student.issue}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold font-mono border border-red-200">{student.metric}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-800 text-xs font-bold uppercase tracking-widest">All caught up!</p>
                      <p className="text-emerald-700 text-[10px] mt-1">No urgent interventions required.</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setActiveTab('students')} className="mt-6 text-[10px] uppercase tracking-widest font-bold text-red-900 hover:opacity-70 transition-opacity">View Full List →</button>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-8">
              {/* Batches Overview */}
              <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_var(--color-slate-900)]">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Active Batches ({batches.length})</h3>
                <div className="space-y-4">
                  {batches.map(b => (
                    <div key={b.id} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest">{b.name}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 px-1">{b.size} Pax</span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2">Avg: {b.avgScore}%</p>
                      <p className="text-[10px] text-slate-600 leading-relaxed"><span className="font-bold text-slate-900 uppercase tracking-widest">Focus:</span> {b.syllabus}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 text-white border border-slate-900 p-6 shadow-[8px_8px_0px_var(--color-slate-900)]">
                <h3 className="font-bold text-white/50 uppercase text-[10px] tracking-[0.3em] mb-6">Faculty Logistics</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors">
                    Upload Lecture Notes
                  </button>
                  <button 
                    onClick={() => setIsDppModalOpen(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors">
                    Publish Next DPP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Cohort Management
                </h3>
                <button 
                  onClick={() => setIsCohortModalOpen(true)}
                  className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                  + Create New Cohort
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {batches.map(b => (
                  <div key={b.id} className="border border-slate-300 p-6 relative group hover:border-slate-900 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-serif italic text-slate-900">{b.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{b.size} Students Enrolled</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-[10px] font-bold font-mono">
                        Avg {b.avgScore}%
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Active Syllabus</p>
                      <p className="text-sm text-slate-700">{b.syllabus}</p>
                    </div>
                    <div className="flex flex-col border-t border-slate-200 pt-4 mt-6 gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setRosterView(b.id)}
                          className="flex-1 bg-slate-50 border border-slate-300 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            View Roster
                        </button>
                        <button onClick={() => navigate("/faculty/schedule")} className="flex-1 bg-slate-50 border border-slate-300 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:bg-slate-100 transition-colors">Schedule Meet</button>
                      </div>
                      <button 
                        onClick={() => handleOpenAttendance(b.name)}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        <UserCheck className="w-3.5 h-3.5" /> Mark Daily Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Submissions & Grading
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Student</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Cohort</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Assessment</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Date</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
                      <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Score/Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900 text-sm">{sub.student}</td>
                        <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">{sub.batch}</td>
                        <td className="py-4 px-4 text-xs text-slate-700">{sub.title}</td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-mono">{sub.date}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-[10px] font-bold font-mono border ${sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {sub.status === 'Graded' ? (
                            <span className="font-bold text-slate-900">{sub.score !== null ? `${sub.score}%` : 'N/A'}</span>
                          ) : (
                            <div className="flex justify-end items-center gap-2">
                               <input 
                                 type="number" 
                                 placeholder="Score"
                                 className="w-16 border border-slate-300 px-2 py-1 text-xs"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     const score = (e.target as HTMLInputElement).value;
                                     if(score) {
                                       gradeSubmission(sub.id, parseInt(score));
                                       setSubmissions(getSubmissions());
                                     }
                                   }
                                 }}
                               />
                               <span className="text-[9px] text-slate-400">Press Enter</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
            <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Academic Interventions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Student Ref</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Cohort</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Flagged Issue</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">Metric</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentStudents.map((student, idx) => (
                    <tr key={idx} className={`border-b border-slate-200 transition-colors ${student.logged ? 'bg-slate-50 opacity-50' : 'hover:bg-red-50/30'}`}>
                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">{student.name}</td>
                      <td className="py-4 px-4 text-[10px] uppercase tracking-widest font-mono text-slate-500">{student.batch}</td>
                      <td className={`py-4 px-4 text-xs ${student.logged ? 'text-slate-500' : 'text-red-900'}`}>{student.issue}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-[10px] font-bold font-mono border ${student.logged ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{student.metric}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {student.logged ? (
                           <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/> Resolved</span>
                        ) : (
                          <button onClick={() => {
                            const message = prompt("Enter intervention notes for " + student.name + ":");
                            if (message !== null) {
                              logIntervention(student.id, message);
                              setUrgentStudents(getInterventions());
                            }
                          }} className="text-[10px] uppercase tracking-widest font-bold text-slate-900 hover:text-red-700 transition-colors border-b border-slate-900 hover:border-red-700 pb-0.5">Log Intervention</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Content & Assessments Control
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setIsUploadModalOpen(true)} className="bg-slate-100 border border-slate-300 text-slate-900 px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-200 transition-colors">
                    Upload Resource
                  </button>
                  <button onClick={() => setIsDppModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                    + Create Assessment
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Assignments/Quizzes */}
                <div className="border border-slate-300 p-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-200">Active Quizzes & Assignments</h4>
                  <div className="space-y-4">
                    {assessments.length > 0 ? assessments.map(assessment => (
                      <div key={assessment.id} className="flex justify-between items-center group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 ${assessment.color === 'amber' ? 'text-amber-900 bg-amber-100' : assessment.color === 'blue' ? 'text-blue-900 bg-blue-100' : 'text-emerald-900 bg-emerald-100'}`}>{assessment.type}</span>
                            <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">Due: {assessment.due}</span>
                          </div>
                          <h5 onClick={() => setViewingExam(assessment)} className="font-bold text-sm text-slate-900 border-b border-transparent hover:border-slate-900 inline-block transition-colors cursor-pointer">{assessment.title}</h5>
                          <p className="text-[10px] text-slate-500 font-mono">{assessment.batch}</p>
                        </div>
                        <button onClick={() => {
                           setConfirmDialog({
                             isOpen: true,
                             title: `Delete Assessment`,
                             description: `Are you sure you want to delete ${assessment.title}? This action cannot be undone.`,
                             onConfirm: () => {
                               deleteAssessment(assessment.id);
                               setAssessments(getAssessments());
                               setConfirmDialog(null);
                             }
                           });
                        }} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-red-600 hover:underline transition-colors">Delete</button>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic">No active assessments.</p>
                    )}
                  </div>
                </div>

                {/* Internal Resources */}
                <div className="border border-slate-300 p-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 pb-2 border-b border-slate-200">Shared Study Resources</h4>
                  <div className="space-y-4">
                    {resources.length > 0 ? resources.map(resource => (
                      <div key={resource.id} className="flex justify-between items-center group">
                        <div>
                          <h5 onClick={() => setViewingMaterial(resource)} className="font-bold text-sm text-slate-900 border-b border-transparent group-hover:border-slate-900 inline-block transition-colors cursor-pointer">{resource.title}</h5>
                          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex gap-2"><span>{resource.size}</span> <span>{resource.batch}</span></p>
                        </div>
                        <button onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: `Revoke Material`,
                            description: `Are you sure you want to revoke access to ${resource.title}?`,
                            onConfirm: () => {
                              revokeMaterial(resource.id);
                              setResources(getMaterials());
                              setConfirmDialog(null);
                            }
                          });
                        }} className="text-slate-400 hover:text-red-600 transition-colors text-[10px] uppercase tracking-widest font-bold">Revoke</button>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic">No shared resources.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCohortModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-md w-full p-8 relative">
              <button 
                onClick={() => setIsCohortModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="font-serif italic text-2xl text-slate-900 mb-6">Create New Cohort</h3>
              
              <form onSubmit={handleCreateCohort} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Cohort Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCohortData.name}
                    onChange={(e) => setNewCohortData({...newCohortData, name: e.target.value})}
                    placeholder="e.g. Gamma Batch (JEE Adv)"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Initial Syllabus Focus (Optional)</label>
                  <input 
                    type="text" 
                    value={newCohortData.syllabus}
                    onChange={(e) => setNewCohortData({...newCohortData, syllabus: e.target.value})}
                    placeholder="e.g. Kinematics"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsCohortModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-600 px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                    Create Cohort
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {rosterView !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-2xl w-full p-8 relative max-h-[80vh] flex flex-col">
              <button 
                onClick={() => setRosterView(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="font-serif italic text-2xl text-slate-900">Student Roster</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  {batches.find(b => b.id === rosterView)?.name || "Cohort"}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 border-y border-slate-200 py-4">
                {batches.find(b => b.id === rosterView)?.size === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No students currently enrolled in this cohort.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="py-2 px-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">Name</th>
                        <th className="py-2 px-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Generating mock students based on size */}
                      {Array.from({ length: batches.find(b => b.id === rosterView)?.size || 0 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 text-sm text-slate-900">Student {String.fromCharCode(65 + (i % 26))}</td>
                          <td className="py-3 px-2 text-right">
                            <span className="text-[9px] uppercase tracking-widest font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="mt-6">
                <button onClick={() => setRosterView(null)} className="w-full bg-slate-900 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                  Close Roster
                </button>
              </div>
            </div>
          </div>
        )}

        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-md w-full p-8 relative">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="font-serif italic text-2xl text-slate-900 mb-6">Upload Notes</h3>
              
              <form onSubmit={handleUploadNotes} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Resource Document</label>
                  <div 
                    className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer group ${uploadFileContext.isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-500'}`}
                    onDragOver={(e) => { e.preventDefault(); setUploadFileContext(prev => ({...prev, isDragging: true})); }}
                    onDragLeave={() => setUploadFileContext(prev => ({...prev, isDragging: false}))}
                    onDrop={(e) => {
                      e.preventDefault();
                      setUploadFileContext(prev => ({...prev, isDragging: false}));
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setUploadFileContext(prev => ({...prev, file}));
                        if (!uploadData.title) setUploadData(prev => ({...prev, title: file.name}));
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,image/*,video/*';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadFileContext(prev => ({...prev, file}));
                          if (!uploadData.title) setUploadData(prev => ({...prev, title: file.name}));
                        }
                      };
                      input.click();
                    }}
                  >
                    {!uploadFileContext.file ? (
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className={`w-8 h-8 ${uploadFileContext.isDragging ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-700">Drag and drop file here</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">Supports PDF, Images, Video</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {uploadFileContext.file.type.includes('pdf') ? <File className="w-8 h-8 text-slate-700" /> : uploadFileContext.file.type.includes('image') ? <ImageIcon className="w-8 h-8 text-slate-700" /> : uploadFileContext.file.type.includes('video') ? <Film className="w-8 h-8 text-slate-700" /> : <File className="w-8 h-8 text-slate-700" />}
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{uploadFileContext.file.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">{(uploadFileContext.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setUploadFileContext({file: null, isDragging: false}); setUploadData(prev => ({...prev, title: ''})); }} className="text-[10px] uppercase tracking-widest font-bold text-red-600 hover:text-red-800 mt-2">Remove File</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Resource Title</label>
                  <input 
                    type="text" 
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="e.g. Physics_Notes.pdf"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Target Batch</label>
                  <input 
                    type="text" 
                    value={uploadData.batch}
                    onChange={(e) => setUploadData({...uploadData, batch: e.target.value})}
                    placeholder="e.g. All Batches"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-600 px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-md w-full p-8 relative">
              <button 
                onClick={() => setIsDppModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="font-serif italic text-2xl text-slate-900 mb-6">Publish Assessment</h3>
              
              <form onSubmit={handlePublishDpp} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Assessment Document</label>
                  <div 
                    className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer group ${dppFileContext.isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-500'}`}
                    onDragOver={(e) => { e.preventDefault(); setDppFileContext(prev => ({...prev, isDragging: true})); }}
                    onDragLeave={() => setDppFileContext(prev => ({...prev, isDragging: false}))}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDppFileContext(prev => ({...prev, isDragging: false}));
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setDppFileContext(prev => ({...prev, file}));
                        if (!dppData.title) setDppData(prev => ({...prev, title: file.name.replace(/\.[^/.]+$/, "")}));
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,image/*';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          setDppFileContext(prev => ({...prev, file}));
                          if (!dppData.title) setDppData(prev => ({...prev, title: file.name.replace(/\.[^/.]+$/, "")}));
                        }
                      };
                      input.click();
                    }}
                  >
                    {!dppFileContext.file ? (
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className={`w-8 h-8 ${dppFileContext.isDragging ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-700">Drop DPP / Quiz file here</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">Supports PDF, Images</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {dppFileContext.file.type.includes('pdf') ? <File className="w-8 h-8 text-slate-700" /> : <ImageIcon className="w-8 h-8 text-slate-700" />}
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{dppFileContext.file.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">{(dppFileContext.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setDppFileContext({file: null, isDragging: false}); setDppData(prev => ({...prev, title: ''})); }} className="text-[10px] uppercase tracking-widest font-bold text-red-600 hover:text-red-800 mt-2">Remove File</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Assessment Title</label>
                  <input 
                    type="text" 
                    required
                    value={dppData.title}
                    onChange={(e) => setDppData({...dppData, title: e.target.value})}
                    placeholder="e.g. Mechanics Quiz 1"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Format</label>
                    <select 
                      value={dppData.type}
                      onChange={(e) => setDppData({...dppData, type: e.target.value})}
                      className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors bg-white">
                      <option value="DPP">DPP</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Test">Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Due Date</label>
                    <input 
                      type="text" 
                      value={dppData.due}
                      onChange={(e) => setDppData({...dppData, due: e.target.value})}
                      placeholder="e.g. Tomorrow"
                      className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Target Cohort</label>
                  <input 
                    type="text" 
                    value={dppData.batch}
                    onChange={(e) => setDppData({...dppData, batch: e.target.value})}
                    placeholder="e.g. All Classes"
                    className="w-full border border-slate-300 p-3 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsDppModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-600 px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-xl w-full p-8 relative max-h-[90vh] flex flex-col font-sans">
              <button 
                onClick={() => setIsAttendanceModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="border-b border-slate-200 pb-4 mb-6">
                <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block mb-1">Faculty Logistics // Registrar</span>
                <h3 className="font-serif italic text-3xl text-slate-900">Daily Attendance</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">Batch: {attendanceBatch}</p>
              </div>

              <form onSubmit={handleSaveAttendance} className="flex-grow flex flex-col min-h-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 p-4 border border-slate-200">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-700 mb-1 font-mono">Attendance Date</label>
                    <input 
                      type="date"
                      required
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cohort Strength</p>
                    <p className="text-lg font-mono font-bold text-slate-800">{attendanceRecords.length} Student{attendanceRecords.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 border border-slate-200">
                  {attendanceRecords.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs italic bg-slate-50/50">
                      No active student accounts found registered in this batch.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {attendanceRecords.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 text-xs uppercase tracking-wide">{r.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">{r.email}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                if (r.status !== 'Present') handleToggleAttendance(r.email);
                              }}
                              className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                                r.status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_#064e3b]'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (r.status !== 'Absent') handleToggleAttendance(r.email);
                              }}
                              className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                                r.status === 'Absent'
                                  ? 'bg-rose-500 text-white shadow-[2px_2px_0px_#4c0519]'
                                  : 'text-slate-500 hover:text-rose-600'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-100 font-sans">
                  <button 
                    type="button"
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="w-full sm:w-auto border border-slate-300 text-slate-700 font-bold text-[10px] uppercase tracking-widest py-3 px-6 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-8 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Save Logs
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_var(--color-slate-900)] max-w-sm w-full p-8 relative">
            <button 
              onClick={() => setConfirmDialog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
            <h3 className="font-serif italic text-2xl text-slate-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDialog(null)} 
                className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-200 transition-colors border border-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="flex-1 bg-red-600 text-white px-4 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-red-700 transition-colors border border-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Viewer Modal */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full max-w-6xl bg-white flex flex-col border border-slate-900 shadow-[16px_16px_0px_var(--color-slate-900)]"
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
          </motion.div>
        </div>
      )}

      {/* Exam Viewer Modal */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full max-w-6xl bg-white flex flex-col shadow-[16px_16px_0px_var(--color-slate-900)]"
          >
            <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1 block">{viewingExam.type} Preview</span>
                <h3 className="font-serif italic text-2xl">{viewingExam.title}</h3>
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
                  <FileText className="w-16 h-16 text-slate-300 mb-6" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Simulated Assessment Viewer</h2>
                  <p className="text-slate-500 text-sm max-w-sm">This is where the {viewingExam.type} content would be rendered.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewingExam(null)} className="px-8 py-3 bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition shadow-[4px_4px_0px_#450a0a] hover:shadow-[2px_2px_0px_#450a0a]">
                Close Preview
              </button>
            </div>
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
