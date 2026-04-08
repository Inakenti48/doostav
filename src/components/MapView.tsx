'use client';

import { useEffect, useRef } from 'react';

interface Order {
  id: string;
  cargo_name: string;
  lat: number;
  lng: number;
  status: string;
  driver_id: string | null;
  cargo_width?: number;
  cargo_length?: number;
  cargo_height?: number;
  cargo_weight?: number;
}

interface Driver {
  id: string;
  name: string;
  transport_type: string;
  lat: number;
  lng: number;
  city?: string;
  vehicle_capacity_kg?: number;
  vehicle_length_m?: number;
  vehicle_width_m?: number;
  vehicle_height_m?: number;
}

interface MapViewProps {
  orders: Order[];
  drivers: Driver[];
  onSelectOrder: (order: Order) => void;
}

export default function MapView({ orders, drivers, onSelectOrder }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

    const style = document.createElement('style');
      style.textContent = `
        @keyframes marker-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.5);opacity:0}}
        .custom-marker{background:none!important;border:none!important}
      `;
      document.head.appendChild(style);

      import('leaflet').then((L) => {
        if (!mapContainerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center: [55.75, 49.13],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!markersRef.current || !LRef.current) return;
    const L = LRef.current;
    markersRef.current.clearLayers();

    orders.forEach((order) => {
      if (!order.lat || !order.lng) return;
      const color = order.status === 'active' ? '#34d399' : '#22d3ee';
      const pc = order.status === 'active' ? '52,211,153' : '34,211,238';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(${pc},.2);animation:marker-pulse 2s ease-in-out infinite"></div>
          <div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid rgba(0,0,0,.5);box-shadow:0 0 20px ${color}80;display:flex;align-items:center;justify-content:center;font-size:12px">📦</div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const marker = L.marker([order.lat, order.lng], { icon }).addTo(markersRef.current!);
        marker.bindTooltip(
          `<div style="background:#0f0f14;border:1px solid rgba(99,102,241,.2);border-radius:12px;padding:8px 12px;color:#f0f0f5;font-size:12px;box-shadow:0 4px 20px rgba(0,0,0,.5)">
            <div style="font-weight:600;margin-bottom:2px">${order.cargo_name || 'Груз'}</div>
            <div style="color:rgba(240,240,245,.4);font-size:10px;margin-bottom:4px">${order.status === 'active' ? 'Ожидает забора' : 'В доставке'}</div>
            ${(order.cargo_width || order.cargo_length || order.cargo_height || order.cargo_weight) ? `
              <div style="border-top:1px solid rgba(255,255,255,.05);padding-top:4px;display:grid;grid-template-cols:1fr 1fr;gap:4px;font-size:9px;opacity:.6">
                ${order.cargo_length ? `<span>Д: ${order.cargo_length}см</span>` : ''}
                ${order.cargo_width ? `<span>Ш: ${order.cargo_width}см</span>` : ''}
                ${order.cargo_height ? `<span>В: ${order.cargo_height}см</span>` : ''}
                ${order.cargo_weight ? `<span style="color:#6366f1">⚖️ ${order.cargo_weight}кг</span>` : ''}
                ${(order.cargo_width && order.cargo_length && order.cargo_height) ? `<span style="grid-column:span 2;color:#34d399">📦 ${((order.cargo_width * order.cargo_length * order.cargo_height) / 1000000).toFixed(2)} м³</span>` : ''}
              </div>
            ` : ''}
          </div>`,
          { className: 'custom-tooltip', direction: 'top', offset: [0, -20] }
        );
        marker.on('click', () => {
          mapRef.current?.setView([order.lat, order.lng], 16, { animate: true, duration: 0.8 });
          onSelectOrder(order);
        });
      });

      drivers.forEach((driver) => {
        if (!driver.lat || !driver.lng) return;
        const assignedOrder = orders.find(o => o.driver_id === driver.id && o.status === 'in_progress');
        const truckImg = assignedOrder ? '/truck-with-trailer.png' : '/truck-no-trailer.png';
        const size = assignedOrder ? 64 : 56;
        const borderColor = assignedOrder ? 'rgba(34,211,238,.5)' : 'rgba(99,102,241,.4)';
        const pulseColor = assignedOrder ? 'rgba(34,211,238,.15)' : 'rgba(99,102,241,.15)';
        const icon = L.divIcon({
          className: 'custom-marker',
            html: `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
              <div style="position:absolute;inset:0;border-radius:50%;background:${pulseColor};animation:marker-pulse 2.5s ease-in-out infinite"></div>
              <img src="${truckImg}" style="width:${size}px;height:${size}px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))" alt="truck"/>
            </div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const marker = L.marker([driver.lat, driver.lng], { icon }).addTo(markersRef.current!);
        const statusText = assignedOrder ? '🟢 На заказе — груз загружен' : '⚪ Свободен — едет к точке';
          marker.bindTooltip(
            `<div style="background:#0f0f14;border:1px solid ${borderColor};border-radius:12px;padding:8px 12px;color:#f0f0f5;font-size:12px;box-shadow:0 4px 20px rgba(0,0,0,.5)">
              <div style="font-weight:600;margin-bottom:2px">${driver.name}</div>
              <div style="color:rgba(240,240,245,.5);font-size:10px">${statusText}</div>
              ${(driver.vehicle_length_m || driver.vehicle_width_m || driver.vehicle_height_m || driver.vehicle_capacity_kg) ? `
                <div style="border-top:1px solid rgba(255,255,255,.05);margin-top:4px;padding-top:4px;display:grid;grid-template-cols:1fr 1fr;gap:4px;font-size:9px;opacity:.6">
                  ${driver.vehicle_length_m ? `<span>Д: ${driver.vehicle_length_m}м</span>` : ''}
                  ${driver.vehicle_width_m ? `<span>Ш: ${driver.vehicle_width_m}м</span>` : ''}
                  ${driver.vehicle_height_m ? `<span>В: ${driver.vehicle_height_m}м</span>` : ''}
                  ${driver.vehicle_capacity_kg ? `<span style="color:#6366f1">⚖️ ${driver.vehicle_capacity_kg}кг</span>` : ''}
                </div>
              ` : ''}
              <div style="color:rgba(240,240,245,.3);font-size:9px;margin-top:2px">${driver.city || ''}</div>
            </div>`,
            { className: 'custom-tooltip', direction: 'top', offset: [0, -size / 2] }
          );
        marker.on('click', () => {
          mapRef.current?.setView([driver.lat, driver.lng], 16, { animate: true, duration: 0.8 });
        });
      });
  }, [orders, drivers, onSelectOrder]);

  return <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
