"use client";

import Link from "next/link";

const packages = [
  {
    id: 1,
    title: "(1인) 에코다이버스 투어 패키지",
    subtitle: "제주 바다 전망 숙박 포함",
    period: "2025.06.01 - 2026.06.30",
    price: "112,000",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: "1인 패키지",
    tagColor: "#006BD6",
    highlight: false,
  },
  {
    id: 2,
    title: "(2인) 커플 다이빙 패키지",
    subtitle: "호텔 숙박권 및 전문 수중 사진 촬영",
    period: "2025.06.01 - 2026.06.30",
    price: "177,000",
    image:
      "https://images.unsplash.com/photo-1544552866-d3ed42536fcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: "Best",
    tagColor: "#e63946",
    highlight: true,
  },
  {
    id: 3,
    title: "올인원 자격증 캠프",
    subtitle: "오픈워터 교육 + 숙박 + 식사",
    period: "2025.06.01 - 2026.06.30",
    price: "420,000",
    image:
      "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: "교육 전용",
    tagColor: "#2a9d8f",
    highlight: false,
  },
];

const stats = [
  { num: "3,000+", label: "누적 고객수", en: "CUSTOMERS" },
  { num: "4.9", label: "평균 리뷰 점수", en: "RATING" },
  { num: "10+", label: "운영 경력", en: "YEARS" },
  { num: "100%", label: "안전 보장", en: "SAFETY" },
];

export default function PackageSection() {
  return (
    <>
      {/* Stats Bar */}
      <div className="bg-[#0a1628] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="px-8 py-10 text-center group hover:bg-[#006BD6]/10 transition-colors duration-300"
              >
                <div
                  className="text-4xl md:text-5xl font-black text-white mb-1 group-hover:text-[#60b8ff] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {stat.num}
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">
                  {stat.label}
                </div>
                <div
                  className="text-[10px] tracking-[0.3em] text-white/20 uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {stat.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Section */}
      <section
        className="py-28 bg-[#f7f9fc] relative overflow-hidden"
        id="packages"
      >
        {/* Background decorative element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#006BD6]/30 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span
                className="text-[#006BD6] font-bold text-xs tracking-[0.4em] uppercase mb-4 block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Special Deals
              </span>
              <h2
                className="text-4xl md:text-5xl font-black text-[#0a1628] leading-tight"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                에코다이버스
                <br />
                <span className="text-[#006BD6]">추천 패키지</span>
              </h2>
            </div>
            <p className="text-gray-500 font-medium md:text-right md:max-w-xs leading-relaxed">
              제주를 더 완벽하게 즐기는<br />에코다이버스만의 특별한 패키지
            </p>
          </div>

          {/* Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group relative bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                  pkg.highlight
                    ? "shadow-2xl shadow-[#006BD6]/15 ring-2 ring-[#006BD6]/20"
                    : "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10"
                }`}
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Tag */}
                  <div
                    className="absolute top-4 left-0 px-5 py-1.5 text-white text-[11px] font-black tracking-widest uppercase"
                    style={{
                      backgroundColor: pkg.tagColor,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {pkg.tag}
                  </div>

                  {pkg.highlight && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#e63946] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-7">
                  {/* Title */}
                  <h3
                    className="text-lg font-black text-[#0a1628] mb-1.5 leading-tight"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                  >
                    {pkg.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-5">{pkg.subtitle}</p>

                  {/* Period */}
                  <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400 font-medium">{pkg.period}</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium mb-0.5">가격 (1인)</div>
                      <div
                        className="text-2xl font-black text-[#006BD6]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {pkg.price}
                        <span className="text-sm font-bold ml-1">원~</span>
                      </div>
                    </div>
                    <Link
                      href={`/package/${pkg.id}`}
                      className="px-5 py-2.5 bg-[#0a1628] hover:bg-[#006BD6] text-white text-[11px] font-black tracking-widest uppercase transition-all duration-300"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      DETAIL
                    </Link>
                  </div>
                </div>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#006BD6] group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>

          {/* View All */}
          <div className="text-center mt-14">
            <Link
              href="/packages"
              className="inline-flex items-center gap-3 border border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              모든 패키지 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
