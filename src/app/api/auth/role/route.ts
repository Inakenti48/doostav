import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Role error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
