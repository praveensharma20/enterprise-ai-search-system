import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: SourceModal ---
// This handles the document preview overlay
const SourceModal = ({ isOpen, onClose, docName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex"
      >
        <aside className="w-72 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5">
          <div className="space-y-8 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Source_Node</p>
            <h3 className="text-xl font-bold italic">{docName}</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl glass-status-card">
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-medium text-emerald-400">Verified Access</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all">
            Close Preview
          </button>
        </aside>
        <main className="flex-1 bg-slate-50 p-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between border-b pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document_Excerpt</span>
            </div>
            <div className="prose prose-slate">
              <h2 className="text-2xl font-bold text-slate-800">Operational Synthesis</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                This document confirms the strategic deployment of assets within the US-East sector. 
                Data integrity checks indicate that efficiency metrics reached peak performance 
                following the integration of the primary infrastructure nodes.
              </p>
            </div>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT: Engine ---
const Engine = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState('idle');

  const handleInquiry = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setStatus('thinking');
      setTimeout(() => setStatus('result'), 2200);
    }
  };

  return (
    <div className="h-screen flex bg-[var(--bg-main)] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5 pt-32 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="space-y-16 relative z-10">
          <div className="group">
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={{ height: [16, 24, 16] }} transition={{ repeat: Infinity, duration: 4 }} className="w-1 bg-[var(--accent-intel)] rounded-full" />
              <h1 className="text-2xl font-bold text-[var(--text-on-dark)] tracking-tight italic">Engine.</h1>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-4 group-hover:text-white/40 transition-colors">
              Neural_Inference_Core
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-status-card shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Inquiry Pulse</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: status === 'thinking' ? '90%' : '68%' }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[var(--accent-intel)] to-indigo-400" />
              </div>
            </div>
            <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-50 transition-all">
              New Research
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-16 pt-40">
        <div className="max-w-4xl mx-auto">
          <header className={`text-center transition-all duration-700 ${status === 'idle' ? 'mb-20' : 'mb-10 scale-90 opacity-50'}`}>
            <h2 className="text-5xl font-black tracking-tightest mb-4">Ask your <span className="text-[var(--accent-intel)]">Knowledge.</span></h2>
            <p className="text-slate-400 font-medium">Get verified, instant answers from your private library.</p>
          </header>

          <div className="relative group mb-20">
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleInquiry}
              placeholder="What would you like to find?"
              className="w-full bg-white border-2 border-[var(--border-subtle)] focus:border-[var(--accent-intel)] rounded-3xl py-7 px-10 text-xl shadow-lg transition-all outline-none"
            />
            <button onClick={() => setStatus('thinking')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--accent-intel)]">
              Inquire
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'result' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
                <div className="bg-white border border-[var(--border-subtle)] p-14 rounded-[48px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                  <p className="text-[10px] font-black tracking-[0.6em] text-[var(--accent-intel)] uppercase mb-8">Verified Synthesis</p>
                  <h3 className="text-3xl font-light leading-snug text-slate-800">
                    The growth vector for 2026 is confirmed at <span className="font-bold text-indigo-600">14.2%</span>.
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Global_Strategy_2026.pdf', 'Audit_Q4.json'].map((doc, i) => (
                    <div 
                      key={i} onClick={() => setSelectedDoc(doc)}
                      className="p-6 bg-white border border-[var(--border-subtle)] rounded-3xl flex justify-between items-center group cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <span className="text-sm font-bold text-slate-700">{doc}</span>
                      <span className="text-xs text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Source →</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* OVERLAY: Quick-View Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <SourceModal 
            isOpen={!!selectedDoc} 
            docName={selectedDoc} 
            onClose={() => setSelectedDoc(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Engine;