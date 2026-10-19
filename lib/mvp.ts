import type { Hotspot, HotspotProperties, TrafficSite, TrafficSort } from "./types";
export const fmt = (n: number) => n.toLocaleString("ko-KR");
export const kindLabel = (kind: HotspotProperties["kind"]) => kind === "truck" ? "화물차" : "보행자";
export const recordKey = (p: HotspotProperties) => `${p.kind}:${p.selection_id}:${p.id}`;
export function filterHotspots(features: Hotspot[], truck: boolean, pedestrian: boolean, min: number) {
  return features.filter(({ properties: p }) => (p.kind === "truck" ? truck : pedestrian) && p.accidents >= min)
    .sort((a, b) => b.properties.accidents - a.properties.accidents);
}
export function filterTraffic(sites: TrafficSite[], query: string, sort: TrafficSort) {
  const q = query.trim().toLowerCase();
  return sites.filter((x) => `${x.road} ${x.location} ${x.site}`.toLowerCase().includes(q)).sort((a, b) => b[sort] - a[sort]);
}
export function brief(p: HotspotProperties) {
  return `【U-SAFE 점검 준비 브리핑 — 데이터 기반 시제품】
장소: ${p.name}
자료 유형: ${kindLabel(p.kind)} 사고다발지역
원본 기록 식별자: ${p.id} / 선정 ID: ${p.selection_id}
원본 기록의 사고건수: ${fmt(p.accidents)}건 · 사망자수: ${fmt(p.fatal)}명 · 중상자수: ${fmt(p.serious)}명
중심 좌표: ${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}

[현장 확인 제안 — 일반 점검 항목, 공식 지침 인용 아님]
• 횡단시설, 보행 동선 및 차량 시야 확보 상태 확인
• 교차로 접근부의 안내·노면표시·조명 상태 확인
• 실제 통행 동선과 대형차 회전·정차 공간 현장 확인
• 사고기록의 선정 연도와 원자료 범위 확인

주의: 본 자료는 현장 점검 준비용이며 위험도 예측, 사고 원인 판정, 개선 우선순위 확정 결과가 아닙니다. 교통량 조사지점과의 공간 결합도 수행하지 않았습니다.`;
}
