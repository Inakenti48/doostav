'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import type L from 'leaflet';

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
  driver: { name: string; phone: string; transport_type: string } | null;
  vehicle_type: string | null;
  loading_time_min: number | null;
  downtime_rate_per_min: number | null;
  cargo_width: number | null;
  cargo_length: number | null;
  cargo_height: number | null;
  cargo_weight: number | null;
}

interface RouteOption {
  coords: [number, number][];
  distance: number;
  duration: number;
  label: string;
}

const SPEEDS = [80, 100, 120, 140];

function formatDist(m: number) {
  const km = m / 1000;
  return km >= 1 ? `${km.toFixed(1)} км` : `${Math.round(m)} м`;
}

function formatDur(seconds: number) {
  const min = Math.ceil(seconds / 60);
  const h = Math.floor(min / 60);
  const mm = min % 60;
  return h > 0 ? `${h}ч ${mm}мин` : `${mm} мин`;
}

function timeAtSpeed(distMeters: number, speedKmh: number) {
  const hours = (distMeters / 1000) / speedKmh;
  const totalMin = Math.ceil(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}ч ${m}мин` : `${m} мин`;
}

export default function OrderMap() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'gps' | 'ip' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [showMapChooser, setShowMapChooser] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const LeafletRef = useRef<typeof L | null>(null);
  const routeLayersRef = useRef<L.LayerGroup[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const userPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const getLocation = useCallback(async (): Promise<{ lat: number; lng: number; method: 'gps' | 'ip' }> => {
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude, method: 'gps' };
      } catch {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 });
          });
          return { lat: pos.coords.latitude, lng: pos.coords.longitude, method: 'gps' };
        } catch { /* fall through */ }
      }
    }
    try {
      const res = await fetch('/api/geolocation');
      const data = await res.json();
      if (data.lat && data.lon) return { lat: data.lat, lng: data.lon, method: 'ip' };
    } catch { /* ignore */ }
    return { lat: 55.7558, lng: 37.6173, method: 'ip' };
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const clearRoutes = useCallback(() => {
    routeLayersRef.current.forEach(layer => { if (mapRef.current) mapRef.current.removeLayer(layer); });
    routeLayersRef.current = [];
  }, []);

  const drawRoutes = useCallback((routeOptions: RouteOption[], selectedIdx: number) => {
    const map = mapRef.current;
    const LL = LeafletRef.current;
    if (!map || !LL) return;
    clearRoutes();

    routeOptions.forEach((route, i) => {
      if (i === selectedIdx) return;
      const line = LL.polyline(route.coords, { color: '#9ca3af', weight: 5, opacity: 0.4, dashArray: '8 6' });
      const group = LL.layerGroup([line]).addTo(map);
      line.on('click', () => { setActiveRouteIdx(i); drawRoutes(routeOptions, i); });
      routeLayersRef.current.push(group);
    });

    if (routeOptions[selectedIdx]) {
      const route = routeOptions[selectedIdx];
      const glow = LL.polyline(route.coords, { color: '#22c55e', weight: 12, opacity: 0.15 });
      const mid = LL.polyline(route.coords, { color: '#22c55e', weight: 7, opacity: 0.3 });
      const main = LL.polyline(route.coords, { color: '#22c55e', weight: 5, opacity: 0.95 });
      const group = LL.layerGroup([glow, mid, main]).addTo(map);
      routeLayersRef.current.push(group);
    }
  }, [clearRoutes]);

  const buildRoute = useCallback(async () => {
    const map = mapRef.current;
    const LL = LeafletRef.current;
    if (!order || !map || !LL) return;
    setRouteLoading(true);
    setError(null);

    try {
      const loc = await getLocation();
      setLocationMethod(loc.method);
      userPosRef.current = { lat: loc.lat, lng: loc.lng };

      const destLat = order.lat || 55.75;
      const destLng = order.lng || 37.62;

      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const color = loc.method === 'gps' ? '#3b82f6' : '#f59e0b';
      userMarkerRef.current = LL.marker([loc.lat, loc.lng], {
        icon: LL.divIcon({
          className: '',
          html: `<div style="width:40px;height:40px;position:relative;display:flex;align-items:center;justify-content:center">
            <div style="position:absolute;inset:0;border-radius:50%;background:${color}30;animation:upulse 2s infinite"></div>
            <div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 10px ${color}80"></div>
          </div>`,
          iconSize: [40, 40], iconAnchor: [20, 20],
        }),
        zIndexOffset: 1000,
      }).addTo(map);

      const url = `https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=3`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const routeOptions: RouteOption[] = data.routes.map((r: { geometry: { coordinates: number[][] }; distance: number; duration: number }, idx: number) => ({
          coords: r.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]),
          distance: r.distance, duration: r.duration,
          label: idx === 0 ? 'Быстрый' : idx === 1 ? 'Альтернативный' : `Маршрут ${idx + 1}`,
        }));
        setRoutes(routeOptions);
        setActiveRouteIdx(0);
        drawRoutes(routeOptions, 0);
        const bounds = LL.latLngBounds([[loc.lat, loc.lng], [destLat, destLng], ...routeOptions[0].coords]);
        map.fitBounds(bounds, { padding: [60, 60] });
      } else {
        const line = LL.polyline([[loc.lat, loc.lng], [destLat, destLng]], { color: '#22c55e', weight: 4, dashArray: '10 8' }).addTo(map);
        routeLayersRef.current.push(LL.layerGroup([line]));
        const dist = map.distance([loc.lat, loc.lng], [destLat, destLng]);
        setRoutes([{ coords: [[loc.lat, loc.lng], [destLat, destLng]], distance: dist, duration: dist / 16.67, label: 'Прямой' }]);
        map.fitBounds([[loc.lat, loc.lng], [destLat, destLng]], { padding: [60, 60] });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка построения маршрута');
    }
    setRouteLoading(false);
  }, [order, getLocation, drawRoutes]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || tracking) return;
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        userPosRef.current = { lat: latitude, lng: longitude };
        if (userMarkerRef.current) userMarkerRef.current.setLatLng([latitude, longitude]);
        if (routes.length > 0 && mapRef.current) {
          const activeRoute = routes[activeRouteIdx];
          if (activeRoute) {
            let minDist = Infinity;
            for (let i = 0; i < activeRoute.coords.length; i += 5) {
              const d = mapRef.current.distance([latitude, longitude], activeRoute.coords[i]);
              if (d < minDist) minDist = d;
            }
            if (minDist > 200) buildRoute();
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [tracking, routes, activeRouteIdx, buildRoute]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setTracking(false);
  }, []);

  useEffect(() => {
    if (routes.length > 0) drawRoutes(routes, activeRouteIdx);
  }, [activeRouteIdx, routes, drawRoutes]);

  // Init map with dynamic leaflet import
  useEffect(() => {
    if (!order || !mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    import('leaflet').then((LL) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      LeafletRef.current = LL.default || LL;
      const Leaf = LeafletRef.current;

      // Animations
      if (!document.getElementById('lf-anim')) {
        const s = document.createElement('style');
        s.id = 'lf-anim';
        s.textContent = `@keyframes upulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(2);opacity:0}}`;
        document.head.appendChild(s);
      }

      const lat = order.lat || 55.75;
      const lng = order.lng || 37.62;

      const map = Leaf.map(mapContainerRef.current!, { center: [lat, lng], zoom: 14, zoomControl: false, attributionControl: false });
      Leaf.control.zoom({ position: 'topright' }).addTo(map);
      Leaf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      destMarkerRef.current = Leaf.marker([lat, lng], {
        icon: Leaf.divIcon({
          className: '',
          html: `<div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#22c55e,#16a34a);border:3px solid #fff;box-shadow:0 2px 15px #22c55e80;display:flex;align-items:center;justify-content:center">
              <span style="transform:rotate(45deg);font-size:16px">📦</span>
            </div>
            <div style="width:2px;height:8px;background:#22c55e;margin-top:-2px"></div>
          </div>`,
          iconSize: [40, 50], iconAnchor: [20, 50],
        }),
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);
      setTimeout(() => map.invalidateSize(), 1000);
    });

    return () => {
      cancelled = true;
      stopTracking();
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Auto build route when map ready
  useEffect(() => {
    if (mapReady && order && routes.length === 0) {
      buildRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  useEffect(() => () => stopTracking(), [stopTracking]);

  const openInMaps = (app: 'yandex' | 'google' | '2gis' | 'apple') => {
    if (!order) return;
    const destLat = order.lat || 55.75;
    const destLng = order.lng || 37.62;
    const fromLat = userPosRef.current?.lat || '';
    const fromLng = userPosRef.current?.lng || '';
    let url = '';
    switch (app) {
      case 'yandex':
        url = fromLat ? `https://yandex.ru/maps/?rtext=${fromLat},${fromLng}~${destLat},${destLng}&rtt=auto` : `https://yandex.ru/maps/?pt=${destLng},${destLat}&z=15`;
        break;
      case 'google':
        url = fromLat ? `https://www.google.com/maps/dir/${fromLat},${fromLng}/${destLat},${destLng}` : `https://www.google.com/maps?q=${destLat},${destLng}`;
        break;
      case '2gis':
        url = fromLat ? `https://2gis.ru/routeSearch/rsType/car/from/${fromLng},${fromLat}/to/${destLng},${destLat}` : `https://2gis.ru/search/${destLat},${destLng}`;
        break;
      case 'apple':
        url = fromLat ? `https://maps.apple.com/?saddr=${fromLat},${fromLng}&daddr=${destLat},${destLng}&dirflg=d` : `https://maps.apple.com/?q=${destLat},${destLng}`;
        break;
    }
    window.open(url, '_blank');
    setShowMapChooser(false);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!order) {
    return <div className="h-screen flex flex-col items-center justify-center bg-white gap-4"><p className="text-gray-400 text-sm">Заказ не найден</p><button onClick={() => router.back()} className="text-green-600 text-sm underline">Назад</button></div>;
  }

  const activeRoute = routes[activeRouteIdx];

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => { stopTracking(); router.push('/dashboard'); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <div className="font-bold text-xs text-gray-900">{order.cargo_name || 'Заказ'}</div>
            <div className="text-[10px] text-gray-400">{order.city}{order.address ? `, ${order.address}` : ''}</div>
          </div>
        </div>
        {tracking && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-green-700 font-medium">GPS</span>
          </div>
        )}
      </header>

      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

        {activeRoute && mapReady && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-3 left-3 right-3 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-bold text-gray-900">{formatDist(activeRoute.distance)}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-600">{formatDur(activeRoute.duration)}</span>
                </div>
                {locationMethod === 'ip' && <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">~IP</span>}
              </div>
              <div className="flex gap-1 mb-2">
                {SPEEDS.map(s => (
                  <div key={s} className="flex-1 bg-gray-50 rounded-lg py-1 px-1 text-center">
                    <div className="text-[9px] text-gray-400">{s} км/ч</div>
                    <div className="text-[10px] font-semibold text-gray-700">{timeAtSpeed(activeRoute.distance, s)}</div>
                  </div>
                ))}
              </div>
              {routes.length > 1 && (
                <div className="flex gap-1.5">
                  {routes.map((r, i) => (
                    <button key={i} onClick={() => setActiveRouteIdx(i)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${i === activeRouteIdx ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {r.label}
                      <div className={`text-[8px] ${i === activeRouteIdx ? 'text-green-100' : 'text-gray-400'}`}>{formatDist(r.distance)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {routeLoading && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-5 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Строим маршрут...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-3 left-3 right-3 z-[1000]">
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-600 text-xs text-center">{error}</div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-3">
            <div className="flex gap-2">
              <button onClick={buildRoute} disabled={routeLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-green-500 text-white disabled:opacity-50 hover:bg-green-600 transition-colors">
                {routes.length > 0 ? 'Перестроить' : 'Построить маршрут'}
              </button>
              <button onClick={() => setShowMapChooser(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                Открыть в картах
              </button>
              <button onClick={tracking ? stopTracking : startTracking}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium ${tracking ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {tracking ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4m10-10h-4M6 12H2" /></>}
                </svg>
              </button>
            </div>
              {order.sender_phone && (
                <a href={`tel:${order.sender_phone}`} className="block mt-2 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 text-center hover:bg-gray-200">
                  Позвонить {order.sender_phone}
                </a>
              )}
              {order.loading_time_min && (
                <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
                  <span className="text-base mt-0.5">⏱</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-amber-800 mb-0.5">
                      Норма погрузки/выгрузки: {order.loading_time_min >= 60 ? `${order.loading_time_min / 60} ч` : `${order.loading_time_min} мин`}
                    </div>
                    <div className="text-[10px] text-amber-700">
                      Сверх нормы — простой: <b>{order.downtime_rate_per_min} ₽/мин</b>
                      {order.vehicle_type && (
                        <span className="ml-1 opacity-60">
                          ({order.vehicle_type === 'truck' ? '🚛 Фура' : order.vehicle_type === 'gazelle' ? '🚐 Газель' : order.vehicle_type === 'pickup' ? '🛻 Пикап' : '🚗 Легковой'})
                        </span>
                      )}
                    </div>
                    {(order.cargo_width || order.cargo_length || order.cargo_height || order.cargo_weight) && (
                      <div className="text-[10px] text-amber-600 mt-1 flex flex-wrap gap-2">
                        {order.cargo_width && <span>Ш: {order.cargo_width} см</span>}
                        {order.cargo_length && <span>Д: {order.cargo_length} см</span>}
                        {order.cargo_height && <span>В: {order.cargo_height} см</span>}
                        {order.cargo_weight && <span>Вес: {order.cargo_weight} кг</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMapChooser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 flex items-end justify-center" onClick={() => setShowMapChooser(false)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-4">Открыть маршрут в:</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'yandex' as const, name: 'Яндекс Карты', icon: '🗺', bg: 'bg-red-50' },
                  { key: 'google' as const, name: 'Google Maps', icon: '📍', bg: 'bg-blue-50' },
                  { key: '2gis' as const, name: '2ГИС', icon: '🏙', bg: 'bg-green-50' },
                  { key: 'apple' as const, name: 'Apple Maps', icon: '🍎', bg: 'bg-gray-50' },
                ].map(app => (
                  <button key={app.key} onClick={() => openInMaps(app.key)}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${app.bg} flex items-center justify-center text-lg`}>{app.icon}</div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">{app.name}</div>
                      <div className="text-[10px] text-gray-400">С маршрутом</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMapChooser(false)} className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200">Отмена</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
