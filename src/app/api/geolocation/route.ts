import { NextResponse } from "next/server";

export async function GET() {
  const services = [
    async () => {
      const r = await fetch("http://ip-api.com/json/?fields=lat,lon,city", { signal: AbortSignal.timeout(5000) });
      const d = await r.json();
      return { lat: d.lat, lon: d.lon, city: d.city };
    },
    async () => {
      const r = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(5000) });
      const d = await r.json();
      return { lat: d.latitude, lon: d.longitude, city: d.city };
    },
  ];

  for (const svc of services) {
    try {
      const result = await svc();
      if (result.lat && result.lon) return NextResponse.json(result);
    } catch {}
  }

  return NextResponse.json({ lat: 55.7558, lon: 37.6173, city: "Москва" });
}
