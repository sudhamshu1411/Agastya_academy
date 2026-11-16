import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Home } from "./pages/Home";
import { StudentDashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Admissions } from "./pages/Admissions";
import { Philosophy } from "./pages/Philosophy";
import { Faculty } from "./pages/Faculty";

import { Scheduler } from "./pages/Scheduler";
import { AdminDashboard } from "./pages/AdminDashboard";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { FounderDashboard } from "./pages/FounderDashboard";
import { About } from "./pages/About";
import { Programs } from "./pages/Programs";
import { Results } from "./pages/Results";
import { Contact } from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/courses" element={<Programs />} />
          <Route path="/results" element={<Results />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Route>
        
        {/* Standalone Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Route Stub */}
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/schedule" element={<ProtectedRoute><Scheduler /></ProtectedRoute>} />
        <Route path="/faculty/schedule" element={<ProtectedRoute><Scheduler /></ProtectedRoute>} />
        <Route path="/founder/schedule" element={<ProtectedRoute><Scheduler /></ProtectedRoute>} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />

        {/* Founder Routes */}
        <Route path="/founder/dashboard" element={<ProtectedRoute><FounderDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

