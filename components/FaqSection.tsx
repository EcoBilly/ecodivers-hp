"use client";

import { useState } from "react";

const faqs = [
  {
    q: "당일에 예약해도 되나요?",
    a: "네. 자리가 있으면 당일도 가능합니다. 다만 물때와 날씨에 따라 시간대가 달라질 수 있어, 오시기 전에 카카오톡 채널로 한 번 확인해 주시면 가장 정확합니다.",
  },
  {
    q: "수영을 전혀 못하는데 참여할 수 있을까요?",
    a: "호핑투어와 해녀체험은 구명조끼를 입고 강사가 곁에서 함께 이동하기 때문에 수영을 못해도 괜찮습니다. 체험다이빙도 강사가 1:1로 붙어 진행하니 물이 무서운 분도 많이 다녀가십니다.",
  },
  {
    q: "비가 오거나 파도가 높으면 어떻게 되나요?",
    a: "기상으로 진행이 어려우면 일정을 미루거나 전액 환불해 드립니다. 결정은 저희가 당일 아침 바다 상황을 보고 먼저 연락드립니다. 손님 사정으로 인한 취소는 하루 전까지 연락 주시면 전액 환불됩니다.",
  },
  {
    q: "아이와 함께 가려는데 나이 제한이 있나요?",
    a: "호핑투어·해녀체험은 만 5세부터, 체험다이빙은 만 10세부터 참여할 수 있습니다. 보호자 동반이 필요하며, 아동 요금이 따로 있습니다.",
  },
  {
    q: "장비는 따로 챙겨가야 하나요?",
    a: "슈트, 마스크, 오리발, 구명조끼 등 물에서 쓰는 장비는 모두 무료로 대여됩니다. 수영복과 세면도구, 수건만 준비해 오시면 됩니다.",
  },
  {
    q: "주차는 어디에 하면 되나요?",
    a: "센터 앞 상가 공용 주차장을 이용하시면 됩니다. 자리가 찰 때는 인근 공영주차장을 안내해 드리니 도착 전 연락 주세요.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white border-t border-[var(--line)]">
      <div className="max-w-[900px] mx-auto px-4 md:px-6">
        <div className="mb-10 md:mb-14">
          <p className="eyebrow mb-4">FAQ</p>
          <h2 className="display-lg text-[#0b1b2b]">
            자주 묻는 <span className="text-[#006BD6]">질문</span>
          </h2>
        </div>

        <div className="border-t border-[var(--line)]">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[var(--line)]">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base md:text-lg font-black text-[#0b1b2b]">{f.q}</span>
                  <span
                    className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border border-[var(--line)] transition-transform ${
                      isOpen ? "rotate-45 bg-[#006BD6] border-[#006BD6] text-white" : "text-[#0b1b2b]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div className={`acc-panel ${isOpen ? "open" : ""}`}>
                  <div>
                    <p className="pb-6 pr-10 text-sm md:text-[15px] text-[var(--ink-soft)] leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-gray-400">
          더 궁금한 점은{" "}
          <a href="http://pf.kakao.com/_Gjdbl/chat" target="_blank" rel="noopener noreferrer" className="text-[#006BD6] font-bold underline underline-offset-2">
            카카오톡 채널
          </a>
          로 편하게 물어보세요.
        </p>
      </div>
    </section>
  );
}
