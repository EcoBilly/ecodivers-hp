"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// 개인정보 필터링 후 예약 현황만 추출
const fetchPublicBookings = async (dates: string[]) => {
  const results: { date: string; time: string; category: string; pax: number }[] = [];
  for (const date of dates) {
    try {
      const q = query(collection(db, "bookings"), where("date", "==", date));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        // 이름, 연락처, 결제 정보 등 개인정보 일체 제외
        results.push({
          date: d.date,
          time: d.time,
          category: d.category,
          pax: d.pax,
        });
      });
    } catch (_) { /* Firestore 오류 시 조용히 skip */ }
  }
  return results;
};

// 메시지에서 날짜 추출
const extractDates = (msg: string): string[] => {
  const today = new Date();
  const dates: string[] = [];
  if (msg.includes("오늘") || msg.includes("today")) dates.push(format(today, "yyyy-MM-dd"));
  if (msg.includes("내일") || msg.includes("tomorrow")) dates.push(format(addDays(today, 1), "yyyy-MM-dd"));
  if (msg.includes("모레")) dates.push(format(addDays(today, 2), "yyyy-MM-dd"));

  // "5월 6일", "5/6" 같은 패턴 추출
  const patterns = [
    /(\d{1,2})월\s*(\d{1,2})일/g,
    /(\d{1,2})\/(\d{1,2})/g,
  ];
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(msg)) !== null) {
      const month = m[1].padStart(2, "0");
      const day = m[2].padStart(2, "0");
      const year = today.getFullYear();
      dates.push(`${year}-${month}-${day}`);
    }
  }

  // 날짜 언급 없이 가능 여부를 묻는 경우 → 오늘 + 내일
  const availKeywords = ["가능", "예약", "자리", "남은", "여유", "몇 명", "몇명", "인원"];
  if (dates.length === 0 && availKeywords.some(k => msg.includes(k))) {
    dates.push(format(today, "yyyy-MM-dd"));
    dates.push(format(addDays(today, 1), "yyyy-MM-dd"));
  }
  return [...new Set(dates)];
};

// 최대 정원 (프로그램별)
const MAX_PAX: Record<string, number> = {
  호핑투어: 12,
  스노클링: 12,
  해녀체험: 8,
  체험다이빙: 6,
  체험: 6,
  자격증: 4,
};
const getMaxPax = (category: string) => {
  for (const [key, val] of Object.entries(MAX_PAX)) {
    if (category.includes(key)) return val;
  }
  return 10;
};

// 예약 현황을 자연어로 변환
const formatBookingContext = (
  bookings: { date: string; time: string; category: string; pax: number }[]
): string => {
  if (bookings.length === 0) return "조회된 예약 없음 (모든 시간대 예약 가능)";

  const grouped: Record<string, Record<string, { cat: string; pax: number }[]>> = {};
  bookings.forEach(b => {
    if (!grouped[b.date]) grouped[b.date] = {};
    if (!grouped[b.date][b.time]) grouped[b.date][b.time] = [];
    grouped[b.date][b.time].push({ cat: b.category, pax: b.pax });
  });

  let ctx = "";
  for (const [date, times] of Object.entries(grouped)) {
    const d = parseISO(date);
    ctx += `\n[${format(d, "M월 d일 (E)", { locale: ko })}]\n`;
    for (const [time, items] of Object.entries(times).sort()) {
      items.forEach(({ cat, pax }) => {
        const max = getMaxPax(cat);
        const remaining = Math.max(0, max - pax);
        ctx += `  - ${time} ${cat}: ${pax}명 예약됨, 잔여 약 ${remaining}자리 (정원 ${max}명)\n`;
      });
    }
  }
  return ctx.trim();
};

const SYSTEM_PROMPT = `당신은 제주도 다이빙 센터 '에코다이버스'의 친절한 AI 상담원입니다.

[센터 정보]
- 위치: 제주특별자치도 서귀포시 칠십리로 145
- 연락처: 010-7414-3373
- 카카오톡: http://pf.kakao.com/_xgpxexnxj
- 인스타그램: @ecodivers_jeju

[운영 프로그램]
- 호핑투어: 스노클링 포함, 최대 12명, 10:00/12:00/14:00/16:00
- 해녀체험: 최대 8명, 09:00/11:00/13:00/15:00
- 체험다이빙: 최대 6명, 09:00~18:00 (시간 협의)
- 자격증 교육: PADI·AIDA 공인, 별도 문의

[답변 규칙]
1. 예약 현황 데이터가 제공되면 정확한 수치로 안내하세요.
2. 개인 고객 이름, 연락처, 결제 금액, 정산 데이터는 절대 언급하지 마세요.
3. 예약 확정이 필요하면 카카오톡 또는 전화로 안내하세요.
4. 모르는 사항은 솔직히 모른다고 하고 연락처를 안내하세요.
5. 답변은 친근하고 간결하게, 이모지를 적절히 사용하세요.
6. 한국어로 답변하세요.`;

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! 에코다이버스 AI 상담원입니다 🤿\n예약 문의, 프로그램 안내, 잔여 자리 확인 등 무엇이든 물어보세요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (pathname?.startsWith("/connect") || pathname?.startsWith("/manage-connect-secret")) {
    return null;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 1. 날짜 감지 → Firestore 조회
      const dates = extractDates(text);
      let bookingContext = "";
      if (dates.length > 0) {
        setFetchingData(true);
        const bookings = await fetchPublicBookings(dates);
        bookingContext = formatBookingContext(bookings);
        setFetchingData(false);
      }

      // 2. Gemini 호출용 메시지 히스토리 구성
      const history = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const userParts: { text: string }[] = [{ text: text }];
      if (bookingContext) {
        userParts.push({
          text: `\n\n[실시간 예약 현황 데이터 - 이 정보를 바탕으로 답변하세요]\n${bookingContext}`,
        });
      }
      history.push({ role: "user", parts: userParts });

      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "AI 서비스 설정이 필요합니다. 관리자에게 문의해 주세요.\n\n직접 문의: 010-7414-3373 📞",
        }]);
        return;
      }

      // 3. Gemini 1.5 Flash REST API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "죄송합니다, 답변을 생성하지 못했습니다.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "일시적인 오류가 발생했습니다 😅\n직접 문의 주시면 빠르게 도와드리겠습니다!\n📞 010-7414-3373",
      }]);
    } finally {
      setLoading(false);
      setFetchingData(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "오늘 호핑투어 자리 있나요?",
    "내일 해녀체험 예약 가능한가요?",
    "체험다이빙 가격이 어떻게 되나요?",
    "자격증 교육 문의",
  ];

  return (
    <>
      {/* 챗봇 열기 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-4 bottom-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
        } bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800`}
        title="AI 상담"
        aria-label="AI 챗봇 열기"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        {/* 펄스 효과 */}
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
      </button>

      {/* 챗 패널 */}
      <div
        className={`fixed left-0 bottom-0 z-50 w-full sm:w-96 sm:left-4 sm:bottom-6 transition-all duration-400 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full sm:translate-y-8 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden h-[90vh] sm:h-[580px]">
          
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤿</div>
              <div>
                <p className="text-white font-black text-sm leading-tight">에코다이버스 AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-blue-100 text-[10px] font-medium">실시간 예약 현황 연동</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🤿</div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">🤿</div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  {fetchingData ? (
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      예약 현황 조회 중...
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 질문 (초기 메시지만 있을 때) */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <p className="text-[10px] text-gray-400 font-medium mb-1.5">자주 묻는 질문</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 0); }}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium hover:bg-blue-100 transition border border-blue-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 입력창 */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="전송"
            >
              <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          <p className="text-center text-[9px] text-gray-300 pb-2 bg-white">Powered by Gemini · 실시간 Firestore 연동</p>
        </div>
      </div>

      {/* 모바일 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
