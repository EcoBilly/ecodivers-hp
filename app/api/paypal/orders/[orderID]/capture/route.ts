import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal';

const base = 'https://api-m.sandbox.paypal.com';

export async function POST(req: Request, { params }: { params: Promise<{ orderID: string }> }) {
  try {
    const { orderID } = await params;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to capture order:', error);
    return NextResponse.json({ error: 'Failed to capture order' }, { status: 500 });
  }
}
