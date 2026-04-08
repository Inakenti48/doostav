import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
      const { rows } = await pool.query(
        `INSERT INTO drivers (user_id, name, transport_type, phone, city, lat, lng, vehicle_brand, vehicle_model, vehicle_year, vehicle_plate, vehicle_capacity_kg, vehicle_length_m, vehicle_width_m, vehicle_height_m)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          body.user_id, body.name, body.transport_type, body.phone, body.city,
          body.lat, body.lng,
          body.vehicle_brand || null, body.vehicle_model || null,
          body.vehicle_year || null, body.vehicle_plate || null,
          body.vehicle_capacity_kg || null, body.vehicle_length_m || null,
          body.vehicle_width_m || null, body.vehicle_height_m || null,
        ]
      );
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error('Driver create error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM drivers WHERE is_active = true');
    return NextResponse.json(rows);
  } catch (e) {
    console.error('Drivers fetch error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
