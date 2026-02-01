import { useState, useEffect } from 'react'; // Hooks come from React
import { motion, useSpring } from 'framer-motion'; // Motion components come from Framer

const MouseFollower = () => {
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 150);
      mouseY.set(e.clientY - 150);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ x: mouseX, y: mouseY }}
      className="fixed top-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-[1]"
    />
  );
};

export default MouseFollower;