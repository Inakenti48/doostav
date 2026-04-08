'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const VEHICLE_TYPES = [
  { key: 'truck', label: 'Фура / Большегруз', icon: '🚛', loading_time_min: 180, downtime_rate_per_min: 10, desc: '3 ч бесплатно, далее 10 ₽/мин' },
  { key: 'gazelle', label: 'Газель / Средний', icon: '🚐', loading_time_min: 60, downtime_rate_per_min: 5, desc: '1 ч бесплатно, далее 5 ₽/мин' },
  { key: 'pickup', label: 'Пикап / Малый габарит', icon: '🛻', loading_time_min: 30, downtime_rate_per_min: 3, desc: '30 мин бесплатно, далее 3 ₽/мин' },
  { key: 'car', label: 'Легковой', icon: '🚗', loading_time_min: 10, downtime_rate_per_min: 2, desc: '10 мин бесплатно, далее 2 ₽/мин' },
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
  'воронеж': [51.6683, 39.1843],
};

function calcVolume(w: string, l: string, h: string): string | null {
  const width = parseFloat(w);
  const length = parseFloat(l);
  const height = parseFloat(h);
  if (width > 0 && length > 0 && height > 0) {
    return ((width * length * height) / 1000000).toFixed(3);
  }
  return null;
}

export default function OrderPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<'private' | 'company' | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const [privateForm, setPrivateForm] = useState({
    cargo_name: '', sender_phone: '', city: '', address: '', comment: '',
    cargo_width: '', cargo_length: '', cargo_height: '', cargo_weight: '',
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: '', cargo_name: '', address: '', sender_phone: '', company_email: '',
    cargo_width: '', cargo_length: '', cargo_height: '', cargo_weight: '',
  });

  const vehicleInfo = VEHICLE_TYPES.find(v => v.key === selectedVehicle);
  const privateVolume = calcVolume(privateForm.cargo_width, privateForm.cargo_length, privateForm.cargo_height);
  const companyVolume = calcVolume(companyForm.cargo_width, companyForm.cargo_length, companyForm.cargo_height);

  const handleSubmit = async () => {
    setLoading(true);
    const userId = localStorage.getItem('doostav_user_id');
    const city = orderType === 'private' ? privateForm.city : '';
    const coords = cityCoords[city.toLowerCase()] || [55.7558 + (Math.random() - 0.5) * 10, 37.6173 + (Math.random() - 0.5) * 20];
    const vehicleData = vehicleInfo ? { vehicle_type: vehicleInfo.key, loading_time_min: vehicleInfo.loading_time_min, downtime_rate_per_min: vehicleInfo.downtime_rate_per_min } : {};
    const body = orderType === 'private'
      ? { user_id: userId, order_type: 'private', ...privateForm, ...vehicleData, lat: coords[0], lng: coords[1] }
      : { user_id: userId, order_type: 'company', ...companyForm, ...vehicleData, lat: coords[0] + (Math.random() - 0.5) * 2, lng: coords[1] + (Math.random() - 0.5) * 4 };

    await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setLoading(false);
    router.push('/dashboard');
  };

  const inputCls = (accent = false) =>
    `w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-${accent ? 'accent' : 'primary'}/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20`;

  const DimensionsBlock = ({ form, setForm, volume, accent }: {
    form: { cargo_width: string; cargo_length: string; cargo_height: string; cargo_weight: string };
    setForm: (updater: (p: typeof form) => typeof form) => void;
    volume: string | null;
    accent: boolean;
  }) => (
    <>
      <div>
        <label className="text-xs text-foreground/40 mb-2 block">Габариты груза (см)</label>
        <div className="grid grid-cols-3 gap-2">
          {(['cargo_width', 'cargo_length', 'cargo_height'] as const).map((key, i) => (
            <div key={key} className="relative">
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder="0"
                min="0"
                className={`w-full px-3 py-3.5 rounded-xl bg-surface-light border border-border focus:border-${accent ? 'accent' : 'primary'}/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 text-center`}
              />
              <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-foreground/30">
                {['ширина', 'длина', 'высота'][i]}
              </span>
            </div>
          ))}
        </div>
        {volume && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-light border border-border">
            <span className="text-foreground/40 text-xs">Объём груза:</span>
            <span className={`${accent ? 'text-accent' : 'text-primary-light'} font-bold text-sm`}>{volume} м³</span>
          </div>
        )}
      </div>
      <div>
        <label className="text-xs text-foreground/40 mb-2 block">Вес груза (кг)</label>
        <input
          type="number"
          value={form.cargo_weight}
          onChange={(e) => setForm(p => ({ ...p, cargo_weight: e.target.value }))}
          placeholder="0"
          min="0"
          className={`w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-${accent ? 'accent' : 'primary'}/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20`}
        />
      </div>
    </>
  );

  const VehicleBlock = ({ accent }: { accent: boolean }) => (
    <div>
      <label className="text-xs text-foreground/40 mb-2 block">Тип транспорта</label>
      <div className="grid grid-cols-2 gap-2">
        {VEHICLE_TYPES.map(v => (
          <button
            key={v.key}
            type="button"
            onClick={() => setSelectedVehicle(v.key)}
            className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${selectedVehicle === v.key ? `border-${accent ? 'accent' : 'primary'} bg-${accent ? 'accent' : 'primary'}/10` : 'border-border bg-surface-light hover:border-primary/40'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{v.icon}</span>
              <span className="text-xs font-semibold text-foreground">{v.label}</span>
            </div>
            <span className="text-[10px] text-foreground/40">{v.desc}</span>
          </button>
        ))}
      </div>
      {vehicleInfo && (
        <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-${accent ? 'accent' : 'primary'}/10 border border-${accent ? 'accent' : 'primary'}/20`}>
          <span className="text-lg">{vehicleInfo.icon}</span>
          <div>
            <div className={`text-xs font-semibold text-${accent ? 'accent' : 'primary-light'}`}>{vehicleInfo.label}</div>
            <div className="text-[10px] text-foreground/50">
              Бесплатно: <b className="text-foreground/70">{vehicleInfo.loading_time_min >= 60 ? `${vehicleInfo.loading_time_min / 60} ч` : `${vehicleInfo.loading_time_min} мин`}</b>
              &nbsp;· Простой: <b className="text-foreground/70">{vehicleInfo.downtime_rate_per_min} ₽/мин</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {!orderType ? (
            <motion.div key="type-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3">Тип заказа</h1>
                <p className="text-foreground/50">Выберите тип отправления</p>
              </div>
              <div className="grid gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setOrderType('private')} className="glass rounded-3xl p-8 text-left group cursor-pointer transition-all hover:border-accent/30">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0 text-3xl">📦</div>
                    <div>
                      <h2 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">Частный груз</h2>
                      <p className="text-foreground/40 text-sm">Личная посылка, переезд, небольшой груз</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setOrderType('company')} className="glass rounded-3xl p-8 text-left group cursor-pointer transition-all hover:border-primary/30">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-3xl">🏢</div>
                    <div>
                      <h2 className="text-xl font-bold mb-1 group-hover:text-primary-light transition-colors">Компания</h2>
                      <p className="text-foreground/40 text-sm">Корпоративная доставка, оптовые перевозки</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>

          ) : orderType === 'private' ? (
            <motion.div key="private-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass rounded-3xl p-8 glow">
                <button onClick={() => setOrderType(null)} className="text-foreground/40 hover:text-foreground text-sm mb-6 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Назад
                </button>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Частный груз</h1>
                  <p className="text-foreground/50 text-sm">Опишите ваш груз и адрес доставки</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Название груза</label>
                    <input value={privateForm.cargo_name} onChange={(e) => setPrivateForm(p => ({ ...p, cargo_name: e.target.value }))} placeholder="Бытовая техника, мебель..." className={inputCls(true)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Телефон отправителя</label>
                    <input value={privateForm.sender_phone} onChange={(e) => setPrivateForm(p => ({ ...p, sender_phone: e.target.value }))} placeholder="+7 (999) 123-45-67" className={inputCls(true)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Город получения</label>
                    <input value={privateForm.city} onChange={(e) => setPrivateForm(p => ({ ...p, city: e.target.value }))} placeholder="Москва" className={inputCls(true)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Точный адрес (дом, квартира)</label>
                    <input value={privateForm.address} onChange={(e) => setPrivateForm(p => ({ ...p, address: e.target.value }))} placeholder="ул. Ленина 15, кв. 42" className={inputCls(true)} />
                  </div>
                  <VehicleBlock accent={true} />
                  <DimensionsBlock form={privateForm} setForm={setPrivateForm} volume={privateVolume} accent={true} />
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Комментарий</label>
                    <textarea value={privateForm.comment} onChange={(e) => setPrivateForm(p => ({ ...p, comment: e.target.value }))} placeholder="Хрупкий груз, требует аккуратной погрузки" rows={3} className="w-full px-4 py-3.5 rounded-xl bg-surface-light border border-border focus:border-accent/50 focus:outline-none transition-colors text-foreground placeholder:text-foreground/20 resize-none" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading || !privateForm.cargo_name || !privateForm.city} className="w-full mt-8 py-4 rounded-2xl font-semibold text-white bg-accent glow-accent transition-all disabled:opacity-30">
                  {loading ? 'Создание...' : 'Разместить заказ'}
                </motion.button>
              </div>
            </motion.div>

          ) : (
            <motion.div key="company-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass rounded-3xl p-8 glow">
                <button onClick={() => setOrderType(null)} className="text-foreground/40 hover:text-foreground text-sm mb-6 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Назад
                </button>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Компания</h1>
                  <p className="text-foreground/50 text-sm">Корпоративная доставка</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Название компании</label>
                    <input value={companyForm.company_name} onChange={(e) => setCompanyForm(p => ({ ...p, company_name: e.target.value }))} placeholder="ООО «ТрансЛогистика»" className={inputCls(false)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Наименование товара</label>
                    <input value={companyForm.cargo_name} onChange={(e) => setCompanyForm(p => ({ ...p, cargo_name: e.target.value }))} placeholder="Строительные материалы" className={inputCls(false)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Адрес компании</label>
                    <input value={companyForm.address} onChange={(e) => setCompanyForm(p => ({ ...p, address: e.target.value }))} placeholder="г. Москва, Промышленная ул. 10" className={inputCls(false)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Телефон</label>
                    <input value={companyForm.sender_phone} onChange={(e) => setCompanyForm(p => ({ ...p, sender_phone: e.target.value }))} placeholder="+7 (495) 123-45-67" className={inputCls(false)} />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/40 mb-2 block">Email (необязательно)</label>
                    <input value={companyForm.company_email} onChange={(e) => setCompanyForm(p => ({ ...p, company_email: e.target.value }))} placeholder="info@company.ru" className={inputCls(false)} />
                  </div>
                  <VehicleBlock accent={false} />
                  <DimensionsBlock form={companyForm} setForm={setCompanyForm} volume={companyVolume} accent={false} />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading || !companyForm.company_name || !companyForm.cargo_name} className="w-full mt-8 py-4 rounded-2xl font-semibold text-white bg-primary glow transition-all disabled:opacity-30">
                  {loading ? 'Создание...' : 'Разместить заказ'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
