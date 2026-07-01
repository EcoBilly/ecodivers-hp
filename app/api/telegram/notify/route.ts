import { NextResponse } from 'next/server';
import { getDbAdmin } from '@/lib/firebaseAdmin';

const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const SCHEDULE_URL = 'https://ecodivers-hp.vercel.app/admin/schedule';

function getCategoryIcon(category: string) {
  if (category.includes('다이빙') || category.includes('오픈워터') || category.includes('어드밴스드')) return '🤿';
  if (category.includes('호핑투어')) return '🚢';
  if (category.includes('해녀체험')) return '🧜‍♀️';
  return '📅';
}

export async function POST(req: Request) {
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
        if (data && data.chatIds) {
          chatIds = data.chatIds;
        }
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

    if (!msg) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const promises = chatIds.map(chatId => {
      const payload = {
        chat_id: chatId,
        text: msg,
        reply_markup: {
          keyboard: [
            [{ text: '📅 내일 일정' }, { text: '🗓️ 일정표 바로가기' }]
          ],
          resize_keyboard: true,
          persistent: true
        }
      };

      return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.error(`Error sending to ${chatId}:`, e));
    });

    await Promise.all(promises);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Notify API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
