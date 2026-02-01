import { motion, AnimatePresence } from 'framer-motion';

const SourceModal = ({ isOpen, onClose, docName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop with extreme blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex"
          >
            {/* DARK MODAL SIDEBAR: Matches your Library/Engine sidebar */}
            <aside className="w-72 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Source_Node</p>
                  <h3 className="text-xl font-bold text-white leading-tight italic">{docName}</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="p-4 rounded-xl glass-status-card">
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Relevance</p>
                      <p className="text-lg font-light text-white">94% Match</p>
                   </div>
                   <div className="p-4 rounded-xl glass-status-card">
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Security</p>
                      <p className="text-lg font-light text-emerald-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        Verified
                      </p>
                   </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all"
              >
                Close Preview
              </button>
            </aside>

            {/* LIGHT MODAL CONTENT: Document Viewer */}
            <main className="flex-1 bg-slate-50 p-12 overflow-y-auto">
               <div className="max-w-2xl mx-auto space-y-8">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document_Excerpt</span>
                     <span className="text-[10px] font-mono text-slate-300">SECURE_VIEW_MODE</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                     <h2 className="text-2xl font-bold text-slate-800">Operational Expansion: US-East</h2>
                     <p className="text-lg text-slate-600 leading-relaxed">
                        The current strategy for 2026 focuses heavily on the US-East infrastructure. 
                        Initial data indicates that the integration of <strong>Node_024</strong> has surpassed 
                        original efficiency projections by approximately 4% as of Q4 2025.
                     </p>
                     <p className="text-lg text-slate-600 leading-relaxed">
                        This document outlines the specific hardware requirements and the technical 
                        alignment needed to sustain this growth velocity...
                     </p>
                  </div>
               </div>
            </main>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};