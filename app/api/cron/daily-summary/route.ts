import { NextResponse } from 'next/server';
import { getDbAdmin } from '@/lib/firebaseAdmin';
import { format } from 'date-fns';

const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const SCHEDULE_URL = 'https://ecodivers-hp.vercel.app/admin/schedule';

function getCategoryIcon(category: string) {
  if (category.includes('다이빙') || category.includes('오픈워터') || category.includes('어드밴스드')) return '🤿';
  if (category.includes('호핑투어')) return '🚢';
  if (category.includes('해녀체험')) return '🧜‍♀️';
  return '📅';
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
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
        if (data && data.chatIds) {
          chatIds = data.chatIds;
        }
      }
    }

    if (chatIds.length === 0) {
      return NextResponse.json({ message: 'No chat IDs registered for cron job.' });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    if (!db) {
      return NextResponse.json({ error: 'DB init failed' }, { status: 500 });
    }

    const snapshot = await db.collection('bookings').where('date', '==', tomorrowStr).get();
    const tomorrowBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    tomorrowBookings.sort((a, b) => a.time.localeCompare(b.time));

    let msg = `[내일 일정] ${tomorrowStr}\n\n`;
    if (tomorrowBookings.length === 0) {
      msg += "예정된 일정이 없습니다.";
    } else {
      let totalPax = 0;
      let checkedInPax = 0;

      tomorrowBookings.forEach(b => {
        const pax = Number(b.pax) || 0;
        totalPax += pax;
        if (b.checkedIn) checkedInPax += pax;

        const icon = getCategoryIcon(b.category);
        const checkIcon = b.checkedIn ? '✅' : '⏳';
        msg += `${icon} [${b.time}] ${b.name}님 (${b.pax}명) - ${b.category} ${checkIcon}\n[상세보기] ${SCHEDULE_URL}\n\n`;
      });
      
      if (totalPax > 0 && checkedInPax === totalPax) {
        msg += `[온라인 체크인 완료 ✅]`;
      } else {
        msg += `[온라인 체크인: ${totalPax}명 중 ${checkedInPax}명 완료]`;
      }
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

    return NextResponse.json({ ok: true, sentTo: chatIds });
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
