"use client";

import { useState, useEffect, Suspense } from "react";
import { auth } from "@/lib/authService";
import { db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    // 권한 없는 접근 시도로 리다이렉트된 경우 안내 메시지
    if (searchParams.get('reason') === 'unauthorized') {
      setError('접근 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
    }
  }, [searchParams]);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
    ]) as Promise<T>;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!auth) throw new Error("Firebase Auth not initialized");

      const loginEmail = (email.trim() === "admin" ? "admin@ecodivers.com" : email.trim());
      const userCredential = await withTimeout(signInWithEmailAndPassword(auth, loginEmail, password.trim()));

      // Auto-grant admin role (Non-blocking)
      if (userCredential.user && userCredential.user.uid === "BOSaRDC3BDNfrvsyCoyan7bVfnx1") {
        setDoc(doc(db, "users", userCredential.user.uid), {
          role: "admin",
          email: userCredential.user.email,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn("Firestore role update failed:", err.message);
        });
      }

      const redirectTo = searchParams.get("redirect") || "/admin/schedule";
      router.push(redirectTo);
    } catch (err: any) {
      console.error("Login error full:", err);
      let message = "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      if (err.message === "Timeout") {
        message = "서버 응답 시간이 초과되었습니다.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = "이메일 또는 비밀번호가 틀렸습니다.";
      } else if (err.code === 'auth/user-not-found') {
        message = "존재하지 않는 계정입니다. Firebase에서 계정을 먼저 생성해주세요.";
      } else if (err.code === 'auth/invalid-email') {
        message = "이메일 형식이 올바르지 않습니다.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.";
      } else if (err.code === 'auth/network-request-failed') {
        message = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
      } else if (err.code) {
        message = `오류 코드: ${err.code}`;
      }
      setError(message);
      // Fallback: alert so it's always visible
      if (!document.querySelector('[data-error]')) {
        // error state will render, no need for alert
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-white text-sm animate-pulse">로딩 중...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 mb-2">EcoDivers <span className="text-xs text-blue-400">로그인</span></h1>
          <p className="text-gray-500 font-medium">시스템 접속을 위해 로그인해주세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6" id="admin-login-form">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">이메일 주소</label>
            <input
              id="email"
              name="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="admin@ecodivers.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div data-error className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm font-bold text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isClient || loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "시스템 접속"}
          </button>
        </form>
        {loading && (
          <div className="mt-6 text-center">
            <p className="text-blue-600 font-bold animate-pulse">로그인 정보를 확인 중입니다...</p>
            <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">로딩 중...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
