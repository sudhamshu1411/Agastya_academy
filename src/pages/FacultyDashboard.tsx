import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, LogOut, CheckCircle2, Circle, Activity, FileText, ChevronRight, Users, AlertCircle, Video } from "lucide-react";
import { motion } from "motion/react";
import { getAssessments, saveAssessment, deleteAssessment, getMaterials, saveMaterial, revokeMaterial, getSubmissions, gradeSubmission, getInterventions, logIntervention, getMeetings } from "../lib/store";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function FacultyDashboard() {
  const navigate = useNavigate();
  const userFullName = localStorage.getItem("userFullName") || "R.P Kumar";
  const [activeTab, setActiveTab] = useState("overview");

  const [meetings, setMeetings] = useState(getMeetings());
  const classes = meetings; // showing all meetings including PTM and Interviews

  const batches = [
    { id: 1, name: "Alpha Batch (NEET RM)", size: 15, avgScore: 88, syllabus: "Mechanics, Rotational Dynamics" },
    { id: 2, name: "Beta Batch", size: 14, avgScore: 74, syllabus: "Thermodynamics" }
  ];

  const [submissions, setSubmissions] = useState(getSubmissions());
  const [urgentStudents, setUrgentStudents] = useState(getInterventions());
  const [assessments, setAssessments] = useState(getAssessments());
  const [resources, setResources] = useState(getMaterials());
  
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
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-40 border-r border-slate-900">
        <div className="p-6 border-b border-white/20 flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-white font-serif italic text-xl tracking-tighter leading-none">Agastya</h1>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold mt-1">Faculty Portal</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Instruction</div>
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity className="w-4 h-4"/>} label="Overview & Schedule" />
          <NavItem active={activeTab === 'batches'} onClick={() => setActiveTab('batches')} icon={<Users className="w-4 h-4"/>} label="My Batches" />
          
          <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-8 mb-2">Evaluation</div>
          <NavItem active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} icon={<CheckCircle2 className="w-4 h-4"/>} label="Submissions & Grading" />
          <NavItem active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<AlertCircle className="w-4 h-4"/>} label="Student Interventions" />
          <NavItem active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={<FileText className="w-4 h-4"/>} label="Content & Uploads" />
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
              <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                    <Calendar className="w-4 h-4"/> Today's Itinerary
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">May 30, 2026</span>
                </div>
                
                <div className="space-y-4">
                  {classes.map((cls, idx) => (
                    <div key={idx} className="border border-slate-200 p-4 hover:border-slate-400 transition-colors bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-300 px-2 py-0.5 bg-white">{cls.type}</span>
                          <span className="text-[10px] font-mono uppercase text-slate-500">{cls.time}</span>
                        </div>
                        <h4 className="font-serif italic text-xl text-slate-900 mt-2 mb-1">{cls.title}</h4>
                        <p className="text-xs uppercase tracking-widest font-bold text-slate-500">{cls.target || cls.batch}</p>
                      </div>
                      <div className="flex items-center">
                        {cls.link && cls.link !== "No Link generated" && (
                          <a href={cls.link} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 h-fit">
                            <Video className="w-4 h-4" /> Start Meet
                          </a>
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
              <div className="bg-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] mb-6">Active Batches (2)</h3>
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
              <div className="bg-slate-900 text-white border border-slate-900 p-6 shadow-[8px_8px_0px_#1A1A1A]">
                <h3 className="font-bold text-white/50 uppercase text-[10px] tracking-[0.3em] mb-6">Faculty Logistics</h3>
                <div className="space-y-3">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors">
                    Upload Lecture Notes
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors">
                    Publish Next DPP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Cohort Management
                </h3>
                <button className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
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
                    <div className="flex border-t border-slate-200 pt-4 mt-6 gap-2">
                       <button className="flex-1 bg-slate-50 border border-slate-300 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:bg-slate-100 transition-colors">View Roster</button>
                       <button onClick={() => navigate("/faculty/schedule")} className="flex-1 bg-slate-50 border border-slate-300 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:bg-slate-100 transition-colors">Schedule Meet</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
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
          <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
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
            <div className="bg-white border border-slate-900 shadow-[8px_8px_0px_#1A1A1A] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Content & Assessments Control
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const title = prompt("Enter resource title (e.g., Physics_Notes.pdf):");
                    if(title) {
                      const batch = prompt("Enter target batch:") || "All Batches";
                      const newRes = { id: Date.now(), title, size: "0.5 MB", batch };
                      saveMaterial(newRes);
                      setResources(getMaterials());
                    }
                  }} className="bg-slate-100 border border-slate-300 text-slate-900 px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-200 transition-colors">
                    Upload Resource
                  </button>
                  <button onClick={() => {
                    const title = prompt("Enter assessment title:");
                    if(title) {
                      const type = prompt("Enter type (Quiz/DPP/Test):") || "Quiz";
                      const batch = prompt("Enter target cohort:") || "All Classes";
                      const due = prompt("Enter due date/time:") || "Tomorrow";
                      const newAsm = { id: Date.now(), type, due, title, batch, color: type === 'Quiz' ? 'amber' : type === 'DPP' ? 'blue' : 'emerald' };
                      saveAssessment(newAsm);
                      setAssessments(getAssessments());
                    }
                  }} className="bg-slate-900 text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-800 transition-colors">
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
                          <h5 className="font-bold text-sm text-slate-900">{assessment.title}</h5>
                          <p className="text-[10px] text-slate-500 font-mono">{assessment.batch}</p>
                        </div>
                        <button onClick={() => {
                           if(confirm(`Are you sure you want to delete ${assessment.title}?`)) {
                             deleteAssessment(assessment.id);
                             setAssessments(getAssessments());
                           }
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
                          <h5 className="font-bold text-sm text-slate-900 border-b border-transparent group-hover:border-slate-900 inline-block transition-colors cursor-pointer">{resource.title}</h5>
                          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex gap-2"><span>{resource.size}</span> <span>{resource.batch}</span></p>
                        </div>
                        <button onClick={() => {
                          if (confirm(`Revoke access to ${resource.title}?`)) {
                            revokeMaterial(resource.id);
                            setResources(getMaterials());
                          }
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

      </main>
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
