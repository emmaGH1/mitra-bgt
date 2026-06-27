import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MascotProps {
  status: 'idle' | 'thinking' | 'rebalancing';
}

export default function Mascot({ status }: MascotProps) {
  const [radarAngle, setRadarAngle] = useState(0);

  // Animate the radar sweep angle
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setRadarAngle((prev) => (prev + 3) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    if (status === 'thinking') {
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);

  return (
    <motion.div 
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }}
      className="relative w-72 h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center"
    >
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-mint/20 via-yellow/10 to-red/20 blur-2xl rounded-full animate-pulse" />

      {/* Futuristic Orbit Ring 1 (Rotate clockwise) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[95%] h-[95%] border-2 border-dashed border-ink/20 rounded-full"
      />

      {/* Futuristic Orbit Ring 2 (Rotate counter-clockwise) */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[85%] h-[85%] border border-ink/10 rounded-full flex items-center justify-center"
      />

      {/* Main Robotic Sphere Body */}
      <div className="relative w-[75%] h-[75%] bg-gradient-to-b from-[#2E2E2E] to-ink border-4 border-ink rounded-full shadow-[inset_0_8px_16px_rgba(255,255,255,0.15),8px_12px_24px_rgba(27,27,27,0.3)] flex items-center justify-center overflow-hidden">
        
        {/* Curved Glass Reflection Overlay */}
        <div className="absolute top-1 left-4 right-4 h-1/3 bg-white/10 rounded-t-full filter blur-[1px] pointer-events-none z-20" />

        {/* Technical Grid Pattern lines inside the body */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px] opacity-60" />

        {/* Outer glowing circular tubes (like the video's neon trim) */}
        <div className="absolute inset-2 border-2 border-cyan-400/30 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
        <div className="absolute inset-4 border border-cyan-400/10 rounded-full" />

        {/* Central Display Screen (Retro Bevelled Rounded Screen Frame) */}
        <div className="relative w-[72%] h-[64%] bg-gradient-to-b from-[#121820] to-[#080d14] border-3 border-ink rounded-2xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_4px_8px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center p-3 overflow-hidden">
          
          {/* CRT scanlines effect overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,32,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-70" />
          
          {/* Cyan Glow Background layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_75%)]" />

          {/* DYNAMIC SCREEN CONTENT BASED ON STATUS */}
          <AnimatePresence mode="wait">
            
            {/* IDLE: Blinking Double-bracket Robot Eyes */}
            {status === 'idle' && (
              <motion.div
                key="idle-face"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-between px-6 relative"
              >
                {/* Left bracket eye */}
                <div className="flex items-center gap-1.5">
                  <span className="text-3xl md:text-4xl font-display text-cyan-400 select-none animate-pulse filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                    &lt;
                  </span>
                  <motion.div 
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3.5 h-3.5 bg-cyan-400 rounded-full filter drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                  />
                </div>

                {/* Right bracket eye */}
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3.5 h-3.5 bg-cyan-400 rounded-full filter drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                  />
                  <span className="text-3xl md:text-4xl font-display text-cyan-400 select-none animate-pulse filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                    &gt;
                  </span>
                </div>
              </motion.div>
            )}

            {/* THINKING: Radar Scan Sweep Screen */}
            {status === 'thinking' && (
              <motion.div
                key="thinking-radar"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center relative"
              >
                {/* Concentric Radar Grid Rings */}
                <div className="absolute w-28 h-28 border border-cyan-500/25 rounded-full" />
                <div className="absolute w-20 h-20 border border-cyan-500/30 rounded-full" />
                <div className="absolute w-12 h-12 border border-cyan-500/45 rounded-full" />
                <div className="absolute w-4 h-4 border border-cyan-500/60 rounded-full" />
                
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />

                {/* Sweeping Radar Line */}
                <div 
                  style={{ transform: `rotate(${radarAngle}deg)` }}
                  className="absolute w-full h-full origin-center pointer-events-none transition-transform duration-75"
                >
                  {/* Sweep arm gradient */}
                  <div className="absolute top-1/2 left-1/2 w-1/2 h-12 bg-gradient-to-t from-cyan-400/40 to-transparent -translate-y-full origin-bottom-left rotate-[15deg] clip-path-sweep" 
                       style={{ 
                         clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
                         filter: 'blur(1px)'
                       }}
                  />
                  {/* Sharp beam line */}
                  <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-cyan-400 origin-left filter drop-shadow-[0_0_4px_rgba(34,211,238,0.9)]" />
                </div>

                {/* Target blips flashing */}
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="absolute top-6 right-10 w-2 h-2 bg-yellow rounded-full filter drop-shadow-[0_0_4px_rgba(255,215,80,0.8)]"
                />
                <motion.div 
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                  className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-mint rounded-full filter drop-shadow-[0_0_4px_rgba(31,181,122,0.8)]"
                />

                <span className="absolute bottom-1 text-[9px] font-mono font-bold tracking-wider text-cyan-400/80 animate-pulse">
                  SCANNING FED NEWS FEED...
                </span>
              </motion.div>
            )}

            {/* REBALANCING: Animated Candlestick Chart */}
            {status === 'rebalancing' && (
              <motion.div
                key="rebalancing-candles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col justify-between relative p-2"
              >
                {/* Visual Candlesticks */}
                <div className="flex-1 flex items-end justify-center gap-3 md:gap-4 px-2 pt-2">
                  
                  {/* Candle 1 (Green/Mint) */}
                  <div className="flex flex-col items-center justify-end h-full">
                    {/* Upper wick */}
                    <div className="w-[2px] h-3 bg-mint" />
                    {/* Candle body */}
                    <motion.div 
                      animate={{ height: [12, 28, 18, 24, 12] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 bg-mint border border-ink rounded-sm filter drop-shadow-[0_0_3px_rgba(31,181,122,0.6)]"
                    />
                    {/* Lower wick */}
                    <div className="w-[2px] h-2 bg-mint" />
                  </div>

                  {/* Candle 2 (Red) */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="w-[2px] h-2 bg-red" />
                    <motion.div 
                      animate={{ height: [36, 16, 28, 20, 36] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 bg-red border border-ink rounded-sm filter drop-shadow-[0_0_3px_rgba(249,24,20,0.6)]"
                    />
                    <div className="w-[2px] h-3 bg-red" />
                  </div>

                  {/* Candle 3 (Mint) */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="w-[2px] h-4 bg-mint" />
                    <motion.div 
                      animate={{ height: [18, 38, 22, 32, 18] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 bg-mint border border-ink rounded-sm filter drop-shadow-[0_0_3px_rgba(31,181,122,0.6)]"
                    />
                    <div className="w-[2px] h-3 bg-mint" />
                  </div>

                  {/* Candle 4 (Red) */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="w-[2px] h-2 bg-red" />
                    <motion.div 
                      animate={{ height: [14, 24, 10, 18, 14] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 bg-red border border-ink rounded-sm filter drop-shadow-[0_0_3px_rgba(249,24,20,0.6)]"
                    />
                    <div className="w-[2px] h-4 bg-red" />
                  </div>

                </div>

                {/* Subtitle status info */}
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-red animate-pulse block">
                    REBALANCING ORDER ROUTE...
                  </span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Small external sensor glow pins */}
        <div className="absolute top-1/2 left-3 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <div className="absolute top-1/2 right-3 w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-700" />
      </div>
    </motion.div>
  );
}
