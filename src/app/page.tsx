'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Truck3D from './components/Truck3D';

export default function Home() {
  return (
    <div className="min-h-[200vh] bg-background relative overflow-x-hidden selection:bg-primary/30">
      {/* Background depth layers */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
        
        {/* Animated grid with perspective */}
        <div className="absolute inset-0 opacity-[0.05] [perspective:1000px]">
          <div 
            className="absolute inset-0 [transform:rotateX(60deg)]"
            style={{
              backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
              backgroundSize: '100px 100px',
              maskImage: 'linear-gradient(to bottom, black, transparent)',
            }}
          />
        </div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex items-center justify-between glass border-b border-primary/10"
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-light">
              <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">WILDDELIVERS</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/60">
          <a href="#features" className="hover:text-primary transition-colors">О сервисе</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">Как это работает</a>
          <a href="#rates" className="hover:text-primary transition-colors">Тарифы</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth?mode=login">
            <button className="px-5 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">Войти</button>
          </Link>
          <Link href="/auth?mode=register">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.5)] active:scale-95 transition-all">
              Регистрация
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center z-10"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary-light mb-8 shadow-inner"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Next-Gen Logistics
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 italic uppercase">
            Грузоперевозки <br />
            <span className="gradient-text italic">без границ</span>
          </h1>

          <p className="text-xl text-foreground/50 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Инновационная экосистема для водителей и заказчиков. 
            Прямое взаимодействие, прозрачные тарифы и 3D-мониторинг грузов.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth?mode=register">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="convex px-10 py-5 text-xl font-black uppercase italic text-white bg-gradient-to-br from-primary to-indigo-600 border border-white/10 shadow-[0_20px_40px_rgba(99,102,241,0.3)]"
              >
                Создать заказ
              </motion.button>
            </Link>
            <Link href="/role">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="convex-btn px-10 py-5 text-xl font-black uppercase italic text-foreground/80 border border-primary/10"
              >
                Стать водителем
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* 3D Motion Scene - The Truck */}
        <div className="w-full max-w-6xl mt-12">
          <Truck3D />
        </div>
      </section>

      {/* Features - Convex Cards */}
      <section id="features" className="py-24 px-6 relative">
         <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: "3D Мониторинг", desc: "Следите за положением и состоянием груза в реальном времени с высокой точностью.", icon: "🎯" },
                 { title: "Умные габариты", desc: "Система автоматически подберет оптимальный транспорт под ваши размеры.", icon: "📐" },
                 { title: "Быстрые выплаты", desc: "Исполнители получают оплату сразу после подтверждения выгрузки.", icon: "⚡" }
               ].map((item, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.2 }}
                   className="convex p-8 group hover:border-primary/30 transition-all border border-transparent"
                 >
                   <div className="text-4xl mb-6 group-hover:scale-125 transition-transform inline-block">{item.icon}</div>
                   <h3 className="text-2xl font-black uppercase italic mb-4">{item.title}</h3>
                   <p className="text-foreground/50 font-medium leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Stats Section with Depth */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-surface/50 border border-primary/10 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
              {[
                { label: "Заказов", value: "12K+" },
                { label: "Водителей", value: "3.5K" },
                { label: "Тонн груза", value: "50K+" },
                { label: "Городов", value: "150+" }
              ].map((stat, i) => (
                <div key={i}>
                   <div className="text-3xl font-black italic text-primary-light mb-2">{stat.value}</div>
                   <div className="text-xs font-bold uppercase tracking-widest text-foreground/30">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-primary/5 bg-surface/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-foreground/40 text-sm font-bold uppercase tracking-widest">
          <div>WILDDELIVERS &copy; 2026</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Политика</a>
            <a href="#" className="hover:text-primary transition-colors">Условия</a>
            <a href="#" className="hover:text-primary transition-colors">Контакты</a>
          </div>
          <div className="flex gap-4">
             {/* Social mock buttons */}
             <div className="w-8 h-8 rounded-lg bg-surface border border-primary/10 flex items-center justify-center hover:border-primary/50 cursor-pointer transition-all">𝕏</div>
             <div className="w-8 h-8 rounded-lg bg-surface border border-primary/10 flex items-center justify-center hover:border-primary/50 cursor-pointer transition-all">Tg</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
