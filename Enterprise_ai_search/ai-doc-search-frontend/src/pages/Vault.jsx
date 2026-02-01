import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: UploadModal ---
// Features an industrial animation and drag-and-drop feedback for non-technical users
const UploadModal = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 30 }} 
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden p-12 text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center mb-6">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1 h-8 bg-indigo-600 rounded-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rotate-45" />
            </motion.div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Upload Intelligence</h3>
          <p className="text-slate-400 mt-2">Synchronize your local files with the secure vault.</p>
        </div>
        <div 
          onDragOver={() => setIsDragging(true)} 
          onDragLeave={() => setIsDragging(false)} 
          className={`border-2 border-dashed rounded-[32px] py-16 transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-100 bg-slate-50'}`}
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Drop Intelligence Assets Here</p>
        </div>
        <div className="mt-10 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
          <button className="flex-1 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl">Browse Files</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT: Vault ---
const Vault = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const documents = [
    { id: 1, name: 'Global_Expansion_Strategy_2026.pdf', size: '4.2 MB', status: 'Verified', date: 'Jan 20, 2026' },
    { id: 2, name: 'Infrastructure_Audit_Q4.json', size: '1.1 MB', status: 'Processing', date: 'Jan 21, 2026' },
    { id: 3, name: 'Compliance_Framework_v2.docx', size: '840 KB', status: 'Verified', date: 'Jan 15, 2026' },
  ];

  return (
    <div className="h-screen flex bg-[var(--bg-main)] overflow-hidden">
      
      {/* SIDEBAR: Midnight Shimmer Animated Obsidian */}
      <aside className="w-80 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5 pt-32 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="space-y-16 relative z-10">
          <div className="group">
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={{ height: [16, 24, 16] }} transition={{ repeat: Infinity, duration: 4 }} className="w-1 bg-[var(--accent-intel)] rounded-full" />
              <h1 className="text-2xl font-bold text-[var(--text-on-dark)] tracking-tight italic">Library.</h1>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-4">Secure_Enclave_v.84</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-status-card shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Vault Sync</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[var(--accent-intel)] to-indigo-400" />
              </div>
            </div>
            <button onClick={() => setIsUploadOpen(true)} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
              Add Assets +
            </button>
          </div>
        </div>
        <div className="relative z-10 pt-8 border-t border-white/5 opacity-30 text-[9px] font-mono text-white tracking-widest">
          NODE_SECURE // Jan 2026
        </div>
      </aside>

      {/* MAIN CONTENT: High-Readability Workspace */}
      <main className="flex-1 overflow-y-auto p-16 pt-40">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-light tracking-tighter text-[var(--text-primary)]">Knowledge <span className="font-bold">Assets</span></h2>
            <p className="text-sm text-slate-400 mt-2">Manage organizational digital intelligence.</p>
          </header>

          <div className="rounded-3xl border border-[var(--border-subtle)] overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-[var(--border-subtle)] text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">File Name</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {documents.map((doc, i) => (
                  <motion.tr 
                    key={doc.id}
                    onMouseEnter={() => setHoveredRow(doc.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-slate-50/80 transition-all cursor-default relative group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-slate-800">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">{doc.date} // {doc.size}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${doc.status === 'Verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400 animate-pulse'}`} />
                        <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500">{doc.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <AnimatePresence>
                        {hoveredRow === doc.id && (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            className="flex justify-end gap-2"
                          >
                            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm" title="Download">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 shadow-sm" title="Delete">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span className={`text-[10px] font-mono text-slate-300 transition-opacity duration-300 ${hoveredRow === doc.id ? 'opacity-0' : 'opacity-100'}`}>
                        -- ACCESS_ID: {doc.id} --
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* OVERLAY: Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Vault;