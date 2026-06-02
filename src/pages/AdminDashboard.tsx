import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, BarChart3, Calendar, Settings, AlertCircle, LayoutDashboard, FileText, Bell, Search, CheckCircle2, MoreHorizontal, ShieldAlert, Trash2, Menu, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getValidUsers, deleteUser, updateUserRole } from "../lib/users";
import { getAdmissions, deleteAdmissionByEmail } from "../lib/admissions";
import { getNotices, saveNotice, getInterventions, logIntervention } from "../lib/store";
import { RoleSwitcher } from "../components/RoleSwitcher";

export function AdminDashboard() {
  const userFullName = localStorage.getItem("userFullName") || "M. Kumar";
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  const [admissionsLogs, setAdmissionsLogs] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    setPortalUsers(getValidUsers());
    setAdmissionsLogs(getAdmissions());
    setNotices(getNotices());
    setAlerts(getInterventions().filter((i:any) => !i.logged));
  }, [activeTab]);

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
            <NavItem active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }} icon={<Users className="w-4 h-4"/>} label="Students & Cohorts" />
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
                          className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border focus:outline-none cursor-pointer ${
                            u.role === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            u.role === 'founder' ? 'border-purple-200 bg-purple-50 text-purple-700' :
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
        )}

        {activeTab !== 'overview' && activeTab !== 'users' && (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
            <LayoutDashboard className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-xl font-serif italic text-slate-700 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
            <p className="text-sm font-mono text-slate-500 max-w-md text-center">This module is part of the extended ERP features and is currently running offline processes.</p>
            <button onClick={() => setActiveTab('overview')} className="mt-6 border-b border-slate-900 text-slate-900 text-[10px] uppercase font-bold tracking-widest pb-1 hover:opacity-70 transition-opacity">Return to Overview</button>
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
