import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Importing our Premium Depth-Contrast pages
import Home from './pages/Home';
import Vault from './pages/Vault';
import Engine from './pages/Engine';
import Dashboard from './pages/Dashboard'; // New Page
import Settings from './pages/Settings';   // New Page

// Components
import Navbar from './components/layout/Navbar';
import MouseFollower from './components/layout/MouseFollower';

function App() {
  return (
    <Router>
      {/* The container is now neutral to let page-specific backgrounds (Obsidian/White) shine */}
      <div className="relative min-h-screen transition-colors duration-500">
        <Navbar />
        <MouseFollower />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/search" element={<Engine />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;