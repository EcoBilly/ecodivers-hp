import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal';

const base = 'https://api-m.sandbox.paypal.com';

export async function POST(req: Request) {
  try {
    const { email, activity, quantity } = await req.json();

    if (!email || !activity || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let PRICE_PER_PERSON = 100.00; // Default
    if (activity === '호핑투어') PRICE_PER_PERSON = 55.00;
    if (activity === '해녀체험') PRICE_PER_PERSON = 45.00;
    if (activity === '비치 스쿠버다이빙') PRICE_PER_PERSON = 55.00;
    if (activity === '보트 스쿠버다이빙') PRICE_PER_PERSON = 65.00;
    
    const accessToken = await getPayPalAccessToken();

    // 1. Get next invoice number
    const nextInvoiceNumberRes = await fetch(`${base}/v2/invoicing/generate-next-invoice-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!nextInvoiceNumberRes.ok) {
        const errorText = await nextInvoiceNumberRes.text();
        console.error('Failed to generate invoice number:', errorText);
        throw new Error('Failed to generate invoice number');
    }
    const { invoice_number } = await nextInvoiceNumberRes.json();

    // 2. Create Draft Invoice
    const createInvoiceRes = await fetch(`${base}/v2/invoicing/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        detail: {
          invoice_number,
          invoice_date: new Date().toISOString().split('T')[0],
          currency_code: 'USD',
          note: 'Thank you for booking with Eco Divers!',
        },
        invoicer: {
          name: {
            given_name: 'Eco',
            surname: 'Divers',
          },
        },
        primary_recipients: [
          {
            billing_info: {
              email_address: email,
            },
          },
        ],
        items: [
          {
            name: activity,
            description: `Booking for ${activity}`,
            quantity: quantity.toString(),
            unit_amount: {
              currency_code: 'USD',
              value: PRICE_PER_PERSON.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!createInvoiceRes.ok) {
        const errorText = await createInvoiceRes.text();
        console.error('Failed to create draft invoice:', errorText);
        throw new Error('Failed to create draft invoice');
    }

    const invoiceData = await createInvoiceRes.json();
    const invoiceId = invoiceData.id; // The href usually contains the ID, wait, id is returned in response.

    if (!invoiceId) {
        // sometimes id is returned in href
        const selfLink = invoiceData.links?.find((l: any) => l.rel === 'self');
        if (selfLink) {
            // ... parsing logic, but usually `id` is present or we can find it.
            // Let's assume id is returned at root or inside href
        }
    }

    const targetInvoiceId = invoiceData.id || invoiceData.href?.split('/').pop();

    // 3. Send Invoice
    const sendInvoiceRes = await fetch(`${base}/v2/invoicing/invoices/${targetInvoiceId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subject: 'Invoice for Eco Divers Booking',
        note: 'Please pay this invoice to confirm your booking.',
        send_to_invoicer: false,
      }),
    });

    if (!sendInvoiceRes.ok) {
       const errorText = await sendInvoiceRes.text();
       console.error('Failed to send invoice:', errorText);
       throw new Error('Failed to send invoice');
    }

    return NextResponse.json({ success: true, invoiceId: targetInvoiceId });
  } catch (error) {
    console.error('Invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
