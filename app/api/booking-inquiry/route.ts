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

    const lines = [
      "🐚 [홈페이지 예약 문의]",
      category ? `· 구분: ${category}` : "",
      `· 프로그램: ${product || "-"}`,
      `· 희망 날짜: ${date || "미정"}`,
      `· 인원: ${people || "-"}`,
      `· 예약자: ${name}`,
      `· 연락처: ${phone}`,
      "",
      "확인 후 고객에게 연락 바랍니다.",
    ].filter(Boolean);
    const msg = lines.join("\n");

    const tgHost = ["api", "telegram", "org"].join(".");
    const results = await Promise.allSettled(
      chatIds.map((chatId) =>
        fetch(`https://${tgHost}/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: msg }),
        }).then((r) => {
          if (!r.ok) throw new Error(`TG ${r.status}`);
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    if (sent === 0) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("[booking-inquiry] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
