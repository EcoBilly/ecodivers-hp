import { NextResponse } from 'next/server';
import { getDbAdmin } from '@/lib/firebaseAdmin';

// 서버 전용 변수 (클라이언트에 절대 노출되지 않음)
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

async function sendMessage(chatId: string, text: string, withKeyboard = false) {
  if (!TELEGRAM_TOKEN) return;
  const tgHost = ['api', 'telegram', 'org'].join('.');
  const payload: any = { chat_id: chatId, text };
  if (withKeyboard) payload.reply_markup = KEYBOARD;

  await fetch(`https://${tgHost}/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(e => console.error('[TG] sendMessage error:', e));
}

async function buildScheduleMessage(dateStr: string, label: string): Promise<string> {
  const db = getDbAdmin();
  if (!db) {
    return `[오류] 데이터베이스 연결에 실패했습니다.\n관리자 페이지에서 직접 확인해주세요.\n${SCHEDULE_URL}`;
  }

  const snapshot = await db.collection('bookings').where('date', '==', dateStr).get();
  const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  bookings.sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''));

  let msg = `[${label}] ${dateStr}\n\n`;
  if (bookings.length === 0) {
    msg += '예정된 일정이 없습니다.';
    return msg;
  }

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
  return msg;
}

export async function POST(req: Request) {
  try {
    // 웹훅은 텔레그램 서버에서만 호출됨 — Origin 헤더가 없는 게 정상
    const update = await req.json();
    const message = update.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const text = message.text.trim();
    const chatId = message.chat.id.toString();

    // Chat ID 자동 저장
    const db = getDbAdmin();
    if (db) {
      try {
        const docRef = db.collection('settings').doc('telegram');
        const snap = await docRef.get();
        const chatIds: string[] = snap.exists ? snap.data()?.chatIds || [] : [];
        if (!chatIds.includes(chatId)) {
          chatIds.push(chatId);
          await docRef.set({ chatIds }, { merge: true });
        }
      } catch (e) {
        console.error('[TG] Failed to save chatId:', e);
      }
    }

    if (text === '/start') {
      await sendMessage(chatId, '안녕하세요! 에코다이버스 알림 봇입니다.\n하단 메뉴에서 원하시는 작업을 선택해주세요.', true);
    } else if (text === '🗓️ 일정표 바로가기') {
      await sendMessage(chatId, `[일정표 바로가기]\n아래 링크를 눌러 관리자 페이지로 이동하세요.\n${SCHEDULE_URL}`, true);
    } else if (text === '📅 오늘 일정' || text === '오늘 일정') {
      const msg = await buildScheduleMessage(getDateKST(0), '오늘 일정');
      await sendMessage(chatId, msg, true);
    } else if (text === '📅 내일 일정' || text === '내일 일정') {
      const msg = await buildScheduleMessage(getDateKST(1), '내일 일정');
      await sendMessage(chatId, msg, true);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
