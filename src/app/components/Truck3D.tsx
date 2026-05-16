'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function AnimatedNumber({ value, suffix = "" }: { value: any, suffix?: string }) {
  // Use useTransform to format the number
  const formattedValue = useTransform(value, (latest: number) => {
    return Math.round(latest).toLocaleString() + suffix;
  });
  
  return <motion.span>{formattedValue}</motion.span>;
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
                  <div className="absolute inset-0 flex items-end justify-start pl-4 gap-2 pb-[1px]">
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-12 h-16 bg-gradient-to-tr from-[#692912] to-[#8c3a1c] rounded-[2px] shadow-inner" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-16 h-12 bg-gradient-to-tr from-[#8c3a1c] to-[#b35222] rounded-[2px] shadow-inner" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-10 h-20 bg-gradient-to-tr from-[#3a1508] to-[#692912] rounded-[2px] shadow-inner" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-14 h-14 bg-gradient-to-tr from-[#692912] to-[#8c3a1c] rounded-[2px] shadow-inner" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-16 h-10 bg-gradient-to-tr from-[#8c3a1c] to-[#b35222] rounded-[2px] shadow-inner" 
                    />
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-12 h-16 bg-gradient-to-tr from-[#3a1508] to-[#692912] rounded-[2px] shadow-inner" 
                    />
                  </div>

                  {/* Curtain (Tent) Sliding to close */}
                  {/* Since loadProgress goes from 0 to 100, we want the curtain to slide in from the right (cabin side) to the left */}
                  <motion.div 
                    style={{ width: useTransform(loadProgress, v => `${v}%`) }}
                    className="absolute top-0 right-0 bottom-0 bg-[#4b6bfb] z-10 border-l-4 border-[#3a56d4] shadow-[-10px_0_20px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* Vertical stripes for curtain texture */}
                    <div className="absolute inset-0 flex justify-end pr-2 opacity-30 gap-2">
                       {[...Array(30)].map((_, i) => (
                         <div key={i} className="w-[2px] h-full bg-[#2a40a8] shadow-sm" />
                       ))}
                    </div>
                    {/* Text on curtain - anchored to the left edge of the curtain so it moves with it */}
                    <div className="absolute top-4 left-4 whitespace-nowrap">
                       <span className="text-white/90 font-black italic tracking-[0.2em] text-lg drop-shadow-md">WILDDELIVERS</span>
                    </div>
                    
                    {/* Progress percentage on curtain */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="text-3xl font-black italic text-white/50 drop-shadow-md">
                         <AnimatedNumber value={loadProgress} suffix="%" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Trailer outline overlay */}
                  <div className="absolute inset-0 border-2 border-[#2a2a2a] rounded-l-lg z-20 pointer-events-none" />
                  
                  {/* Trailer chassis/bumper at the bottom */}
                  <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#111] z-20 rounded-l-sm flex justify-between px-4">
                     {/* Bumper reflectors */}
                     <div className="w-4 h-1 bg-red-500 mt-0.5 rounded-sm" />
                     <div className="w-4 h-1 bg-yellow-500 mt-0.5 rounded-sm" />
                  </div>
               </div>

               {/* Truck Cabin (Realistic White) */}
               <div className="relative w-36 h-36 flex flex-col justify-end z-30 ml-[2px]">
                  {/* Cabin body */}
                  <div className="absolute bottom-0 left-0 w-32 h-28 bg-gradient-to-b from-[#ffffff] to-[#e0e0e0] border border-black/10 rounded-r-xl rounded-l-sm shadow-xl">
                    {/* Window */}
                    <div className="absolute top-4 right-2 w-20 h-12 bg-gradient-to-br from-slate-800 to-slate-950 rounded-md border border-white/20 overflow-hidden">
                      <div className="absolute top-1 right-2 w-4 h-16 bg-white/10 skew-x-[30deg] blur-[1px]" />
                      <div className="absolute top-1 right-10 w-2 h-16 bg-white/5 skew-x-[30deg] blur-[1px]" />
                    </div>
                    {/* Door line */}
                    <div className="absolute top-0 left-8 w-[1px] h-full bg-black/10" />
                    {/* Handle */}
                    <div className="absolute top-16 left-5 w-4 h-1.5 bg-black/30 rounded-full shadow-inner" />
                    {/* Grill */}
                    <div className="absolute bottom-4 right-0 w-8 h-10 bg-[#cfcfcf] border-l border-black/10 flex flex-col gap-1.5 p-1 rounded-bl-sm">
                      {[...Array(4)].map((_, i) => <div key={i} className="w-full h-[2px] bg-black/20 rounded-full" />)}
                    </div>
                    {/* Headlight */}
                    <div className="absolute bottom-4 right-0 w-3 h-4 bg-yellow-100/80 rounded-l-sm border border-black/10 shadow-[0_0_10px_rgba(255,255,150,0.5)]" />
                  </div>
                  {/* High roof (Aerodynamic deflector) */}
                  <div className="absolute top-0 left-0 w-28 h-8 bg-gradient-to-r from-[#f5f5f5] to-[#ffffff] border-x border-t border-black/10 rounded-t-3xl shadow-sm" />
                  
                  {/* Mirrors */}
                  <div className="absolute top-8 -right-2 w-2 h-10 bg-slate-800 rounded-sm border border-slate-700 shadow-sm" />
                  
                  {/* Exhaust or connecting pipes */}
                  <div className="absolute bottom-8 -left-2 w-2 h-12 flex flex-col justify-between">
                     <div className="w-full h-1 bg-black/40" />
                     <div className="w-full h-1 bg-black/40" />
                  </div>
               </div>
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-5 left-8 flex gap-[4.5rem] z-40">
               <div className="flex gap-1.5">
                 {/* Trailer wheel 1 */}
                 <div className="w-12 h-12 bg-slate-900 rounded-full border-[5px] border-[#1a1a1a] shadow-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-[#d4d4d4] rounded-full flex items-center justify-center border border-black/20">
                      <div className="w-2 h-2 bg-black/80 rounded-full" />
                    </div>
                 </div>
                 {/* Trailer wheel 2 */}
                 <div className="w-12 h-12 bg-slate-900 rounded-full border-[5px] border-[#1a1a1a] shadow-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-[#d4d4d4] rounded-full flex items-center justify-center border border-black/20">
                      <div className="w-2 h-2 bg-black/80 rounded-full" />
                    </div>
                 </div>
               </div>
               {/* Cabin wheel */}
               <div className="absolute -bottom-0 right-7">
                 <div className="w-12 h-12 bg-slate-900 rounded-full border-[5px] border-[#1a1a1a] shadow-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-[#d4d4d4] rounded-full flex items-center justify-center border border-black/20">
                      <div className="w-2 h-2 bg-black/80 rounded-full" />
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
