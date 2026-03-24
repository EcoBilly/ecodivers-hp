"use client";

import { useState, useEffect } from "react";
import { auth, getUserRole } from "@/lib/authService";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettlementPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user);
        if (role !== "admin") {
          alert("권한이 없습니다. 관리자만 접근 가능합니다.");
          router.push("/admin/schedule");
        }
      } else {
        router.push("/admin/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 border-l-4 border-blue-600 pl-4">정산 및 매출 현황</h1>
            <p className="text-gray-500 mt-2 font-medium">관리자 전용 수익 분석 대시보드</p>
          </div>
          <Link href="/admin/schedule" className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition">
            일정표로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-500 mb-1">이번 달 총 매출</p>
            <h3 className="text-3xl font-black text-blue-600">₩ 0</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-500 mb-1">오늘의 예약 건수</p>
            <h3 className="text-3xl font-black text-orange-500">0 건</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-500 mb-1">누적 예약 인원</p>
            <h3 className="text-3xl font-black text-emerald-600">0 명</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600 text-3xl font-bold">∑</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">상세 매출 데이터 집계 중</h2>
          <p className="text-gray-500 max-w-md">실시간 예약 데이터를 기반으로 한 상세 정산 기능이 곧 활성화됩니다. 현재는 전체 요약 정보만 조회 가능합니다.</p>
        </div>
      </div>
    </div>
  );
}
