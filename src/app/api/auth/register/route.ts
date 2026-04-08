import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateLogin, generatePassword } from '@/lib/generate';
import { signToken } from '@/lib/jwt';

export async function POST() {
  try {
    let login = generateLogin();

    // Check uniqueness
    let exists = true;
    while (exists) {
      const { rows } = await pool.query('SELECT id FROM users WHERE login = $1', [login]);
      if (rows.length === 0) {
        exists = false;
      } else {
        login = generateLogin();
      }
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      'INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING id, login',
      [login, passwordHash]
    );

    const user = rows[0];
    const token = await signToken({ userId: user.id, login: user.login });

    return NextResponse.json({
      login,
      password,
      token,
      userId: user.id,
    });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
