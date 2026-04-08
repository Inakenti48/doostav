'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Order {
  id: string;
  order_type: string;
  cargo_name: string;
  sender_phone: string;
  city: string;
  address: string;
  comment: string;
  company_name: string;
  lat: number;
  lng: number;
  status: string;
  driver_id: string | null;
  created_at: string;
  cargo_width?: number;
  cargo_length?: number;
  cargo_height?: number;
  cargo_weight?: number;
}

interface Driver {
  id: string;
  user_id: string;
  name: string;
  transport_type: string;
  phone: string;
  city: string;
  lat: number;
  lng: number;
  is_active: boolean;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  vehicle_capacity_kg?: number;
  vehicle_length_m?: number;
  vehicle_width_m?: number;
  vehicle_height_m?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [login, setLogin] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = useCallback(async () => {
    const [ordersRes, driversRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/drivers'),
    ]);
    const ordersData = await ordersRes.json();
    const driversData = await driversRes.json();
    setOrders(ordersData);
    setDrivers(driversData);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('doostav_token');
    if (!token) {
      router.push('/auth?mode=login');
      return;
    }
    setRole(localStorage.getItem('doostav_role'));
    setLogin(localStorage.getItem('doostav_login') || '');
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [router, fetchData]);

  const handleRespond = async (orderId: string) => {
    const userId = localStorage.getItem('doostav_user_id');
    const driver = drivers.find(d => d.user_id === userId);
    if (!driver) return;

    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, driverId: driver.id, status: 'in_progress' }),
    });

    fetchData();
    setSelectedOrder(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('doostav_token');
    localStorage.removeItem('doostav_user_id');
    localStorage.removeItem('doostav_login');
    localStorage.removeItem('doostav_role');
    router.push('/');
  };

  const activeOrders = orders.filter(o => o.status === 'active');
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');

  const transportLabel: Record<string, string> = {
    truck_20t: 'Фура 20т',
    gazelle: 'Газель',
    refrigerator: 'Рефрижератор',
    car: 'Легковая',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <motion.header
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-14 flex items-center justify-between px-6 z-50 flex-shrink-0 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-light">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
              <span className="font-bold text-sm">WILDDELIVERS</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-border" />
          <span className="hidden md:block text-xs text-foreground/40 font-mono">{login}</span>
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-light">
            {role === 'driver' ? 'Исполнитель' : 'Заказчик'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {role === 'customer' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/order')}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-accent text-black"
            >
              + Новый заказ
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-surface-light transition-colors text-foreground/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-surface-light transition-colors text-foreground/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            orders={orders}
            drivers={drivers}
            onSelectOrder={setSelectedOrder}
          />

          {/* Stats overlay */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-4 flex gap-2 z-[1000]"
            >
              <div className="bg-[#0a0a12]/80 backdrop-blur-xl rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-foreground/60">{activeOrders.length} активных заказов</span>
            </div>
            <div className="bg-[#0a0a12]/80 backdrop-blur-xl rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-foreground/60">{drivers.length} исполнителей</span>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full overflow-hidden flex-shrink-0 z-40 bg-[#0a0a12]/95 backdrop-blur-xl border-l border-white/5"
            >
              <div className="w-[380px] h-full overflow-y-auto p-5">
                <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4">
                  {role === 'driver' ? 'Доступные заказы' : 'Мои заказы'}
                </h2>

                {activeOrders.length === 0 && inProgressOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4 opacity-50">📭</div>
                    <p className="text-foreground/30 text-sm">Пока нет заказов</p>
                  </div>
                ) : (
                    <div className="space-y-3">
                      {[...activeOrders, ...inProgressOrders].map((order, i) => (
                        <motion.div
                          key={order.id}
                          initial={{ x: 30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className={`bg-white/[0.04] rounded-2xl p-4 transition-all border border-white/[0.06] hover:border-white/10 ${
                            selectedOrder?.id === order.id ? 'border-primary/40' : ''
                          }`}
                        >
                          {/* Route / Маршрут */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                order.status === 'active' ? 'bg-success' : 'bg-accent'
                              }`} />
                              <span className="font-medium text-sm">
                                {order.city || 'Город не указан'}
                              </span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              order.status === 'active' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                            }`}>
                              {order.status === 'active' ? 'Ожидает' : 'В пути'}
                            </span>
                          </div>
                          {order.address && (
                            <p className="text-xs text-foreground/40 ml-[18px] mb-1">
                              <span className="text-foreground/20">→</span> {order.address}
                            </p>
                          )}
                          <span className="text-[10px] text-foreground/25 font-mono ml-[18px]">
                            {order.order_type === 'private' ? 'Частный' : 'Компания'}
                            {order.company_name ? ` · ${order.company_name}` : ''}
                          </span>

                          {/* Divider / Разделитель */}
                          <div className="my-3 border-t border-border/50" />

                          {/* Contents / Что внутри */}
                          <div className="flex items-start gap-2 mb-3">
                            <span className="text-foreground/20 text-xs mt-0.5">📦</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-foreground/30 mb-0.5">Груз</div>
                                <div className="text-sm font-medium truncate">{order.cargo_name || '—'}</div>
                                {(order.cargo_width || order.cargo_length || order.cargo_height || order.cargo_weight) && (
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-foreground/40 mt-1 font-mono uppercase bg-white/5 p-1.5 rounded-lg border border-white/5">
                                    {order.cargo_width && <span>Ш:{order.cargo_width}см</span>}
                                    {order.cargo_length && <span>Д:{order.cargo_length}см</span>}
                                    {order.cargo_height && <span>В:{order.cargo_height}см</span>}
                                    {order.cargo_weight && <span className="text-accent/60 font-bold">Вес:{order.cargo_weight}кг</span>}
                                    {order.cargo_width && order.cargo_length && order.cargo_height && (
                                      <span className="ml-auto text-primary-light">
                                        {((order.cargo_width * order.cargo_length * order.cargo_height) / 1000000).toFixed(2)}м³
                                      </span>
                                    )}
                                  </div>
                                )}
                                {order.comment && (
                                  <p className="text-xs text-foreground/30 mt-1 line-clamp-2">{order.comment}</p>
                                )}
                            </div>
                          </div>

                            {/* Two buttons / Две кнопки */}
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push(`/dashboard/order/${order.id}`)}
                                className="flex-1 py-2 rounded-xl text-xs font-medium bg-surface-light border border-border hover:border-foreground/20 transition-colors text-foreground/60"
                              >
                                📍 На карте
                              </motion.button>
                            {role === 'driver' && order.status === 'active' ? (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRespond(order.id);
                                }}
                                className="flex-1 py-2 rounded-xl text-xs font-medium bg-primary text-white"
                              >
                                Откликнуться
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  if (order.sender_phone) {
                                    window.open(`tel:${order.sender_phone}`);
                                  } else {
                                    setSelectedOrder(order);
                                  }
                                }}
                                className="flex-1 py-2 rounded-xl text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:border-accent/40 transition-colors"
                              >
                                Связаться
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                )}

                {/* Drivers section */}
                {drivers.length > 0 && (
                  <>
                    <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mt-8 mb-4">
                      Исполнители на линии
                    </h2>
                    <div className="space-y-2">
                  {drivers.map((driver, i) => {
                          const hasOrder = inProgressOrders.some(o => o.driver_id === driver.id);
                          return (
                          <motion.div
                            key={driver.id}
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                              className={`bg-white/[0.04] rounded-xl p-3 flex items-center gap-3 border ${hasOrder ? 'border-accent/30' : 'border-white/[0.06]'}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${hasOrder ? 'bg-accent/20' : 'bg-primary/15'}`}>
                              {hasOrder ? '📦' : '🚛'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{driver.name}</div>
                              {driver.vehicle_plate && (
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold mt-1 tracking-wider ${
                                  hasOrder
                                    ? 'bg-accent/20 text-accent border border-accent/30 animate-pulse'
                                    : 'bg-primary/10 text-primary-light border border-primary/20'
                                }`}>
                                  {driver.vehicle_plate.toUpperCase()}
                                </div>
                              )}
                              <div className="text-[10px] text-foreground/40 mt-0.5">
                                {driver.vehicle_brand && driver.vehicle_model
                                  ? `${driver.vehicle_brand} ${driver.vehicle_model} · `
                                  : ''
                                }
                                {transportLabel[driver.transport_type] || driver.transport_type} · {driver.city}
                                {(driver.vehicle_length_m || driver.vehicle_width_m || driver.vehicle_height_m || driver.vehicle_capacity_kg) && (
                                  <div className="flex flex-wrap gap-x-2 text-[9px] text-foreground/30 mt-1 font-mono uppercase">
                                    {driver.vehicle_length_m && <span>Д:{driver.vehicle_length_m}м</span>}
                                    {driver.vehicle_width_m && <span>Ш:{driver.vehicle_width_m}м</span>}
                                    {driver.vehicle_height_m && <span>В:{driver.vehicle_height_m}м</span>}
                                    {driver.vehicle_capacity_kg && <span>Вес:{driver.vehicle_capacity_kg}кг</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <span className={`w-2.5 h-2.5 rounded-full ${hasOrder ? 'bg-accent animate-pulse' : 'bg-success'}`} />
                              <span className="text-[9px] text-foreground/30">{hasOrder ? 'На заказе' : 'Свободен'}</span>
                            </div>
                          </motion.div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
                className="bg-[#0f0f16] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Детали заказа</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-foreground/40 hover:text-foreground">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

                <div className="space-y-3">
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Груз</div>
                      <div className="text-sm font-medium">{selectedOrder.cargo_name || '—'}</div>
                      {(selectedOrder.cargo_width || selectedOrder.cargo_length || selectedOrder.cargo_height || selectedOrder.cargo_weight) && (
                        <div className="flex flex-wrap gap-x-3 text-xs text-foreground/50 mt-2 font-mono uppercase bg-black/20 p-2 rounded-lg">
                          {selectedOrder.cargo_width && <span>Ш: {selectedOrder.cargo_width}см</span>}
                          {selectedOrder.cargo_length && <span>Д: {selectedOrder.cargo_length}см</span>}
                          {selectedOrder.cargo_height && <span>В: {selectedOrder.cargo_height}см</span>}
                          {selectedOrder.cargo_weight && <span className="text-accent font-bold">Вес: {selectedOrder.cargo_weight}кг</span>}
                          {selectedOrder.cargo_width && selectedOrder.cargo_length && selectedOrder.cargo_height && (
                            <div className="w-full mt-1 pt-1 border-t border-white/5 text-primary-light flex justify-between">
                              <span>Объем:</span>
                              <span>{((selectedOrder.cargo_width * selectedOrder.cargo_length * selectedOrder.cargo_height) / 1000000).toFixed(3)} м³</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  {selectedOrder.city && (
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Город</div>
                      <div className="text-sm font-medium">{selectedOrder.city}</div>
                    </div>
                  )}
                  {selectedOrder.address && (
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Адрес</div>
                      <div className="text-sm font-medium">{selectedOrder.address}</div>
                    </div>
                  )}
                  {selectedOrder.company_name && (
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Компания</div>
                      <div className="text-sm font-medium">{selectedOrder.company_name}</div>
                    </div>
                  )}
                  {selectedOrder.sender_phone && (
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Телефон</div>
                      <div className="text-sm font-medium">{selectedOrder.sender_phone}</div>
                    </div>
                  )}
                  {selectedOrder.comment && (
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                      <div className="text-[10px] text-foreground/30 mb-1">Комментарий</div>
                      <div className="text-sm">{selectedOrder.comment}</div>
                    </div>
                  )}
                <div className="flex items-center gap-2 pt-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedOrder.status === 'active' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                  }`}>
                    {selectedOrder.status === 'active' ? 'Ожидает исполнителя' : 'В процессе доставки'}
                  </span>
                </div>
              </div>

              {role === 'driver' && selectedOrder.status === 'active' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRespond(selectedOrder.id)}
                  className="w-full mt-6 py-4 rounded-2xl font-semibold text-white bg-primary glow"
                >
                  Взять заказ
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
