"use client";

import Link from "next/link";
import { Instagram, MessageCircle, Phone, MapPin, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* 사업자 정보 */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white mb-6 tracking-tight">에코다이버스 (EcoDivers)</h3>
            <div className="space-y-2 text-sm font-medium leading-relaxed">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>대표자: 임영훈</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-slate-500 rounded text-slate-400">№</div>
                <span>사업자등록번호: [대표님 번호 입력]</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>주소: 제주특별자치도 서귀포시 칠십리로 145 상가 102호</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>연락처: 010-9537-3373</span>
              </div>
            </div>
          </div>

          {/* 소셜 및 링크 */}
          <div className="flex flex-col md:items-end space-y-6">
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/ecodivers_jeju"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors shadow-lg group"
                title="인스타그램"
              >
                <Instagram className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="http://pf.kakao.com/_xgpxexnxj"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#FEE500] hover:text-black transition-colors shadow-lg group"
                title="카카오톡 채널"
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
            </div>
            
            <p className="text-xs text-slate-500 font-bold tracking-wider text-left md:text-right">
              Copyright © 2026 EcoDivers. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* 하단 구분선 및 어드민 링크 */}
        <div className="pt-8 border-t border-slate-800 flex justify-end">
          <a
            href="/admin/login/"
            className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em] font-black p-2"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
