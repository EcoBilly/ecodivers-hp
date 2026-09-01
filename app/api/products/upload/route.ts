import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebaseAdmin";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAOKo-7TrKA8vrBOZRd72QoE8G4vJWpPv8";
const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "ecodivers-61b6f.firebasestorage.app";

// 기존 storage.rules 에서 쓰기가 허용된 경로 하위에 저장 (규칙 재배포 불필요)
const BASE_PATH = "mobile-connect/products";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const uid = await verifyAdminRequest(request);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "8MB 이하 이미지만 업로드할 수 있습니다." }, { status: 400 });

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${BASE_PATH}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const encodedPath = encodeURIComponent(path);
    const buffer = await file.arrayBuffer();

    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodedPath}&key=${FIREBASE_API_KEY}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      console.error("[products upload] storage error:", detail);
      return NextResponse.json({ error: "upload_failed", detail }, { status: 502 });
    }

    const url = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[products upload]", e);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
