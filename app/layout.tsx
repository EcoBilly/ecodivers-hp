import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "에코다이버스 | 제주 스쿠버 다이빙·프리다이빙·해녀체험 전문",
  description:
    "제주도 No.1 다이빙 센터 에코다이버스. 스쿠버 다이빙, 프리다이빙, 해녀체험, 호핑투어, 펀다이빙 예약. PADI·AIDA 공인. 당일예약 가능.",
  keywords:
    "제주 다이빙, 제주 스쿠버, 프리다이빙, 해녀체험, 호핑투어, 에코다이버스, PADI, AIDA",
  openGraph: {
    title: "에코다이버스 | 제주 스쿠버 다이빙·프리다이빙 전문",
    description: "제주도 최북단 청정 바다에서 즐기는 다이빙 경험",
    locale: "ko_KR",
    type: "website",
  },
  // 개발/미완성 단계: 전체 사이트 검색엔진 노출 차단
  // 웹사이트 완성 후 이 라인 제거
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Montserrat:wght@300;400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Header />
        {children}
        <ChatbotWidget />
        <Footer />
      </body>
    </html>
  );
}
