import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
        const { rows } = await pool.query(
          `INSERT INTO orders (user_id, order_type, cargo_name, weight, pickup_address, pickup_city, delivery_address, delivery_city, comment, sender_phone, company_name, cargo_width, cargo_length, cargo_height, cargo_weight, vehicle_type, loading_time_min, downtime_rate_per_min, city, address, lat, lng)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           RETURNING *`,
          [
            body.user_id, body.order_type, body.cargo_name, body.weight,
            body.pickup_address || body.address, body.pickup_city || body.city,
            body.delivery_address, body.delivery_city,
            body.comment, body.sender_phone, body.company_name,
            body.cargo_width || null, body.cargo_length || null,
            body.cargo_height || null, body.cargo_weight || null,
            body.vehicle_type || null, body.loading_time_min || null,
            body.downtime_rate_per_min || null,
            body.city || null, body.address || null,
            body.lat || null, body.lng || null,
          ]
        );
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error('Order create error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, row_to_json(d.*) as driver
       FROM orders o
       LEFT JOIN drivers d ON o.driver_id = d.id
       ORDER BY o.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (e) {
    console.error('Orders fetch error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, driverId, status } = await req.json();
    const sets: string[] = [];
    const vals: string[] = [];
    let i = 1;

    if (driverId) { sets.push(`driver_id = $${i++}`); vals.push(driverId); }
    if (status) { sets.push(`status = $${i++}`); vals.push(status); }
    vals.push(orderId);

    const { rows } = await pool.query(
      `UPDATE orders SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error('Order update error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
