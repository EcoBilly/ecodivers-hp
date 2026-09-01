"use client";

const NAVER = "https://smartstore.naver.com/divershop";

const packages = [
  {
    id: 1,
    title: "1인 투어 패키지",
    subtitle: "체험 + 제주 바다 전망 숙박 1박",
    price: "112,000",
    image: "/img/turtle-surface.jpg",
    tag: "혼자 여행",
    highlight: false,
  },
  {
    id: 2,
    title: "커플 다이빙 패키지",
    subtitle: "2인 체험 + 호텔 1박 + 수중 사진 촬영",
    price: "177,000",
    image: "/img/fish.jpg",
    tag: "가장 인기",
    highlight: true,
  },
  {
    id: 3,
    title: "올인원 자격증 캠프",
    subtitle: "오픈워터 교육 + 숙박 3박 + 식사",
    price: "420,000",
    image: "/img/whale.jpg",
    tag: "교육 전용",
    highlight: false,
  },
];

const stats = [
  { num: "3,000+", label: "함께한 손님" },
  { num: "4.9", label: "평균 별점" },
  { num: "10년+", label: "제주 운영" },
  { num: "PADI·AIDA", label: "공인 센터" },
];

export default function PackageSection() {
  return (
    <>
      {/* Stats */}
      <div className="bg-[#0b1b2b]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-x border-white/10">
          {stats.map((s, i) => (
            <div key={i} className="px-4 py-8 md:py-10 text-center">
              <div
                className="text-2xl md:text-4xl font-black text-white"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {s.num}
              </div>
              <div className="text-gray-400 text-xs md:text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <section id="packages" className="py-20 md:py-28 bg-[var(--surface)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="mb-10 md:mb-14">
            <p className="eyebrow mb-4">Packages</p>
            <h2 className="display-lg text-[#0b1b2b]">
              숙박까지 묶은 <span className="text-[#006BD6]">패키지</span>
            </h2>
            <p className="mt-4 text-[var(--ink-soft)] leading-relaxed max-w-xl">
              따로 알아볼 필요 없이 체험과 숙소를 한 번에. 예약은 네이버에서 바로 진행됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`flex flex-col bg-white border overflow-hidden ${
                  pkg.highlight ? "border-[#006BD6] shadow-[0_20px_60px_-25px_rgba(0,107,214,0.5)]" : "border-[var(--line)]"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 text-white ${
                      pkg.highlight ? "bg-[#006BD6]" : "bg-[#0b1b2b]"
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {pkg.tag}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-lg font-black text-[#0b1b2b] mb-1">{pkg.title}</h3>
                  <p className="text-sm text-[var(--ink-soft)] mb-6">{pkg.subtitle}</p>
                  <div className="mt-auto flex items-end justify-between pt-4 border-t border-[var(--line)]">
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">1인 기준</div>
                      <div className="text-2xl font-black text-[#006BD6]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {pkg.price}
                        <span className="text-sm font-bold ml-1">원~</span>
                      </div>
                    </div>
                    <a
                      href={NAVER}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#0b1b2b] hover:bg-[#006BD6] text-white text-[11px] font-black tracking-widest uppercase transition-colors"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      예약
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
