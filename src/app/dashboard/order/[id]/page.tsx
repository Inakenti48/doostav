'use client';

import dynamic from 'next/dynamic';

const OrderMap = dynamic(() => import('@/components/OrderMap'), { ssr: false });

export default function OrderDetailPage() {
  return <OrderMap />;
}
