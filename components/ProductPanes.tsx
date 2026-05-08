"use client";

import Link from "next/link";
import { useState } from "react";

const panes = [
  {
    title: "호핑투어",
    enTitle: "HOPPING TOUR",
    desc: "제주 에메랄드빛 바다 스노클링",
    image:
      "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/hopping-tour",
    price: "35,000원~",
    tag: "인기"
  },
  {
    title: "해녀체험",
    enTitle: "HAENYEO",
    desc: "전통 방식 그대로의 해녀기지 체험",
    image:
      "https://images.unsplash.com/photo-1534084323630-f65511bcfdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/haenyeo",
    price: "50,000원~",
    tag: "추천"
  },
  {
    title: "체험다이빙",
    enTitle: "DISCOVERY SCUBA",
    desc: "생생한 수중 세계로의 첫걸음",
    image:
      "https://images.unsplash.com/photo-1555412654-72a95a495858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/discovery",
    price: "85,000원~",
    tag: ""
  },
  {
    title: "교육/라이센스",
    enTitle: "COURSE & LICENSE",
    desc: "체계적인 PADI/AIDA 교육 프로그램",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/course",
    price: "120,000원~",
    tag: ""
  },
  {
    title: "펀다이빙",
    enTitle: "FUN DIVING",
    desc: "다이버들을 위한 명품 포인트 가이딩",
    image:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/fun-diving",
    price: "100,000원~",
    tag: ""
  },
];

export default function ProductPanes() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="snap-section w-full h-screen flex flex-col md:flex-row overflow-hidden bg-[#0a1628]" id="diving">
      {panes.map((pane, index) => (
        <Link
          key={index}
          href={pane.url}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={`relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            // Mobile: equal height, Desktop: expand on hover
            "flex-1"
          } ${hovered === index ? "md:flex-[2.5]" : "md:flex-1"}`}
          style={{
            minHeight: "20vh",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: `url(${pane.image})`,
              transform: hovered === index ? "scale(1.08)" : "scale(1.03)",
            }}
          />

          {/* Overlay */}
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              hovered === index
                ? "bg-gradient-to-t from-[#023e8a]/90 via-black/30 to-transparent"
                : "bg-gradient-to-t from-black/75 via-black/30 to-black/10"
            }`}
          />

          {/* Left blue accent line on hover */}
          <div
            className={`absolute left-0 top-0 w-0.5 bg-[#006BD6] transition-all duration-500 ${
              hovered === index ? "h-full opacity-100" : "h-0 opacity-0"
            }`}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
            {/* Tag Badge */}
            {pane.tag && (
              <div
                className={`absolute top-5 right-5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-white bg-[#006BD6] transition-opacity duration-300 ${
                  hovered === index ? "opacity-100" : "opacity-80"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {pane.tag}
              </div>
            )}

            {/* Number */}
            <div
              className={`absolute top-5 left-6 text-white/20 font-black text-5xl leading-none transition-all duration-500 ${
                hovered === index ? "opacity-0 -translate-y-4" : "opacity-100"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* English Title */}
            <div
              className={`text-white/50 text-[10px] tracking-[0.35em] uppercase mb-2 transition-all duration-500 ${
                hovered === index
                  ? "opacity-100 translate-y-0 text-[#60b8ff]"
                  : "opacity-70"
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {pane.enTitle}
            </div>

            {/* Korean Title */}
            <h3
              className={`text-white font-black text-2xl md:text-3xl leading-tight mb-1 transition-all duration-500 ${
                hovered === index ? "translate-y-0" : ""
              }`}
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              {pane.title}
            </h3>

            {/* Description & Price on hover */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                hovered === index
                  ? "max-h-40 opacity-100 mt-4"
                  : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <p className="text-white/75 text-sm leading-relaxed mb-4">
                {pane.desc}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-[#60b8ff] font-black text-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {pane.price}
                </span>
                <span
                  className="inline-flex items-center gap-2 text-white text-[11px] font-bold tracking-widest uppercase border border-white/40 px-4 py-2 hover:bg-[#006BD6] hover:border-[#006BD6] transition-all duration-300"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  자세히보기
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom separator line */}
          <div className="absolute right-0 top-0 h-full w-px bg-white/10" />
        </Link>
      ))}
    </section>
  );
}
