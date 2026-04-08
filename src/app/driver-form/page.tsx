'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const vehicleTypes = [
  { label: 'Фура (20т)', value: 'truck_20t', icon: '🚛', desc: 'Еврофура, тентованная, бортовая' },
  { label: 'Фургон', value: 'van', icon: '🚐', desc: 'Газель, Спринтер, Ивеко' },
  { label: 'Рефрижератор', value: 'refrigerator', icon: '❄️', desc: 'Температурный контроль' },
  { label: 'Малогабаритный', value: 'car', icon: '🚗', desc: 'Легковая, каблук, пикап' },
];

const cityCoords: Record<string, [number, number]> = {
  'москва': [55.7558, 37.6173],
  'санкт-петербург': [59.9343, 30.3351],
  'новосибирск': [55.0084, 82.9357],
  'екатеринбург': [56.8389, 60.6057],
  'казань': [55.7887, 49.1221],
  'нижний новгород': [56.2965, 43.9361],
  'челябинск': [55.1644, 61.4368],
  'самара': [53.1959, 50.1002],
  'ростов-на-дону': [47.2357, 39.7015],
  'уфа': [54.7388, 55.9721],
  'краснодар': [45.0355, 38.9753],
  'воронеж': [51.6720, 39.1843],
  'пермь': [58.0105, 56.2502],
  'волгоград': [48.7080, 44.5133],
  'красноярск': [56.0153, 92.8932],
  'омск': [54.9885, 73.3242],
  'тюмень': [57.1522, 65.5272],
  'иркутск': [52.2870, 104.3050],
  'хабаровск': [48.4827, 135.0836],
  'владивосток': [43.1156, 131.8855],
};

export default function DriverFormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    transport_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
      vehicle_capacity_kg: '',
      vehicle_length_m: '',
      vehicle_width_m: '',
      vehicle_height_m: '',
    });

  const update = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const canNext1 = form.name && form.phone && form.city;
  const canNext2 = form.transport_type;
  const canSubmit = form.vehicle_brand && form.vehicle_plate;

  const handleSubmit = async () => {
    setLoading(true);
    const userId = localStorage.getItem('doostav_user_id');

    const cityLower = form.city.toLowerCase();
    const coords = cityCoords[cityLower] || [55.7558 + (Math.random() - 0.5) * 10, 37.6173 + (Math.random() - 0.5) * 20];

    await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        name: form.name,
        phone: form.phone,
        city: form.city,
        transport_type: form.transport_type,
        vehicle_brand: form.vehicle_brand,
        vehicle_model: form.vehicle_model,
        vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : null,
        vehicle_plate: form.vehicle_plate.toUpperCase(),
          vehicle_capacity_kg: form.vehicle_capacity_kg ? parseInt(form.vehicle_capacity_kg) : null,
          vehicle_length_m: form.vehicle_length_m ? parseFloat(form.vehicle_length_m) : null,
          vehicle_width_m: form.vehicle_width_m ? parseFloat(form.vehicle_width_m) : null,
          vehicle_height_m: form.vehicle_height_m ? parseFloat(form.vehicle_height_m) : null,
        lat: coords[0],
        lng: coords[1],
      }),
    });

    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-3xl p-8 glow">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  step >= s ? 'bg-primary' : 'bg-surface-light'
                }`} />
              </div>
            ))}
            <span className="text-xs text-foreground/40 ml-2">Шаг {step}/3</span>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Personal info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 text-3xl"
                  >
                    👤
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-1">О вас</h1>
                  <p className="text-foreground/50 text-sm">Контактная информация</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Имя / Позывной *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Виктор «Дальнобой»"
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Телефон *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Город базирования *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Москва"
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  disabled={!canNext1}
                  className="w-full mt-6 py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-30"
                >
                  Далее — Тип транспорта
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Vehicle type */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4 text-3xl"
                  >
                    🚚
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-1">Тип транспорта</h1>
                  <p className="text-foreground/50 text-sm">Выберите категорию вашего ТС</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {vehicleTypes.map((t) => (
                    <motion.button
                      key={t.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => update('transport_type', t.value)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                        form.transport_type === t.value
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border bg-surface-light hover:border-border'
                      }`}
                    >
                      <span className="text-3xl">{t.icon}</span>
                      <div>
                        <div className={`font-semibold ${form.transport_type === t.value ? 'text-primary-light' : 'text-foreground/80'}`}>
                          {t.label}
                        </div>
                        <div className="text-foreground/40 text-xs">{t.desc}</div>
                      </div>
                      {form.transport_type === t.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-2xl font-semibold glass text-foreground/60"
                  >
                    Назад
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    disabled={!canNext2}
                    className="flex-[2] py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-30"
                  >
                    Далее — Данные ТС
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Vehicle details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4 text-3xl"
                  >
                    {vehicleTypes.find(t => t.value === form.transport_type)?.icon || '🚛'}
                  </motion.div>
                  <h1 className="text-2xl font-bold mb-1">Данные автомобиля</h1>
                  <p className="text-foreground/50 text-sm">Марка, модель, номер</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Марка *</label>
                      <input
                        type="text"
                        value={form.vehicle_brand}
                        onChange={(e) => update('vehicle_brand', e.target.value)}
                        placeholder="MAN, Volvo, ГАЗ..."
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Модель</label>
                      <input
                        type="text"
                        value={form.vehicle_model}
                        onChange={(e) => update('vehicle_model', e.target.value)}
                        placeholder="TGX, FH, Next..."
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Год выпуска</label>
                      <input
                        type="number"
                        value={form.vehicle_year}
                        onChange={(e) => update('vehicle_year', e.target.value)}
                        placeholder="2020"
                        min="1990"
                        max="2026"
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Гос. номер *</label>
                      <input
                        type="text"
                        value={form.vehicle_plate}
                        onChange={(e) => update('vehicle_plate', e.target.value.toUpperCase())}
                        placeholder="А123БВ777"
                        maxLength={12}
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 uppercase"
                      />
                    </div>
                  </div>

                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Размеры кузова (м)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={form.vehicle_length_m}
                            onChange={(e) => update('vehicle_length_m', e.target.value)}
                            placeholder="13.6"
                            className="w-full px-3 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 text-center"
                          />
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-foreground/30">длина</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={form.vehicle_width_m}
                            onChange={(e) => update('vehicle_width_m', e.target.value)}
                            placeholder="2.4"
                            className="w-full px-3 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 text-center"
                          />
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-foreground/30">ширина</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={form.vehicle_height_m}
                            onChange={(e) => update('vehicle_height_m', e.target.value)}
                            placeholder="2.7"
                            className="w-full px-3 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 text-center"
                          />
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-foreground/30">высота</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-foreground/40 mb-2 block">Грузоподъёмность (кг)</label>
                      <input
                        type="number"
                        value={form.vehicle_capacity_kg}
                        onChange={(e) => update('vehicle_capacity_kg', e.target.value)}
                        placeholder="20000"
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-primary/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20"
                      />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-2xl font-semibold glass text-foreground/60"
                  >
                    Назад
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit}
                    className="flex-[2] py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-30"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить и на карту'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
