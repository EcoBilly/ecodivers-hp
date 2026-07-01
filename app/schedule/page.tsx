"use client";

import React, { useState, useEffect } from "react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay
} from "date-fns";
import { ko } from "date-fns/locale";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Booking Interface
interface Booking {
  id: string;
  name: string;
  pax: number;
  category: string;
  date: string;
  time: string;
  checkedIn: boolean;
  phone?: string;
  memo?: string;
  paymentMethod?: string;
  cancelled?: boolean;
  cameraRental?: boolean;
}

export default function PublicSchedulePage() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [summaryModal, setSummaryModal] = useState<{
    date: string;
    categorySummary: Record<string, Record<string, number>>;
    dayBookings: Booking[];
  } | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  // Firebase 실시간 구독 (읽기 전용)
  useEffect(() => {
    setIsClient(true);
    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Booking))
        .filter((b: Booking & { deleted?: boolean }) => !b.deleted && !b.cancelled);
      setBookings(all);
      setLastUpdated(new Date());
      setLoading(false);
    }, (error: unknown) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 모달 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (summaryModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [summaryModal]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(b => b.date === format(date, "yyyy-MM-dd"));
  };

  const openDayModal = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayBookings = bookings.filter(b => b.date === dateStr);

    const categorySummary: Record<string, Record<string, number>> = {};
    dayBookings.forEach(b => {
      if (!categorySummary[b.category]) categorySummary[b.category] = {};
      categorySummary[b.category][b.time] = (categorySummary[b.category][b.time] || 0) + b.pax;
    });

    setSummaryModal({ date: dateStr, categorySummary, dayBookings });
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {lastUpdated
                ? `${format(lastUpdated, 'HH:mm:ss')} 기준 • 실시간`
                : '데이터 로딩 중...'}
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">에코다이버스 일정표</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">📅 직원 공유용 — 조회 전용</p>
          </div>

          {/* 범례 */}
          <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300 inline-block" />
              일반
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
              체크인 완료
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              만석 (10명+)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" />
              만석+체크인
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-t-2xl border-x border-t border-gray-200 p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-xl"
            >
              ‹
            </button>
            <h2 className="text-2xl font-black text-blue-900 tracking-tight">
              {format(currentDate, "yyyy년 MM월", { locale: ko })}
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-xl"
            >
              ›
            </button>
          </div>
          <button
            onClick={goToday}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all text-sm"
          >
            오늘
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-b-2xl shadow-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div
                key={day}
                className={`p-4 text-center font-extrabold text-sm ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-700'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 로딩 상태 */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">일정 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 bg-white">
              {calendarDays.map((day) => {
                const dayBookings = getBookingsForDate(day);

                const timeSlotPax: Record<string, number> = {};
                dayBookings.forEach(b => {
                  timeSlotPax[b.time] = (timeSlotPax[b.time] || 0) + b.pax;
                });

                return (
                  <div
                    key={day.toString()}
                    onClick={() => openDayModal(day)}
                    className={`min-h-[140px] border-b border-r border-gray-100 p-2 cursor-pointer transition relative
                      ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 opacity-50' : 'bg-white hover:bg-blue-50/40'}
                      ${isSameDay(day, new Date()) ? 'ring-2 ring-inset ring-blue-400' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                          {dayBookings.reduce((s, b) => s + b.pax, 0)}명
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[100px]">
                      {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => {
                        const isSlotOverloaded = (timeSlotPax[booking.time] || 0) >= 10;
                        const isCheckedIn = booking.checkedIn;

                        let appearance = "bg-gray-100 border-gray-300 text-gray-700";
                        let badge = "";

                        if (isSlotOverloaded && isCheckedIn) {
                          appearance = "bg-yellow-400 border-yellow-500 text-yellow-900 shadow-sm";
                          badge = "⚠️";
                        } else if (isSlotOverloaded) {
                          appearance = "bg-red-500 border-red-600 text-white shadow-sm";
                          badge = "🚨";
                        } else if (isCheckedIn) {
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
                            className={`text-xs p-1.5 rounded-md border font-bold truncate ${appearance}`}
                            title={`${booking.time} | ${booking.name}님 (${booking.pax}명) - ${booking.category}`}
                          >
                            <span className="mr-1">{booking.time}</span>
                            {badge && <span className="mr-1">{badge}</span>}
                            <span>[{shortBlockCat}]</span> {booking.name}({booking.pax}명)
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 이번 달 통계 카드 */}
        {!loading && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(() => {
              const ym = format(currentDate, 'yyyy-MM');
              const mb = bookings.filter(b => b.date.startsWith(ym));
              const totalPax = mb.reduce((s, b) => s + b.pax, 0);
              const checkedIn = mb.filter(b => b.checkedIn).length;
              const today = format(new Date(), 'yyyy-MM-dd');
              const todayBookings = bookings.filter(b => b.date === today);
              const todayPax = todayBookings.reduce((s, b) => s + b.pax, 0);
              return (
                <>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">이번달 예약</p>
                    <p className="text-2xl font-black text-blue-900">{mb.length}<span className="text-sm font-bold text-gray-500 ml-1">건</span></p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">이번달 총 인원</p>
                    <p className="text-2xl font-black text-blue-900">{totalPax}<span className="text-sm font-bold text-gray-500 ml-1">명</span></p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">체크인 완료</p>
                    <p className="text-2xl font-black text-green-600">{checkedIn}<span className="text-sm font-bold text-gray-500 ml-1">건</span></p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">오늘 인원</p>
                    <p className="text-2xl font-black text-cyan-600">{todayPax}<span className="text-sm font-bold text-gray-500 ml-1">명</span></p>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 당일 예약 상세 모달 (읽기 전용) */}
      {summaryModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSummaryModal(null)}
        >
          <div
            className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200 font-medium">{summaryModal.date}</p>
                <h3 className="text-lg font-black">
                  {format(new Date(summaryModal.date + 'T00:00:00'), 'M월 d일 (EEE)', { locale: ko })} 일정
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  총 {summaryModal.dayBookings.reduce((s, b) => s + b.pax, 0)}명
                </p>
              </div>
              <button
                onClick={() => setSummaryModal(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center transition"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {summaryModal.dayBookings.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm">이 날의 예약이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {summaryModal.dayBookings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(booking => {
                      let shortCat = "";
                      if (booking.category.includes("해녀")) shortCat = "해녀체험";
                      else if (booking.category.includes("호핑")) shortCat = "호핑투어";
                      else if (booking.category.includes("스노클링")) shortCat = "스노클링";
                      else if (booking.category.includes("체험")) shortCat = "체험다이빙";
                      else if (booking.category.includes("교육") || booking.category.includes("자격")) shortCat = "자격증교육";
                      else shortCat = booking.category;

                      return (
                        <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                          <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${booking.checkedIn ? 'bg-blue-500' : 'bg-gray-200'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{booking.time}</span>
                              <span className="text-xs text-gray-500 truncate">{shortCat}</span>
                              {booking.checkedIn && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">✅ 체크인</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-800">{booking.name}</span>
                              <span className="text-xs text-gray-400">{booking.pax}명</span>
                              {booking.paymentMethod && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{booking.paymentMethod}</span>
                              )}
                              {booking.cameraRental && (
                                <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">📷 카메라</span>
                              )}
                            </div>
                            {booking.memo && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">📝 {booking.memo}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {summaryModal.dayBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 mb-3">시간대별 요약</p>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400">
                        <th className="pb-2 font-bold">카테고리</th>
                        <th className="pb-2 font-bold">시간</th>
                        <th className="pb-2 font-bold text-right">인원</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summaryModal.categorySummary).map(([cat, times]) => {
                        let displayName = cat;
                        if (cat.includes('해녀')) displayName = '해녀체험';
                        else if (cat.includes('호핑')) displayName = '호핑투어';
                        else if (cat.includes('스노클링')) displayName = '스노클링';
                        else if (cat.includes('체험')) displayName = '체험다이빙';
                        else if (cat.includes('교육') || cat.includes('자격')) displayName = '자격증 교육';
                        const sortedTimes = Object.keys(times).sort();
                        return (
                          <React.Fragment key={cat}>
                            {sortedTimes.map((t, tidx) => (
                              <tr key={t} className="border-b border-gray-50 last:border-0">
                                <td className="py-2 font-bold text-blue-700 text-xs">{tidx === 0 ? displayName : ''}</td>
                                <td className="py-2 text-gray-600 text-xs">{t}</td>
                                <td className={`py-2 text-right font-black text-xs ${times[t] >= 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                  {times[t]}명{times[t] >= 10 ? ' 🚨' : ''}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => setSummaryModal(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
