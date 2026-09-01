"use client";

import BookingWidget from "@/components/BookingWidget";
import HeroSlider from "@/components/HeroSlider";
import PackageSection from "@/components/PackageSection";
import ProductPanes from "@/components/ProductPanes";
import FaqSection from "@/components/FaqSection";

const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const reviews = [
  {
    name: "다이빙초보",
    date: "2023.10.12",
    product: "체험다이빙",
    text: "쫄보라 걱정했는데 강사님이 계속 옆에 계셔서 거북이까지 보고 왔어요. 인생 경험이었습니다.",
  },
  {
    name: "바다사랑",
    date: "2023.09.28",
    product: "해녀체험",
    text: "친구들이랑 갔는데 사진도 예쁘게 많이 찍어주시고, 직접 잡은 해산물 먹는 재미가 컸어요.",
  },
  {
    name: "프로다이버",
    date: "2023.09.15",
    product: "펀다이빙",
    text: "제주 올 때마다 여기로 옵니다. 장비 상태 좋고 포인트 안내가 확실해요. 다음 달에 또 갑니다.",
  },
];

const promises = [
  {
    title: "강사가 곁에서 함께 들어갑니다",
    desc: "모든 체험은 전문 강사가 동행합니다. 물이 무섭다고 미리 말씀해 주시면, 그 속도에 맞춰 진행합니다.",
  },
  {
    title: "사진은 저희가 남겨 드립니다",
    desc: "체험다이빙과 스노클링 중에는 강사가 수중 사진을 찍어 그날 안에 전달합니다. 따로 요청하지 않으셔도 됩니다.",
  },
  {
    title: "바다 상황은 솔직하게 알려 드립니다",
    desc: "무리해서 진행하지 않습니다. 파도가 높은 날은 시간대를 옮기거나 일정을 미루자고 먼저 연락드립니다.",
  },
];

export default function Home() {
  return (
    <>
      <HeroSlider />

      <BookingWidget />

      <ProductPanes />

      <PackageSection />

      {/* 약속 — 체크리스트 대신 문장으로 */}
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <p className="eyebrow mb-4">Why EcoDivers</p>
          <h2 className="display-lg text-[#0b1b2b] max-w-2xl">
            바다보다 먼저,<br />
            <span className="text-[#006BD6]">사람을 봅니다</span>
          </h2>
          <p className="mt-5 text-[var(--ink-soft)] leading-relaxed max-w-xl">
            에코다이버스는 제주 서귀포에서 10년 넘게 같은 바다를 안내해 왔습니다. 화려한 문구 대신,
            매번 지키는 세 가지를 적어 둡니다.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 border-t border-[var(--line)] pt-10">
            {promises.map((p, i) => (
              <div key={i}>
                <div
                  className="text-[#006BD6] font-black text-sm mb-3"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  0{i + 1}
                </div>
                <h3 className="text-lg font-black text-[#0b1b2b] mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="community" className="py-20 md:py-28 bg-[#0b1b2b]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
            <div>
              <p className="eyebrow mb-4">Reviews</p>
              <h2 className="display-lg text-white">
                다녀간 분들의 <span className="text-[#60b8ff]">이야기</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <span className="text-white font-black text-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                4.9
              </span>
              <span className="text-gray-500 text-sm">네이버 예약 기준</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/10 p-7">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-sm mb-6">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-white font-bold text-sm">{r.name}</div>
                    <div
                      className="text-[#60b8ff] text-[10px] tracking-widest uppercase mt-0.5"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {r.product}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">{r.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a
              href="https://smartstore.naver.com/divershop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-white/25 text-white hover:bg-white hover:text-[#0b1b2b] px-8 py-4 text-sm font-black tracking-widest uppercase transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              네이버 후기 전체 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Map */}
      <section id="contact" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <p className="eyebrow mb-4">Location</p>
            <h2 className="display-lg text-[#0b1b2b] mb-8">
              오시는 길 &amp;<br />
              <span className="text-[#006BD6]">문의</span>
            </h2>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] mb-8">
              {[
                { label: "주소", value: "제주특별자치도 서귀포시 칠십리로 145 상가 102호" },
                { label: "전화", value: "010-7414-3373" },
                { label: "운영", value: "09:00 – 18:00 · 연중무휴" },
                { label: "이메일", value: "ecodivers.jeju@gmail.com" },
              ].map((it) => (
                <div key={it.label} className="flex gap-5 py-4">
                  <span
                    className="text-[#006BD6] font-black text-[11px] tracking-widest uppercase w-16 flex-shrink-0 pt-0.5"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {it.label}
                  </span>
                  <span className="text-[var(--ink-soft)] text-sm leading-relaxed">{it.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="http://pf.kakao.com/_Gjdbl/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-6 py-4 bg-[#FEE500] text-[#191919] font-black text-sm tracking-wide"
              >
                카카오톡 채널 문의
              </a>
              <a
                href="tel:01074143373"
                className="flex-1 text-center px-6 py-4 bg-[#006BD6] text-white font-black text-sm tracking-wide"
              >
                전화 문의
              </a>
            </div>
          </div>

          <div className="w-full h-[340px] md:h-[440px] bg-gray-100 overflow-hidden border border-[var(--line)]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26693.2!2d126.5!3d33.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x350d23a0d3752b09%3A0x2994fb99b18abe37!2z7KCE7KO86rWs7Ja0!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="에코다이버스 지도"
            />
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
