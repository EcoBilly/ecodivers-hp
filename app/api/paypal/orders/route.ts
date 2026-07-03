import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal';

const base = 'https://api-m.sandbox.paypal.com';

export async function POST(req: Request) {
  try {
    const { activity, quantity } = await req.json();
    
    // Price logic
    let PRICE_PER_PERSON = 100.00; // Default
    if (activity === '호핑투어') PRICE_PER_PERSON = 55.00;
    if (activity === '해녀체험') PRICE_PER_PERSON = 45.00;
    if (activity === '비치 스쿠버다이빙') PRICE_PER_PERSON = 55.00;
    if (activity === '보트 스쿠버다이빙') PRICE_PER_PERSON = 65.00;
    
    const total = (PRICE_PER_PERSON * quantity).toFixed(2);

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total
                }
              }
            },
            items: [
              {
                name: activity,
                quantity: quantity.toString(),
                unit_amount: {
                  currency_code: 'USD',
                  value: PRICE_PER_PERSON.toFixed(2)
                }
              }
            ]
          },
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
