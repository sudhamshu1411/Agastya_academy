import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, X, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Programs", path: "/programs" },
    { name: "Philosophy", path: "/philosophy" },
    { name: "Results", path: "/results" },
    { name: "Faculty", path: "/faculty" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out-expo border-b border-slate-900",
        isScrolled
          ? "bg-slate-50 py-3 shadow-none"
          : "bg-slate-50 py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col text-slate-900">
              <span className="font-serif italic text-2xl tracking-tighter leading-none transition-colors duration-300">
                Agastya
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 mt-1">
                Academy of Physics
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[11px] uppercase tracking-widest font-semibold opacity-70 text-slate-900 hover:opacity-100 transition-opacity"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-6 ml-4">
              <Link
                to="/login"
                className="text-[11px] uppercase tracking-widest font-semibold opacity-70 text-slate-900 hover:opacity-100 transition-opacity"
              >
                Portal Login
              </Link>
              <Link
                to="/admissions"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 text-[11px] uppercase tracking-widest font-semibold text-slate-900 border border-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Admissions <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-slate-600 font-medium p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-100" />
          <Link to="/login" className="text-slate-900 font-medium p-2">Portal Login</Link>
          <Link to="/admissions" className="bg-slate-900 text-white font-medium p-3 flex justify-between items-center text-center mt-2">
            Admissions <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </header>
  );
}
