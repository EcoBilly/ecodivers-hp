"use client";

import Link from "next/link";
import { useState } from "react";

const panes = [
  {
    title: "호핑투어",
    enTitle: "Hopping Tour",
    desc: "제주 에메랄드빛 바다 스노클링",
    image: "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/hopping-tour",
    icon: "🚤"
  },
  {
    title: "해녀체험",
    enTitle: "Haenyeo Experience",
    desc: "전통 방식 그대로의 해녀기지 체험",
    image: "https://images.unsplash.com/photo-1534084323630-f65511bcfdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/haenyeo",
    icon: "🦪"
  },
  {
    title: "스노클링",
    enTitle: "Snorkeling",
    desc: "가장 맑은 바다에서의 스노클링",
    image: "https://images.unsplash.com/photo-1544552866-d3ed42536fcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/snorkeling",
    icon: "🏊"
  },
  {
    title: "체험다이빙",
    enTitle: "Discovery Scuba",
    desc: "생생한 수중 세계로의 첫걸음",
    image: "https://images.unsplash.com/photo-1555412654-72a95a495858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/discovery",
    icon: "🐠"
  },
  {
    title: "교육/라이센스",
    enTitle: "Course & License",
    desc: "체계적인 다이빙 교육 프로그램",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/course",
    icon: "🤿"
  },
  {
    title: "펀다이빙",
    enTitle: "Fun Diving",
    desc: "다이버들을 위한 명품 포인트 가이딩",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    url: "/fun-diving",
    icon: "🌊"
  }
];

export default function ProductPanes() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="snap-section w-full h-screen flex flex-col md:flex-row overflow-hidden bg-black">
      {panes.map((pane, index) => (
        <Link
          key={index}
          href={pane.url}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={`relative h-1/6 md:h-full transition-all duration-700 ease-in-out border-b md:border-b-0 md:border-r border-white/20 group overflow-hidden ${
            hovered === index ? "flex-2" : "flex-1"
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url(${pane.image})` }}
          />
          
          {/* Overlay - Darker for unhovered, lighter for hovered */}
          <div className={`absolute inset-0 transition-opacity duration-500 bg-black/50 ${
            hovered === index ? "opacity-30" : "opacity-60 group-hover:opacity-30"
          }`} />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <div className={`flex flex-col items-center transition-all duration-500 ease-out ${
              hovered === index ? "-translate-y-12" : "translate-y-0"
            }`}>
              
              {/* Icon - only visible on hover or persistent small? Reference image has some small icons */}
              <div className="text-3xl mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {pane.icon}
              </div>

              <h3 className="text-white text-2xl md:text-4xl font-black mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tighter">
                {pane.title}
              </h3>
              <span className="text-white/60 text-sm md:text-base font-bold uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">
                {pane.enTitle}
              </span>
              
              {/* Detailed Text on Hover */}
              <div className={`mt-8 transition-all duration-500 ${
                hovered === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}>
                <p className="text-white/90 text-sm font-medium mb-6 break-keep max-w-[200px] leading-relaxed">
                  {pane.desc}
                </p>
                <span className="inline-block px-8 py-3 bg-white text-black text-xs font-black rounded-sm transition-all hover:bg-blue-600 hover:text-white uppercase tracking-widest shadow-xl">
                  GO RESERVE
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
