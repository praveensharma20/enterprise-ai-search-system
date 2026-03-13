import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- API CONFIGURATION ---
const api = axios.create({
  baseURL: 'http://localhost:8000', // Change to your backend URL
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- SUB-COMPONENT: UploadModal ---
const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post('/upload', formData);
      onUploadSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

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
            {isUploading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            ) : (
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1 h-8 bg-indigo-600 rounded-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rotate-45" />
              </motion.div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{isUploading ? 'Processing...' : 'Upload Intelligence'}</h3>
          <p className="text-slate-400 mt-2">PDF, TXT, or DOCX accepted.</p>
        </div>

        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept=".pdf,.txt,.docx"
        />

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
          onDragLeave={() => setIsDragging(false)} 
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-[32px] py-16 transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-100 bg-slate-50'}`}
          onClick={() => fileInputRef.current.click()}
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {isUploading ? "Syncing with Vault..." : "Drop Intelligence Assets Here"}
          </p>
        </div>

        <div className="mt-10 flex gap-4">
          <button disabled={isUploading} onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
          <button disabled={isUploading} onClick={() => fileInputRef.current.click()} className="flex-1 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl">
            Browse Files
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT: Vault ---
const Vault = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      // Mapping backend schema to your UI structure
      setDocuments(response.data.documents);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Document
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset from the vault?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc.document_id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 bg-slate-900 p-10 flex flex-col justify-between border-r border-white/5 pt-32 relative text-white">
        <div className="space-y-16 relative z-10">
          <div className="group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-indigo-500 rounded-full" />
              <h1 className="text-2xl font-bold tracking-tight italic">Library.</h1>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-4">Secure_Enclave_v.84</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Vault Capacity</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-400" />
              </div>
            </div>
            <button onClick={() => setIsUploadOpen(true)} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
              Add Assets +
            </button>
          </div>
        </div>
        <div className="relative z-10 pt-8 border-t border-white/5 opacity-30 text-[9px] font-mono tracking-widest">
          NODE_SECURE // 2026
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-16 pt-40 bg-slate-50/30">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-light tracking-tighter text-slate-800">Knowledge <span className="font-bold">Assets</span></h2>
            <p className="text-sm text-slate-400 mt-2">Showing {documents.length} verified intelligence objects.</p>
          </header>

          <div className="rounded-3xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">File Name</th>
                  <th className="px-8 py-5">Chunks</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                    <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 text-xs">Accessing Vault...</td></tr>
                ) : documents.map((doc, i) => (
                  <motion.tr 
                    key={doc.document_id}
                    onMouseEnter={() => setHoveredRow(doc.document_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/80 transition-all cursor-default relative group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-slate-800">{doc.file_name}</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">
                            {new Date(doc.upload_date).toLocaleDateString()} // ID: {doc.document_id.slice(0,8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500">{doc.total_chunks} Chunks Indexed</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <AnimatePresence>
                        {hoveredRow === doc.document_id && (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                            className="flex justify-end gap-2"
                          >
                            <button 
                                onClick={() => handleDelete(doc.document_id)}
                                className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-colors"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal 
            isOpen={isUploadOpen} 
            onClose={() => setIsUploadOpen(false)} 
            onUploadSuccess={fetchDocuments} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;