import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Send, Clock } from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill out all required fields.");
      return;
    }
    alert(`Thank you, ${formData.name}. Your message has been sent successfully. We will get back to you shortly.`);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-slate-900"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Reach Out</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-8">
            Contact Us.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-relaxed">
            Whether you have an academic inquiry, require assistance with the admission process, or simply wish to visit the campus, we are here to help.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:w-1/3 space-y-12"
          >
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Headquarters
              </h3>
              <p className="text-lg font-serif italic mb-1">Agastya Academy</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                42, Knowledge Avenue, Sector 5<br/>
                Cyber City, New Delhi - 110014
              </p>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Direct Lines
              </h3>
              <p className="text-sm text-slate-900 font-mono font-bold mb-2">+91 98765 43210 <span className="text-slate-400 font-sans font-normal ml-2">(Admissions)</span></p>
              <p className="text-sm text-slate-900 font-mono font-bold">+91 11 4567 8900 <span className="text-slate-400 font-sans font-normal ml-2">(Front Desk)</span></p>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Digital
              </h3>
              <p className="text-sm text-slate-900 font-mono font-bold mb-2 hover:underline cursor-pointer">contact@agastyaacademy.online</p>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Visiting Hours
              </h3>
              <p className="text-sm text-slate-600">Mon - Sat: 9:00 AM - 6:00 PM</p>
              <p className="text-sm text-slate-400 mt-1">Closed on Sundays and Public Holidays.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:w-2/3"
          >
            <div className="bg-white border border-slate-900 p-8 md:p-12 shadow-[16px_16px_0px_#1A1A1A]">
              <h2 className="text-2xl font-serif italic mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border-b border-slate-300 py-2 focus:border-slate-900 outline-none transition-colors bg-transparent"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full border-b border-slate-300 py-2 focus:border-slate-900 outline-none transition-colors bg-transparent"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-b border-slate-300 py-2 focus:border-slate-900 outline-none transition-colors bg-transparent"
                    placeholder="+91"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Message *</label>
                  <textarea 
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full border border-slate-300 p-3 focus:border-slate-900 outline-none transition-colors bg-transparent resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  Transmit Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
