"use client";

import Link from "next/link";
import BookingWidget from "@/components/BookingWidget";
import HeroSlider from "@/components/HeroSlider";
import PackageSection from "@/components/PackageSection";
import ProductPanes from "@/components/ProductPanes";

// Lucide-react Star icon fallback
const Star = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const products = [
  {
    title: "제주 해녀체험",
    summary: "제주 바다의 심장, 해녀와 함께하는 특별한 물질 체험",
    price: "50,000",
    icon: "🦪",
    features: ["당일 예약 가능✅", "몸만 오세요! 준비물 완비", "전문 강사 밀착 동행"],
    bgImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    highlight: true
  },
  {
    title: "호핑투어 스노클링",
    summary: "환상적인 에메랄드빛 바다 속 물고기들과의 만남",
    price: "35,000",
    icon: "🚤",
    features: ["당일 예약 가능✅", "스노클링 장비/다과 제공", "환상적인 제주 바다"],
    bgImage: "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    bookingUrl: "https://smartstore.naver.com/divershop/products/8486581353",
    highlight: true
  },
  {
    title: "체험다이빙",
    summary: "생생한 수중 세계 탐험, 초보자도 안심하고 즐기는 다이빙",
    price: "85,000",
    icon: "🐠",
    features: ["물공포증 극복! 안심 케어", "인생샷 보장 무료 수중촬영", "강사 1:1 전담 마크"],
    bgImage: "https://images.unsplash.com/photo-1555412654-72a95a495858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "스쿠버다이빙 교육",
    summary: "세계 인정 라이센스 취득, 기초부터 탄탄한 정규 코스",
    price: "150,000",
    icon: "🤿",
    features: ["PADI/AIDA 자격증 취득", "기초부터 탄탄한 전문 커리큘럼", "자격증 취득 100% 보장"],
    bgImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "프리다이빙 교육",
    summary: "한 호흡으로 자유롭게, 바다와 하나가 되는 고요한 경험",
    price: "120,000",
    icon: "🧜‍♀️",
    features: ["AIDA 1~4 레벨 전과정", "체계화된 수중 스태틱/호흡", "안전한 해양 실습"],
    bgImage: "https://images.unsplash.com/photo-1544552866-d3ed42536fcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "제주 펀다이빙",
    summary: "다이버들을 위한 선물, 제주의 숨겨진 명품 포인트 탐방",
    price: "100,000",
    icon: "🌊",
    features: ["라이센스 소지자 전용", "제주 명품 포인트 가이딩", "다이빙 로그 및 리뷰 공유"],
    bgImage: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
];

export default function Home() {
  return (
    <main className="scroll-snap-container bg-white selection:bg-blue-100">
      {/* 1. Hero & Booking Widget */}
      <section className="snap-section relative w-full h-screen overflow-hidden">
        <HeroSlider />
        <div className="absolute bottom-0 left-0 w-full pb-0 md:pb-12 z-40 bg-linear-to-t from-black/20 to-transparent">
          <BookingWidget />
        </div>
      </section>

      {/* 2. Package Section */}
      <div className="snap-section overflow-y-auto">
        <PackageSection />
      </div>

      {/* 3. Product Panes Section */}
      <ProductPanes />

      {/* 4. Review Section (Snap Section) */}
      <div className="snap-section overflow-y-auto">
        <section className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                에코다이버스와 함께한 생생한 리얼 후기
              </h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-2xl font-black text-gray-800 ml-2">4.9<span className="text-gray-400 text-lg font-bold">/5.0</span></span>
              </div>
              <p className="text-gray-500 font-semibold tracking-wide">
                네이버 예약 실관람객 리얼 리뷰
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  name: "다이빙초보",
                  date: "2023.10.12",
                  text: "강사님이 너무 친절하게 알려주셔서 쫄보인 저도 거북이 보고 왔어요! 인생 최고의 경험이었습니다. 에코다이버스 강력 추천해요!"
                },
                {
                  name: "바다사랑",
                  date: "2023.09.28",
                  text: "친구들과 우정 여행으로 해녀체험을 신청했는데, 사진도 진짜 예쁘게 많이 찍어주시고 해산물 잡아먹는 재미가 쏠쏠했습니다 ㅎㅎ"
                },
                {
                  name: "프로다이버",
                  date: "2023.09.15",
                  text: "제주도 올 때마다 펀다이빙은 무조건 에코다이버스로 옵니다. 장비 상태도 최상급이고 포인트 설명도 완벽했습니다. 다음 달에 또 올게요!"
                }
              ].map((review, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-loose mb-8 font-medium grow break-keep">
                    &quot;{review.text}&quot;
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400 font-bold border-t border-gray-50 pt-5 mt-auto">
                    <span className="text-gray-900 border-b-2 border-green-400 pb-1">{review.name}</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="https://smartstore.naver.com/divershop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-4 bg-white border-2 border-[#03C75A] text-[#03C75A] hover:bg-[#03C75A] hover:text-white font-extrabold rounded-2xl transition-all duration-300 shadow-md group"
              >
                <span className="mr-2 tracking-wide">네이버 실시간 후기 더보기</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
