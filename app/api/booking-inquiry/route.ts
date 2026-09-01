import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/firebaseAdmin";

// 서버 전용 토큰 우선, 없으면 NEXT_PUBLIC 값으로 폴백 (동일 봇)
const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOOKING_BOT_TOKEN ||
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

// 간단한 IP 스로틀 (서버리스 인스턴스 단위 — 완벽하지 않지만 최소 방어)
const lastHit = new Map<string, number>();
const THROTTLE_MS = 8000;

function clip(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 국내 번호 → tel: URI 용 정규화 (010-1234-5678 → +821012345678)
function toTelUri(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("82")) return `+${digits}`;
  if (digits.startsWith("0")) return `+82${digits.slice(1)}`;
  return `+${digits}`;
}

// 모바일 텔레그램이 자동 인식하기 쉬운 표기 (+82 10-1234-5678)
function prettyPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (/^01\d{8,9}$/.test(d)) {
    const rest = d.slice(1);
    const mid = rest.length === 10 ? rest.slice(1, 5) : rest.slice(1, 4);
    const last = rest.slice(mid.length + 1);
    return `+82 ${rest[0]}-${mid}-${last}`;
  }
  return raw;
}

interface SendResult {
  chatId: string;
  ok: boolean;
}

async function sendTo(
  token: string,
  chatId: string,
  html: string,
  plain: string
): Promise<SendResult> {
  const url = `https://${["api", "telegram", "org"].join(".")}/bot${token}/sendMessage`;
  // 1) HTML(전화 링크 포함) 시도 → 2) 실패 시 일반 텍스트로 재시도
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (r.ok) return { chatId, ok: true };
  } catch {
    /* fall through */
  }
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: plain }),
    });
    return { chatId, ok: r.ok };
  } catch {
    return { chatId, ok: false };
  }
}

async function resolveChatIds(): Promise<string[]> {
  const fromEnv =
    process.env.TELEGRAM_BOOKING_CHAT_IDS || process.env.TELEGRAM_ADMIN_CHAT_IDS;
  if (fromEnv) {
    return fromEnv.split(",").map((s) => s.trim()).filter(Boolean);
  }
  // 운영 환경: 스케줄 알림과 동일하게 Firestore에 등록된 chatId 사용
  const db = getDbAdmin();
  if (db) {
    try {
      const snap = await db.collection("settings").doc("telegram").get();
      if (snap.exists) {
        const ids = snap.data()?.chatIds;
        if (Array.isArray(ids)) return ids.map((x: unknown) => String(x));
      }
    } catch (e) {
      console.error("[booking-inquiry] Firestore chatId lookup failed:", e);
    }
  }
  return [];
}

export async function POST(req: Request) {
  try {
    // 동일 출처 요청만 허용 (origin 헤더가 있는 경우)
    const origin = req.headers.get("origin");
    if (origin) {
      const host = req.headers.get("host");
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const now = Date.now();
    if (now - (lastHit.get(ip) ?? 0) < THROTTLE_MS) {
      return NextResponse.json(
        { error: "잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // 봇 차단용 허니팟
    if (clip(body.company, 50)) {
      return NextResponse.json({ ok: true });
    }

    const product = clip(body.product, 80);
    const date = clip(body.date, 20);
    const people = clip(body.people, 40);
    const name = clip(body.name, 40);
    const phone = clip(body.phone, 30);
    const category = clip(body.category, 30);

    if (!name || !phone) {
      return NextResponse.json(
        { error: "예약자명과 연락처를 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!TELEGRAM_TOKEN) {
      console.error("[booking-inquiry] TELEGRAM token not configured");
      return NextResponse.json(
        { error: "notify_unconfigured" },
        { status: 503 }
      );
    }

    const chatIds = await resolveChatIds();
    if (chatIds.length === 0) {
      console.error("[booking-inquiry] No chat IDs resolved");
      return NextResponse.json({ error: "notify_unconfigured" }, { status: 503 });
    }

    lastHit.set(ip, now);

    const tel = toTelUri(phone);
    const phoneDisplay = prettyPhone(phone);

    // HTML: 연락처를 탭하면 바로 전화 연결
    const htmlLines = [
      "🐚 <b>[홈페이지 예약 문의]</b>",
      category ? `· 구분: ${escHtml(category)}` : "",
      `· 프로그램: ${escHtml(product || "-")}`,
      `· 희망 날짜: ${escHtml(date || "미정")}`,
      `· 인원: ${escHtml(people || "-")}`,
      `· 예약자: ${escHtml(name)}`,
      tel
        ? `· 연락처: <a href="tel:${tel}">${escHtml(phoneDisplay)}</a>`
        : `· 연락처: ${escHtml(phone)}`,
      "",
      "확인 후 고객에게 연락 바랍니다.",
    ].filter(Boolean);
    const htmlMsg = htmlLines.join("\n");

    // 일반 텍스트 폴백 (+82 표기 → 모바일 텔레그램에서 자동 통화 링크)
    const plainMsg = [
      "🐚 [홈페이지 예약 문의]",
      category ? `· 구분: ${category}` : "",
      `· 프로그램: ${product || "-"}`,
      `· 희망 날짜: ${date || "미정"}`,
      `· 인원: ${people || "-"}`,
      `· 예약자: ${name}`,
      `· 연락처: ${phoneDisplay}`,
      "",
      "확인 후 고객에게 연락 바랍니다.",
    ]
      .filter(Boolean)
      .join("\n");

    const results = await Promise.all(
      chatIds.map((chatId) =>
        sendTo(TELEGRAM_TOKEN, chatId, htmlMsg, plainMsg)
      )
    );

    const sent = results.filter((r) => r.ok).length;
    if (sent === 0) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("[booking-inquiry] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
