"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, getUserRole } from "@/lib/authService";
import {
  emptyProduct,
  type DetailBlock,
  type Product,
  type ProductInput,
  type ProductKind,
} from "@/lib/products";

type Editing = (ProductInput & { id?: string }) | null;

export default function AdminProductsPage() {
  const router = useRouter();
  const userRef = useRef<User | null>(null);

  const [ready, setReady] = useState(false);
  const [programs, setPrograms] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Product[]>([]);
  const [empty, setEmpty] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const token = useCallback(async () => {
    const u = userRef.current;
    if (!u) throw new Error("no-auth");
    return u.getIdToken();
  }, []);

  const load = useCallback(async () => {
    try {
      const t = await token();
      const res = await fetch("/api/products?all=1", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data?.unconfigured) {
        setMsg("서버에 Firebase Admin 설정이 없어 로컬에서는 저장이 되지 않습니다. 배포 환경에서 사용하세요.");
      }
      const progs: Product[] = data.programs || [];
      const pkgs: Product[] = data.packages || [];
      setPrograms(progs);
      setPackages(pkgs);
      setEmpty(progs.length === 0 && pkgs.length === 0);
    } catch {
      setMsg("상품 목록을 불러오지 못했습니다.");
    }
  }, [token]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login?redirect=/admin/products");
        return;
      }
      const role = await getUserRole(user);
      if (role !== "admin") {
        alert("권한이 없습니다. 관리자만 접근 가능합니다.");
        router.push("/admin/schedule");
        return;
      }
      userRef.current = user;
      setReady(true);
      await load();
    });
    return () => unsub();
  }, [router, load]);

  // ---- actions ----
  const seed = async () => {
    setBusy(true);
    try {
      const t = await token();
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ action: "seed" }),
      });
      if (!res.ok) throw new Error();
      await load();
      setMsg("기존 카드 8개를 불러왔습니다.");
    } catch {
      setMsg("불러오기에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      setMsg("상품명을 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      const t = await token();
      const { id, ...payload } = editing;
      const res = await fetch(id ? `/api/products/${id}` : "/api/products", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      await load();
      setMsg("저장되었습니다.");
    } catch {
      setMsg("저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`'${p.title}' 상품을 삭제할까요?`)) return;
    setBusy(true);
    try {
      const t = await token();
      await fetch(`/api/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const patch = async (p: Product, body: Partial<Product>) => {
    setBusy(true);
    try {
      const t = await token();
      await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(body),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const move = async (list: Product[], idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[idx];
    const b = list[j];
    await patch(a, { order: b.order });
    await patch(b, { order: a.order });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const t = await token();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/products/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
      body: fd,
    });
    if (!res.ok) {
      setMsg("이미지 업로드에 실패했습니다.");
      return null;
    }
    const data = await res.json();
    return data.url as string;
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-blue-900 border-l-4 border-blue-600 pl-4">
              상품 관리
            </h1>
            <p className="text-gray-500 mt-1 text-sm pl-4">홈페이지 프로그램 · 패키지 카드</p>
          </div>
          <Link
            href="/admin/schedule"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-sm"
          >
            일정표로
          </Link>
        </div>

        {msg && (
          <div className="mb-4 text-sm bg-blue-50 text-blue-800 border border-blue-100 rounded-lg px-4 py-3">
            {msg}
          </div>
        )}

        {editing ? (
          <Editor
            value={editing}
            onChange={setEditing}
            onCancel={() => setEditing(null)}
            onSave={save}
            busy={busy}
            uploadImage={uploadImage}
          />
        ) : (
          <>
            {empty && (
              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  아직 등록된 상품이 없습니다. 현재 홈페이지 카드를 그대로 불러와 시작할 수 있어요.
                </p>
                <button
                  onClick={seed}
                  disabled={busy}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
                >
                  기존 카드 8개 불러오기
                </button>
              </div>
            )}

            <Group
              title="프로그램"
              kind="program"
              list={programs}
              onAdd={() =>
                setEditing({ ...emptyProduct("program", programs.length), published: true })
              }
              onEdit={(p) => setEditing({ ...p })}
              onRemove={remove}
              onToggle={(p) => patch(p, { published: !p.published })}
              onMove={(idx, dir) => move(programs, idx, dir)}
              busy={busy}
            />
            <Group
              title="패키지"
              kind="package"
              list={packages}
              onAdd={() =>
                setEditing({ ...emptyProduct("package", packages.length), published: true })
              }
              onEdit={(p) => setEditing({ ...p })}
              onRemove={remove}
              onToggle={(p) => patch(p, { published: !p.published })}
              onMove={(idx, dir) => move(packages, idx, dir)}
              busy={busy}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Group({
  title,
  list,
  onAdd,
  onEdit,
  onRemove,
  onToggle,
  onMove,
  busy,
}: {
  title: string;
  kind: ProductKind;
  list: Product[];
  onAdd: () => void;
  onEdit: (p: Product) => void;
  onRemove: (p: Product) => void;
  onToggle: (p: Product) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  busy: boolean;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-gray-800">{title}</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg"
        >
          + 상품 추가
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {list.length === 0 && (
          <p className="p-5 text-sm text-gray-400">등록된 항목이 없습니다.</p>
        )}
        {list.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {p.mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.mainImage} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 truncate">{p.title || "(제목 없음)"}</div>
              <div className="text-xs text-gray-400 truncate">
                {p.category} · {p.priceLabel}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onMove(idx, -1)}
                disabled={busy || idx === 0}
                className="px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs"
              >
                ▲
              </button>
              <button
                onClick={() => onMove(idx, 1)}
                disabled={busy || idx === list.length - 1}
                className="px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs"
              >
                ▼
              </button>
            </div>
            <button
              onClick={() => onToggle(p)}
              disabled={busy}
              className={`px-2.5 py-1 rounded text-xs font-bold ${
                p.published
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {p.published ? "노출중" : "숨김"}
            </button>
            <button
              onClick={() => onEdit(p)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100"
            >
              수정
            </button>
            <button
              onClick={() => onRemove(p)}
              disabled={busy}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Editor({
  value,
  onChange,
  onCancel,
  onSave,
  busy,
  uploadImage,
}: {
  value: ProductInput & { id?: string };
  onChange: (v: ProductInput & { id?: string }) => void;
  onCancel: () => void;
  onSave: () => void;
  busy: boolean;
  uploadImage: (f: File) => Promise<string | null>;
}) {
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    onChange({ ...value, [k]: v });

  const pickMain = async (f: File) => {
    setUploading(true);
    const url = await uploadImage(f);
    setUploading(false);
    if (url) set("mainImage", url);
  };

  const addGallery = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const u = await uploadImage(f);
      if (u) urls.push(u);
    }
    setUploading(false);
    set("images", [...value.images, ...urls]);
  };

  const setBlock = (i: number, b: DetailBlock) => {
    const next = value.detailBlocks.slice();
    next[i] = b;
    set("detailBlocks", next);
  };
  const removeBlock = (i: number) =>
    set("detailBlocks", value.detailBlocks.filter((_, j) => j !== i));
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.detailBlocks.length) return;
    const next = value.detailBlocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    set("detailBlocks", next);
  };

  const field = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-gray-800">
          {value.id ? "상품 수정" : "새 상품"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-lg"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={busy || uploading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg"
          >
            {busy ? "저장 중…" : "저장하기"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <label className="block">
          <span className="text-xs font-bold text-gray-500">구분</span>
          <select
            value={value.kind}
            onChange={(e) => set("kind", e.target.value as ProductKind)}
            className={field}
          >
            <option value="program">프로그램</option>
            <option value="package">패키지</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-gray-500">카테고리 / 뱃지 문구</span>
          <input
            value={value.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="예: 호핑투어 / 가장 인기"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-gray-500">상품명</span>
          <input value={value.title} onChange={(e) => set("title", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-gray-500">영문 부제 (프로그램)</span>
          <input
            value={value.enTitle}
            onChange={(e) => set("enTitle", e.target.value)}
            placeholder="예: HOPPING TOUR"
            className={field}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-bold text-gray-500">카드 한 줄 설명</span>
          <input value={value.summary} onChange={(e) => set("summary", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-gray-500">가격 표기</span>
          <input
            value={value.priceLabel}
            onChange={(e) => set("priceLabel", e.target.value)}
            placeholder="예: 35,000원부터"
            className={field}
          />
        </label>
        <div className="flex items-end gap-4 pb-1">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <input
              type="checkbox"
              checked={value.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            노출
          </label>
          {value.kind === "program" ? (
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <input
                type="checkbox"
                checked={value.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              대표 프로그램
            </label>
          ) : (
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
              <input
                type="checkbox"
                checked={value.highlight}
                onChange={(e) => set("highlight", e.target.checked)}
              />
              강조(가장 인기)
            </label>
          )}
        </div>
      </div>

      {/* 대표 이미지 */}
      <div className="mb-5">
        <span className="text-xs font-bold text-gray-500">대표 이미지</span>
        <div className="mt-1 flex items-center gap-3">
          <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {value.mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.mainImage} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg cursor-pointer w-max">
              이미지 선택
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && pickMain(e.target.files[0])}
              />
            </label>
            {value.mainImage && (
              <button
                onClick={() => set("mainImage", "")}
                className="text-xs text-red-500 font-bold w-max"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 추가 이미지 */}
      <div className="mb-6">
        <span className="text-xs font-bold text-gray-500">추가 이미지 ({value.images.length})</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {value.images.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => set("images", value.images.filter((_, j) => j !== i))}
                className="absolute top-0 right-0 bg-black/60 text-white w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-2xl cursor-pointer">
            +
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addGallery(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* 상세 설명 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500">상세 설명</span>
          <div className="flex gap-2">
            <button
              onClick={() => set("detailBlocks", [...value.detailBlocks, { type: "text", value: "" }])}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded"
            >
              + 텍스트
            </button>
            <button
              onClick={() => set("detailBlocks", [...value.detailBlocks, { type: "image", value: "" }])}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded"
            >
              + 이미지
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {value.detailBlocks.length === 0 && (
            <p className="text-xs text-gray-400">
              상세 페이지에 들어갈 이미지/문단을 추가하세요. 순서대로 표시됩니다.
            </p>
          )}
          {value.detailBlocks.map((b, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400">
                  {b.type === "image" ? "이미지" : "텍스트"} #{i + 1}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => moveBlock(i, -1)} className="px-2 text-gray-400 hover:text-gray-700 text-xs">▲</button>
                  <button onClick={() => moveBlock(i, 1)} className="px-2 text-gray-400 hover:text-gray-700 text-xs">▼</button>
                  <button onClick={() => removeBlock(i)} className="px-2 text-red-400 hover:text-red-600 text-xs">삭제</button>
                </div>
              </div>
              {b.type === "text" ? (
                <textarea
                  value={b.value}
                  onChange={(e) => setBlock(i, { type: "text", value: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {b.value ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.value} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <label className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg cursor-pointer">
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploading(true);
                        const url = await uploadImage(f);
                        setUploading(false);
                        if (url) setBlock(i, { type: "image", value: url });
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {uploading && (
        <p className="mt-4 text-xs text-blue-600 font-bold">이미지 업로드 중…</p>
      )}
    </div>
  );
}
