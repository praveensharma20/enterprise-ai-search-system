import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { label: 'Total Intelligence', value: '1,204', sub: 'Nodes' },
    { label: 'System Accuracy', value: '98.4%', sub: 'Verified' },
    { label: 'Processing Speed', value: '14ms', sub: 'Latency' },
  ];

  return (
    <div className="h-screen flex bg-[var(--bg-main)] overflow-hidden">
      {/* SIDEBAR: Consistent across all pages */}
      <aside className="w-80 sidebar-obsidian-gradient p-10 flex flex-col justify-between border-r border-white/5 pt-32 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="space-y-16 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-on-dark)] tracking-tight italic">Overview.</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 ml-4">System_Status_v.84</p>
          </div>
          <div className="p-6 rounded-2xl glass-status-card">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Neural Pulse</p>
            <div className="flex gap-1 h-8 items-end">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <motion.div key={i} animate={{ height: [`${h*100}%`, `${(h+0.1)*100}%`, `${h*100}%`] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }} className="flex-1 bg-indigo-500/40 rounded-t-sm" />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-16 pt-40">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-light tracking-tighter text-slate-900">Enterprise <span className="font-bold">Dashboard</span></h2>
          </header>

          <div className="grid grid-cols-3 gap-8 mb-12">
            {stats.map((stat, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-8 bg-white border border-[var(--border-subtle)] rounded-[32px] shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-xs text-indigo-500 font-medium">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-[var(--border-subtle)] rounded-[40px] p-10 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Recent Intelligence Activity</h4>
            <div className="space-y-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">AI</div>
                    <p className="text-sm font-semibold text-slate-700">New document synthesized into Engine core.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">2H AGO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;