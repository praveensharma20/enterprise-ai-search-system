import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: SuccessToast ---
// A floating notification that matches the violet-indigo theme
const SuccessToast = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex items-center gap-4"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Config_Applied_Successfully</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Security');
  const [showToast, setShowToast] = useState(false);

  const triggerSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const navLinks = [
    { name: 'Profile', icon: 'ID' },
    { name: 'Security', icon: 'SH' },
    { name: 'Intelligence', icon: 'AI' },
    { name: 'Billing', icon: 'CR' }
  ];

  return (
    <div className="h-screen flex bg-[var(--bg-main)] overflow-hidden">
      
      {/* SIDEBAR: Midnight Shimmer Animated Obsidian */}
      <aside className="w-80 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5 pt-32 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="space-y-12 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-on-dark)] tracking-tight italic text-white">Config.</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-2">Environment Controls</p>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setActiveTab(link.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeTab === link.name ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                <span className="text-[8px] font-mono opacity-20 group-hover:opacity-100">{link.icon}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-16 pt-40">
        <div className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h2 className="text-4xl font-light tracking-tighter text-slate-900">
              System <span className="font-bold">Configuration</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">Adjust your workspace parameters and security protocols.</p>
          </header>

          <div className="space-y-12">
            {/* SECTION: Intelligence Settings */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 ml-2">Inference_Parameters</h3>
              <div className="bg-white border border-[var(--border-subtle)] rounded-[32px] p-8 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Neural Precision</p>
                    <p className="text-xs text-slate-400 mt-1">Prioritize speed vs. accuracy in synthesis.</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button className="px-4 py-1.5 text-[9px] font-black uppercase bg-white rounded-lg shadow-sm">Accuracy</button>
                    <button className="px-4 py-1.5 text-[9px] font-black uppercase text-slate-400">Velocity</button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Automated Indexing</p>
                    <p className="text-xs text-slate-400 mt-1">Automatically process new Vault assets.</p>
                  </div>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"
                  >
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* SECTION: Identity Management */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 ml-2">Identity_Nodes</h3>
              <div className="bg-white border border-[var(--border-subtle)] rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-8 flex items-center justify-between border-b border-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-800">System Label</p>
                    <p className="text-xs text-slate-400 mt-1">Organization-wide display name.</p>
                  </div>
                  <input type="text" placeholder="Semantic Intelligence" className="bg-slate-50 border-none outline-none px-4 py-2 rounded-xl text-xs font-bold text-slate-700" />
                </div>
              </div>
            </motion.section>
          </div>

          <footer className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center pb-20">
             <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest italic">Changes autosaved to cloud_enclave</p>
             <button 
               onClick={triggerSave}
               className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
             >
               Apply Master Config
             </button>
          </footer>
        </div>
      </main>

      {/* GLOBAL TOAST */}
      <SuccessToast show={showToast} />
    </div>
  );
};

export default Settings;