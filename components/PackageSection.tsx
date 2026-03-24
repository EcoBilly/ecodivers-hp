"use client";

import Link from "next/link";

const packages = [
  {
    id: 1,
    title: "(1인) 서프홀릭 투어 패키지",
    subtitle: "송정 바다 전망 블루캐슬 숙박 포함",
    period: "2025.06.01 - 2026.06.30",
    price: "112,000",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=400",
    tag: "1인 패키지"
  },
  {
    id: 2,
    title: "(2인) 커플 다이빙 패키지",
    subtitle: "호텔 숙박권 및 전문 사진 촬영",
    period: "2025.06.01 - 2026.06.30",
    price: "177,000",
    image: "https://images.unsplash.com/photo-1544552866-d3ed42536fcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=400",
    tag: "2인 패키지"
  },
  {
    id: 3,
    title: "올인원 자격증 캠프",
    subtitle: "오픈워터 교육 + 숙박 + 식사",
    period: "2025.06.01 - 2026.06.30",
    price: "420,000",
    image: "https://images.unsplash.com/photo-1518182170546-076616fdacdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=400",
    tag: "교육 전용"
  }
];

export default function PackageSection() {
  return (
    <section className="py-24 bg-blue-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-3 block">Special Deals</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">에코다이버스 추천 패키지</h2>
          <p className="text-gray-500 font-medium">제주를 더 완벽하게 즐기는 최고의 방법</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="group bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full">{pkg.tag}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{pkg.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{pkg.subtitle}</p>
                <div className="flex flex-col gap-1 mb-6 border-y py-4 border-gray-50">
                  <span className="text-[11px] font-bold text-gray-400">이용기간</span>
                  <span className="text-sm font-bold text-gray-600 tracking-tighter">{pkg.period}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-2xl font-black text-blue-600">{pkg.price}원</span>
                  </div>
                  <Link href={`/package/${pkg.id}`} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors">
                    상세보기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="px-12 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 font-bold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
            더보기
          </button>
        </div>
      </div>
    </section>
  );
}
