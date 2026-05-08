"use client";

import Link from "next/link";
import { Instagram, MessageCircle, Phone, MapPin, Mail } from "lucide-react";

const footerLinks = {
  서비스: ["체험다이빙", "해녀체험", "호핑투어", "펀다이빙", "교육/라이센스", "패키지"],
  정보: ["에코다이버스 소개", "오시는 길", "이용약관", "개인정보처리방침"],
  커뮤니티: ["다이빙 갤러리", "후기 게시판", "자주 묻는 질문"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-gray-400">
      {/* CTA Banner */}
      <div className="bg-[#006BD6] py-14 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="text-white/70 text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Ready to Dive?
            </p>
            <h3
              className="text-3xl md:text-4xl font-black text-white leading-tight"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              제주 바다와의 만남,<br />지금 예약하세요
            </h3>
          </div>
          <div className="flex gap-3">
            <a
              href="#booking"
              className="px-8 py-4 bg-white text-[#006BD6] font-black text-sm tracking-widest uppercase hover:bg-[#0a1628] hover:text-white transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              예약하기
            </a>
            <a
              href="http://pf.kakao.com/_xgpxexnxj"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-black text-sm tracking-widest uppercase hover:bg-white hover:text-[#006BD6] transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              카카오 문의
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div
                className="text-white font-black text-2xl tracking-tight mb-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                ECO<span className="text-[#006BD6]">DIVERS</span>
              </div>
              <div
                className="text-gray-600 text-[9px] tracking-[0.5em] uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                JEJU DIVE CENTER
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
              제주도 최북단 맑고 깨끗한 바다에서<br />
              최고의 다이빙 경험을 제공합니다.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              {[
                {
                  icon: <MapPin className="w-4 h-4 flex-shrink-0 text-[#006BD6]" />,
                  text: "제주특별자치도 서귀포시 칠십리로 145 상가 102호",
                },
                {
                  icon: <Phone className="w-4 h-4 flex-shrink-0 text-[#006BD6]" />,
                  text: "010-7414-3373",
                },
                {
                  icon: <Mail className="w-4 h-4 flex-shrink-0 text-[#006BD6]" />,
                  text: "ecodivers.jeju@gmail.com",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/ecodivers_jeju"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#006BD6] hover:bg-[#006BD6]/10 transition-all duration-300 group"
                title="인스타그램"
              >
                <Instagram className="w-4 h-4 text-gray-500 group-hover:text-[#006BD6]" />
              </a>
              <a
                href="http://pf.kakao.com/_xgpxexnxj"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#FEE500] hover:bg-[#FEE500]/10 transition-all duration-300 group"
                title="카카오톡"
              >
                <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-[#FEE500]" />
              </a>
              <a
                href="https://smartstore.naver.com/divershop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#03C75A] hover:bg-[#03C75A]/10 transition-all duration-300 group"
                title="네이버 스마트스토어"
              >
                <svg className="w-4 h-4 text-gray-500 group-hover:text-[#03C75A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-white font-black text-sm tracking-wider uppercase mb-6 pb-3 border-b border-white/5"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-gray-500 text-sm hover:text-white hover:pl-1 transition-all duration-200 block"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 pb-24 md:pb-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs tracking-wide text-center md:text-left">
            Copyright © 2026 EcoDivers. All Rights Reserved.
            <span className="mx-2 text-gray-700 hidden sm:inline">|</span>
            <br className="sm:hidden" />
            사업자등록번호: [번호 입력]
            <span className="mx-2 text-gray-700 hidden sm:inline">|</span>
            <br className="sm:hidden" />
            대표: 임영훈
          </p>
          <Link
            href="/admin/schedule"
            className="text-[10px] text-gray-700 hover:text-[#006BD6] transition-colors tracking-[0.3em] uppercase font-bold md:pr-16 p-3 -m-3 md:m-0 md:p-0"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
