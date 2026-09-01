"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "프로그램", href: "/#diving" },
  { label: "패키지", href: "/#packages" },
  { label: "후기", href: "/#community" },
  { label: "자주 묻는 질문", href: "/#faq" },
  { label: "오시는 길", href: "/#contact" },
  { label: "AI 사진보정", href: "/underwater-enhancer" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  if (pathname?.startsWith("/connect") || pathname?.startsWith("/manage-connect-secret")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector(".scroll-snap-container");
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 80);
      } else {
        setIsScrolled(window.scrollY > 80);
      }
    };

    const scrollContainer = document.querySelector(".scroll-snap-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-[0_2px_30px_rgba(0,0,0,0.08)] py-0"
            : "bg-transparent py-0"
        }`}
      >
        {/* Top Utility Bar - 모바일에서 슬림하게 */}
        <div
          className={`border-b transition-all duration-500 ${
            isScrolled
              ? "border-gray-100 py-1"
              : "border-white/10 py-1"
          }`}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
            {/* 주소 - 데스크탑에서만 표시 */}
            <div
              className={`hidden md:flex items-center gap-6 text-[11px] font-medium tracking-wider transition-colors ${
                isScrolled ? "text-gray-500" : "text-white/70"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                제주특별자치도 서귀포시 칠십리로 145
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                010-7414-3373
              </span>
            </div>

            {/* 모바일 - 전화번호만 */}
            <a
              href="tel:01074143373"
              className={`flex md:hidden items-center gap-1.5 text-[11px] font-medium tracking-wider transition-colors ${
                isScrolled ? "text-gray-500" : "text-white/70"
              }`}
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              010-7414-3373
            </a>

            {/* 우측 링크들 */}
            <div
              className={`flex items-center gap-3 text-[11px] font-bold tracking-wider transition-colors ${
                isScrolled ? "text-gray-500" : "text-white/70"
              }`}
            >
              {/* 데스크탑에서만 INSTAGRAM, KAKAOTALK 표시 */}
              <a
                href="https://www.instagram.com/ecodivers_jeju"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block hover:text-[#006BD6] transition-colors py-1"
              >
                INSTAGRAM
              </a>
              <span className="hidden md:block opacity-30">|</span>
              <a
                href="http://pf.kakao.com/_Gjdbl/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block hover:text-[#006BD6] transition-colors py-1"
              >
                KAKAOTALK
              </a>
              <span className="hidden md:block opacity-30">|</span>
              <Link
                href="/login"
                className="hover:text-[#006BD6] transition-colors py-1"
              >
                LOGIN
              </Link>
              <span className="opacity-30">|</span>
              <Link
                href="/admin/schedule"
                className="hover:text-[#006BD6] transition-colors py-1 pr-1 md:pr-0"
              >
                ADMIN
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className={`transition-all duration-500 ${
                  isScrolled ? "text-[#006BD6]" : "text-white"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-en text-lg md:text-xl font-black tracking-tight leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    ECO
                  </span>
                  <span
                    className="font-en text-lg md:text-xl font-black tracking-tight leading-none opacity-70"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    DIVERS
                  </span>
                </div>
                <div
                  className={`text-[7px] md:text-[8px] tracking-[0.4em] uppercase font-medium mt-0.5 transition-colors ${
                    isScrolled ? "text-gray-400" : "text-white/50"
                  }`}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  JEJU DIVE CENTER
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-5 py-5 text-[13px] font-bold tracking-wide transition-all duration-300 group ${
                    isScrolled
                      ? "text-gray-700 hover:text-[#006BD6]"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                      isScrolled ? "bg-[#006BD6]" : "bg-white"
                    }`}
                  />
                </Link>
              ))}
              <a
                href="https://smartstore.naver.com/divershop"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-6 px-6 py-2.5 bg-[#006BD6] hover:bg-[#004fa3] text-white text-[12px] font-bold tracking-widest uppercase rounded-none transition-all duration-300 shadow-lg shadow-blue-600/20"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                NAVER BOOK
              </a>
              <Link
                href="/booking/qr"
                className="ml-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-[12px] font-bold tracking-widest uppercase rounded-none transition-all duration-300 shadow-lg shadow-gray-900/20"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                GLOBAL BOOK
              </Link>
            </nav>

            {/* Hamburger */}
            <button
              className={`lg:hidden transition-colors duration-300 ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="메뉴 열기"
            >
              <div className="w-7 flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${
                    isOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${
                    isOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${
                    isOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 bg-white ${
            isOpen ? "max-h-screen shadow-xl" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col py-4 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-6 py-3.5 text-gray-800 font-bold text-sm hover:text-[#006BD6] hover:bg-blue-50 transition-all border-b border-gray-50"
              >
                {item.label}
              </Link>
            ))}
            {/* 모바일 메뉴 하단 - SNS 링크 + 예약 버튼 */}
            <div className="px-6 pt-4 pb-3 flex gap-3 text-[11px] font-bold text-gray-400 border-b border-gray-50">
              <a href="https://www.instagram.com/ecodivers_jeju" target="_blank" rel="noopener noreferrer" className="hover:text-[#006BD6]">INSTAGRAM</a>
              <span className="opacity-30">|</span>
              <a href="http://pf.kakao.com/_Gjdbl/chat" target="_blank" rel="noopener noreferrer" className="hover:text-[#006BD6]">KAKAOTALK</a>
            </div>
            <div className="px-6 pt-4 pb-1 flex flex-col gap-2">
              <a
                href="https://smartstore.naver.com/divershop"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 bg-[#006BD6] text-white text-center text-sm font-bold tracking-wider"
              >
                NAVER BOOK
              </a>
              <Link
                href="/booking/qr"
                onClick={() => setIsOpen(false)}
                className="py-3 bg-gray-900 text-white text-center text-sm font-bold tracking-wider"
              >
                GLOBAL BOOK
              </Link>
            </div>
            <div className="px-6 pt-1 pb-4 flex">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 border-2 border-[#006BD6] text-[#006BD6] text-center text-sm font-bold tracking-wider"
              >
                LOGIN
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Floating Action Buttons (데스크톱 전용 — 모바일은 하단 예약 바 사용) */}
      <div className="hidden lg:flex fixed right-4 bottom-6 z-40 flex-col gap-3">
        <a
          href="http://pf.kakao.com/_Gjdbl/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 md:w-12 md:h-12 bg-[#FEE500] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="카카오톡 문의"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="#000">
            <path d="M12 3C6.48 3 2 6.55 2 10.92c0 2.73 1.74 5.15 4.37 6.61L5.3 21l4.57-2.25c.7.1 1.42.15 2.13.15 5.52 0 10-3.55 10-7.92C22 6.55 17.52 3 12 3z"/>
          </svg>
        </a>
        <a
          href="tel:01074143373"
          className="w-11 h-11 md:w-12 md:h-12 bg-[#006BD6] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="전화 문의"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </a>
        <button
          onClick={() => {
            const el = document.querySelector(".scroll-snap-container");
            if (el) el.scrollTo({ top: 0, behavior: "smooth" });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-11 h-11 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="맨 위로"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </>
  );
}
