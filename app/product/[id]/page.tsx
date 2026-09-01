import Link from "next/link";
import { notFound } from "next/navigation";
import { getDbAdmin } from "@/lib/firebaseAdmin";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

async function getProduct(id: string): Promise<Product | null> {
  const db = getDbAdmin();
  if (!db) return null;
  try {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as any) };
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product || !product.published) notFound();

  return (
    <main className="bg-white pt-[92px] md:pt-[110px]">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-gray-100">
          {product.mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.mainImage} alt={product.title} className="w-full h-full object-cover" />
          ) : null}
        </div>

        <div>
          <p className="eyebrow mb-3">{product.enTitle || product.category}</p>
          <h1 className="display-lg text-[#0b1b2b] mb-4">{product.title}</h1>
          <p className="text-[var(--ink-soft)] leading-relaxed mb-6">{product.summary}</p>

          {product.priceLabel ? (
            <div
              className="text-3xl font-black text-[#006BD6] mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {product.priceLabel}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/#booking"
              className="flex-1 text-center px-8 py-4 bg-[#006BD6] hover:bg-[#00457f] text-white text-sm font-black tracking-widest uppercase transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              예약 요청하기
            </Link>
            <a
              href="http://pf.kakao.com/_Gjdbl/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-8 py-4 border border-[#0b1b2b] text-[#0b1b2b] hover:bg-[#0b1b2b] hover:text-white text-sm font-black tracking-widest uppercase transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              카카오톡 상담
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {product.images.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {product.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${product.title} ${i + 1}`}
                loading="lazy"
                className="w-full aspect-square object-cover border border-[var(--line)]"
              />
            ))}
          </div>
        </section>
      )}

      {/* Detail blocks — 네이버 상세페이지(가로 860px) 이미지를 그대로 사용 */}
      {product.detailBlocks.length > 0 && (
        <section className="py-12 md:py-16">
          {/* 데스크톱: 최대 860px 중앙정렬 / 모바일: 화면폭에 맞춰 축소 */}
          <div className="mx-auto w-full max-w-[860px]">
            {product.detailBlocks.map((block, i) =>
              block.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={block.value}
                  alt=""
                  loading="lazy"
                  className="block w-full align-top"
                />
              ) : (
                <p
                  key={i}
                  className="text-[15px] md:text-base text-[var(--ink-soft)] leading-loose whitespace-pre-wrap px-4 py-6"
                >
                  {block.value}
                </p>
              )
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-[#0b1b2b] py-14 px-4">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="display-lg text-white mb-6">
            {product.title}, <span className="text-[#60b8ff]">지금 예약하세요</span>
          </h2>
          <Link
            href="/#booking"
            className="inline-block px-10 py-4 bg-[#006BD6] hover:bg-[#00457f] text-white text-sm font-black tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            예약 요청하기
          </Link>
          <div className="mt-6">
            <Link href="/#diving" className="text-white/50 text-sm hover:text-white transition-colors">
              ← 다른 프로그램 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
