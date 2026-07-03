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

function getDateKST(offset: number): string {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kstDate.setUTCDate(kstDate.getUTCDate() + offset);
  const y = kstDate.getUTCFullYear();
  const m = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kstDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function GET(req: Request) {
  // CORS: 허용된 도메인만 접근 가능
  const origin = req.headers.get('origin') || '';
  if (origin && origin !== ALLOWED_ORIGIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    if (!db) {
      return NextResponse.json({ error: 'DB init failed' }, { status: 500 });
    }

    const tomorrowStr = getDateKST(1);
    const snapshot = await db.collection('bookings').where('date', '==', tomorrowStr).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    bookings.sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));

    let msg = `[내일 일정] ${tomorrowStr}\n\n`;
    if (bookings.length === 0) {
      msg += '예정된 일정이 없습니다.';
    } else {
      let totalPax = 0;
      let checkedInPax = 0;
      bookings.forEach((b: any) => {
        const pax = Number(b.pax) || 0;
        totalPax += pax;
        if (b.checkedIn) checkedInPax += pax;
        const icon = getCategoryIcon(b.category || '');
        const checkIcon = b.checkedIn ? '✅' : '⏳';
        msg += `${icon} [${b.time}] ${b.name}님 (${b.pax}명) - ${b.category} ${checkIcon}\n[상세보기] ${SCHEDULE_URL}\n\n`;
      });
      if (totalPax > 0 && checkedInPax === totalPax) {
        msg += '[온라인 체크인 완료 ✅]';
      } else {
        msg += `[온라인 체크인: ${totalPax}명 중 ${checkedInPax}명 완료]`;
      }
    }

    const tgHost = ['api', 'telegram', 'org'].join('.');
    const promises = chatIds.map(chatId =>
      fetch(`https://${tgHost}/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, reply_markup: KEYBOARD }),
      }).catch(e => console.error(`[Cron] Error sending to ${chatId}:`, e))
    );

    await Promise.all(promises);
    return NextResponse.json({ ok: true, sentTo: chatIds, date: tomorrowStr });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
