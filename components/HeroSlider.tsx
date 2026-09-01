"use client";

import { useState, useEffect, useRef } from "react";

const KAKAO = "http://pf.kakao.com/_Gjdbl/chat";

/**
 * 짧고 담백한 문장형 카피 (체크리스트 지양).
 * 배경은 고정, 문장만 천천히 교차한다.
 */
const lines = [
  {
    kicker: "제주 서귀포 · 호핑투어 & 해녀체험",
    title: "제주 바다를\n처음 만나는 분께",
    body: "수영이 서툴러도, 장비가 낯설어도 괜찮습니다.\n강사가 곁에서 함께 들어갑니다.",
  },
  {
    kicker: "반나절이면 충분합니다",
    title: "물빛과 해녀의\n하루를 그대로",
    body: "에메랄드빛 앞바다에서의 스노클링,\n해녀와 함께 걷는 물질의 시간.",
  },
  {
    kicker: "다시 찾는 이유",
    title: "매번 같은\n기준으로 준비합니다",
    body: "장비 관리, 안전 브리핑, 수중 사진까지\n빠짐없이 챙깁니다.",
  },
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % lines.length), 6000);
    return () => clearInterval(t);
  }, []);

  // 모바일 브라우저 자동재생 정책 대응 — 강제로 재생 시도 + 사용자 터치 시 재시도
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", tryPlay);
    };
  }, []);

  const cur = lines[i];

  return (
    <div className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-[#0b1b2b]">
      {/* Background — 영상 (로딩 전/미지원 시 poster 이미지) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/img/hero.jpg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b2b] via-[#0b1b2b]/55 to-[#0b1b2b]/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b2b]/90 via-[#0b1b2b]/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 h-full flex flex-col justify-end pb-44 md:justify-center md:pb-0 [text-shadow:0_2px_24px_rgba(3,15,25,0.45)]">
          <div key={i} className="max-w-2xl reveal">
            <p className="eyebrow text-white mb-5">{cur.kicker}</p>
            <h1 className="display-xl text-white whitespace-pre-line mb-6">{cur.title}</h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed whitespace-pre-line mb-9">
              {cur.body}
            </p>
          </div>

          {/* CTA — 바로 예약으로 */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <a
              href="#booking"
              className="flex-1 sm:flex-none text-center px-9 py-4 bg-[#006BD6] hover:bg-[#00457f] text-white text-sm font-black tracking-widest uppercase transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              날짜 보고 예약하기
            </a>
            <a
              href={KAKAO}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block sm:flex-none text-center px-9 py-4 border border-white/40 text-white text-sm font-black tracking-widest uppercase hover:bg-white hover:text-[#0b1b2b] transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              카카오로 문의
            </a>
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div className="hidden md:flex absolute bottom-6 left-16 z-10 gap-2">
        {lines.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`슬라이드 ${idx + 1}`}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx === i ? "w-8 bg-[#006BD6]" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
