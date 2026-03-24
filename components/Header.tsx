"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo (Left Fixed) */}
        <Link
          href="/"
          className={`text-2xl md:text-3xl font-black tracking-tighter transition-colors duration-300 ${
            isScrolled ? "text-blue-600" : "text-white drop-shadow-md"
          }`}
        >
          EcoDivers.
        </Link>

        {/* Desktop Menu (Center-Right) */}
        <nav className="hidden lg:flex items-center gap-10">
          <div className={`flex gap-8 font-bold text-[15px] transition-colors duration-300 ${
            isScrolled ? "text-gray-700" : "text-white drop-shadow-md"
          }`}>
            <Link href="#products" className="hover:text-blue-500">상품안내</Link>
            <Link href="#booking" className="hover:text-blue-500">예약</Link>
            <Link href="#community" className="hover:text-blue-500">커뮤니티</Link>
            <Link href="#about" className="hover:text-blue-500">소개</Link>
          </div>

          {/* Utilities (Right) */}
          <div className={`flex items-center gap-6 border-l pl-8 ml-4 transition-all duration-300 ${
            isScrolled ? "border-gray-200 text-gray-500" : "border-white/30 text-white/90"
          }`}>
            <div className="flex gap-3 text-[12px] font-bold">
              <button className="hover:text-blue-400">KOR</button>
              <span className="opacity-30">|</span>
              <button className="hover:text-blue-400">ENG</button>
            </div>
            <Link
              href="/admin/login"
              className={`text-[13px] font-bold px-4 py-1.5 rounded-full border transition-all ${
                isScrolled 
                ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white" 
                : "border-white text-white hover:bg-white hover:text-blue-600"
              }`}
            >
              로그인
            </Link>
          </div>
        </nav>

        {/* Hamburger (Mobile) */}
        <button
          className={`lg:hidden transition-colors duration-300 ${
            isScrolled ? "text-gray-900" : "text-white drop-shadow-md"
          } focus:outline-none`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="lg:hidden bg-white absolute top-full left-0 w-full flex flex-col items-center py-10 gap-6 text-gray-900 font-bold text-lg shadow-2xl border-t border-gray-100">
          <Link href="#products" onClick={() => setIsOpen(false)}>상품안내</Link>
          <Link href="#booking" onClick={() => setIsOpen(false)}>예약</Link>
          <Link href="#community" onClick={() => setIsOpen(false)}>커뮤니티</Link>
          <Link href="#about" onClick={() => setIsOpen(false)}>소개</Link>
          <div className="flex gap-4 mt-4 py-4 border-t w-full justify-center">
            <button className="text-sm text-gray-500">KOR</button>
            <button className="text-sm text-gray-500">ENG</button>
            <Link href="/admin/login" className="text-sm text-blue-600 font-bold ml-4">로그인</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
