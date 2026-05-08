"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/schedule");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-white text-sm animate-pulse">관리자 페이지로 이동 중...</div>
    </div>
  );
}
