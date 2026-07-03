import { NextResponse } from 'next/server';
import { getDbAdmin } from '@/lib/firebaseAdmin';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SCHEDULE_URL = 'https://ecodivers-hp.vercel.app/admin/schedule';
const ALLOWED_ORIGIN = 'https://ecodivers-hp.vercel.app';

const KEYBOARD = {
  keyboard: [
    [{ text: '📅 오늘 일정' }, { text: '📅 내일 일정' }],
    [{ text: '🗓️ 일정표 바로가기' }],
  ],
  resize_keyboard: true,
  persistent: true,
};

function getCategoryIcon(category: string) {
  if (category.includes('다이빙') || category.includes('오픈워터') || category.includes('어드밴스드')) return '🤿';
  if (category.includes('호핑투어')) return '🚢';
  if (category.includes('해녀체험')) return '🧜‍♀️';
  return '📅';
}

function corsHeaders(origin: string) {
  const isAllowed = !origin || origin === ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': isAllowed ? ALLOWED_ORIGIN : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '';
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '';

  // CORS: 외부 도메인 차단 (브라우저 요청만 해당 — 서버 간 요청은 origin 헤더가 없음)
  if (origin && origin !== ALLOWED_ORIGIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { action, booking, rescheduleData, cancelReason } = await req.json();

    let chatIds: string[] = [];
    const db = getDbAdmin();

    if (process.env.TELEGRAM_ADMIN_CHAT_IDS) {
      chatIds = process.env.TELEGRAM_ADMIN_CHAT_IDS.split(',').map(id => id.trim()).filter(Boolean);
    } else if (db) {
      const settingsDoc = await db.collection('settings').doc('telegram').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        if (data?.chatIds) chatIds = data.chatIds;
      }
    }

    if (chatIds.length === 0) {
      return NextResponse.json({ message: 'No chat IDs registered.' });
    }

    let msg = '';
    if (action === 'create' || action === 'update') {
      const icon = getCategoryIcon(booking.category);
      msg = `[일정 추가/변경]\n${icon} ${booking.date} ${booking.time}\n${booking.name}님 (${booking.pax}명) - ${booking.category}\n[상세보기] ${SCHEDULE_URL}`;
    } else if (action === 'delete') {
      const icon = getCategoryIcon(booking.category);
      msg = `[일정 삭제됨]\n${icon} ${booking.date} ${booking.time}\n${booking.name}님 (${booking.pax}명) - ${booking.category}`;
    } else if (action === 'reschedule') {
      const icon = getCategoryIcon(rescheduleData.category);
      msg = `[일정 변경됨]\n기존: ${booking.date} ${booking.time}\n변경: ${icon} ${rescheduleData.date} ${rescheduleData.time}\n${booking.name}님 (${booking.pax}명) - ${rescheduleData.category}\n[상세보기] ${SCHEDULE_URL}`;
    } else if (action === 'cancel') {
      const icon = getCategoryIcon(booking.category);
      msg = `[일정 취소됨]\n${icon} ${booking.date} ${booking.time}\n${booking.name}님 (${booking.pax}명) - ${booking.category}\n사유: ${cancelReason}\n[상세보기] ${SCHEDULE_URL}`;
    }

    if (!msg) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const tgHost = ['api', 'telegram', 'org'].join('.');
    const promises = chatIds.map(chatId =>
      fetch(`https://${tgHost}/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, reply_markup: KEYBOARD }),
      }).catch(e => console.error(`[Notify] Error sending to ${chatId}:`, e))
    );

    await Promise.all(promises);
    return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('[Notify] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
