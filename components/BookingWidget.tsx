"use client";

import { useState } from "react";

const KAKAO = "http://pf.kakao.com/_Gjdbl/chat";

const tabConfig = [
  {
    id: "experience",
    label: "체험",
    products: [
      "무인도 호핑투어 스노클링",
      "해녀체험",
      "체험다이빙 (비치 다이빙)",
      "체험다이빙 (섬 다이빙)",
    ],
  },
  {
    id: "education",
    label: "교육 · 자격증",
    products: [
      "오픈워터 다이버",
      "어드밴스드 다이버",
      "오픈워터+어드밴스드 다이버",
      "레스큐 다이버",
      "마스터 다이버",
      "스쿠버다이버 강사과정",
      "레벨1 프리다이버",
      "레벨2 프리다이버",
      "레벨1+2 프리다이버",
      "레벨3 프리다이버",
      "레벨4 프리다이버",
      "프리다이버 강사과정",
    ],
  },
  {
    id: "tour",
    label: "펀다이빙",
    products: ["비치 다이빙", "섬 다이빙"],
  },
];

type Status = "idle" | "sending" | "done" | "error";

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("experience");
  const active = tabConfig.find((t) => t.id === activeTab)!;

  const [product, setProduct] = useState(active.products[0]);
  const [date, setDate] = useState("");
  const [adult, setAdult] = useState(2);
  const [child, setChild] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); // 허니팟
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const pickTab = (id: string) => {
    setActiveTab(id);
    const next = tabConfig.find((t) => t.id === id)!;
    setProduct(next.products[0]);
    setStatus("idle");
    setErrMsg("");
  };

  const submit = async () => {
    if (status === "sending") return;
    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setErrMsg("예약자명과 연락처를 입력해 주세요.");
      return;
    }

    const people = `성인 ${adult}명${child ? ` / 아동 ${child}명` : ""}`;
    setStatus("sending");
    setErrMsg("");

    try {
      const res = await fetch("/api/booking-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: active.label,
          product,
          date,
          people,
          name: name.trim(),
          phone: phone.trim(),
          company,
        }),
      });

      if (res.ok) {
        setStatus("done");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data?.error) {
        setStatus("error");
        setErrMsg(data.error);
        return;
      }
      throw new Error(data?.error || `HTTP ${res.status}`);
    } catch {
      // 전송 실패 시 카카오 상담 채널로 유도
      const summary =
        `[예약 문의]\n프로그램: ${product}\n날짜: ${date || "미정"}\n` +
        `인원: ${people}\n예약자: ${name} (${phone})`;
      try {
        await navigator.clipboard?.writeText(summary);
      } catch {}
      window.open(KAKAO, "_blank", "noopener,noreferrer");
      setStatus("error");
      setErrMsg(
        "지금 접수가 원활하지 않아 카카오톡 채널을 열었습니다. 입력하신 내용이 복사되어 있어요 — 붙여넣기만 해주시면 됩니다."
      );
    }
  };

  return (
    <section id="booking" className="relative z-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* 카드가 히어로 위로 살짝 겹침 */}
        <div className="-mt-12 md:-mt-16 bg-white border border-[var(--line)] shadow-[0_30px_80px_-30px_rgba(11,27,43,0.35)]">
          {/* Tabs */}
          <div className="flex">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => pickTab(tab.id)}
                className={`flex-1 px-3 py-4 text-[13px] md:text-sm font-bold tracking-wide transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#0b1b2b] text-white"
                    : "bg-white text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Product */}
              <label className="sm:col-span-2 lg:col-span-1 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">프로그램</span>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="border border-[var(--line)] px-3 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6]"
                >
                  {active.products.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>

              {/* Date */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">날짜</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-[var(--line)] px-3 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6]"
                />
              </label>

              {/* People */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">인원</span>
                <div className="flex gap-2">
                  <select
                    value={adult}
                    onChange={(e) => setAdult(+e.target.value)}
                    className="flex-1 border border-[var(--line)] px-2 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6]"
                  >
                    {[...Array(11)].map((_, n) => (
                      <option key={n} value={n}>성인 {n}</option>
                    ))}
                  </select>
                  <select
                    value={child}
                    onChange={(e) => setChild(+e.target.value)}
                    className="flex-1 border border-[var(--line)] px-2 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6]"
                  >
                    {[...Array(11)].map((_, n) => (
                      <option key={n} value={n}>아동 {n}</option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Name */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">예약자명</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="성함"
                  className="border border-[var(--line)] px-3 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6] placeholder:text-gray-300 placeholder:font-normal"
                />
              </label>

              {/* Phone */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">연락처</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="border border-[var(--line)] px-3 py-3 text-sm font-bold text-[#0b1b2b] outline-none focus:border-[#006BD6] placeholder:text-gray-300 placeholder:font-normal"
                />
              </label>
            </div>

            {/* 허니팟 (사용자에게 숨김) */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
              aria-hidden
            />

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={submit}
                disabled={status === "sending"}
                className="flex-1 bg-[#006BD6] hover:bg-[#00457f] disabled:opacity-60 text-white font-black py-4 text-sm tracking-widest uppercase transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {status === "sending"
                  ? "전송 중…"
                  : status === "done"
                  ? "접수 완료"
                  : "예약 요청"}
              </button>
              <a
                href={KAKAO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center border border-[#0b1b2b] text-[#0b1b2b] hover:bg-[#0b1b2b] hover:text-white font-black py-4 text-sm tracking-widest uppercase transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                카카오톡 상담
              </a>
            </div>

            <p
              className={`mt-3 text-xs leading-relaxed ${
                status === "error" ? "text-red-500" : "text-gray-400"
              }`}
            >
              {status === "done"
                ? "예약 요청이 접수되었습니다. 담당자가 예약 현황을 확인한 뒤 문자로 연락드립니다. 당일 예약도 가능합니다."
                : status === "error"
                ? errMsg
                : "‘예약 요청’을 누르면 입력하신 내용이 담당자에게 바로 전달됩니다. 당일 예약도 가능합니다."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
