import { NextRequest, NextResponse } from 'next/server';

// 관리자 전용 경로
const ADMIN_PATHS = ['/admin', '/admin/schedule', '/admin/settlement', '/admin/checkin-settings'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin 경로 접근 시 — Next.js 미들웨어 레벨에서 추가 보안 헤더 주입
  // (Firebase Auth는 클라이언트 사이드이므로 서버사이드 완전 차단은 별도 세션 쿠키 필요)
  // 현재는 헤더 기반 보안 강화 + 봇/크롤러 차단
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const response = NextResponse.next();

    // 봇/크롤러 User-Agent 차단
    const ua = req.headers.get('user-agent') || '';
    const botPatterns = /bot|crawler|spider|scraper|curl|wget|python-requests|go-http/i;
    if (botPatterns.test(ua)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 추가 캐시 방지 헤더
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  // /api/telegram/notify — 외부 직접 접근 차단 (브라우저 origin 기반)
  if (pathname === '/api/telegram/notify') {
    const origin = req.headers.get('origin');
    const allowedOrigin = 'https://ecodivers-hp.vercel.app';

    // origin이 있는데 허용 도메인이 아니면 즉시 차단
    if (origin && origin !== allowedOrigin) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/telegram/:path*',
  ],
};
