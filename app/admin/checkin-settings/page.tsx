"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserRole } from "@/lib/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HealthQuestion {
  id: string;
  text: string;
  active: boolean;
}

interface CheckinSettings {
  notificationTemplate: string;
  liabilityWaiver: string;
  healthQuestions: HealthQuestion[];
  timeLimitMinutes: number;
}

const defaultSettings: CheckinSettings = {
  notificationTemplate: "[EcoDivers] 예약이 확정되었습니다.\n아래 링크에서 체크인을 진행해 주세요.\n{link}",
  liabilityWaiver: `본인은 에코다이버스에서 진행하는 프로그램에 참여함에 있어 다음의 사항을 충분히 이해하고 동의합니다.\n\n1. 본인은 현재 건강 상태가 양호하며, 프로그램 참여에 방해가 될 만한 기저질환(심장병, 폐질환, 고혈압 등)이 없음을 확인합니다.\n2. 진행 요원의 안전 수칙 및 지시 사항을 철저히 준수할 것을 약속합니다.\n3. 안전 수칙을 미준수하거나 본인의 부주의로 발생하는 사고에 대해서는 본인에게 책임이 있음을 인지합니다.\n4. 활동 중 발생할 수 있는 경미한 찰과상 등에 대해 안전 요원의 응급 처치에 동의합니다.`,
  healthQuestions: [
    { id: "1", text: "최근 1개월 이내에 수술을 받은 적이 있습니까?", active: true },
    { id: "2", text: "현재 복용 중인 처방약이 있습니까?", active: true },
    { id: "3", text: "심장 또는 폐 질환을 앓고 계십니까?", active: true },
  ],
  timeLimitMinutes: 60,
};

export default function CheckinSettingsPage() {
  const [settings, setSettings] = useState<CheckinSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await getUserRole(currentUser);
        if (role !== "admin") {
          alert("관리자 권한이 필요합니다.");
          router.push("/");
        } else {
          fetchSettings();
        }
      } else {
        router.push("/login?redirect=/admin/checkin-settings");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "checkin");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CheckinSettings;
        setSettings({
          notificationTemplate: data.notificationTemplate || defaultSettings.notificationTemplate,
          liabilityWaiver: data.liabilityWaiver || defaultSettings.liabilityWaiver,
          healthQuestions: data.healthQuestions || defaultSettings.healthQuestions,
          timeLimitMinutes: data.timeLimitMinutes !== undefined ? data.timeLimitMinutes : defaultSettings.timeLimitMinutes,
        });
      }
    } catch (error) {
      console.error("Error fetching checkin settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "checkin");
      await setDoc(docRef, settings, { merge: true });
      alert("체크인 설정이 저장되었습니다.");
    } catch (error) {
      console.error("Error saving checkin settings:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updateHealthQuestion = (index: number, field: keyof HealthQuestion, value: any) => {
    const newQs = [...settings.healthQuestions];
    newQs[index] = { ...newQs[index], [field]: value };
    setSettings({ ...settings, healthQuestions: newQs });
  };

  const addHealthQuestion = () => {
    setSettings({
      ...settings,
      healthQuestions: [...settings.healthQuestions, { id: Date.now().toString(), text: "", active: true }]
    });
  };

  const removeHealthQuestion = (index: number) => {
    const newQs = settings.healthQuestions.filter((_, i) => i !== index);
    setSettings({ ...settings, healthQuestions: newQs });
  };

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">체크인 설정</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">온라인 체크인 페이지 콘텐츠 및 문진표 관리</p>
          </div>
          <Link href="/admin/schedule" className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition">
            ← 일정표로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Section 1: Notification Template */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">알림톡 / 링크 복사용 안내 메시지</h2>
            <p className="text-xs text-gray-500 mb-4">{`{link}`} 태그를 포함하면 실제 체크인 페이지 주소로 자동 변환됩니다.</p>
            <textarea
              value={settings.notificationTemplate}
              onChange={(e) => setSettings({ ...settings, notificationTemplate: e.target.value })}
              className="w-full h-32 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              placeholder="안내 메시지를 입력하세요..."
            />
          </div>

          {/* Section 2: Liability Waiver */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 mb-2">면책 동의서 본문</h2>
            <p className="text-xs text-gray-500 mb-4">고객이 체크인 시 반드시 동의해야 하는 안전 수칙 및 면책 동의 내용입니다.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">편집창 (줄바꿈 지원)</label>
                <textarea
                  value={settings.liabilityWaiver}
                  onChange={(e) => setSettings({ ...settings, liabilityWaiver: e.target.value })}
                  className="w-full h-64 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y bg-white"
                  placeholder="면책 동의서 내용을 입력하세요..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">미리보기</label>
                <div className="w-full h-64 border border-gray-200 bg-white rounded-xl p-4 text-xs text-gray-600 leading-relaxed overflow-y-auto whitespace-pre-wrap font-medium">
                  {settings.liabilityWaiver}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Health Questionnaire */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-1">건강 문진표 질문 관리</h2>
                <p className="text-xs text-gray-500">질문을 On/Off 하여 표시 여부를 결정할 수 있습니다.</p>
              </div>
              <button
                onClick={addHealthQuestion}
                className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition"
              >
                + 질문 추가
              </button>
            </div>
            
            <div className="space-y-3">
              {settings.healthQuestions.map((q, index) => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateHealthQuestion(index, "text", e.target.value)}
                      className="w-full border-b border-gray-200 p-2 text-sm focus:border-blue-600 outline-none"
                      placeholder="질문을 입력하세요..."
                    />
                  </div>
                  <div className="flex items-center gap-4 justify-end">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${q.active ? 'text-blue-600' : 'text-gray-400'}`}>
                        {q.active ? '사용 중' : '사용 안함'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={q.active}
                          onChange={(e) => updateHealthQuestion(index, "active", e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <button 
                      onClick={() => removeHealthQuestion(index)}
                      className="text-xs font-bold px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {settings.healthQuestions.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  등록된 문진표 질문이 없습니다.
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Time Limit */}
          <div className="p-6 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 mb-2">체크인 마감 시간</h2>
            <p className="text-xs text-gray-500 mb-4">예약 시간 이후 몇 분까지 온라인 체크인을 허용할지 설정합니다. (현장 도착 후 체크인 허용)</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">예약 시간 이후</span>
              <input
                type="number"
                min="0"
                value={settings.timeLimitMinutes}
                onChange={(e) => setSettings({ ...settings, timeLimitMinutes: parseInt(e.target.value) || 0 })}
                className="w-24 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-gray-800"
              />
              <span className="text-sm font-bold text-gray-700">분 후까지 수정 가능</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">예: 60 설정 시 → 예약 시간 후 1시간까지 체크인 허용</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg transition disabled:opacity-50 text-lg flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>저장 중...</span>
              </>
            ) : "설정 저장하기"}
          </button>
        </div>

      </div>
    </div>
  );
}
