import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- API CONFIGURATION ---
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- SUB-COMPONENT: SourceModal ---
const SourceModal = ({ isOpen, onClose, source }) => {
  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex"
      >
        {/* Modal Sidebar */}
        <aside className="w-80 bg-[#0A0A0A] p-10 flex flex-col justify-between border-r border-white/10">
          <div className="space-y-8 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Source Node Access</p>
            <h3 className="text-xl font-semibold leading-snug truncate" title={source.file_name}>
              {source.file_name}
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Match Confidence</p>
                <p className="text-2xl font-mono text-emerald-400">{(source.similarity_score * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chunk ID</p>
                <p className="text-xs font-mono text-slate-300">{source.chunk_id}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all">
            Close Preview
          </button>
        </aside>

        {/* Modal Content area */}
        <main className="flex-1 bg-slate-50 p-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between border-b border-slate-200 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extracted Excerpt</span>
            </div>
            <div className="prose prose-slate">
              <p className="text-base text-slate-700 leading-relaxed font-serif">
                {source.content}
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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState('idle'); // 'idle', 'thinking', 'result', 'error'
  
  // API Data States
  const [ragAnswer, setRagAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [metrics, setMetrics] = useState({ time: 0, count: 0 });
  const [selectedSource, setSelectedSource] = useState(null);
  
  // History State
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setStatus('thinking');
    setQuery(searchQuery); // Ensure input matches if triggered from history

    try {
      const response = await api.post('/search', {
        query: searchQuery,
        top_k: 4,
        use_rag: true
      });

      setRagAnswer(response.data.rag_answer || "No synthesis could be generated from the available documents.");
      setSources(response.data.results || []);
      setMetrics({
        time: response.data.processing_time,
        count: response.data.total_results
      });

      // Add to history if it's not the exact same as the last query
      setHistory(prev => {
        if (prev[0] === searchQuery) return prev;
        return [searchQuery, ...prev].slice(0, 10); // Keep last 10
      });

      setStatus('result');
    } catch (error) {
      console.error("Search failed:", error);
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch(query);
    }
  };

  const resetEngine = () => {
    setStatus('idle');
    setQuery("");
    setRagAnswer("");
    setSources([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      
      {/* SIDEBAR: Obsidian Gradient Theme */}
      <aside className="w-80 bg-[#0A0A0A] p-10 flex flex-col justify-between border-r border-white/5 pt-10 relative overflow-hidden text-white">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-12 relative z-10 flex flex-col h-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={status === 'thinking' ? { height: [16, 24, 16] } : { height: 16 }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-indigo-500 rounded-full" />
              <h1 className="text-2xl font-bold tracking-tight italic">Engine.</h1>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-4">
              Inference_Core
            </p>
          </div>

          {/* Inquiry History */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Sessions</p>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No recent inquiries.</p>
              ) : (
                history.map((histQuery, i) => (
                  <div 
                    key={i} 
                    onClick={() => executeSearch(histQuery)}
                    className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10 group"
                  >
                    <p className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">
                      {histQuery}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            <button 
              onClick={resetEngine}
              className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
            >
              New Research +
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12 lg:p-20 relative">
        <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-full">
          
          <header className={`transition-all duration-700 ease-in-out ${status === 'idle' ? 'mb-16' : 'mb-8 opacity-0 hidden'}`}>
            <h2 className="text-5xl font-light tracking-tight text-slate-800 mb-4">Ask your <span className="font-bold text-slate-900">Knowledge.</span></h2>
            <p className="text-slate-500">Query the semantic vector space for verified insights.</p>
          </header>

          {/* Search Input */}
          <div className={`relative group transition-all duration-500 z-10 ${status === 'idle' ? 'scale-100' : 'scale-95 mb-8'}`}>
            <input 
              ref={inputRef}
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={handleKeyDown}
              disabled={status === 'thinking'}
              placeholder="What would you like to synthesize?"
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-3xl py-6 px-8 text-lg shadow-sm transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button 
              onClick={() => executeSearch(query)} 
              disabled={status === 'thinking' || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {status === 'thinking' ? 'Processing...' : 'Inquire'}
            </button>
          </div>

          {/* Status Indicators */}
          <AnimatePresence>
            {status === 'thinking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center mb-12">
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Traversing Vector Space...</span>
                </div>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-sm text-center">
                The engine encountered a critical error. Please verify core connectivity and try again.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {status === 'result' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
                
                {/* Metrics Bar */}
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                    Synthesis Complete
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {metrics.count} nodes analyzed in {metrics.time}s
                  </span>
                </div>

                {/* Primary RAG Answer */}
                <div className="bg-white border border-slate-200 p-10 md:p-14 rounded-[40px] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <div className="prose prose-slate max-w-none">
                    <p className="text-xl leading-relaxed text-slate-800">
                      {ragAnswer}
                    </p>
                  </div>
                </div>

                {/* Source Citations */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Referenced Source Nodes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sources.map((source, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedSource(source)}
                        className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between group cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-semibold text-slate-800 truncate pr-4" title={source.file_name}>
                            {source.file_name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-50 px-2 py-1 rounded shrink-0">
                            {(source.similarity_score * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {source.content}
                        </p>
                      </div>
                    ))}
                    {sources.length === 0 && (
                      <div className="col-span-2 p-6 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                        No strict semantic matches found for this query.
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* OVERLAY: Quick-View Modal */}
      <AnimatePresence>
        {selectedSource && (
          <SourceModal 
            isOpen={!!selectedSource} 
            source={selectedSource} 
            onClose={() => setSelectedSource(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Engine;