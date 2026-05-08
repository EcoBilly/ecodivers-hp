"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "제주 바다의\n깊은 매력",
    subtitle: "SCUBA DIVING",
    desc: "제주도 최북단, 가장 맑은 바다에서\n즐겁고 안전한 다이빙",
    cta: "체험 예약하기",
    ctaLink: "#booking",
  },
  {
    image:
      "https://images.unsplash.com/photo-1534084323630-f65511bcfdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "신비로운\n해녀 체험",
    subtitle: "HAENYEO EXPERIENCE",
    desc: "제주의 살아있는 문화유산\n해녀와 함께하는 특별한 경험",
    cta: "지금 예약하기",
    ctaLink: "#booking",
  },
  {
    image:
      "https://images.unsplash.com/photo-1555412654-72a95a495858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "인생 최고의\n순간을",
    subtitle: "DISCOVERY SCUBA",
    desc: "물이 무서워도 괜찮아요\n전문 강사의 1:1 케어로 안심 다이빙",
    cta: "더 알아보기",
    ctaLink: "#experience",
  },
  {
    image:
      "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "에메랄드빛\n바다 속으로",
    subtitle: "HOPPING TOUR & SNORKELING",
    desc: "환상적인 제주 바다에서\n열대어와 함께 스노클링",
    cta: "코스 확인하기",
    ctaLink: "#packages",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 1000);
  }, [isAnimating]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // Progress bar
  useEffect(() => {
    setProgress(0);
    const step = 100 / 50; // 50 steps over 5 seconds
    let current = 0;

    const interval = setInterval(() => {
      current += step;
      setProgress(Math.min(current, 100));
    }, 100);

    progressRef.current = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#023e8a]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image with Ken Burns effect */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === current ? "scale(1.05)" : "scale(1.12)",
              transition: "transform 7s ease-out, opacity 1s ease-in-out",
            }}
          />
          {/* Gradient overlay - darker on left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
      ))}

      {/* Main Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 w-full">
          <div className="max-w-2xl">
            {/* Subtitle Label */}
            <div
              key={`subtitle-${current}`}
              className="animate-fadeInDown mb-4"
            >
              <span
                className="inline-flex items-center gap-3 text-white/70 text-xs md:text-sm tracking-[0.4em] uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <span className="w-8 h-px bg-white/50" />
                {slides[current].subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h1
              key={`title-${current}`}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-6 animate-fadeInUp"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              {slides[current].title.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p
              key={`desc-${current}`}
              className="text-white/75 text-base md:text-lg font-light leading-relaxed mb-10 animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              {slides[current].desc.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>

            {/* CTA Buttons */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap gap-4 animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <a
                href={slides[current].ctaLink}
                className="px-8 py-4 bg-[#006BD6] hover:bg-[#0057b0] text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {slides[current].cta}
              </a>
              <a
                href="https://smartstore.naver.com/divershop"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border border-white/60 hover:bg-white hover:text-[#006BD6] text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                NAVER RESERVE
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Counter & Controls (Bottom Left) */}
      <div className="absolute bottom-10 left-8 md:left-16 z-30 flex items-center gap-8">
        {/* Slide number */}
        <div
          className="text-white/60 text-xs tracking-widest"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <span className="text-white text-2xl font-black">
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="mx-2">/</span>
          {String(slides.length).padStart(2, "0")}
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-500 rounded-full ${
                i === current
                  ? "w-8 h-1.5 bg-[#006BD6]"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-30">
        <div
          className="h-full bg-[#006BD6] transition-none"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>

      {/* Arrow Controls (Right Side) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        <button
          onClick={prevSlide}
          className="w-12 h-12 border border-white/30 hover:border-white hover:bg-white/10 text-white flex items-center justify-center transition-all duration-300 group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 border border-white/30 hover:border-white hover:bg-white/10 text-white flex items-center justify-center transition-all duration-300 group"
        >
          <svg
            className="w-5 h-5 group-hover:translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 right-16 z-30 hidden md:flex flex-col items-center gap-2">
        <span
          className="text-white/40 text-[10px] tracking-[0.3em] uppercase rotate-90 origin-center translate-y-4"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Scroll
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white/40 to-white/0 animate-pulse" />
      </div>
    </div>
  );
}
