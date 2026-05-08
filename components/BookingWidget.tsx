"use client";

import { useState } from "react";

const tabConfig = [
  {
    id: "experience",
    label: "체험 예약",
    icon: "🤿",
    products: ["해녀체험", "체험다이빙 (반나절)", "호핑투어 스노클링"],
  },
  {
    id: "education",
    label: "교육 예약",
    icon: "📚",
    products: [
      "스쿠버 오픈워터",
      "스쿠버 어드밴스드",
      "프리다이빙 레벨 1",
      "프리다이빙 레벨 2",
      "레스큐 다이버",
    ],
  },
  {
    id: "tour",
    label: "펀다이빙",
    icon: "🌊",
    products: ["보트 펀다이빙 (2탱크)", "보트 펀다이빙 (3탱크)", "야간 다이빙", "섬 다이빙 투어"],
  },
];

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("experience");

  const activeConfig = tabConfig.find((t) => t.id === activeTab)!;

  return (
    <div className="w-full" id="booking">
      {/* Ticker Banner */}
      <div className="bg-[#006BD6] py-2.5 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(4)].map((_, ri) => (
            <div key={ri} className="flex items-center gap-8 mr-8">
              {[
                "✔ 당일 예약 가능",
                "✔ 전문 강사 1:1 케어",
                "✔ 장비 완비",
                "✔ 수중 촬영 서비스",
                "✔ PADI / AIDA 공인 교육",
                "✔ 제주 최북단 맑은 바다",
                "✔ 100% 안전 보장",
              ].map((item, i) => (
                <span
                  key={i}
                  className="text-white text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white border-t-4 border-[#006BD6] shadow-2xl shadow-black/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-8 py-5 text-sm font-bold tracking-wide transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-[#006BD6] border-b-2 border-[#006BD6]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Row */}
          <div className="py-6 flex flex-col lg:flex-row items-stretch gap-0">
            {/* Product */}
            <div className="flex-1 flex flex-col border-r border-gray-100 pr-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                상품 선택
              </label>
              <select className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none py-2 cursor-pointer">
                {activeConfig.products.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex-1 flex flex-col border-r border-gray-100 px-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                날짜 선택
              </label>
              <input
                type="date"
                className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none py-2"
              />
            </div>

            {/* People */}
            <div className="flex-1 flex flex-col border-r border-gray-100 px-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                인원 (성인 / 아동)
              </label>
              <div className="flex gap-2 py-2">
                <select className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none">
                  {[...Array(10)].map((_, i) => (
                    <option key={i}>성인 {i}명</option>
                  ))}
                </select>
                <span className="text-gray-300 self-center">/</span>
                <select className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none">
                  {[...Array(10)].map((_, i) => (
                    <option key={i}>아동 {i}명</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Name */}
            <div className="flex-1 flex flex-col border-r border-gray-100 px-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                예약자명
              </label>
              <input
                type="text"
                placeholder="성함 입력"
                className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none py-2 placeholder:text-gray-300"
              />
            </div>

            {/* Phone */}
            <div className="flex-1 flex flex-col px-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                연락처
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                className="flex-1 bg-transparent text-gray-800 font-bold text-base border-0 outline-none focus:outline-none py-2 placeholder:text-gray-300"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center pl-6 pt-4 lg:pt-0">
              <button
                className="bg-[#006BD6] hover:bg-[#004fa3] text-white font-black px-10 py-4 text-sm tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/20 whitespace-nowrap"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                예약 문의
              </button>
            </div>
          </div>

          <div className="pb-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006BD6] animate-pulse inline-block" />
            담당자 확인 후 예약 확정 문자를 발송해 드립니다. 당일 예약 가능하며, 자세한 문의는 카카오톡 채널을 이용해 주세요.
          </div>
        </div>
      </div>
    </div>
  );
}
