"use client";
import { useState } from "react";
import { brief, fmt, kindLabel } from "@/lib/mvp";
import type { HotspotProperties } from "@/lib/types";
export default function Briefing({ selected }: { selected: HotspotProperties | null }) {
  const [message, setMessage] = useState("");
  const text = selected ? brief(selected) : "사고다발지역을 선택하면 규칙 기반 점검 준비 요약이 표시됩니다.";
  async function copy() {
    if (!selected) return;
    try { await navigator.clipboard.writeText(text); setMessage("브리핑을 복사했습니다."); }
    catch { window.prompt("아래 텍스트를 복사하세요", text); setMessage("브리핑을 직접 복사할 수 있는 창을 열었습니다."); }
  }
  return <section className="section" aria-labelledby="briefing-title">
    {selected && <div className="record-details"><h3>선택한 원본 기록</h3><p><strong>{selected.name}</strong></p><dl>
      <dt>자료 유형</dt><dd>{kindLabel(selected.kind)}</dd>
      <dt>기록 ID / 선정 ID</dt><dd>{selected.id} / {selected.selection_id}</dd>
      <dt>사고 / 사망 / 중상</dt><dd>{fmt(selected.accidents)}건 / {fmt(selected.fatal)}명 / {fmt(selected.serious)}명</dd>
      <dt>원본 중심 좌표</dt><dd>{selected.lat}, {selected.lon}</dd>
    </dl></div>}
    <h2 id="briefing-title">점검 준비 브리핑 <span className="badge">규칙 기반</span></h2>
    <div className="briefing" aria-live="polite">{text}</div>
    <button className="primary section" disabled={!selected} onClick={copy}>브리핑 복사</button>
    <p role="status" className="muted">{message}</p>
    <p className="muted">이 영역은 원본 데이터 기반 규칙형 요약입니다. AI와 지침 원문 검색은 공개 시연에서 제공하지 않습니다.</p>
  </section>;
}
