"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "제주 바다의 깊은 매력",
    subtitle: "ECO DIVERS SCUBA DIVING",
  },
  {
    image: "https://images.unsplash.com/photo-1534084323630-f65511bcfdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "신비로운 해녀 체험",
    subtitle: "HAENYEO EXPERIENCE",
  },
  {
    image: "https://images.unsplash.com/photo-1555412654-72a95a495858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "인생 최고의 순간",
    subtitle: "DISCOVERY SCUBA DIVING",
  },
  {
    image: "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "환상적인 스노클링",
    subtitle: "HOPPING TOUR & SNORKELING",
  },
  {
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "끝없는 바다의 신비",
    subtitle: "FUN DIVING JEJU",
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-5000 ease-out scale-110"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === current ? "scale(1)" : "scale(1.1)"
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-blue-400 font-bold tracking-[0.4em] uppercase mb-6 text-sm md:text-base animate-[fadeInDown_1s_ease-out]">
            {slides[current].subtitle}
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[1.1] drop-shadow-2xl animate-[fadeInUp_1s_ease-out]">
            {slides[current].title.split(" ").map((word, i) => (
              <span key={i} className={i === 0 ? "mr-4" : "text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300"}>
                {word}
              </span>
            ))}
          </h1>
          <p className="text-lg md:text-2xl text-white/80 font-medium mb-12 max-w-2xl mx-auto drop-shadow-md animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0">
            제주도 최북단, 가장 맑은 바다에서 즐겁고 안전한 다이빙을.<br />
            에코다이버스가 당신의 특별한 순간을 보장합니다.
          </p>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20 group"
      >
        <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20 group"
      >
        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              i === current ? "w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
