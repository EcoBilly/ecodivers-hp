'use client';

import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

type Lang = 'en' | 'ko' | 'zh';

const translations = {
  en: {
    title: "Eco Divers Booking",
    subtitle: "Quick & easy booking via QR",
    activityLabel: "Select Activity",
    activities: {
      "호핑투어": "Hopping Tour",
      "해녀체험": "Haenyeo Experience",
      "비치 스쿠버다이빙": "Beach Scuba Diving",
      "보트 스쿠버다이빙": "Boat Scuba Diving"
    },
    dateLabel: "Date",
    timeLabel: "Time",
    peopleLabel: "Number of People",
    nameLabel: "Name",
    namePlaceholder: "John Doe",
    phoneLabel: "Phone / WhatsApp",
    phonePlaceholder: "+1 234 567 8900",
    emailLabel: "Email Address",
    emailPlaceholder: "for payment receipt",
    totalLabel: "Total Amount:",
    payNow: "Pay Now",
    payLater: "Or Pay Later",
    sendInvoice: "Send me an Invoice via Email",
    sending: "Sending...",
    sent: "Invoice Sent to Email",
    successTitle: "Payment Completed!",
    successDesc: "Your booking has been successfully registered. Thank you.",
    errName: "Please enter your name.",
    errPhone: "Please enter your phone number.",
    errEmail: "Please enter your email address.",
    errPayment: "Your payment was declined. Please try another payment method.",
    errInvoice: "An error occurred while sending the invoice."
  },
  ko: {
    title: "에코다이버스 예약",
    subtitle: "QR 코드로 빠르고 간편하게 예약하세요",
    activityLabel: "체험 선택",
    activities: {
      "호핑투어": "호핑투어",
      "해녀체험": "해녀체험",
      "비치 스쿠버다이빙": "비치 스쿠버다이빙",
      "보트 스쿠버다이빙": "보트 스쿠버다이빙"
    },
    dateLabel: "예약 날짜",
    timeLabel: "시간 선택",
    peopleLabel: "예약 인원",
    nameLabel: "예약자명",
    namePlaceholder: "홍길동",
    phoneLabel: "연락처",
    phonePlaceholder: "010-0000-0000",
    emailLabel: "이메일 주소",
    emailPlaceholder: "결제 영수증 수신용",
    totalLabel: "총 결제 금액:",
    payNow: "결제하기",
    payLater: "또는 나중에 결제",
    sendInvoice: "이메일로 결제 인보이스 받기",
    sending: "전송 중...",
    sent: "인보이스 전송 완료",
    successTitle: "결제가 완료되었습니다!",
    successDesc: "예약 내역이 성공적으로 등록되었습니다. 감사합니다.",
    errName: "예약자 성함을 입력해주세요.",
    errPhone: "연락처를 입력해주세요.",
    errEmail: "이메일 주소를 입력해주세요.",
    errPayment: "결제가 거절되었습니다. 다른 결제 수단을 이용해주세요.",
    errInvoice: "인보이스 전송 중 오류가 발생했습니다."
  },
  zh: {
    title: "Eco Divers 预订",
    subtitle: "通过二维码快速简便预订",
    activityLabel: "选择项目",
    activities: {
      "호핑투어": "跳岛游 (Hopping Tour)",
      "해녀체험": "海女体验 (Haenyeo)",
      "비치 스쿠버다이빙": "岸边水肺潜水 (Beach Diving)",
      "보트 스쿠버다이빙": "乘船水肺潜水 (Boat Diving)"
    },
    dateLabel: "日期",
    timeLabel: "时间",
    peopleLabel: "人数",
    nameLabel: "姓名",
    namePlaceholder: "张三",
    phoneLabel: "联系电话 / WhatsApp",
    phonePlaceholder: "+86 138 0000 0000",
    emailLabel: "电子邮箱",
    emailPlaceholder: "用于接收付款收据",
    totalLabel: "总金额:",
    payNow: "立即付款",
    payLater: "或稍后付款",
    sendInvoice: "通过电子邮件发送付款发票",
    sending: "发送中...",
    sent: "发票已发送至邮箱",
    successTitle: "支付完成！",
    successDesc: "您的预订已成功注册。谢谢。",
    errName: "请输入您的姓名。",
    errPhone: "请输入您的联系电话。",
    errEmail: "请输入您的电子邮箱。",
    errPayment: "您的付款被拒绝。请尝试其他付款方式。",
    errInvoice: "发送发票时发生错误。"
  }
};

export default function QRBookingPage() {
  const [clientId, setClientId] = useState<string>('');
  const [lang, setLang] = useState<Lang>('en'); // Default to English
  
  useEffect(() => {
    // Ensuring this runs only on client to avoid hydration mismatch
    setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test');

    // Detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('ko')) {
        setLang('ko');
      } else if (browserLang.includes('zh')) {
        setLang('zh');
      } else {
        setLang('en');
      }
    }
  }, []);

  const t = translations[lang];

  const [activity, setActivity] = useState('호핑투어');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Time slots based on activity
  const getTimeSlots = () => {
    if (activity === '호핑투어') return ['10:00', '12:00', '14:00', '16:00'];
    if (activity === '해녀체험') return ['09:00', '11:00', '13:00', '15:00'];
    // 체험 다이빙 (비치, 보트)
    return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  };

  // Adjust time when activity changes
  useEffect(() => {
    const slots = getTimeSlots();
    if (!slots.includes(time)) {
      setTime(slots[0]);
    }
  }, [activity]);

  const getPrice = (act: string) => {
    if (act === '호핑투어') return 55;
    if (act === '해녀체험') return 45;
    if (act === '비치 스쿠버다이빙') return 55;
    if (act === '보트 스쿠버다이빙') return 65;
    return 100; // default fallback
  };

  const pricePerPerson = getPrice(activity);
  const total = pricePerPerson * quantity;

  const validateForm = () => {
    if (!name.trim()) { alert(t.errName); return false; }
    if (!phone.trim()) { alert(t.errPhone); return false; }
    if (!email.trim()) { alert(t.errEmail); return false; }
    return true;
  };

  const saveToFirestore = async (method: string) => {
    try {
      await addDoc(collection(db, 'bookings'), {
        name,
        phone,
        email,
        date,
        time,
        pax: quantity,
        category: activity, // Keep original Korean string for DB
        paymentMethod: method,
        checkedIn: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleSendInvoice = async () => {
    if (!validateForm()) return;
    
    setLoadingInvoice(true);
    try {
      const res = await fetch('/api/paypal/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, quantity, email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        await saveToFirestore('PayPal 인보이스(발송됨)');
        setInvoiceSent(true);
      } else {
        alert(data.error || t.errInvoice);
      }
    } catch (error) {
      console.error(error);
      alert(t.errInvoice);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const createOrder = async () => {
    if (!validateForm()) throw new Error("Validation failed");

    const res = await fetch('/api/paypal/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, quantity }),
    });
    const orderData = await res.json();
    if (!orderData.id) {
      throw new Error("Could not create order");
    }
    return orderData.id;
  };

  const onApprove = async (data: any) => {
    const res = await fetch(`/api/paypal/orders/${data.orderID}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const orderData = await res.json();
    
    if (orderData?.details?.[0]?.issue === "INSTRUMENT_DECLINED") {
      return alert(t.errPayment);
    }

    if (orderData.status === "COMPLETED") {
      await saveToFirestore('PayPal (즉시결제)');
      setOrderComplete(true);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
          <p className="text-gray-600">{t.successDesc}</p>
        </div>
      </div>
    );
  }

  // Map our internal lang state to PayPal locales
  const getPayPalLocale = () => {
    if (lang === 'zh') return 'zh_CN';
    if (lang === 'ko') return 'en_US'; // By user request previously, keep buttons in English for KR
    return 'en_US';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl">
        <div className="bg-blue-600 px-6 py-8 text-center rounded-t-2xl">
          <div className="flex justify-end gap-2 mb-2 absolute right-8 top-8">
            {/* Language switcher for manual override if they want */}
            <button onClick={() => setLang('en')} className={`text-xs px-2 py-1 rounded ${lang === 'en' ? 'bg-white text-blue-600' : 'text-blue-100 border border-blue-400'}`}>EN</button>
            <button onClick={() => setLang('ko')} className={`text-xs px-2 py-1 rounded ${lang === 'ko' ? 'bg-white text-blue-600' : 'text-blue-100 border border-blue-400'}`}>KR</button>
            <button onClick={() => setLang('zh')} className={`text-xs px-2 py-1 rounded ${lang === 'zh' ? 'bg-white text-blue-600' : 'text-blue-100 border border-blue-400'}`}>CN</button>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-4">{t.title}</h2>
          <p className="mt-2 text-blue-100">{t.subtitle}</p>
        </div>
        
        <div className="p-6 space-y-5">
          {/* 체험 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.activityLabel}</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="호핑투어">{t.activities["호핑투어"]} - $55</option>
              <option value="해녀체험">{t.activities["해녀체험"]} - $45</option>
              <option value="비치 스쿠버다이빙">{t.activities["비치 스쿠버다이빙"]} - $55</option>
              <option value="보트 스쿠버다이빙">{t.activities["보트 스쿠버다이빙"]} - $65</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateLabel}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {/* 시간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.timeLabel}</label>
              <select 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {getTimeSlots().map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>

          {/* 인원 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.peopleLabel}</label>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 예약자명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
            <input 
              type="text" 
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
            <input 
              type="tel" 
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
            <input 
              type="email" 
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">{t.totalLabel}</span>
              <span className="text-2xl font-bold text-gray-900">${total}</span>
            </div>

            {clientId && (
              <PayPalScriptProvider options={{ 
                clientId, 
                currency: 'USD', 
                intent: 'capture',
                "disable-funding": "paylater,venmo",
                locale: getPayPalLocale()
              }}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">{t.payNow}</span>
                    </div>
                  </div>

                  <div className="pb-2">
                    <PayPalButtons 
                      createOrder={createOrder}
                      onApprove={onApprove}
                      fundingSource={undefined}
                      style={{ layout: "vertical", shape: "rect", color: "blue" }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">{t.payLater}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendInvoice}
                    disabled={loadingInvoice || invoiceSent}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      invoiceSent 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {loadingInvoice ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t.sending}</>
                    ) : invoiceSent ? (
                      <><CheckCircle2 className="w-5 h-5 mr-2" /> {t.sent}</>
                    ) : (
                      t.sendInvoice
                    )}
                  </button>
                </div>
              </PayPalScriptProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
