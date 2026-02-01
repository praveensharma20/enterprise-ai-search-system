// src/pages/Home.jsx (Repeat for Vault, Engine, and DocumentView)
import { motion } from 'framer-motion';

const DocumentView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="p-8 pt-24"
    >
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        Nexus Shell
      </h1>
      <p className="text-slate-400 mt-4">Semantic Engine initialization...</p>
    </motion.div>
  );
};

export default DocumentView;