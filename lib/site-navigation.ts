export const siteNavigation = [
  { href: "/", label: "홈", description: "서비스 소개와 이용 흐름" },
  { href: "/map", label: "안전지도", description: "원본 사고다발지역 지도와 기록 상세" },
  { href: "/candidates", label: "점검 후보 탐색", description: "공간적으로 인접한 화물차·보행자 기록 쌍 탐색" },
  { href: "/briefing", label: "AI 점검 브리핑", description: "공개 시연의 AI 호출 제한 및 기능 구조 안내" },
  { href: "/guidelines", label: "안전지침 검색", description: "공개 시연 제한 안내와 공식 원문 출처" },
  { href: "/traffic", label: "교통량 데이터", description: "상세 데이터 공개 제한 안내와 공식 자료" },
] as const;
export function isCurrentPage(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
export const availablePages: readonly string[] = ["/map", "/candidates", "/briefing", "/guidelines", "/traffic"];
