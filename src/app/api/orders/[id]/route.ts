import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { rows } = await pool.query(
      `SELECT o.*, row_to_json(d.*) as driver
       FROM orders o
       LEFT JOIN drivers d ON o.driver_id = d.id
       WHERE o.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error('Order fetch error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
