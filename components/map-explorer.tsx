"use client";
import dynamic from "next/dynamic";
import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mapUrl } from "@/lib/page-selection";
import type { HotspotCollection, HotspotProperties } from "@/lib/types";
import { filterHotspots, fmt, kindLabel, recordKey } from "@/lib/mvp";
import Briefing from "./briefing";
const HotspotMap = dynamic(() => import("./hotspot-map"), { ssr: false, loading: () => <div className="map-loading" role="status">사고다발지역 지도를 불러오는 중입니다…</div> });
export default function MapExplorer({ hotspots, selectedRecord, filters, error }: { hotspots: HotspotCollection; selectedRecord: HotspotProperties | null; filters: { truck: boolean; pedestrian: boolean; min: number }; error: string | null }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const [optimisticFilters, updateFilters] = useOptimistic(filters, (_current, next: typeof filters) => next);
  const intent = useRef({ filters, record: selectedRecord });
  useEffect(() => { if (!pending) intent.current = { filters, record: selectedRecord }; }, [filters, selectedRecord, pending]);
  const { truck, pedestrian, min } = optimisticFilters;
  const features = filterHotspots(hotspots.features, truck, pedestrian, min);
  const selected = selectedRecord && features.some((f) => recordKey(f.properties) === recordKey(selectedRecord)) ? selectedRecord : null;
  function choose(record: HotspotProperties | null) {
    intent.current.record = record;
    const next = intent.current.filters;
    startTransition(() => router.push(mapUrl(record ? recordKey(record) : undefined,next.truck,next.pedestrian,next.min), { scroll: false }));
  }
  function filter(patch: Partial<typeof filters>) {
    const next = { ...intent.current.filters, ...patch };
    const record = intent.current.record;
    const remains = record && filterHotspots(hotspots.features,next.truck,next.pedestrian,next.min).some((f) => recordKey(f.properties) === recordKey(record));
    intent.current = { filters: next, record: remains ? record : null };
    startTransition(() => { updateFilters(next); router.push(mapUrl(remains ? recordKey(record) : undefined,next.truck,next.pedestrian,next.min), { scroll: false }); });
  }
  return <div className="map-explorer" aria-busy={pending}>
    <section className="panel map-primary" aria-labelledby="map-title"><h2 id="map-title">사고다발지역 지도</h2>
      <div className="controls"><label><input type="checkbox" checked={truck} onChange={(e) => filter({ truck: e.target.checked })} /> 화물차</label><label><input type="checkbox" checked={pedestrian} onChange={(e) => filter({ pedestrian: e.target.checked })} /> 보행자</label><label>사고건수 <select value={min} onChange={(e) => filter({ min: Number(e.target.value) })}><option value={0}>전체</option><option value={3}>3건 이상</option><option value={5}>5건 이상</option></select></label></div>
      <p className="muted" role="status">표시 중: {features.length} / {hotspots.features.length}개 기록 · 원본 기록 1개 선택 모드</p>
      {error && <p role="alert" className="note">{error}</p>}
      {selectedRecord && !selected && <p role="status">현재 필터에서 제외된 기록입니다. 필터를 변경하면 확인할 수 있습니다.</p>}
      {pending && <p role="status">원본 기록 선택을 확인하는 중입니다…</p>}
      <HotspotMap features={features} selected={selected} candidate={null} onSelect={choose} />
      <p className="legend"><span className="dot red" />화물차 <span className="dot blue" />보행자 · 원본 사고다발지역 폴리곤</p>
      <p className="muted">배경 지도는 인터넷 연결이 필요합니다. 배경이 표시되지 않아도 오른쪽 또는 아래 목록에서 기록을 선택할 수 있습니다.</p>
    </section>
    <aside className="map-secondary" aria-label="원본 기록 목록과 상세"><section className="panel" aria-labelledby="records-title"><h2 id="records-title">원본 기록 목록</h2><p className="muted">목록이나 지도 도형을 선택하면 아래 상세와 규칙 기반 브리핑이 표시됩니다. 후보 쌍 선택과 별도 기능입니다.</p>
      <div className="hotlist">{features.map(({ properties: p }) => <button key={recordKey(p)} className="item" aria-pressed={selected ? recordKey(selected) === recordKey(p) : false} onClick={() => choose(p)}><strong>{p.name}</strong><span className="muted">{kindLabel(p.kind)} · 사고 {fmt(p.accidents)}건 · 선정 ID {p.selection_id}</span></button>)}{features.length === 0 && <p role="status">조건에 맞는 기록이 없습니다. 유형 또는 사고건수 필터를 변경하세요.</p>}</div>
    </section><section className="panel" aria-label="원본 상세와 규칙 기반 브리핑">{selected && <><button onClick={() => choose(null)}>선택 해제</button><p><Link href={`/candidates?distance=500&record=${encodeURIComponent(recordKey(selected))}`}>이 기록이 포함된 후보 모두 보기 →</Link></p></>}<Briefing key={selected ? recordKey(selected) : "none"} selected={selected} /></section></aside>
  </div>;
}
