'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function RolePage() {
  const router = useRouter();

  const selectRole = async (role: string) => {
    const userId = localStorage.getItem('doostav_user_id');
    if (!userId) {
      router.push('/auth?mode=login');
      return;
    }

    await fetch('/api/auth/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });

    localStorage.setItem('doostav_role', role);

    if (role === 'driver') {
      router.push('/driver-form');
    } else {
      router.push('/order');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[100px]" />
      </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg relative"
        >
          <button 
            onClick={() => router.back()} 
            className="absolute -left-16 top-0 w-12 h-12 rounded-2xl glass-light flex items-center justify-center text-foreground/40 hover:text-primary-light hover:border-primary/30 transition-all border border-transparent hidden lg:flex"
            title="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 -top-12 px-4 py-2 rounded-xl glass-light flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary-light transition-all lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            НАЗАД
          </button>

          <div className="text-center mb-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold mb-3"
          >
            Кто вы?
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-foreground/50"
          >
            Выберите вашу роль на платформе
          </motion.p>
        </div>

        <div className="grid gap-4">
          <motion.button
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(99, 102, 241, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole('driver')}
            className="glass rounded-3xl p-8 text-left group cursor-pointer transition-all hover:border-primary/30"
          >
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-3xl"
              >
                🚚
              </motion.div>
              <div>
                <h2 className="text-xl font-bold mb-1 group-hover:text-primary-light transition-colors">
                  Исполнитель
                </h2>
                <p className="text-foreground/40 text-sm leading-relaxed">
                  Дальнобойщик, курьер или перевозчик. Принимайте заказы и зарабатывайте.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(34, 211, 238, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole('customer')}
            className="glass rounded-3xl p-8 text-left group cursor-pointer transition-all hover:border-accent/30"
          >
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 text-3xl"
              >
                📦
              </motion.div>
              <div>
                <h2 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">
                  Заказчик
                </h2>
                <p className="text-foreground/40 text-sm leading-relaxed">
                  Отправляйте грузы — частные посылки или корпоративные партии.
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
