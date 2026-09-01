"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KAKAO = "http://pf.kakao.com/_Gjdbl/chat";

/** 모바일 전용 하단 고정 예약 바 — 어느 위치에서도 한 번에 예약으로. */
export default function MobileBookingBar() {
  const pathname = usePathname();
  const show = pathname === "/";

  useEffect(() => {
    document.body.classList.toggle("has-mobile-bar", show);
    return () => document.body.classList.remove("has-mobile-bar");
  }, [show]);

  if (!show) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex safe-bottom bg-white border-t border-[var(--line)] shadow-[0_-8px_30px_-12px_rgba(11,27,43,0.25)]">
      <a
        href={KAKAO}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-[38%] py-4 bg-[#FEE500] text-[#191919] text-sm font-black tracking-wide"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.48 3 2 6.55 2 10.92c0 2.73 1.74 5.15 4.37 6.61L5.3 21l4.57-2.25c.7.1 1.42.15 2.13.15 5.52 0 10-3.55 10-7.92C22 6.55 17.52 3 12 3z" />
        </svg>
        문의
      </a>
      <a
        href="#booking"
        className="flex-1 flex items-center justify-center py-4 bg-[#006BD6] text-white text-sm font-black tracking-widest uppercase"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        날짜 보고 예약하기
      </a>
    </div>
  );
}
