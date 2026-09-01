import { NextResponse } from "next/server";
import { getDbAdmin, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { ProductInput } from "@/lib/products";

export const dynamic = "force-dynamic";

const COLLECTION = "products";

function sanitize(body: any): Partial<ProductInput> & { updatedAt?: string } {
  const str = (v: unknown, max = 400) => String(v ?? "").slice(0, max);
  const out: Partial<ProductInput> & { updatedAt?: string } = {};
  if (body.kind === "program" || body.kind === "package") out.kind = body.kind;
  if ("category" in body) out.category = str(body.category, 40);
  if ("title" in body) out.title = str(body.title, 80);
  if ("enTitle" in body) out.enTitle = str(body.enTitle, 80);
  if ("summary" in body) out.summary = str(body.summary, 400);
  if ("priceLabel" in body) out.priceLabel = str(body.priceLabel, 40);
  if ("mainImage" in body) out.mainImage = str(body.mainImage, 1000);
  if (Array.isArray(body.images))
    out.images = body.images.slice(0, 12).map((u: unknown) => str(u, 1000)).filter(Boolean);
  if (Array.isArray(body.detailBlocks))
    out.detailBlocks = body.detailBlocks
      .filter((b: any) => b && (b.type === "image" || b.type === "text"))
      .slice(0, 60)
      .map((b: any) => ({ type: b.type, value: str(b.value, 5000) }));
  if ("order" in body && Number.isFinite(+body.order)) out.order = +body.order;
  if ("published" in body) out.published = !!body.published;
  if ("featured" in body) out.featured = !!body.featured;
  if ("highlight" in body) out.highlight = !!body.highlight;
  return out;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDbAdmin();
  if (!db) return NextResponse.json({ error: "db_unconfigured" }, { status: 503 });

  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const uid = await verifyAdminRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDbAdmin();
  if (!db) return NextResponse.json({ error: "db_unconfigured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const patch = sanitize(body);
  patch.updatedAt = new Date().toISOString();

  await db.collection(COLLECTION).doc(id).set(patch, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const uid = await verifyAdminRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDbAdmin();
  if (!db) return NextResponse.json({ error: "db_unconfigured" }, { status: 503 });

  await db.collection(COLLECTION).doc(id).delete();
  return NextResponse.json({ ok: true });
}
