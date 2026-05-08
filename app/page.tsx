"use client";

import Link from "next/link";
import BookingWidget from "@/components/BookingWidget";
import HeroSlider from "@/components/HeroSlider";
import PackageSection from "@/components/PackageSection";
import ProductPanes from "@/components/ProductPanes";

const Star = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const reviews = [
  {
    name: "다이빙초보",
    date: "2023.10.12",
    product: "체험다이빙",
    rating: 5,
    text: "강사님이 너무 친절하게 알려주셔서 쫄보인 저도 거북이 보고 왔어요! 인생 최고의 경험이었습니다. 에코다이버스 강력 추천해요!",
  },
  {
    name: "바다사랑",
    date: "2023.09.28",
    product: "해녀체험",
    rating: 5,
    text: "친구들과 우정 여행으로 해녀체험을 신청했는데, 사진도 진짜 예쁘게 많이 찍어주시고 해산물 잡아먹는 재미가 쏠쏠했습니다 ㅎㅎ",
  },
  {
    name: "프로다이버",
    date: "2023.09.15",
    product: "펀다이빙",
    rating: 5,
    text: "제주도 올 때마다 펀다이빙은 무조건 에코다이버스로 옵니다. 장비 상태도 최상급이고 포인트 설명도 완벽했습니다. 다음 달에 또 올게요!",
  },
];

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "안전 최우선",
    desc: "모든 체험에 전문 강사 1:1 동행, 안전한 바다 경험 보장",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "무료 수중 촬영",
    desc: "체험다이빙 및 스노클링 시 전문 수중 사진 촬영 무료 제공",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "당일 예약 가능",
    desc: "복잡한 사전 예약 없이 당일 예약도 OK. 카카오톡으로 빠르게!",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "PADI / AIDA 공인",
    desc: "세계 최고 인증기관 PADI·AIDA 공인 교육으로 정식 자격증 취득",
  },
];

export default function Home() {
  return (
    <>
      {/* ── 1. Hero ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <HeroSlider />
      </section>

      {/* ── 2. Booking Widget ── */}
      <div className="relative z-30 bg-white">
        <BookingWidget />
      </div>

      {/* ── 3. About / Features ── */}
      <section className="py-24 bg-white" id="about">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left image */}
            <div className="relative">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
                  alt="에코다이버스 스쿠버 다이빙"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 right-6 bg-[#006BD6] text-white px-6 py-4 shadow-xl">
                  <div className="text-3xl font-black leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>10+</div>
                  <div className="text-xs text-white/80 mt-1">Years Experience</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-4 border-[#006BD6]/20 -z-10" />
            </div>

            {/* Right content */}
            <div>
              <span
                className="text-[#006BD6] font-bold text-xs tracking-[0.4em] uppercase mb-4 block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Why EcoDivers
              </span>
              <h2
                className="text-4xl md:text-5xl font-black text-[#0a1628] mb-6 leading-tight"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                제주 바다를 가장<br />
                <span className="text-[#006BD6]">완벽하게 즐기는 법</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-10">
                에코다이버스는 제주도 최북단에 위치한 다이빙 전문 센터입니다.
                청정한 제주 바다에서 다이빙, 스노클링, 해녀체험까지 다양한 해양 레저를
                안전하고 즐겁게 경험하실 수 있습니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="group flex gap-4 p-5 border border-gray-100 hover:border-[#006BD6]/30 hover:bg-blue-50/30 transition-all duration-300"
                  >
                    <div className="text-[#006BD6] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <div>
                      <h4 className="font-black text-[#0a1628] mb-1 text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{f.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Product Panes ── */}
      <ProductPanes />

      {/* ── 5. Packages ── */}
      <PackageSection />

      {/* ── 6. Reviews ── */}
      <section className="py-28 bg-[#0a1628]" id="community">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span
                className="text-[#006BD6] font-bold text-xs tracking-[0.4em] uppercase mb-4 block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Customer Reviews
              </span>
              <h2
                className="text-4xl md:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                에코다이버스와 함께한<br />
                생생한 <span className="text-[#60b8ff]">리얼 후기</span>
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-yellow-400" />)}
              </div>
              <div className="text-4xl font-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                4.9<span className="text-gray-500 text-xl font-normal"> / 5.0</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">네이버 예약 실관람객 리뷰</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 p-8 hover:bg-white/[0.08] hover:border-[#006BD6]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 leading-loose mb-8 text-sm">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                  <div>
                    <div className="text-white font-black text-sm">{review.name}</div>
                    <div className="text-[#006BD6] text-[10px] tracking-widest uppercase mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{review.product}</div>
                  </div>
                  <span className="text-gray-600 text-xs">{review.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <a
              href="https://smartstore.naver.com/divershop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-white/20 text-white hover:bg-[#006BD6] hover:border-[#006BD6] px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              네이버 전체 후기 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. Contact & Map ── */}
      <section className="py-24 bg-white" id="contact">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span
                className="text-[#006BD6] font-bold text-xs tracking-[0.4em] uppercase mb-4 block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Location & Contact
              </span>
              <h2
                className="text-4xl font-black text-[#0a1628] mb-8 leading-tight"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                오시는 길 &amp;<br />
                <span className="text-[#006BD6]">문의하기</span>
              </h2>
              <div className="space-y-5 mb-10">
                {[
                  { label: "주소", value: "제주특별자치도 서귀포시 칠십리로 145 상가 102호" },
                  { label: "전화", value: "010-7414-3373" },
                  { label: "운영시간", value: "09:00 - 18:00 (연중무휴)" },
                  { label: "이메일", value: "ecodivers.jeju@gmail.com" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-6 border-b border-gray-100 pb-5">
                    <span className="text-[#006BD6] font-black text-[11px] tracking-widest uppercase w-20 flex-shrink-0 pt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{item.label}</span>
                    <span className="text-gray-600 text-sm leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="http://pf.kakao.com/_xgpxexnxj"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-[#FEE500] text-[#333] font-black text-sm tracking-wide hover:bg-yellow-400 transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  카카오톡 채널 문의
                </a>
                <a
                  href="tel:01074143373"
                  className="flex items-center gap-2 px-6 py-3 bg-[#006BD6] text-white font-black text-sm tracking-wide hover:bg-[#004fa3] transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  전화 문의
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="w-full min-h-[400px] bg-gray-100 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26693.2!2d126.5!3d33.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x350d23a0d3752b09%3A0x2994fb99b18abe37!2z7KCE7KO86rWs7Ja0!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="에코다이버스 지도"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
