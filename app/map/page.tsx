import MapExplorer from "@/components/map-explorer";
import hotspots from "@/data/hotspots.json";
import type { HotspotCollection } from "@/lib/types";
import type { CandidateParams } from "@/lib/candidate-selection";
import { resolveRecord, resolveMapFilters } from "@/lib/page-selection";
import { siteNavigation } from "@/lib/site-navigation";
const item = siteNavigation[1];
export const metadata = { title: `${item.label} | U-SAFE` };
export default async function Page({ searchParams }: { searchParams: Promise<CandidateParams> }) { const params = await searchParams; const { record, error } = resolveRecord(params.record, hotspots as HotspotCollection); const filters = resolveMapFilters(params); return <main className="page-shell functional-page"><p className="eyebrow">원본 기록 탐색</p><h1>{item.label}</h1><p className="page-lead">화물차·보행자 사고다발지역을 지도와 목록에서 살펴보고, 선택한 원본 기록의 상세와 규칙 기반 점검 준비 요약을 확인합니다.</p><MapExplorer hotspots={hotspots as HotspotCollection} selectedRecord={record} error={error ?? filters.error} filters={filters} /><section className="note" aria-label="데이터 해석 주의사항">53개는 사고다발지역 기록 수이며 사고 발생 건수나 고유 장소 수가 아닙니다. 반복 선정·중첩 도형이 포함될 수 있습니다. 개별 사고 발생 지점·시설 결함·위험도를 뜻하지 않으며 교통량 조사지점과 공간적으로 연결하지 않습니다. 출처: 한국도로교통공단 사고다발지역 공개 데이터. 기관별 원본 링크는 하단 참조.</section></main>; }
