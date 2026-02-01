import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroVisual from '../components/home/HeroVisual';

const Home = () => {
  const navigate = useNavigate();

  // Animation for the hero text
  const heroReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-white overflow-x-hidden">
      
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
        <HeroVisual />
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" 
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="h-screen flex flex-col items-center justify-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroReveal}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-blue-400">
              Semantic Search v2.0
            </span>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
              Universal Intelligence <br /> for Enterprise Data.
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-12">
              Transform unstructured documents into a searchable intelligence base.
              Ask questions. Get verified answers.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/search')}
                className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Launch Engine
              </button>
              <button 
                onClick={() => navigate('/vault')}
                className="px-10 py-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-full font-bold hover:bg-white/10 transition-all"
              >
                The Vault
              </button>
            </div>
          </motion.div>
        </section>

        {/* FEATURE BENTO GRID (The Scroll Reveal Part) */}
        <section className="pb-32">
            
        <motion.section 
  className="grid grid-cols-1 md:grid-cols-3 gap-8"
  style={{ perspective: "1000px" }}
>
  <FeatureCard 
    index={0}
    iconType="logic"
    title="Semantic Logic" 
    desc="Our engine maps human intent across thousands of documents using deep-learning transformers."
  />
  <FeatureCard 
    index={1}
    iconType="vector"
    title="Vector Precision" 
    desc="High-dimensional vector storage ensures millisecond retrieval of complex enterprise data points."
  />
  <FeatureCard 
    index={2}
    iconType="rag"
    title="RAG Intelligence" 
    desc="Advanced Retrieval-Augmented Generation provides accurate answers with direct source citations."
  />
</motion.section>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc, iconType, index }) => {
    // Define our professional icons here
    const icons = {
      logic: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      vector: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      rag: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    };
  
    return (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          whileHover={{ y: -12, scale: 1.02 }}
          /* UPDATED CLASSES: Added border-slate-200 and bg-white for light mode */
          className="relative group p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white/70 dark:bg-white/[0.01] backdrop-blur-3xl overflow-hidden transition-all duration-500 shadow-xl dark:shadow-2xl"
        >
          {/* Background Glow - stays subtle in both modes */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* ICON CONTAINER: Adaptive background and border */}
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/[0.02] border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-blue-400 mb-8 group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-white group-hover:border-indigo-500/50 transition-all duration-500 shadow-sm dark:shadow-xl">
              {icons[iconType]}
            </div>
    
            {/* TITLE: Dark slate in light mode, white in dark mode */}
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            
            {/* DESCRIPTION: Slightly darker slate for better readability in light mode */}
            <p className="text-slate-600 dark:text-slate-500 leading-relaxed text-sm font-medium">
              {desc}
            </p>
          </div>
        </motion.div>
      );
    };
export default Home;