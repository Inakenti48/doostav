-- WILDDELIVERS / DOOSTAV — init schema for PostgreSQL
-- Run: psql $DATABASE_URL -f init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20), -- 'driver' | 'customer'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  transport_type VARCHAR(50) NOT NULL,
  phone VARCHAR(30),
  city VARCHAR(100),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_type VARCHAR(20) NOT NULL, -- 'private' | 'company'
  cargo_name VARCHAR(200) NOT NULL,
  weight DOUBLE PRECISION,
  pickup_address TEXT NOT NULL,
  pickup_city VARCHAR(100),
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100),
  comment TEXT,
  sender_phone VARCHAR(30),
  company_name VARCHAR(200),
  driver_id UUID REFERENCES drivers(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'in_progress' | 'completed'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
