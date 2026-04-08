'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';

  const [mode, setMode] = useState<'register' | 'login' | 'credentials'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('doostav_credentials');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLoginForm({ login: parsed.login, password: parsed.password });
    }
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setCredentials({ login: data.login, password: data.password });
      localStorage.setItem('doostav_token', data.token);
      localStorage.setItem('doostav_user_id', data.userId);
      localStorage.setItem('doostav_login', data.login);
      setMode('credentials');
    } catch {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem('doostav_token', data.token);
      localStorage.setItem('doostav_user_id', data.userId);
      localStorage.setItem('doostav_login', data.login);
      if (data.role) {
        localStorage.setItem('doostav_role', data.role);
        router.push('/dashboard');
      } else {
        router.push('/role');
      }
    } catch {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Логин: ${credentials.login}\nПароль: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    localStorage.setItem('doostav_credentials', JSON.stringify(credentials));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaved = () => {
    router.push('/role');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'credentials' && credentials ? (
            <motion.div
              key="credentials"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <div className="convex p-8 text-center border border-white/5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <h1 className="text-2xl font-bold mb-2">ВАШ ДОСТУП СОЗДАН</h1>
              <p className="text-foreground/50 mb-8 text-sm">Сохраните данные для входа</p>

              <div className="space-y-3 mb-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-light rounded-2xl p-4 text-left"
                >
                  <div className="text-xs text-foreground/40 mb-1">Логин</div>
                  <div className="text-lg font-mono font-bold text-primary-light">{credentials.login}</div>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass-light rounded-2xl p-4 text-left"
                >
                  <div className="text-xs text-foreground/40 mb-1">Пароль</div>
                  <div className="text-lg font-mono font-bold text-accent">{credentials.password}</div>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-6"
              >
                <p className="text-danger text-sm font-medium">
                  Сохраните логин и пароль. Восстановление невозможно.
                </p>
                <p className="text-foreground/40 text-xs mt-1">
                  Сделайте скриншот или сохраните в заметки.
                </p>
              </motion.div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyCredentials}
                  className="w-full py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all"
                >
                  {copied ? '✓ Скопировано!' : 'Скопировать данные'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaved}
                  className="w-full py-4 rounded-2xl font-semibold glass text-foreground/80 hover:text-foreground transition-all"
                >
                  Я сохранил — продолжить
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : mode === 'register' ? (
            <motion.div
              key="register"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <div className="convex p-8 text-center border border-white/5 relative">
                <button 
                  onClick={() => router.back()} 
                  className="absolute left-4 top-4 w-10 h-10 rounded-xl glass-light flex items-center justify-center text-foreground/40 hover:text-primary-light hover:border-primary/30 transition-all border border-transparent"
                  title="Назад"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <Link href="/" className="inline-block mb-8">
                  <div className="flex items-center gap-2 justify-center group">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-light">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <span className="font-black italic tracking-tighter uppercase">WILDDELIVERS</span>
                  </div>
                </Link>

                <h1 className="text-3xl font-black italic uppercase mb-2">Регистрация</h1>
              <p className="text-foreground/50 mb-8 text-sm">
                Система автоматически создаст ваш аккаунт
              </p>

              <motion.div
                className="glass-light rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-light">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Мгновенная регистрация</div>
                    <div className="text-foreground/40 text-xs">Логин и пароль будут сгенерированы автоматически</div>
                  </div>
                </div>
              </motion.div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-4 text-danger text-sm">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Создаём аккаунт...
                  </span>
                ) : (
                  'Зарегистрироваться'
                )}
              </motion.button>

              <p className="mt-6 text-foreground/40 text-sm">
                Уже есть аккаунт?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-primary-light hover:underline">
                  Войти
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <div className="convex p-8 border border-white/5 relative">
              <button 
                onClick={() => router.back()} 
                className="absolute left-4 top-4 w-10 h-10 rounded-xl glass-light flex items-center justify-center text-foreground/40 hover:text-primary-light hover:border-primary/30 transition-all border border-transparent"
                title="Назад"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-6 group">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-light">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <span className="font-black italic tracking-tighter uppercase">WILDDELIVERS</span>
                  </div>
                </Link>
                <h1 className="text-3xl font-black italic uppercase mb-2">Вход</h1>
                <p className="text-foreground/50 text-sm italic">Введите данные вашего аккаунта</p>
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-4 text-danger text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-foreground/40 mb-2 block">Логин</label>
                  <input
                    type="text"
                    value={loginForm.login}
                    onChange={(e) => setLoginForm(p => ({ ...p, login: e.target.value }))}
                    placeholder="truck-48291"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 mb-2 block">Пароль</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 font-mono"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Вход...
                  </span>
                ) : (
                  'Войти'
                )}
              </motion.button>

              <p className="mt-6 text-foreground/40 text-sm text-center">
                Нет аккаунта?{' '}
                <button onClick={() => { setMode('register'); setError(''); }} className="text-primary-light hover:underline">
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
