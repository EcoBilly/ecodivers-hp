"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";

interface Card {
  id?: string;
  title: string;
  en: string;
  desc: string;
  image: string;
  price: string;
  feature: boolean;
}

const FALLBACK: Card[] = [
  {
    title: "호핑투어",
    en: "HOPPING TOUR",
    desc: "보트로 나가 에메랄드빛 앞바다에서 스노클링. 수영을 못해도 구명조끼와 강사가 함께합니다.",
    image: "/img/reef.jpg",
    price: "35,000원부터",
    feature: true,
  },
  {
    title: "해녀체험",
    en: "HAENYEO",
    desc: "제주의 살아있는 문화. 해녀와 함께 물질을 배우고, 직접 잡은 해산물을 맛봅니다.",
    image: "/img/snorkel-turtle.jpg",
    price: "50,000원부터",
    feature: true,
  },
  {
    title: "체험다이빙",
    en: "DISCOVERY SCUBA",
    desc: "자격증 없이 즐기는 첫 스쿠버. 강사가 1:1로 붙어 수심 5m 아래 세계를 안내합니다.",
    image: "/img/diver.jpg",
    price: "85,000원부터",
    feature: false,
  },
  {
    title: "교육 · 라이센스",
    en: "COURSE & LICENSE",
    desc: "PADI·AIDA 공인 과정. 오픈워터부터 프리다이빙까지 일정에 맞춰 진행합니다.",
    image: "/img/coral-garden.jpg",
    price: "120,000원부터",
    feature: false,
  },
  {
    title: "펀다이빙",
    en: "FUN DIVING",
    desc: "자격증 보유 다이버를 위한 포인트 가이딩. 관리된 장비와 보트로 편하게.",
    image: "/img/sandy.jpg",
    price: "100,000원부터",
    feature: false,
  },
];

export default function ProductPanes() {
  const [cards, setCards] = useState<Card[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !Array.isArray(data?.programs) || data.programs.length === 0) return;
        setCards(
          (data.programs as Product[]).map((p) => ({
            id: p.id,
            title: p.title,
            en: p.enTitle,
            desc: p.summary,
            image: p.mainImage || "/img/reef.jpg",
            price: p.priceLabel,
            feature: !!p.featured,
          }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="diving" className="py-20 md:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-14">
          <p className="eyebrow mb-4">Programs</p>
          <h2 className="display-lg text-[#0b1b2b]">
            제주 바다에서 <span className="text-[#006BD6]">할 수 있는 일</span>
          </h2>
          <p className="mt-4 text-[var(--ink-soft)] leading-relaxed max-w-xl">
            호핑투어와 해녀체험이 가장 많이 찾는 프로그램입니다. 스쿠버 교육과 펀다이빙도 같은 곳에서 운영합니다.
          </p>
        </div>

        {/* 모바일: 세로 스택 / 데스크톱: 3열 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {cards.map((p, i) => (
            <a
              key={p.id || i}
              href={p.id ? `/product/${p.id}` : "#booking"}
              className="group relative flex flex-col overflow-hidden border border-[var(--line)] bg-white transition-colors hover:border-[#006BD6]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.feature && (
                  <span
                    className="absolute top-3 left-3 bg-[#006BD6] text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    대표 프로그램
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 p-5">
                <span
                  className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-1.5"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {p.en}
                </span>
                <h3 className="text-xl font-black text-[#0b1b2b] mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed mb-5">{p.desc}</p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--line)]">
                  <span className="text-[#006BD6] font-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {p.price}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-[#0b1b2b] group-hover:text-[#006BD6] transition-colors">
                    {p.id ? "자세히 보기" : "예약하기"}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
