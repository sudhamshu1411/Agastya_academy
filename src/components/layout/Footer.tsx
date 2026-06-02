import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-900">
      {/* Integrated Status Bar (ERP Sync) matching the design */}
      <div className="h-12 flex items-center px-4 sm:px-12 bg-slate-900 text-white border-b border-white/20">
        <div className="flex-1 flex gap-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-[9px] uppercase tracking-widest">LMS Core Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest opacity-50">Current Status:</span>
            <span className="text-[9px] uppercase tracking-widest">Accepting Applications</span>
          </div>
        </div>
        <div className="flex gap-6 text-[9px] uppercase tracking-widest">
          <span>2024-25 Academic Cycle</span>
          <span className="opacity-50 font-mono hidden sm:inline">VER_2.4.1</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="flex flex-col">
                <span className="font-serif text-2xl italic text-white tracking-tighter leading-none">
                  Agastya
                </span>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white mt-1">
                  Academy of Physics
                </span>
              </div>
            </Link>
            <p className="text-[11px] uppercase tracking-widest opacity-70 leading-relaxed max-w-sm mb-6">
              A disciplined, mentorship-based NEET physics academy focused on consistency, structured preparation, and personal attention.
            </p>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white font-bold italic">
              "Students should never feel lost in a crowd."
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest opacity-70">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">About the Academy</Link></li>
              <li><Link to="/courses" className="hover:opacity-100 transition-opacity">Academic Programs</Link></li>
              <li><Link to="/results" className="hover:opacity-100 transition-opacity">Results & Testimonials</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-white">Portals</h4>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest opacity-70">
              <li><Link to="/login" className="hover:opacity-100 transition-opacity">Student ERP Login</Link></li>
              <li><Link to="/parent-portal" className="hover:opacity-100 transition-opacity">Parent Portal</Link></li>
              <li><Link to="/admissions" className="hover:opacity-100 transition-opacity">Digital Enrollment</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-widest opacity-70">
          <p>&copy; {new Date().getFullYear()} Agastya Academy of Physics. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
