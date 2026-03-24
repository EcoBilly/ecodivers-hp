"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/authService";
import { db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
    ]) as Promise<T>;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      console.log("Login button clicked");
    }
    setLoading(true);
    setError("");

    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }

      const loginEmail = (email.trim() === "admin" ? "admin@ecodivers.com" : email.trim());
      console.log("Step 1: Attempting login with email:", loginEmail);

      // Attempt login with timeout
      const userCredential = await withTimeout(signInWithEmailAndPassword(auth, loginEmail, password.trim()));
      console.log("Step 2: Login successful, UID:", userCredential.user.uid);

      // Auto-grant admin role (Non-blocking: if it fails, just ignore and proceed)
      if (userCredential.user && userCredential.user.uid === "JPtfQFrkGRVzqmejQc28DDlZC0K2") {
        console.log("Step 3: (Async) Auto-granting admin role for UID:", userCredential.user.uid);
        // Do not await this, just fire and forget, or wrap in try-catch
        setDoc(doc(db, "users", userCredential.user.uid), {
          role: "admin",
          email: userCredential.user.email,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn("Step 3 (Async failure): Firestore permission denied or error:", err.message);
        });
      }

      console.log("Step 4: Redirecting to admin schedule...");
      router.push("/admin/schedule/");
    } catch (err: any) {
      console.error("Login catch block triggered:", err);
      let message = "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";

      if (err.message === "Timeout") {
        message = "서버 응답 시간이 초과되었습니다. 인터넷 연결을 확인해 주세요.";
      } else if (err.code === 'auth/wrong-password') {
        message = "비밀번호가 틀렸습니다. 다시 확인해주세요.";
      } else if (err.code === 'auth/user-not-found') {
        message = "존재하지 않는 관리자 계정입니다.";
      } else if (err.code === 'auth/invalid-email') {
        message = "이메일 형식이 올바르지 않습니다.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      } else if (err.code === 'auth/network-request-failed') {
        message = "네트워크 연결에 실패했습니다. 방화벽이나 백신 설정을 확인해 주세요.";
      }

      setError(message);
      if (typeof window !== "undefined") {
        window.alert("로그인 에러: " + message + " (" + (err.code || err.message) + ")");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 mb-2">EcoDivers Admin <span className="text-xs text-blue-400">v1.1</span></h1>
          <p className="text-gray-500 font-medium">관리자 시스템 접속을 위해 로그인해주세요.</p>
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

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

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
