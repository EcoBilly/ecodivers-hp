import { NextResponse } from "next/server";
import { getDbAdmin, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { SEED_PRODUCTS, type Product, type ProductInput } from "@/lib/products";

export const dynamic = "force-dynamic";

const COLLECTION = "products";

function sanitize(body: any): ProductInput | null {
  if (!body || typeof body !== "object") return null;
  const kind = body.kind === "package" ? "package" : "program";
  const str = (v: unknown, max = 400) => String(v ?? "").slice(0, max);
  const blocks = Array.isArray(body.detailBlocks)
    ? body.detailBlocks
        .filter((b: any) => b && (b.type === "image" || b.type === "text"))
        .slice(0, 60)
        .map((b: any) => ({ type: b.type, value: str(b.value, 5000) }))
    : [];
  const images = Array.isArray(body.images)
    ? body.images.slice(0, 12).map((u: unknown) => str(u, 1000)).filter(Boolean)
    : [];
  return {
    kind,
    category: str(body.category, 40),
    title: str(body.title, 80),
    enTitle: str(body.enTitle, 80),
    summary: str(body.summary, 400),
    priceLabel: str(body.priceLabel, 40),
    mainImage: str(body.mainImage, 1000),
    images,
    detailBlocks: blocks,
    order: Number.isFinite(+body.order) ? +body.order : 0,
    published: !!body.published,
    featured: !!body.featured,
    highlight: !!body.highlight,
  };
}

export async function GET(req: Request) {
  const db = getDbAdmin();
  if (!db) {
    // 로컬 등 Admin SDK 미설정 — 홈화면은 정적 폴백 사용
    return NextResponse.json({ programs: [], packages: [], unconfigured: true });
  }

  const url = new URL(req.url);
  const wantAll = url.searchParams.get("all") === "1";
  let includeUnpublished = false;
  if (wantAll) {
    includeUnpublished = (await verifyAdminRequest(req)) !== null;
  }

  try {
    const snap = await db.collection(COLLECTION).get();
    const all: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    const visible = includeUnpublished ? all : all.filter((p) => p.published);
    visible.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({
      programs: visible.filter((p) => p.kind === "program"),
      packages: visible.filter((p) => p.kind === "package"),
    });
  } catch (e) {
    console.error("[products GET]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const uid = await verifyAdminRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDbAdmin();
  if (!db) return NextResponse.json({ error: "db_unconfigured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();

  // 시드: 컬렉션이 비어있을 때만 기존 카드 8개 생성
  if (body?.action === "seed") {
    const existing = await db.collection(COLLECTION).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "already_seeded" }, { status: 409 });
    }
    const batch = db.batch();
    SEED_PRODUCTS.forEach((p) => {
      const ref = db.collection(COLLECTION).doc();
      batch.set(ref, { ...p, createdAt: now, updatedAt: now });
    });
    await batch.commit();
    return NextResponse.json({ ok: true, seeded: SEED_PRODUCTS.length });
  }

  const clean = sanitize(body);
  if (!clean) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const ref = await db
    .collection(COLLECTION)
    .add({ ...clean, createdAt: now, updatedAt: now });
  return NextResponse.json({ ok: true, id: ref.id });
}
