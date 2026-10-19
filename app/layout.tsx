import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import SiteHeader from "@/components/site-header";
export const metadata: Metadata = { title: "U-SAFE | 공개 시연", description: "울산 사고다발지역 지도와 공간적 인접성 기반 점검 후보 탐색 공개 시연" };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="ko"><body><a className="skip-link" href="#main-content">본문 바로가기</a><SiteHeader/><div className="demo-banner" role="note">공개 시연 · 안전지도와 점검 후보 탐색 제공 · AI 생성·지침 원문 검색·교통량 상세 제공 제외</div><div id="main-content" tabIndex={-1}>{children}</div><footer className="page-shell source-footer"><p>출처: 한국도로교통공단 사고다발지역 공개 데이터 · <a href="https://www.data.go.kr/data/15113414/openapi.do" target="_blank" rel="noreferrer">화물차</a> · <a href="https://www.data.go.kr/data/15105289/openapi.do" target="_blank" rel="noreferrer">보행자</a> · <a href="https://github.com/rladhEKd/u-safe-demo" target="_blank" rel="noreferrer">공개 시연 소스</a></p><p>화물차 2019~2024, 보행자 2019~2025를 포함하는 중첩 3년 집계의 선정 기록. 53개는 고유 장소 수가 아니며 사고건수 합산·위험도 예측 미제공.</p></footer></body></html>;
}
