'use client';

import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function QRBookingPage() {
  const [clientId, setClientId] = useState<string>('');
  
  useEffect(() => {
    // Ensuring this runs only on client to avoid hydration mismatch with env vars
    setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test');
  }, []);

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
    if (!name.trim()) { alert('예약자 성함을 입력해주세요.'); return false; }
    if (!phone.trim()) { alert('연락처를 입력해주세요.'); return false; }
    if (!email.trim()) { alert('이메일 주소를 입력해주세요.'); return false; }
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
        category: activity,
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
        alert(data.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while sending the invoice.');
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
      return alert("Your payment was declined. Please try another payment method.");
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h2>
          <p className="text-gray-600">예약 내역이 성공적으로 등록되었습니다. 감사합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl">
        <div className="bg-blue-600 px-6 py-8 text-center rounded-t-2xl">
          <h2 className="text-3xl font-extrabold text-white">Eco Divers Booking</h2>
          <p className="mt-2 text-blue-100">Quick & easy booking via QR</p>
        </div>
        
        <div className="p-6 space-y-5">
          {/* 체험 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Activity (체험 선택)</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="호핑투어">Hopping Tour (호핑투어) - $55</option>
              <option value="해녀체험">Haenyeo Experience (해녀체험) - $45</option>
              <option value="비치 스쿠버다이빙">Beach Scuba Diving (비치 스쿠버다이빙) - $55</option>
              <option value="보트 스쿠버다이빙">Boat Scuba Diving (보트 스쿠버다이빙) - $65</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date (날짜)</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {/* 시간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (시간)</label>
              <select 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {getTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 인원 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of People (인원 수)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (예약자명)</label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (연락처)</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (이메일)</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900">${total}</span>
            </div>

            {clientId && (
              <PayPalScriptProvider options={{ 
                clientId, 
                currency: 'USD', 
                intent: 'capture',
                "disable-funding": "paylater,venmo",
                locale: "en_US"
              }}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Pay Now</span>
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
                      <span className="px-2 bg-white text-gray-500">Or Pay Later</span>
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
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                    ) : invoiceSent ? (
                      <><CheckCircle2 className="w-5 h-5 mr-2" /> Invoice Sent to Email</>
                    ) : (
                      'Send me an Invoice via Email'
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
