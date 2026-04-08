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
  const loadProgress = useTransform(scrollYProgress, [0.1, 0.6], [0, 85]);
  
  // Weights based on progress
  const currentLoad = useTransform(loadProgress, (v) => (v / 100) * 20000);

  return (
    <div ref={containerRef} className="relative py-20 w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Truck Info Card (from screenshot) */}
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
               <div className="relative flex-grow h-32 bg-white rounded-l-md border-y border-l border-black/10 shadow-lg overflow-hidden">
                  {/* Load Progress Overlay (Green with stripes like screenshot) */}
                  <motion.div 
                    style={{ width: useTransform(loadProgress, v => `${v}%`) }}
                    className="absolute inset-0 bg-[#22c55e] z-10 flex items-center justify-center overflow-hidden"
                  >
                    {/* Diagonal stripes texture */}
                    <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                      backgroundSize: '40px 40px'
                    }} />
                    
                    <span className="relative z-10 text-3xl font-black italic text-white drop-shadow-md">
                      <AnimatedNumber value={loadProgress} suffix="%" />
                    </span>
                  </motion.div>

                  {/* Empty trailer details */}
                  <div className="absolute inset-0 flex justify-between px-4 items-center">
                     {[...Array(8)].map((_, i) => (
                       <div key={i} className="w-[1px] h-[80%] bg-black/5" />
                     ))}
                  </div>
               </div>

               {/* Truck Cabin (Realistic White) */}
               <div className="relative w-36 h-36 flex flex-col justify-end">
                  {/* Cabin body */}
                  <div className="absolute bottom-0 left-0 w-32 h-28 bg-white border border-black/10 rounded-r-xl rounded-l-sm shadow-xl">
                    {/* Window */}
                    <div className="absolute top-4 right-2 w-20 h-12 bg-slate-900/90 rounded-md border border-white/20">
                      <div className="absolute top-1 right-2 w-4 h-6 bg-white/10 skew-x-12 blur-[1px]" />
                    </div>
                    {/* Door line */}
                    <div className="absolute top-0 left-8 w-[1px] h-full bg-black/5" />
                    {/* Handle */}
                    <div className="absolute top-16 left-6 w-3 h-1 bg-black/20 rounded-full" />
                    {/* Grill */}
                    <div className="absolute bottom-4 right-0 w-8 h-10 bg-slate-100 border-l border-black/5 flex flex-col gap-1.5 p-1">
                      {[...Array(4)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black/10" />)}
                    </div>
                  </div>
                  {/* High roof */}
                  <div className="absolute top-0 left-0 w-28 h-8 bg-white border-x border-t border-black/10 rounded-t-3xl" />
                  
                  {/* Mirrors */}
                  <div className="absolute top-8 -right-1 w-2 h-8 bg-slate-800 rounded-sm" />
               </div>
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-4 left-6 flex gap-12">
               <div className="flex gap-2">
                 <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-600 rounded-full" />
                 </div>
                 <div className="w-10 h-10 bg-slate-900 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-600 rounded-full" />
                 </div>
               </div>
               <div className="absolute -bottom-0 right-8">
                 <div className="w-11 h-11 bg-slate-900 rounded-full border-4 border-slate-700 shadow-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-slate-600 rounded-full" />
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative background grid elements */}
      <div className="absolute inset-0 -z-10 opacity-10 flex items-center justify-center">
         <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px]" />
      </div>
    </div>
  );
}
