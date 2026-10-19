import CandidateExplorer from "@/components/candidate-explorer";
import hotspots from "@/data/hotspots.json";
import { analyzeProximity } from "@/lib/proximity";
import { candidateUrl, resolveCandidateSelection } from "@/lib/candidate-selection";
import type { CandidateParams } from "@/lib/candidate-selection";
import type { HotspotCollection } from "@/lib/types";
import { redirect } from "next/navigation";
import { resolveRecord, relatedCandidates } from "@/lib/page-selection";
import { recordKey } from "@/lib/mvp";
import { siteNavigation } from "@/lib/site-navigation";
const item = siteNavigation[2];
export const metadata = { title: `${item.label} | U-SAFE` };
export default async function Page({ searchParams }: { searchParams: Promise<CandidateParams> }) {
  const collection = hotspots as HotspotCollection;
  const candidates = analyzeProximity(collection);
  const params = await searchParams;
  const related = resolveRecord(params.record,collection);
  const relatedKey = related.record ? recordKey(related.record) : undefined;
  const eligible = related.error ? [] : relatedKey ? relatedCandidates(relatedKey,candidates) : candidates;
  const state = resolveCandidateSelection(params,eligible);
  if (state.invalidDistance && !related.error && !state.error) redirect(`${candidateUrl(100,state.selected?.id,relatedKey)}&notice=distance_normalized`);
  return <main className="page-shell functional-page"><p className="eyebrow">공간적 인접성 기반 탐색</p><h1>{item.label}</h1><p className="page-lead">거리 기준을 선택하고 후보 1쌍의 두 원본 기록을 비교해 현장 점검을 준비합니다. 가까운 거리가 실제 위험도 상승이나 시설 설치 필요성을 뜻하지 않습니다.</p><>{state.notice && <p role="status" className="muted">{state.notice}</p>}<CandidateExplorer key={`${state.distance}:${state.selected?.id ?? "none"}`} hotspots={collection} visible={state.visible} total={candidates.length} distance={state.distance} selected={state.selected} error={related.error ?? state.error} relatedRecord={related.record} /></></main>;
}
