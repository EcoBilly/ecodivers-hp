"use client";

import React, { useState, useEffect } from "react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay
} from "date-fns";
import { ko } from "date-fns/locale";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
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
  category: string;
  date: string;
  time: string;
  checkedIn: boolean;
  phone?: string;
  memo?: string;
  paymentMethod?: string;
  createdAt?: unknown;
  cancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
  cameraRental?: boolean;
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
  // 탭: 'list'=당일예약목록, 'form'=입력/수정폼
  const [modalTab, setModalTab] = useState<'list' | 'form'>('list');
  const [selectedDate, setSelectedDate] = useState<string>('');
  // 현황 요약 모달
  const [summaryModal, setSummaryModal] = useState<{ date: string; categorySummary: Record<string, Record<string, number>> } | null>(null);
  const router = useRouter();
  const [pageTab, setPageTab] = useState<'calendar' | 'settlement'>('calendar');
  const [cancelledBookings, setCancelledBookings] = useState<Booking[]>([]);
  const [programPrices, setProgramPrices] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('ecodivers_prices') || '{}'); } catch { return {}; }
    }
    return {};
  });
  const [cancelModal, setCancelModal] = useState<{ booking: Booking } | null>(null);
  const [cancelReason, setCancelReason] = useState('고객변심');
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', category: '', time: '' });
  const [formEndDate, setFormEndDate] = useState(''); // 날짜 범위 등록용 종료일

  // 텔레그램 봇 상태
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [telegramInput, setTelegramInput] = useState<string>('');
  const [botStatus, setBotStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [showBotSetup, setShowBotSetup] = useState(false);
  const telegramChatIdRef = React.useRef<string>('');

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
        // 비로그인 시 로그인 페이지로 이동 (이미 로그인된 세션이면 Firebase가 자동으로 currentUser를 반환하므로 정상 통과)
        router.push("/login?redirect=/admin/schedule");
      }
    });

    const q = collection(db, "bookings");
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Booking))
        .filter((b: Booking & { deleted?: boolean }) => !b.deleted);
      setBookings(all.filter(b => !b.cancelled));
      setCancelledBookings(all.filter(b => !!b.cancelled));
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

  // 모달 오픈 시 배경 스크롤 방지 (html + body 둘 다 처리해야 iOS Safari 포함 전체 브라우저에서 동작)
  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  // 텔레그램 봇 연동 로직
  const bookingsRef = React.useRef(bookings);
  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);

  // localStorage에서 chat_id 초기 로드
  useEffect(() => {
    const stored = localStorage.getItem('ecodivers_telegram_chat_id');
    if (stored) {
      setTelegramChatId(stored);
      setTelegramInput(stored);
      telegramChatIdRef.current = stored;
      setBotStatus('connected');
    }
  }, []);

  // chat_id 수동 저장
  const saveTelegramChatId = async () => {
    const id = telegramInput.trim();
    if (!id) return;
    localStorage.setItem('ecodivers_telegram_chat_id', id);
    setTelegramChatId(id);
    telegramChatIdRef.current = id;
    setBotStatus('connected');

    // 연결 테스트 메시지 발송
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    if (token) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: id,
            text: '✅ <b>에코다이버스 봇 연결 완료!</b>\n이제부터 예약 알림과 일정 변경 소식을 받을 수 있습니다.\n하단 [📅 내일 일정] 버튼을 눌러보세요.',
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [[{ text: '📅 내일 일정' }]],
              resize_keyboard: true,
              persistent: true
            }
          })
        });
        const data = await res.json();
        if (!data.ok) {
          alert('전송 실패: Chat ID를 확인해주세요.\n' + (data.description || ''));
          setBotStatus('error');
        } else {
          setShowBotSetup(false);
          alert('텔레그램 연결 완료! 메시지를 확인하세요.');
        }
      } catch {
        alert('네트워크 오류가 발생했습니다.');
        setBotStatus('error');
      }
    }
  };

  useEffect(() => {
    let updateOffset = 0;
    
    const sendTomorrowSchedule = async (chatId: string) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
      
      const tomorrowBookings = bookingsRef.current.filter(b => b.date === tomorrowStr);
      tomorrowBookings.sort((a, b) => a.time.localeCompare(b.time));
      
      let msg = `📅 <b>[내일 일정] ${tomorrowStr}</b>\n\n`;
      if (tomorrowBookings.length === 0) {
        msg += "예정된 일정이 없습니다.";
      } else {
        tomorrowBookings.forEach(b => {
          const checkIcon = b.checkedIn ? '✅' : '⏳';
          msg += `[${b.time}] ${b.name}님 (${b.pax}명) - ${b.category} ${checkIcon}\n`;
        });
        msg += `\n총 ${tomorrowBookings.length}건 예약 대기 중`;
      }

      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      if (!token) return;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [[{ text: '📅 내일 일정' }]],
            resize_keyboard: true,
            persistent: true
          }
        })
      });
    };

    const sendTelegramMessage = async (chatId: string, msg: string, useKeyboard = false) => {
      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      if (!token) return;

      const payload: any = { chat_id: chatId, text: msg, parse_mode: 'HTML' };
      if (useKeyboard) {
        payload.reply_markup = {
          keyboard: [[{ text: '📅 내일 일정' }]],
          resize_keyboard: true,
          persistent: true
        };
      }

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    };

    const pollTelegram = async () => {
      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      if (!token) { console.warn('[TelegramBot] Token not found'); return; }

      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${updateOffset}&timeout=5`);
        const data = await res.json();
        console.log('[TelegramBot] Poll result:', data.ok, 'updates:', data.result?.length);
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            updateOffset = update.update_id + 1;
            const message = update.message;
            if (message && message.text) {
              const text = message.text.trim();
              const chatId = message.chat.id.toString();
              
              console.log('[TelegramBot] Received:', text, 'from chatId:', chatId);
              localStorage.setItem('ecodivers_telegram_chat_id', chatId);
              setTelegramChatId(chatId);
              telegramChatIdRef.current = chatId;
              setBotStatus('connected');

              if (text === '/start') {
                await sendTelegramMessage(chatId, '안녕하세요! 에코다이버스 알림 봇입니다.\n하단 메뉴의 <b>[📅 내일 일정]</b> 버튼을 누르시면 내일 예약 현황을 알려드립니다.', true);
              } else if (text === '📅 내일 일정' || text === '내일 일정') {
                await sendTomorrowSchedule(chatId);
              }
            }
          }
        }
      } catch (e) {
        console.error('[TelegramBot] Poll error:', e);
      }
    };

    // 즉시 한 번 폴링
    pollTelegram();
    const interval = setInterval(pollTelegram, 5000);
    
    // 7 PM Daily Summary Check
    const dailyInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 19 && now.getMinutes() === 0) {
        const lastSent = localStorage.getItem('ecodivers_telegram_last_summary');
        const todayStr = format(now, "yyyy-MM-dd");
        if (lastSent !== todayStr) {
          const chatId = telegramChatIdRef.current || localStorage.getItem('ecodivers_telegram_chat_id');
          if (chatId) {
            localStorage.setItem('ecodivers_telegram_last_summary', todayStr);
            sendTomorrowSchedule(chatId);
          }
        }
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(dailyInterval);
    };
  }, []);

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

  // 기존 예약 수정 - 바로 폼 탭으로
  const openEditModal = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBooking({ ...booking });
    setIsCustomTimeMode(!getTimeOptions(booking.category).includes(booking.time));
    setIsCustomCategoryMode(!categories.includes(booking.category));
    setIsCustomPaymentMode(booking.paymentMethod ? !paymentOptions.includes(booking.paymentMethod) : false);
    setFormEndDate('');
    setModalTab('form');
    setIsModalOpen(true);
  };

  // 날짜 클릭 - 먼저 당일 예약 목록 탭으로 열기
  const openNewModal = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    const defaultCat = categories[0];
    setEditingBooking({
      id: "new",
      name: "",
      pax: 1,
      category: defaultCat,
      date: dateStr,
      time: getTimeOptions(defaultCat)[0],
      checkedIn: false,
      phone: "",
      memo: "",
      paymentMethod: paymentOptions[0]
    });
    setIsCustomTimeMode(false);
    setIsCustomCategoryMode(false);
    setIsCustomPaymentMode(false);
    setFormEndDate('');
    setModalTab('list');
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

        // 날짜 범위 등록: 종료일이 있으면 각 날짜마다 자동 생성
        const dates: string[] = [];
        if (formEndDate && formEndDate > editingBooking.date) {
          let cur = new Date(editingBooking.date + 'T00:00:00');
          const last = new Date(formEndDate + 'T00:00:00');
          while (cur <= last) {
            dates.push(format(cur, 'yyyy-MM-dd'));
            cur = new Date(cur.getTime() + 86400000);
          }
        } else {
          dates.push(editingBooking.date);
        }

        for (const d of dates) {
          const finalData = { ...dataToSave, date: d, createdAt: serverTimestamp() };
          await withTimeout(addDoc(collection(db, "bookings"), finalData));
          await saveBackup({ ...finalData, date: d, action: "create" });
        }
        console.log(`Firestore: ${dates.length}개 일정 생성 완료`);
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
        
        // 텔레그램 알림 발송
        const chatId = telegramChatIdRef.current || localStorage.getItem('ecodivers_telegram_chat_id');
        const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        if (chatId && token) {
          let dateText = editingBooking.date;
          if (editingBooking.id === 'new' && formEndDate && formEndDate > editingBooking.date) {
            dateText = `${editingBooking.date} ~ ${formEndDate}`;
          }
          const msg = `🔔 <b>일정 추가/변경</b>\n${dateText} ${editingBooking.time}\n${editingBooking.name}님 (${editingBooking.pax}명) - ${editingBooking.category}`;
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
          }).catch(() => {});
        }
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
      await withTimeout(deleteDoc(docRef));
      console.log("Firestore: Booking deleted successfully");
      await saveBackup({ ...editingBooking, action: "delete" });
      
      const chatId = telegramChatIdRef.current || localStorage.getItem('ecodivers_telegram_chat_id');
      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      if (chatId && token) {
        const msg = `🗑 <b>일정 삭제됨</b>\n${editingBooking.date} ${editingBooking.time}\n${editingBooking.name}님 (${editingBooking.pax}명) - ${editingBooking.category}`;
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
        }).catch(() => {});
      }
      
      setIsModalOpen(false);
    } catch (error: unknown) {
      console.error("삭제 실패:", error);
      // Fallback: remove from local state
      setBookings(bookings.filter(b => b.id !== editingBooking.id));
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // 일정 취소 처리
  const handleCancel = async () => {
    if (!cancelModal || isSaving) return;
    const bk = cancelModal.booking;
    setIsSaving(true);
    try {
      const docRef = doc(db, "bookings", bk.id);
      await withTimeout(updateDoc(docRef, { cancelled: true, cancelReason, cancelledAt: new Date().toISOString() }));
      if (rescheduleMode && rescheduleData.date && rescheduleData.category && rescheduleData.time) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, cancelled: _c, cancelReason: _cr, cancelledAt: _ca, createdAt: _ct, ...rest } = bk as any;
        await withTimeout(addDoc(collection(db, "bookings"), {
          ...rest,
          date: rescheduleData.date,
          category: rescheduleData.category,
          time: rescheduleData.time,
          checkedIn: false,
          memo: (bk.memo ? bk.memo + '\n' : '') + `[일정변경] 원래: ${bk.date} ${bk.time} ${bk.category}`,
          createdAt: serverTimestamp(),
        }));
      }
      setCancelModal(null);
      setIsModalOpen(false);
      alert(rescheduleMode ? '일정이 변경되었습니다.' : '일정이 취소되었습니다.');
      
      const chatId = telegramChatIdRef.current || localStorage.getItem('ecodivers_telegram_chat_id');
      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      if (chatId && token) {
        const msg = rescheduleMode 
          ? `🔄 <b>일정 변경됨</b>\n[기존] ${bk.date} ${bk.time}\n[변경] ${rescheduleData.date} ${rescheduleData.time}\n${bk.name}님 (${bk.pax}명) - ${rescheduleData.category}`
          : `❌ <b>일정 취소됨</b>\n${bk.date} ${bk.time}\n${bk.name}님 (${bk.pax}명) - ${bk.category}\n사유: ${cancelReason}`;
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
        }).catch(() => {});
      }
      
    } catch { alert('처리 중 오류가 발생했습니다.'); }
    finally { setIsSaving(false); }
  };

  const saveProgramPrice = (cat: string, price: number) => {
    const next = { ...programPrices, [cat]: price };
    setProgramPrices(next);
    if (typeof window !== 'undefined') localStorage.setItem('ecodivers_prices', JSON.stringify(next));
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

            {/* 텔레그램 봇 상태 표시 */}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setShowBotSetup(!showBotSetup)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  botStatus === 'connected'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${botStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {botStatus === 'connected' ? `✈️ 텔레그램 연결됨` : '📱 텔레그램 봇 설정'}
              </button>
              {botStatus === 'connected' && telegramChatId && (
                <span className="text-xs text-gray-400">Chat ID: {telegramChatId}</span>
              )}
            </div>

            {/* 텔레그램 봇 설정 패널 */}
            {showBotSetup && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-sm">
                <p className="text-xs font-bold text-blue-800 mb-2">📱 텔레그램 봇 연결 설정</p>
                <ol className="text-xs text-blue-700 space-y-1 mb-3 list-decimal list-inside">
                  <li>텔레그램에서 <b>@EcodiversBot</b> 채팅 열기</li>
                  <li><b>/start</b> 전송</li>
                  <li>아래에서 <b>내 Chat ID 확인</b> 클릭</li>
                  <li>Chat ID 입력 후 <b>저장 &amp; 테스트</b></li>
                </ol>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={telegramInput}
                    onChange={e => setTelegramInput(e.target.value)}
                    placeholder="Chat ID 입력 (예: 123456789)"
                    className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={saveTelegramChatId}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    저장 &amp; 테스트
                  </button>
                </div>
                <a
                  href={`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/getUpdates`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  👉 내 Chat ID 확인하기 (새 탭에서 열림)
                </a>
                <p className="text-xs text-gray-500 mt-1">→ "from":{'{'}"id": <b>이 숫자</b>{'}'} 가 내 Chat ID입니다</p>
              </div>
            )}
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
                <Link href="/admin/checkin-settings" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition">
                  체크인 설정
                </Link>
                <Link href="/admin/settlement" className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100 transition">
                  정산/매출
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Page Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm w-fit">
          <button onClick={() => setPageTab('calendar')} className={`px-6 py-2.5 rounded-lg text-sm font-extrabold transition ${pageTab === 'calendar' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📅 캘린더</button>
          <button onClick={() => setPageTab('settlement')} className={`px-6 py-2.5 rounded-lg text-sm font-extrabold transition ${pageTab === 'settlement' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>💰 정산/매출</button>
        </div>

        {pageTab === 'calendar' && <>
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

              // 카테고리별/시간대별 요약 로직 추가 (모달용)
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

                    {/* 일일 현황 요약 아이콘 - 클릭 시 중앙 모달 */}
                    {dayBookings.length > 0 && (
                      <button
                        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSummaryModal({ date: format(day, 'yyyy-MM-dd'), categorySummary });
                        }}
                        title="현황 요약"
                      >
                        <span className="text-gray-400 font-bold text-sm">ⓘ</span>
                      </button>
                    )}
                  </div>

                  {/* 예약 블랙 렌더링 */}
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                    {dayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(booking => {

                      const isSlotOverloaded = (timeSlotPax[booking.time] || 0) >= 10;
                      const isCheckedIn = booking.checkedIn;

                      let appearance = "bg-gray-100 border-gray-300 text-gray-700";
                      let badge = "";

                      if (isSlotOverloaded && isCheckedIn) {
                        // 1순위: 10명 이상 + 체크인 완료 (Yellow) — 만석 + 체크인
                        appearance = "bg-yellow-400 border-yellow-500 text-yellow-900 shadow-sm";
                        badge = "⚠️";
                      } else if (isSlotOverloaded) {
                        // 2순위: 해당 시간대 전체 인원 10명 이상 (Red)
                        appearance = "bg-red-500 border-red-600 text-white shadow-sm";
                        badge = "🚨";
                      } else if (isCheckedIn) {
                        // 3순위: 개별 예약 체크인 완료 (Blue)
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
        </>}

        {/* Settlement Tab */}
        {pageTab === 'settlement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-blue-900 mb-4">프로그램 단가 설정</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="flex-1 text-sm font-bold text-gray-700">{cat}</span>
                    <input type="number" value={programPrices[cat] || ''} onChange={e => saveProgramPrice(cat, parseInt(e.target.value) || 0)} onFocus={e => e.target.select()} placeholder="0" className="w-28 border border-gray-200 rounded-lg p-2 text-sm text-right outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-gray-400">원/인</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-blue-900">{format(currentDate, 'yyyy년 MM월', { locale: ko })} 매출 현황</h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="px-3 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition text-sm">&lt;</button>
                  <button onClick={nextMonth} className="px-3 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition text-sm">&gt;</button>
                </div>
              </div>
              {(() => {
                const ym = format(currentDate, 'yyyy-MM');
                const mb = bookings.filter(b => b.date.startsWith(ym));
                const mc = cancelledBookings.filter(b => b.date.startsWith(ym));
                const bycat: Record<string, { count: number; pax: number }> = {};
                mb.forEach(b => { if (!bycat[b.category]) bycat[b.category] = { count: 0, pax: 0 }; bycat[b.category].count++; bycat[b.category].pax += b.pax; });
                const totalRev = Object.entries(bycat).reduce((s, [cat, d]) => s + d.pax * (programPrices[cat] || 0), 0);
                const totalPax = Object.values(bycat).reduce((s, d) => s + d.pax, 0);
                return (
                  <div className="space-y-6">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead><tr className="border-b-2 border-gray-100">
                        <th className="pb-3 text-xs font-extrabold text-gray-400">프로그램</th>
                        <th className="pb-3 text-xs font-extrabold text-gray-400 text-right">건수</th>
                        <th className="pb-3 text-xs font-extrabold text-gray-400 text-right">인원</th>
                        <th className="pb-3 text-xs font-extrabold text-gray-400 text-right">단가</th>
                        <th className="pb-3 text-xs font-extrabold text-gray-400 text-right">매출</th>
                      </tr></thead>
                      <tbody>
                        {Object.entries(bycat).map(([cat, d]) => (
                          <tr key={cat} className="border-b border-gray-50">
                            <td className="py-3 font-bold text-gray-800">{cat}</td>
                            <td className="py-3 text-right text-gray-500">{d.count}건</td>
                            <td className="py-3 text-right text-gray-500">{d.pax}명</td>
                            <td className="py-3 text-right text-gray-400">{(programPrices[cat] || 0).toLocaleString()}원</td>
                            <td className="py-3 text-right font-black text-blue-700">{(d.pax * (programPrices[cat] || 0)).toLocaleString()}원</td>
                          </tr>
                        ))}
                        {Object.keys(bycat).length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">이 달의 예약이 없습니다.</td></tr>}
                      </tbody>
                      <tfoot><tr className="bg-blue-50 rounded-xl">
                        <td className="py-3 px-2 font-extrabold text-blue-900">합계</td>
                        <td className="py-3 text-right font-bold text-blue-900">{mb.length}건</td>
                        <td className="py-3 text-right font-bold text-blue-900">{totalPax}명</td>
                        <td className="py-3 text-right text-gray-400">-</td>
                        <td className="py-3 px-2 text-right font-black text-blue-700 text-base">{totalRev.toLocaleString()}원</td>
                      </tr></tfoot>
                    </table>
                    {mc.length > 0 && (
                      <div>
                        <h4 className="text-sm font-extrabold text-red-600 mb-3">취소 내역 ({mc.length}건)</h4>
                        <div className="space-y-2">
                          {mc.map(b => (
                            <div key={b.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs text-red-400 font-bold">{b.date} {b.time}</span>
                                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{b.cancelReason || '취소'}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{b.name} · {b.category} · {b.pax}명</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>

      {/* 현황 요약 모달 */}
      {summaryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 sm:p-4" onClick={() => setSummaryModal(null)}>
          <div className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200 font-medium">{summaryModal.date}</p>
                <h3 className="text-lg font-black">현황 요약</h3>
              </div>
              <button onClick={() => setSummaryModal(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center transition">×</button>
            </div>
            {/* 테이블 */}
            <div className="p-5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400">
                    <th className="pb-2 font-bold">카테고리</th>
                    <th className="pb-2 font-bold">시간</th>
                    <th className="pb-2 font-bold text-right">인원</th>
                    <th className="pb-2 font-bold text-right">📷 카메라</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summaryModal.categorySummary).map(([cat, times]) => {
                    let displayName = cat;
                    if (cat.includes('해녀')) displayName = '해녀체험';
                    else if (cat.includes('호핑')) displayName = '호핑투어';
                    else if (cat.includes('스노켈링')) displayName = '스노켈링';
                    else if (cat.includes('체험')) displayName = '체험다이빙';
                    else if (cat.includes('교육') || cat.includes('자격')) displayName = '자격증 교육';
                    const sortedTimes = Object.keys(times).sort();
                    const totalPax = sortedTimes.reduce((sum, t) => sum + times[t], 0);
                    const isHopping = cat.includes('호핑');
                    return (
                      <React.Fragment key={cat}>
                        {sortedTimes.map((t, tidx) => {
                          const matchedBooking = bookings.find(b =>
                            b.date === summaryModal.date && b.category === cat && b.time === t
                          );
                          // 호핑투어인 경우 해당 시간대 커메라 대여 개수
                          const cameraCount = isHopping
                            ? bookings.filter(b => b.date === summaryModal.date && b.category === cat && b.time === t && b.cameraRental).length
                            : 0;
                          return (
                            <tr key={t} className="border-b border-gray-50 last:border-0 group hover:bg-blue-50/40 transition">
                              <td className="py-2.5 font-bold text-blue-700 text-sm">{tidx === 0 ? displayName : ''}</td>
                              <td className="py-2.5 text-gray-600 text-sm">{t}</td>
                              <td className={`py-2.5 text-right font-black text-sm ${times[t] >= 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                {times[t]}명{times[t] >= 10 ? ' 🚨' : ''}
                              </td>
                              <td className="py-2.5 text-right text-sm">
                                {isHopping && cameraCount > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-700 font-black px-2 py-0.5 rounded-full text-xs">
                                    📷 {cameraCount}
                                  </span>
                                )}
                                {isHopping && cameraCount === 0 && (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                              <td className="py-2.5 pl-2">
                                {matchedBooking && (
                                  <button
                                    onClick={() => {
                                      setSummaryModal(null);
                                      setEditingBooking({ ...matchedBooking });
                                      setIsCustomTimeMode(!getTimeOptions(matchedBooking.category).includes(matchedBooking.time));
                                      setIsCustomCategoryMode(!categories.includes(matchedBooking.category));
                                      setIsCustomPaymentMode(matchedBooking.paymentMethod ? !paymentOptions.includes(matchedBooking.paymentMethod) : false);
                                      setSelectedDate(matchedBooking.date);
                                      setModalTab('list');
                                      setIsModalOpen(true);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-600 transition text-sm"
                                    title="일정 수정"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-blue-50">
                          <td colSpan={3} className="py-2 px-2 text-xs font-bold text-gray-400">SUBTOTAL</td>
                          <td className="py-2 px-2 text-right font-black text-blue-600">{totalPax}명</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* 하단 버튼 */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => {
                  const dateStr = summaryModal.date;
                  setSummaryModal(null);
                  const defaultCat = categories[0];
                  setEditingBooking({
                    id: 'new', name: '', pax: 1, category: defaultCat,
                    date: dateStr, time: getTimeOptions(defaultCat)[0],
                    checkedIn: false, phone: '', memo: '', paymentMethod: paymentOptions[0]
                  });
                  setIsCustomTimeMode(false);
                  setIsCustomCategoryMode(false);
                  setIsCustomPaymentMode(false);
                  setSelectedDate(dateStr);
                  setModalTab('form');
                  setIsModalOpen(true);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
              >
                + 신규 추가
              </button>
              <button
                onClick={() => {
                  const dateStr = summaryModal.date;
                  setSummaryModal(null);
                  const defaultCat = categories[0];
                  setEditingBooking({
                    id: 'new', name: '', pax: 1, category: defaultCat,
                    date: dateStr, time: getTimeOptions(defaultCat)[0],
                    checkedIn: false, phone: '', memo: '', paymentMethod: paymentOptions[0]
                  });
                  setIsCustomTimeMode(false);
                  setIsCustomCategoryMode(false);
                  setIsCustomPaymentMode(false);
                  setSelectedDate(dateStr);
                  setModalTab('list');
                  setIsModalOpen(true);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
              >
                일정 수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-xs text-gray-400 font-medium">{selectedDate || editingBooking.date}</p>
                <h3 className="text-lg font-extrabold text-blue-900">
                  {modalTab === 'list' ? '당일 예약 현황' : (editingBooking.id === 'new' ? '신규 일정 추가' : '일정 수정')}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 text-xl flex items-center justify-center">×</button>
            </div>
            {/* 탭 */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              <button onClick={() => setModalTab('list')} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${modalTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                예약 목록 ({bookings.filter(b => b.date === (selectedDate || editingBooking.date)).length})
              </button>
              <button onClick={() => setModalTab('form')} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${modalTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                {editingBooking.id === 'new' ? '+ 신규 추가' : '수정 폼'}
              </button>
            </div>
            {/* 스크롤 가능한 콘텐츠 */}
            <div className="overflow-y-auto flex-1">
              {/* 목록 탭 */}
              {modalTab === 'list' && (
                <div className="p-4">
                  {bookings.filter(b => b.date === (selectedDate || editingBooking.date)).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <div className="text-4xl mb-3">📅</div>
                      <p className="text-sm">이 날의 예약이 없습니다.</p>
                      <button onClick={() => setModalTab('form')} className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition">+ 신규 일정 추가</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookings.filter(b => b.date === (selectedDate || editingBooking.date)).sort((a, b) => a.time.localeCompare(b.time)).map(booking => (
                        <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer transition"
                          onClick={() => { setEditingBooking({...booking}); setIsCustomTimeMode(!getTimeOptions(booking.category).includes(booking.time)); setIsCustomCategoryMode(!categories.includes(booking.category)); setIsCustomPaymentMode(booking.paymentMethod ? !paymentOptions.includes(booking.paymentMethod) : false); setModalTab('form'); }}>
                          <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${booking.checkedIn ? 'bg-blue-500' : 'bg-gray-200'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{booking.time}</span>
                              <span className="text-xs text-gray-500 truncate">{booking.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{booking.name}</span>
                              <span className="text-xs text-gray-400">{booking.pax}명</span>
                              {booking.paymentMethod && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{booking.paymentMethod}</span>}
                            </div>
                            {booking.phone && <p className="text-xs text-gray-400 mt-0.5">{booking.phone}</p>}
                          </div>
                          <span className="text-gray-300">›</span>
                        </div>
                      ))}
                      <button onClick={() => { const dc = categories[0]; setEditingBooking({id:'new',name:'',pax:1,category:dc,date:selectedDate||editingBooking.date,time:getTimeOptions(dc)[0],checkedIn:false,phone:'',memo:'',paymentMethod:paymentOptions[0]}); setIsCustomTimeMode(false); setIsCustomCategoryMode(false); setIsCustomPaymentMode(false); setModalTab('form'); }}
                        className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition">
                        + 신규 일정 추가
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* 폼 탭 */}
              {modalTab === 'form' && (
                <div className="p-5 space-y-4">
                  {editingBooking.id !== 'new' && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-blue-900">온라인 체크인</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${editingBooking.checkedIn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{editingBooking.checkedIn ? '완료' : '미완료'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { const link = `${window.location.origin}/checkin?id=${editingBooking.id}`; void navigator.clipboard.writeText(link); alert('체크인 링크가 복사되었습니다.'); }} className="py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">링크 복사</button>
                        <button onClick={() => alert('솔라피 API 연동 대기 중')} className="py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">알림톡 전송</button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">날짜 (시작)</label>
                      <input type="date" value={editingBooking.date} onChange={e => setEditingBooking({...editingBooking, date: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      {editingBooking.id === 'new' && (
                        <div className="mt-1.5">
                          <label className="block text-xs font-bold text-gray-400 mb-1">종료일 (선택, 범위 등록)</label>
                          <input
                            type="date"
                            value={formEndDate}
                            min={editingBooking.date}
                            onChange={e => setFormEndDate(e.target.value)}
                            className="w-full border border-dashed border-blue-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/40"
                            placeholder="종료일"
                          />
                          {formEndDate && formEndDate > editingBooking.date && (
                            <p className="text-xs text-blue-600 font-bold mt-1">
                              📅 {editingBooking.date} ~ {formEndDate} 범위로 {(() => { let n=0; let c=new Date(editingBooking.date+'T00:00:00'); const e2=new Date(formEndDate+'T00:00:00'); while(c<=e2){n++;c=new Date(c.getTime()+86400000);} return n; })()} 개 일정 생성
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">카테고리</label>
                      {!isCustomCategoryMode ? (
                        <select value={editingBooking.category} onChange={e => { if(e.target.value==='custom'){setIsCustomCategoryMode(true);setEditingBooking({...editingBooking,category:''});}else{const c=e.target.value;setEditingBooking({...editingBooking,category:c,time:getTimeOptions(c)[0]});setIsCustomTimeMode(false);}}} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="custom">직접 입력...</option>
                        </select>
                      ) : (
                        <div className="flex gap-1">
                          <input type="text" value={editingBooking.category} onChange={e => setEditingBooking({...editingBooking,category:e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none" placeholder="카테고리" />
                          <button onClick={() => {setIsCustomCategoryMode(false);setEditingBooking({...editingBooking,category:categories[0]});}} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">목록</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">시간</label>
                      {!isCustomTimeMode ? (
                        <select value={editingBooking.time} onChange={e => { if(e.target.value==='custom')setIsCustomTimeMode(true); else setEditingBooking({...editingBooking,time:e.target.value}); }} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          {getTimeOptions(editingBooking.category).map(t => <option key={t} value={t}>{t}</option>)}
                          <option value="custom">직접 입력...</option>
                        </select>
                      ) : (
                        <div className="flex gap-1">
                          <input type="time" value={editingBooking.time} onChange={e => setEditingBooking({...editingBooking,time:e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none" />
                          <button onClick={() => {setIsCustomTimeMode(false);setEditingBooking({...editingBooking,time:getTimeOptions(editingBooking.category)[0]});}} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">목록</button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">예약자명</label>
                      <input type="text" value={editingBooking.name} onChange={e => setEditingBooking({...editingBooking,name:e.target.value})} placeholder="성함 입력" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">예약 인원</label>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <button
                          type="button"
                          onClick={() => setEditingBooking({...editingBooking, pax: Math.max(1, editingBooking.pax - 1)})}
                          className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none transition select-none flex-shrink-0"
                          aria-label="인원 감소"
                        >−</button>
                        <input
                          type="number"
                          min="1"
                          value={editingBooking.pax}
                          onChange={e => setEditingBooking({...editingBooking, pax: parseInt(e.target.value) || 1})}
                          onFocus={e => e.target.select()}
                          className="flex-1 min-w-0 text-center text-sm p-2.5 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingBooking({...editingBooking, pax: editingBooking.pax + 1})}
                          className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none transition select-none flex-shrink-0"
                          aria-label="인원 증가"
                        >+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">연락처</label>
                      <input type="text" value={editingBooking.phone||''} onChange={e => setEditingBooking({...editingBooking,phone:formatPhoneNumber(e.target.value)})} placeholder="010-0000-0000" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">결제방법</label>
                    {!isCustomPaymentMode ? (
                      <select value={editingBooking.paymentMethod||''} onChange={e => { if(e.target.value==='custom'){setIsCustomPaymentMode(true);setEditingBooking({...editingBooking,paymentMethod:''});}else setEditingBooking({...editingBooking,paymentMethod:e.target.value}); }} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        <option value="custom">직접 입력...</option>
                      </select>
                    ) : (
                      <div className="flex gap-1">
                        <input type="text" value={editingBooking.paymentMethod||''} onChange={e => setEditingBooking({...editingBooking,paymentMethod:e.target.value})} placeholder="결제방법" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none" />
                        <button onClick={() => {setIsCustomPaymentMode(false);setEditingBooking({...editingBooking,paymentMethod:paymentOptions[0]});}} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">목록</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">메모</label>
                    <textarea value={editingBooking.memo||''} onChange={e => setEditingBooking({...editingBooking,memo:e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[60px]" placeholder="특이사항 입력" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="checkedIn" checked={editingBooking.checkedIn} onChange={e => setEditingBooking({...editingBooking,checkedIn:e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer" />
                    <label htmlFor="checkedIn" className="text-sm font-bold text-gray-700 cursor-pointer">✅ 온라인 체크인 완료</label>
                  </div>
                  {editingBooking.category.includes('호핑') && (
                    <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                      <input
                        type="checkbox"
                        id="cameraRental"
                        checked={!!editingBooking.cameraRental}
                        onChange={e => setEditingBooking({...editingBooking, cameraRental: e.target.checked})}
                        className="w-5 h-5 text-cyan-600 rounded border-gray-300 cursor-pointer"
                      />
                      <label htmlFor="cameraRental" className="text-sm font-bold text-cyan-700 cursor-pointer">📷 수중 카메라 대여</label>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* 하단 버튼 - 폼 탭에서만 */}
            {modalTab === 'form' && (
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0 flex-wrap">
                {editingBooking.id !== 'new' && (
                  <>
                    <button onClick={handleDelete} disabled={isSaving} className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition text-sm">삭제</button>
                    <button onClick={() => { setCancelReason('고객변심'); setRescheduleMode(false); setRescheduleData({ date: editingBooking.date, category: editingBooking.category, time: editingBooking.time }); setCancelModal({ booking: editingBooking }); }} disabled={isSaving} className="px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl transition text-sm">일정취소</button>
                  </>
                )}
                <button onClick={() => editingBooking.id !== 'new' ? setModalTab('list') : setIsModalOpen(false)} disabled={isSaving} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm">취소</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition disabled:opacity-50 text-sm">{isSaving ? '저장 중...' : '저장'}</button>
              </div>
            )}
          </div>
        </div>

      )}

      {/* 일정 취소 모달 */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60]" onClick={() => setCancelModal(null)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-red-700">일정 취소</h3>
              <p className="text-xs text-gray-400 mt-1">{cancelModal.booking.name}님 · {cancelModal.booking.date} {cancelModal.booking.time} · {cancelModal.booking.category}</p>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">취소 사유</p>
                <div className="grid grid-cols-2 gap-2">
                  {['천재지변', '고객변심', '인원미달', '기타', '일정변경'].map(r => (
                    <button key={r} onClick={() => { setCancelReason(r); setRescheduleMode(r === '일정변경'); if (r === '일정변경') setRescheduleData({ date: cancelModal.booking.date, category: cancelModal.booking.category, time: cancelModal.booking.time }); }}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition ${cancelReason === r ? (r === '일정변경' ? 'border-blue-500 bg-blue-500 text-white' : 'border-red-500 bg-red-500 text-white') : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
                      {r === '일정변경' ? '📅 일정변경' : r}
                    </button>
                  ))}
                </div>
              </div>
              {rescheduleMode && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                  <p className="text-sm font-extrabold text-blue-900">변경할 일정 선택</p>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">날짜</label>
                    <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">카테고리</label>
                    <select value={rescheduleData.category} onChange={e => setRescheduleData({...rescheduleData, category: e.target.value, time: getTimeOptions(e.target.value)[0]})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">시간</label>
                    <select value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      {getTimeOptions(rescheduleData.category).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm">닫기</button>
              <button onClick={handleCancel} disabled={isSaving} className={`flex-1 py-3 font-extrabold rounded-xl transition text-sm text-white disabled:opacity-50 ${rescheduleMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isSaving ? '처리 중...' : (rescheduleMode ? '일정 변경' : '취소 확정')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
