"use client";

import React, { useState, useEffect } from "react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay
} from "date-fns";
import { ko } from "date-fns/locale";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveBackup, exportToJson, exportToCsv, restoreFromJson } from "@/lib/backupService";
import { auth, getUserRole, type UserRole } from "@/lib/authService";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Booking Interface
interface Booking {
  id: string;
  name: string;
  pax: number;
  category: string; // e.g. "해녀체험", "호핑투어", "체험다이빙"
  date: string; // "YYYY-MM-DD"
  time: string; // "10:00", "12:00", etc.
  checkedIn: boolean; // 온라인 체크인 여부
  phone?: string;
  memo?: string;
  paymentMethod?: string;
  createdAt?: unknown;
}

export default function AdminSchedulePage() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSaving, setIsSaving] = useState(false); // To prevent multiple click duplicates

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [isCustomPaymentMode, setIsCustomPaymentMode] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const router = useRouter();

  // Settings
  const categories = ["호핑투어", "해녀체험", "스노클링", "체험 다이빙", "자격증 교육"];
  const paymentOptions = ["네이버", "마이리얼트립", "현금결제", "카드결제"];

  const getTimeOptions = (cat: string) => {
    if (cat.includes("호핑") || cat.includes("스노클링")) return ["10:00", "12:00", "14:00", "16:00"];
    if (cat.includes("해녀")) return ["09:00", "11:00", "13:00", "15:00"];
    if (cat.includes("체험") || cat.includes("다이빙")) return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  };

  const formatPhoneNumber = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length < 11) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  // 1. Firebase 데이터 실시간 구독 (onSnapshot)
  useEffect(() => {
    setIsClient(true);
    // 1-1. Auth 상태 확인
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await getUserRole(currentUser);
        setUserRole(role);
      } else {
        // [임시] 주석 처리: 개발 중 리다이렉트 방지
        // router.push("/admin/login");
      }
    });

    const q = collection(db, "bookings");
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(fetchedBookings);
    }, (error: unknown) => {
      console.error("Firestore Error:", error);
      setBookings([
        { id: "1", name: "홍길동", pax: 12, category: "해녀체험", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", checkedIn: false },
        { id: "2", name: "김에코", pax: 4, category: "호핑투어&스노클링", date: format(new Date(), "yyyy-MM-dd"), time: "14:00", checkedIn: true },
        { id: "3", name: "이바다", pax: 2, category: "체험 다이빙", date: format(addMonths(new Date(), 0), "yyyy-MM-dd"), time: "12:00", checkedIn: true },
      ]);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [router]);

  // 캘린더 날짜 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 이전/다음 달 이동
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  // 2. 예약 데이터 가공 및 지능형 상태별 색상 로직
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(b => b.date === format(date, "yyyy-MM-dd"));
  };

  // 모달 열기
  const openEditModal = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBooking({ ...booking });
    setIsCustomTimeMode(!getTimeOptions(booking.category).includes(booking.time));
    setIsCustomCategoryMode(!categories.includes(booking.category));
    setIsCustomPaymentMode(booking.paymentMethod ? !paymentOptions.includes(booking.paymentMethod) : false);
    setIsModalOpen(true);
  };

  // 신규 임시 추가 모달 (날짜 클릭 시)
  const openNewModal = (date: Date) => {
    const defaultCat = categories[0];
    setEditingBooking({
      id: "new",
      name: "",
      pax: 1,
      category: defaultCat,
      date: format(date, "yyyy-MM-dd"),
      time: getTimeOptions(defaultCat)[0],
      checkedIn: false,
      phone: "",
      memo: "",
      paymentMethod: paymentOptions[0]
    });
    setIsCustomTimeMode(false);
    setIsCustomCategoryMode(false);
    setIsCustomPaymentMode(false);
    setIsModalOpen(true);
  };

  // Firebase 설정이 제대로 되어 있는지 하드체크
  const isFirebaseConfigured =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes("your_");

  // 타임아웃 래퍼 함수 (Firebase 연결 지연 시 세이브 스턱 방지)
  const withTimeout = (promise: Promise<unknown>, timeoutMs: number = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
    ]);
  };

  // 모달 저장 (Firestore Update)
  const handleSave = async () => {
    if (!editingBooking || isSaving) return;
    setIsSaving(true);

    // 1. Firebase 설정이 안 되어 있으면 즉시 Mock 모드로 동작
    if (!isFirebaseConfigured) {
      console.log("Mock Mode: Skip Firebase call");
      if (editingBooking.id === "new") {
        setBookings([...bookings, { ...editingBooking, id: Date.now().toString() }]);
      } else {
        setBookings(bookings.map(b => b.id === editingBooking.id ? editingBooking : b));
      }
      setIsModalOpen(false);
      setIsSaving(false);
      return;
    }

    try {
      console.log("Firestore: Attempting to save...", editingBooking);
      if (editingBooking.id === "new") {
        const { id: _unusedId, ...dataToSave } = editingBooking;
        void _unusedId;
        const finalData = { ...dataToSave, createdAt: serverTimestamp() };
        await withTimeout(addDoc(collection(db, "bookings"), finalData));
        console.log("Firestore: New booking created successfully");
        await saveBackup({ ...finalData, action: "create" });
      } else {
        const docRef = doc(db, "bookings", editingBooking.id);
        const { id: _unusedId, ...updateData } = editingBooking;
        void _unusedId;
        await withTimeout(updateDoc(docRef, updateData));
        console.log("Firestore: Booking updated successfully");
        await saveBackup({ ...editingBooking, action: "update" });
      }
      
      if (typeof window !== "undefined") {
        window.alert("저장되었습니다.");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Firestore 저장 실패:", error);
      if (typeof window !== "undefined") {
        window.alert("저장 실패: " + (error.message || "알 수 없는 오류"));
      }
      // Do NOT proceed to close modal if it failed to save persistently
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("백업 파일을 복구하시겠습니까? 기존 데이터에 추가됩니다.")) return;

    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result as string;
      const success = await restoreFromJson(content);
      if (success) {
        alert("데이터 복구가 완료되었습니다.");
      } else {
        alert("복구에 실패했습니다. 파일 형식을 확인해주세요.");
      }
      setIsSaving(false);
    };
    reader.readAsText(file);
  };

  // 모달 삭제 (Firestore Delete)
  const handleDelete = async () => {
    if (!editingBooking || editingBooking.id === "new" || isSaving) return;
    if (!confirm("정말 이 예약을 삭제하시겠습니까?")) return;

    setIsSaving(true);

    if (!isFirebaseConfigured) {
      setBookings(bookings.filter(b => b.id !== editingBooking.id));
      setIsModalOpen(false);
      setIsSaving(false);
      return;
    }

    try {
      const docRef = doc(db, "bookings", editingBooking.id);
      try {
        await withTimeout(updateDoc(docRef, { deleted: true }));
      } catch {
        setBookings(bookings.filter(b => b.id !== editingBooking.id));
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error("삭제 실패:", error);
      setBookings(bookings.filter(b => b.id !== editingBooking.id));
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Top Header & Settings */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">관리자 전용 일정표</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">네이버/마이리얼트립 실시간 예약 연동 대시보드</p>
          </div>
          <div className="flex flex-wrap gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm font-bold text-gray-700 flex items-center px-2">시스템 관리</span>
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition">타임슬롯</button>
            {userRole === "admin" && (
              <>
                <button
                  onClick={() => exportToJson(bookings)}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold hover:bg-green-100 transition"
                >
                  JSON 백업
                </button>
                <button
                  onClick={() => exportToCsv(bookings)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition"
                >
                  CSV 내보내기
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="JSON 백업 파일로 복구"
                  />
                  <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-100 transition">
                    백업 복구
                  </button>
                </div>
                <Link href="/admin/settlement" className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100 transition">
                  정산/매출
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-t-2xl border-x border-t border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">&lt;</button>
            <h2 className="text-2xl font-black text-blue-900 tracking-tight">
              {format(currentDate, "yyyy년 MM월", { locale: ko })}
            </h2>
            <button onClick={nextMonth} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">&gt;</button>
          </div>
          <button onClick={goToday} className="px-6 py-2 bg-blue-600 hover:bg-blue-800 text-white font-extrabold rounded-lg shadow-md transition-all">
            오늘
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-b-2xl shadow-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div key={day} className={`p-4 text-center font-extrabold text-sm ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 bg-white">
            {calendarDays.map((day) => {
              const dayBookings = getBookingsForDate(day);

              // 시간대별 인원 합산 로직
              const timeSlotPax: Record<string, number> = {};
              dayBookings.forEach(b => {
                timeSlotPax[b.time] = (timeSlotPax[b.time] || 0) + b.pax;
              });

              // 카테고리별/시간대별 요약 로직 추가 (툴팁용)
              const categorySummary: Record<string, Record<string, number>> = {};
              dayBookings.forEach(b => {
                if (!categorySummary[b.category]) categorySummary[b.category] = {};
                categorySummary[b.category][b.time] = (categorySummary[b.category][b.time] || 0) + b.pax;
              });

              return (
                <div
                  key={day.toString()}
                  onClick={() => openNewModal(day)}
                  className={`min-h-[140px] border-b border-r border-gray-100 p-2 cursor-pointer transition relative group/day
                    ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 opacity-50' : 'bg-white hover:bg-blue-50/50'}
                    ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                      ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'text-gray-700'}
                    `}>
                      {format(day, 'd')}
                    </span>

                    {/* 일일 현황 요약 툴팁 정보 아이콘 */}
                    {dayBookings.length > 0 && (
                      <div className="relative group/tooltip flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                        <span className="text-gray-400 font-bold cursor-help text-xs">ⓘ</span>
                        {/* Tooltip Content */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-50 w-64 bg-white text-gray-800 text-xs rounded-lg shadow-2xl border border-gray-200 p-0 overflow-hidden pointer-events-none">
                          <div className="bg-blue-600 text-white px-3 py-2 font-black text-center border-b border-blue-700">
                            {format(day, 'yyyy-MM-dd')} 현황 요약
                          </div>
                          <div className="p-3 bg-white">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-gray-100 italic text-[10px] text-gray-400">
                                  <th className="pb-1 font-bold">카테고리</th>
                                  <th className="pb-1 font-bold">시간</th>
                                  <th className="pb-1 font-bold text-right">인원</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(categorySummary).map(([cat, times]) => {
                                  let displayName = cat;
                                  if (cat.includes("해녀")) displayName = "해녀체험";
                                  else if (cat.includes("호핑")) displayName = "호핑투어";
                                  else if (cat.includes("스노클링")) displayName = "스노클링";
                                  else if (cat.includes("체험")) displayName = "체험다이빙";
                                  else if (cat.includes("교육") || cat.includes("자격")) displayName = "자격증 교육";

                                  const sortedTimes = Object.keys(times).sort();
                                  const totalPax = sortedTimes.reduce((sum, t) => sum + times[t], 0);

                                  return (
                                    <React.Fragment key={cat}>
                                      {sortedTimes.map((t, tidx) => (
                                        <tr key={t} className="border-b border-gray-50 last:border-0">
                                          <td className="py-1.5 font-bold text-blue-700">{tidx === 0 ? displayName : ""}</td>
                                          <td className="py-1.5 text-gray-600">{t}</td>
                                          <td className={`py-1.5 text-right font-black ${times[t] >= 10 ? "text-red-500" : "text-gray-900"}`}>
                                            {times[t]}명{times[t] >= 10 ? " 🚨" : ""}
                                          </td>
                                        </tr>
                                      ))}
                                      <tr className="bg-blue-50/50">
                                        <td colSpan={2} className="py-1 px-1 text-[10px] font-bold text-gray-400">SUBTOTAL</td>
                                        <td className="py-1 text-right font-black text-blue-600 text-[11px]">{totalPax}명</td>
                                      </tr>
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 예약 블록 렌더링 */}
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                    {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => {

                      const isSlotOverloaded = (timeSlotPax[booking.time] || 0) >= 10;
                      const isCheckedIn = booking.checkedIn;

                      let appearance = "bg-gray-100 border-gray-300 text-gray-700";
                      let badge = "";

                      if (isSlotOverloaded) {
                        // 1순위: 해당 시간대 전체 인원 10명 이상 (Red)
                        appearance = "bg-red-500 border-red-600 text-white shadow-sm";
                        badge = "🚨";
                      } else if (isCheckedIn) {
                        // 2순위: 개별 예약 체크인 완료 (Blue)
                        appearance = "bg-blue-600 border-blue-700 text-white shadow-sm";
                        badge = "✅";
                      }

                      let shortBlockCat = "";
                      if (booking.category.includes("해녀")) shortBlockCat = "해녀";
                      else if (booking.category.includes("호핑")) shortBlockCat = "호핑";
                      else if (booking.category.includes("스노클링")) shortBlockCat = "스노클";
                      else if (booking.category.includes("체험")) shortBlockCat = "체험";
                      else if (booking.category.includes("교육") || booking.category.includes("자격")) shortBlockCat = "교육";
                      else shortBlockCat = booking.category.slice(0, 2);

                      return (
                        <div
                          key={booking.id}
                          onClick={(e) => openEditModal(booking, e)}
                          className={`text-xs p-1.5 rounded-md border font-bold truncate transition-all hover:brightness-110 ${appearance}`}
                          title={`${booking.time} | ${booking.name}님 (${booking.pax}명) - ${booking.category}`}
                        >
                          <span className="mr-1">{booking.time}</span>
                          {badge && <span className="mr-1">{badge}</span>}
                          <span>[{shortBlockCat}]</span> {booking.name}({booking.pax}명)
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-blue-900 border-l-4 border-blue-600 pl-3">
                {editingBooking.id === "new" ? "신규 일정 추가" : "일정 상세 및 수정"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
            </div>

            <div className="space-y-4">
              {/* 온라인 체크인 관리 (기존 예약인 경우에만 표시) */}
              {editingBooking.id !== "new" && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-900">온라인 체크인 관리</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${editingBooking.checkedIn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {editingBooking.checkedIn ? '동의 완료' : '미완료'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/checkin?id=${editingBooking.id}`;
                        void navigator.clipboard.writeText(link);
                        alert("체크인 링크가 복사되었습니다.");
                      }}
                      className="flex items-center justify-center gap-2 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <span>링크 복사</span>
                    </button>
                    <button
                      onClick={() => {
                        alert("솔라피 API 연동 대기 중입니다. (API 키 등록 필요)");
                      }}
                      className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                    >
                      <span>알림톡 전송</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">날짜</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={e => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">카테고리</label>
                  <div className="flex gap-2">
                    {!isCustomCategoryMode ? (
                      <select
                        value={editingBooking.category}
                        onChange={e => {
                          if (e.target.value === "custom") {
                            setIsCustomCategoryMode(true);
                            setEditingBooking({ ...editingBooking, category: "" });
                          } else {
                            const newCat = e.target.value;
                            const newOptions = getTimeOptions(newCat);
                            setEditingBooking({
                              ...editingBooking,
                              category: newCat,
                              time: newOptions.includes(editingBooking.time) ? editingBooking.time : newOptions[0]
                            });
                            setIsCustomTimeMode(false);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="custom">직접 입력...</option>
                      </select>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={editingBooking.category}
                          onChange={e => setEditingBooking({ ...editingBooking, category: e.target.value })}
                          placeholder="새 카테고리 입력"
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            setIsCustomCategoryMode(false);
                            const defaultCat = categories[0];
                            const newOptions = getTimeOptions(defaultCat);
                            setEditingBooking({
                              ...editingBooking,
                              category: defaultCat,
                              time: newOptions.includes(editingBooking.time) ? editingBooking.time : newOptions[0]
                            });
                          }}
                          className="shrink-0 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                        >
                          목록
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">시간 (수동 입력 가능)</label>
                  <div className="flex gap-2">
                    {!isCustomTimeMode ? (
                      <select
                        value={editingBooking.time}
                        onChange={e => {
                          if (e.target.value === "custom") {
                            setIsCustomTimeMode(true);
                          } else {
                            setEditingBooking({ ...editingBooking, time: e.target.value });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {getTimeOptions(editingBooking.category).map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="custom">직접 입력...</option>
                      </select>
                    ) : (
                      <>
                        <input
                          type="time"
                          value={editingBooking.time}
                          onChange={e => setEditingBooking({ ...editingBooking, time: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            setIsCustomTimeMode(false);
                            const defaultOptions = getTimeOptions(editingBooking.category);
                            setEditingBooking({
                              ...editingBooking,
                              time: defaultOptions.includes(editingBooking.time) ? editingBooking.time : defaultOptions[0]
                            });
                          }}
                          className="shrink-0 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                        >
                          목록
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">예약자명</label>
                  <input
                    type="text"
                    value={editingBooking.name}
                    onChange={e => setEditingBooking({ ...editingBooking, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="성함 입력"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">예약 인원</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBooking.pax}
                    onChange={e => setEditingBooking({ ...editingBooking, pax: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">연락처</label>
                  <input
                    type="text"
                    value={editingBooking.phone || ""}
                    onChange={e => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setEditingBooking({ ...editingBooking, phone: formatted });
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">결제방법</label>
                <div className="flex gap-2">
                  {!isCustomPaymentMode ? (
                    <select
                      value={editingBooking.paymentMethod || ""}
                      onChange={e => {
                        if (e.target.value === "custom") {
                          setIsCustomPaymentMode(true);
                          setEditingBooking({ ...editingBooking, paymentMethod: "" });
                        } else {
                          setEditingBooking({ ...editingBooking, paymentMethod: e.target.value });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      <option value="custom">직접 입력...</option>
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={editingBooking.paymentMethod || ""}
                        onChange={e => setEditingBooking({ ...editingBooking, paymentMethod: e.target.value })}
                        placeholder="결제방법 직접 입력"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          setIsCustomPaymentMode(false);
                          setEditingBooking({ ...editingBooking, paymentMethod: paymentOptions[0] });
                        }}
                        className="shrink-0 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                      >
                        목록
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">메모</label>
                <textarea
                  value={editingBooking.memo || ""}
                  onChange={e => setEditingBooking({ ...editingBooking, memo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]"
                  placeholder="특이사항 입력"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="checkedIn"
                  checked={editingBooking.checkedIn}
                  onChange={e => setEditingBooking({ ...editingBooking, checkedIn: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-600 cursor-pointer"
                />
                <label htmlFor="checkedIn" className="text-sm font-bold text-gray-700 cursor-pointer">
                  ✅ 온라인 체크인 완료
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {editingBooking.id !== "new" && (
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition shrink-0"
                >
                  삭제
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-2 px-4 py-3 bg-blue-600 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장 및 적용"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
