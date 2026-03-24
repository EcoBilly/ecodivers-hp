"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, ClipboardList, ShieldCheck, User, Info, Smartphone } from "lucide-react";

function CheckinForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [suitSize, setSuitSize] = useState("");
  const [finSize, setFinSize] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!id) {
      setError("잘못된 접근입니다. 예약 번호가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const docRef = doc(db, "bookings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("예약 정보를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Canvas Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e3a8a";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = async () => {
    if (!agreed) {
      alert("면책 동의서에 동의해 주세요.");
      return;
    }
    if (!suitSize || !finSize) {
      alert("장비 사이즈를 선택해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "bookings", id!);
      await updateDoc(docRef, {
        checkedIn: true,
        equipment: {
          suit: suitSize,
          fin: finSize,
        },
        checkInDate: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit Error:", err);
      alert("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">다시 시도</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 p-6">
        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-md w-full transform animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">체크인 완료!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            온라인 체크인이 성공적으로 완료되었습니다.<br />
            현장에서 대기 없이 바로 안내해 드리겠습니다.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl text-left border border-blue-100 mb-8">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-700 font-bold">예약자</span>
              <span className="text-gray-900 font-black">{booking.name}님</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-bold">프로그램</span>
              <span className="text-gray-900 font-black">{booking.category}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">이 창을 닫으셔도 됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-blue-900 text-white py-8 px-6 text-center shadow-lg">
        <h1 className="text-2xl font-black tracking-tight mb-2">EcoDivers</h1>
        <p className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em]">Online Check-in</p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Booking Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">예약 정보 확인</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-sm">예약자명</span>
              <span className="text-gray-900 font-black">{booking.name}님</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-sm">참여 인원</span>
              <span className="text-gray-900 font-black">{booking.pax}명</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-sm">날짜 및 시간</span>
              <span className="text-gray-900 font-black">{booking.date} {booking.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold text-sm">프로그램</span>
              <span className="text-blue-600 font-black">{booking.category}</span>
            </div>
          </div>
        </div>

        {/* Equipment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">장비 사이즈 입력</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">슈트(Suit) 사이즈</label>
              <select 
                value={suitSize}
                onChange={e => setSuitSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">선택해 주세요</option>
                {["S 입으시는 분 (키 155~165)", "M 입으시는 분 (키 165~175)", "L 입으시는 분 (키 175~185)", "XL 입으시는 분 (키 185~)", "상담 후 결정"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">핀(Fin) 사이즈</label>
              <select 
                value={finSize}
                onChange={e => setFinSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">선택해 주세요</option>
                {[220, 230, 240, 250, 260, 270, 280, 290, 300].map(s => (
                  <option key={s} value={s.toString()}>{s}mm</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liability Waiver */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">안전 면책 동의서</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed max-h-40 overflow-y-auto mb-4 border border-gray-100 font-medium whitespace-pre-wrap">
{`본인은 에코다이버스에서 진행하는 프로그램에 참여함에 있어 다음의 사항을 충분히 이해하고 동의합니다.

1. 본인은 현재 건강 상태가 양호하며, 프로그램 참여에 방해가 될 만한 기저질환(심장병, 폐질환, 고혈압 등)이 없음을 확인합니다.
2. 진행 요원의 안전 수칙 및 지시 사항을 철저히 준수할 것을 약속합니다.
3. 안전 수칙을 미준수하거나 본인의 부주의로 발생하는 사고에 대해서는 본인에게 책임이 있음을 인지합니다.
4. 활동 중 발생할 수 있는 경미한 찰과상 등에 대해 안전 요원의 응급 처치에 동의합니다.`}
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-6 h-6 rounded-lg text-blue-600 border-gray-200 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">위 모든 내용을 확인했으며 동의합니다.</span>
          </label>
        </div>

        {/* Signature */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-gray-900">서명</h2>
            </div>
            <button 
              onClick={clearSignature}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              다시 쓰기
            </button>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={350}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center font-medium">손가락이나 터치펜으로 위 박스에 서명해 주세요.</p>
        </div>

        {/* Submit */}
        <button 
          onClick={handleSubmit}
          disabled={!agreed || loading || !suitSize || !finSize}
          className={`w-full py-5 rounded-3xl font-black text-lg shadow-2xl transition-all active:scale-95
            ${agreed && suitSize && finSize && !loading 
              ? "bg-blue-600 text-white hover:bg-blue-800" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        >
          {loading ? "처리 중..." : "체크인 완료하기"}
        </button>
      </div>

      <p className="text-center text-gray-400 text-[10px] mt-8 font-medium">
        Copyright © 2026 EcoDivers. All Rights Reserved.
      </p>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CheckinForm />
    </Suspense>
  );
}
