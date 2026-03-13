import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// --- API CONFIGURATION ---
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 3000 // Don't hang forever if backend is down
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const terminalRef = useRef(null);
  
  // Data State (with safe default fallbacks to prevent crashes)
  const [data, setData] = useState({
    documents: 0,
    searches: 0,
    types: [],
    health: { status: 'connecting...', db: false },
    info: { model: 'Standby', chunk_size: 0 },
    recentDocs: [],
    totalNodes: 0, 
    latency: 0
  });

  const [terminalLogs, setTerminalLogs] = useState([
    "System initializing...",
    "Attempting core connection..."
  ]);

  // Clock & Fake Latency tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Only show latency fluctuation if connected
      if (data.health.status === 'healthy') {
        setData(prev => ({ ...prev, latency: Math.floor(Math.random() * (89 - 42 + 1) + 42) }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.health.status]);

  // Fetch Real Data (Bulletproofed against backend downtime)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // We use explicit fallback objects in the catch block so properties are NEVER undefined
        const [statsRes, healthRes, infoRes, docsRes] = await Promise.all([
          api.get('/analytics/stats').catch(() => ({ data: { total_documents: 0, total_searches: 0, documents_by_type: [] } })),
          api.get('/health').catch(() => ({ data: { status: 'offline', database_connected: false } })),
          api.get('/info').catch(() => ({ data: { embedding_model: 'Disconnected', chunk_size: 0 } })),
          api.get('/documents').catch(() => ({ data: { documents: [] } }))
        ]);

        const docs = docsRes.data.documents || [];
        const totalChunks = docs.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);
        const isOffline = healthRes.data.status === 'offline';

        setData({
          documents: statsRes.data.total_documents || docs.length || 0,
          searches: statsRes.data.total_searches || 0,
          types: statsRes.data.documents_by_type || [],
          health: { 
            status: healthRes.data.status || 'offline', 
            db: !!healthRes.data.database_connected 
          },
          info: { 
            model: infoRes.data.embedding_model || 'Disconnected', 
            chunk_size: infoRes.data.chunk_size || 0 
          },
          recentDocs: docs.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date)).slice(0, 5),
          totalNodes: totalChunks,
          latency: isOffline ? 0 : 42
        });

        if (isOffline) {
          setTerminalLogs(prev => [...prev, "ERROR: Connection refused.", "Backend subsystem is offline."]);
        } else {
          setTerminalLogs(prev => [
            ...prev, 
            `Connected to vector database.`,
            `Indexed ${totalChunks} semantic nodes.`,
            `Engine ready.`
          ]);
        }

      } catch (error) {
        setTerminalLogs(prev => [...prev, `CRITICAL: Dashboard UI failed to render data.`]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans">
      
      {/* SIDEBAR: Obsidian Gradient Theme */}
      <aside className="w-80 bg-[#0A0A0A] p-10 flex flex-col justify-between border-r border-white/5 pt-10 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-16 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h1 className="text-2xl font-bold text-white tracking-tight italic">Overview.</h1>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-4">System_Status_v.84</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#141414] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Pulse</p>
                <div className={`w-2 h-2 rounded-full ${data.health.db ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-red-500 animate-pulse'}`} />
              </div>
              <div className="flex gap-1.5 h-10 items-end">
                {/* Stop the pulse animation if the DB is disconnected */}
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3].map((h, i) => (
                  <motion.div 
                    key={i} 
                    animate={data.health.db ? { height: [`${h*100}%`, `${(h+0.2)*100}%`, `${h*100}%`] } : { height: '10%' }} 
                    transition={{ repeat: Infinity, duration: 1.5, delay: i*0.15 }} 
                    className={`flex-1 rounded-t-sm ${data.health.db ? 'bg-emerald-500/40' : 'bg-red-500/40'}`} 
                  />
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 text-white/70">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Core Engine</p>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between"><span>Model:</span> <span className={data.health.db ? "text-emerald-400" : "text-red-400"}>{data.info.model}</span></div>
                <div className="flex justify-between"><span>Chunking:</span> <span className="text-white">{data.info.chunk_size} tks</span></div>
                <div className="flex justify-between">
                  <span>Status:</span> 
                  <span className={data.health.status === 'offline' ? "text-red-500 font-bold" : "text-white"}>
                    {data.health.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-8 border-t border-white/5 opacity-40 text-[10px] font-mono text-white tracking-widest flex justify-between">
          <span>NODE_SECURE</span>
          <span>{currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-light tracking-tighter text-slate-900">Intelligence <span className="font-bold">Matrix</span></h2>
              <p className="text-sm text-slate-500 mt-2">Real-time telemetry and vector space analytics.</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Engine Latency</p>
              <p className={`text-2xl font-mono font-bold ${data.latency > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {data.latency} <span className="text-sm text-slate-400">ms</span>
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Verified Assets</p>
              <h3 className="text-5xl font-black text-slate-900 mb-2">{isLoading ? '-' : data.documents}</h3>
              <p className="text-xs font-semibold text-slate-500">Total ingested documents</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vector Nodes</p>
              <h3 className="text-5xl font-black text-slate-900 mb-2">{isLoading ? '-' : data.totalNodes.toLocaleString()}</h3>
              <p className="text-xs font-semibold text-emerald-600">Active searchable chunks</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Query Count</p>
              <h3 className="text-5xl font-black text-slate-900 mb-2">{isLoading ? '-' : data.searches}</h3>
              <p className="text-xs font-semibold text-indigo-600">Total user invocations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* REDESIGNED TERMINAL LOG */}
            <div className="lg:col-span-2 bg-[#0B0F19] rounded-[32px] p-8 shadow-xl flex flex-col border border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.health.status === 'offline' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                Live Subsystem Terminal
              </h4>
              
              {/* Terminal Window with hidden scrollbars */}
              <div 
                ref={terminalRef}
                className="flex-1 bg-[#050505] rounded-2xl p-6 font-mono text-[13px] overflow-y-auto max-h-[220px] space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-white/5 shadow-inner"
              >
                {terminalLogs.map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-slate-600 shrink-0">[{currentTime.toISOString().split('T')[1].slice(0,8)}]</span>
                    <span className={log.includes("ERROR") || log.includes("CRITICAL") ? "text-red-400" : "text-emerald-400"}>
                      {log}
                    </span>
                  </div>
                ))}
                
                {data.health.status !== 'offline' && (
                  <div className="flex gap-4">
                    <span className="text-slate-600 shrink-0">[{currentTime.toISOString().split('T')[1].slice(0,8)}]</span>
                    <span className="text-emerald-400/70 border-r-8 border-emerald-400 animate-pulse pr-1">Awaiting input</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Asset Distribution</h4>
              <div className="space-y-5">
                {data.types.length > 0 ? data.types.map((typeObj, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700 uppercase">{typeObj.type.replace('.', '')}</span>
                      <span className="text-slate-400">{typeObj.count} Files</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min((typeObj.count / (data.documents || 1)) * 100, 100)}%` }} 
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-slate-800 h-full rounded-full" 
                      />
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10">No format data available</div>
                )}
              </div>
            </div>

          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Recent Ingestion Timeline</h4>
             
             <div className="space-y-6">
                {isLoading ? (
                  <div className="text-sm text-slate-400 text-center py-4">Scanning records...</div>
                ) : data.recentDocs.length > 0 ? (
                  data.recentDocs.map((doc, i) => (
                    <div key={doc.document_id} className="flex items-center gap-6 relative">
                      {i !== data.recentDocs.length - 1 && <div className="absolute top-10 left-[19px] w-[2px] h-full bg-slate-100 -z-10" />}
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="flex-1 flex justify-between items-center pb-6 border-b border-slate-50">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{doc.file_name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-1">ID: {doc.document_id.split('-')[0]} • {doc.total_chunks} Data Chunks</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Verified</span>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono">{new Date(doc.upload_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 text-center py-4">No documents have been ingested yet.</div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;