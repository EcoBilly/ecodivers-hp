"use client";

import { useState } from "react";

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("experience"); // experience, education, tour

  const tabs = [
    { id: "experience", label: "체험 예약" },
    { id: "education", label: "교육 예약" },
    { id: "tour", label: "투어 예약" },
  ];

  const products = {
    experience: ["해녀체험", "체험다이빙", "스노클링"],
    education: ["스쿠버 오픈워터", "스쿠버 어드밴스드", "프리다이빙 레벨1", "프리다이빙 레벨2"],
    tour: ["보트 펀다이빙", "섬 다이빙", "야간 다이빙"],
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 -mt-24 relative z-30">
      <div className="bg-[#002855]/90 backdrop-blur-md rounded-t-2xl p-1 inline-flex gap-1 border-x border-t border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-2xl rounded-b-2xl rounded-tr-2xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-6">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Product Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">상품 선택</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                {products[activeTab as keyof typeof products].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">날짜</label>
              <input 
                type="date" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Pax Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">인원(성인/아동)</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3.5 text-[14px] font-bold text-gray-700 outline-none">
                  {[...Array(10)].map((_, i) => <option key={i}>성인 {i}명</option>)}
                </select>
                <select className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3.5 text-[14px] font-bold text-gray-700 outline-none">
                  {[...Array(10)].map((_, i) => <option key={i}>아동 {i}명</option>)}
                </select>
              </div>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">예약자명</label>
              <input 
                type="text" 
                placeholder="성함 입력"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Contact Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">연락처</label>
              <input 
                type="tel" 
                placeholder="010-0000-0000"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full lg:w-48 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 lg:py-0 lg:h-[54px] rounded-xl text-lg shadow-xl shadow-blue-600/20 transform hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-tighter">
            BOOK NOW
          </button>
        </div>
        
        <p className="mt-4 text-[12px] text-gray-400 font-medium flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          실시간 예약 현황에 따라 일정이 변동될 수 있으며, 담당자가 확인 후 확정 문자를 발송해 드립니다.
        </p>
      </div>
    </div>
  );
}
