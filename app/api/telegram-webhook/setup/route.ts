import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  // Use the host from the request to construct the full URL
  const host = req.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/telegram-webhook`;

  if (!TELEGRAM_TOKEN) {
    return NextResponse.json({ error: 'Token missing' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 });
  }
}
