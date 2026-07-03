import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 보안 헤더 (Helmet.js 수준)
  async headers() {
    // Content-Security-Policy 정책
    // - default-src: 기본적으로 자기 자신만 허용
    // - script-src: Next.js 인라인 스크립트(nonce 없이)와 Google Fonts 허용
    // - style-src: Google Fonts CSS 허용
    // - img-src: 자기 자신, data URI, Firebase Storage
    // - connect-src: Firebase, Telegram API (서버사이드에서만 실제 호출)
    // - frame-ancestors: DENY (클릭재킹 방지)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.paypal.com https://*.paypalobjects.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com https://*.paypal.com",
      "frame-src 'self' https://www.sandbox.paypal.com https://www.paypal.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        // 전체 페이지 공통 보안 헤더
        source: "/(.*)",
        headers: [
          // CSP (Content Security Policy) — XSS, 인젝션 방지
          { key: "Content-Security-Policy", value: csp },
          // 클릭재킹(Clickjacking) 방지
          { key: "X-Frame-Options", value: "DENY" },
          // MIME 타입 스니핑 방지
          { key: "X-Content-Type-Options", value: "nosniff" },
          // HTTPS 강제 (HSTS) — 1년, 서브도메인 포함
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Referrer 정보 최소화
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 권한 정책 — 불필요한 브라우저 기능 차단
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()" },
          // XSS 레거시 브라우저 보호
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // DNS Prefetch 제어 (정보 유출 방지)
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
      {
        // 관리자 페이지: 검색엔진 수집 차단 + 캐시 금지
        source: "/admin(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // 로그인 페이지
        source: "/login",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, private" },
        ],
      },
      {
        // API 엔드포인트
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, no-cache" },
        ],
      },
      {
        // 체크인 페이지 (개인정보)
        source: "/checkin(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, private" },
        ],
      },
    ];
  },
};

export default nextConfig;
