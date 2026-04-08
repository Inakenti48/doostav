'use client';

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';

function AnimatedNumber({ value, suffix = "" }: { value: any, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  useMotionValueEvent(value, "change", (latest) => {
    setDisplayValue(Math.round(latest));
  });
  return <>{displayValue.toLocaleString()}{suffix}</>;
}

export default function Truck3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Animation values based on scroll
  const x = useTransform(scrollYProgress, [0, 1], [-300, 300]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 0.9]);
  
  // Progress of loading (0 to 100)
  const loadProgress = useTransform(scrollYProgress, [0.1, 0.6], [0, 100]);
  
  // Weights based on progress
  const currentLoad = useTransform(loadProgress, (v) => (v / 100) * 20000);

  return (
    <div ref={containerRef} className="relative py-20 w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Truck Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="convex mb-12 p-8 w-full max-w-xl bg-surface/80 backdrop-blur-xl border border-primary/10 relative z-20"
      >
        <h3 className="text-xl font-black uppercase italic mb-6 tracking-tight">Текущая загрузка</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-foreground/40 uppercase">Загружено</span>
            <div className="flex items-baseline gap-1 text-primary-light italic text-2xl">
              <AnimatedNumber value={currentLoad} />
              <span className="text-foreground/30 text-sm">кг</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-t border-primary/5 pt-4">
            <span className="text-foreground/40 uppercase">Макс. грузоподъемность</span>
            <div className="flex items-baseline gap-1 text-foreground/60 italic text-2xl">
              <span>20,000</span>
              <span className="text-foreground/30 text-sm">кг</span>
            </div>
          </div>
        </div>

        {/* Realistic Truck Container */}
        <div className="relative w-full aspect-[2.5/1] flex items-center justify-center">
          {/* Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-black/40 blur-2xl rounded-full" />
          
          <motion.div 
            style={{ x, scale }}
            className="relative flex items-center w-full"
          >
            {/* The Truck Image (White, High Quality) */}
            <div className="relative flex items-end w-full">
               
               {/* Trailer */}
               <div className="relative flex-grow h-32 bg-[#1a1a1a] rounded-l-lg border-y border-l border-white/10 shadow-lg overflow-hidden flex items-end">
                  
                  {/* Inside of trailer (dark) with boxes */}
                  <div className="absolute inset-0 flex items-end p-2 gap-2">
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-12 h-16 bg-[#8c3a1c] rounded-sm shadow-inner opacity-80" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-16 h-12 bg-[#b35222] rounded-sm shadow-inner opacity-80" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-10 h-20 bg-[#692912] rounded-sm shadow-inner opacity-80" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-14 h-14 bg-[#8c3a1c] rounded-sm shadow-inner opacity-80" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-16 h-10 bg-[#b35222] rounded-sm shadow-inner opacity-80" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-12 h-16 bg-[#692912] rounded-sm shadow-inner opacity-80" 
                    />
                  </div>

                  {/* Curtain (Tent) Sliding to close */}
                  <motion.div 
                    style={{ width: useTransform(loadProgress, v => `${v}%`) }}
                    className="absolute top-0 right-0 bottom-0 bg-[#4b6bfb] z-10 border-l border-[#3a56d4] shadow-[-5px_0_15px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    {/* Vertical stripes for curtain texture */}
                    <div className="absolute inset-0 flex justify-evenly opacity-30">
                       {[...Array(20)].map((_, i) => (
                         <div key={i} className="w-[1px] h-full bg-[#2a40a8]" />
                       ))}
                    </div>
                    {/* Text on curtain */}
                    <div className="absolute top-4 left-4 whitespace-nowrap">
                       <span className="text-white/80 font-black italic tracking-widest text-sm">WILDDELIVERS</span>
                    </div>
                  </motion.div>

                  {/* Trailer outline overlay */}
                  <div className="absolute inset-0 border-2 border-[#2a2a2a] rounded-l-lg z-20 pointer-events-none" />
               </div>

               {/* Truck Cabin (Realistic White) */}
               <div className="relative w-36 h-36 flex flex-col justify-end z-30">
                  {/* Cabin body */}
                  <div className="absolute bottom-0 left-0 w-32 h-28 bg-[#f5f5f5] border border-black/10 rounded-r-xl rounded-l-sm shadow-xl">
                    {/* Window */}
                    <div className="absolute top-4 right-2 w-20 h-12 bg-slate-900/90 rounded-md border border-white/20">
                      <div className="absolute top-1 right-2 w-4 h-6 bg-white/10 skew-x-12 blur-[1px]" />
                    </div>
                    {/* Door line */}
                    <div className="absolute top-0 left-8 w-[1px] h-full bg-black/5" />
                    {/* Handle */}
                    <div className="absolute top-16 left-6 w-3 h-1 bg-black/20 rounded-full" />
                    {/* Grill */}
                    <div className="absolute bottom-4 right-0 w-8 h-10 bg-[#e0e0e0] border-l border-black/5 flex flex-col gap-1.5 p-1">
                      {[...Array(4)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black/10" />)}
                    </div>
                  </div>
                  {/* High roof */}
                  <div className="absolute top-0 left-0 w-28 h-8 bg-[#f5f5f5] border-x border-t border-black/10 rounded-t-3xl" />
                  
                  {/* Mirrors */}
                  <div className="absolute top-8 -right-1 w-2 h-8 bg-slate-800 rounded-sm" />
               </div>
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-4 left-6 flex gap-12 z-40">
               <div className="flex gap-2">
                 <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-[#2a2a2a] shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-500 rounded-full" />
                 </div>
                 <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-[#2a2a2a] shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-500 rounded-full" />
                 </div>
               </div>
               <div className="absolute -bottom-0 right-8">
                 <div className="w-11 h-11 bg-slate-900 rounded-full border-4 border-[#2a2a2a] shadow-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-slate-500 rounded-full" />
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
