import { recordKey } from "./mvp";
import type { HotspotCollection, InspectionCandidate } from "./types";
export function resolveRecord(value: string | string[] | undefined, hotspots: HotspotCollection) {
  if (value === undefined) return { record: null, error: null };
  if (typeof value !== "string" || !value || value.length > 180) return { record: null, error: "중복되거나 잘못된 원본 기록 키입니다." };
  const record = hotspots.features.find((f) => recordKey(f.properties) === value)?.properties ?? null;
  return { record, error: record ? null : "원본 목록에 없는 기록 키입니다." };
}
export function resolveBriefingCandidate(value: string | string[] | undefined, candidates: readonly InspectionCandidate[]) {
  if (value === undefined) return { candidate: null, error: null };
  if (typeof value !== "string" || !value || value.length > 180) return { candidate: null, error: "중복되거나 잘못된 후보 ID입니다." };
  const candidate = candidates.find((c) => c.id === value && c.distanceM <= 500) ?? null;
  return { candidate, error: candidate ? null : "500m 이내 원본 분석 결과에 없는 후보입니다." };
}
export function relatedCandidates(record: string, candidates: readonly InspectionCandidate[]) {
  return candidates.filter((c) => recordKey(c.truck) === record || recordKey(c.pedestrian) === record);
}
export function mapUrl(key?: string, truck = true, pedestrian = true, min = 0) {
  const params = new URLSearchParams();
  if (key) params.set("record",key);
  if (!truck) params.set("truck","0");
  if (!pedestrian) params.set("pedestrian","0");
  if (min) params.set("min",String(min));
  return `/map${params.size ? `?${params}` : ""}`;
}
export function resolveMapFilters(params: Record<string, string | string[] | undefined>) {
  const invalid = ["truck", "pedestrian"].some((key) => params[key] !== undefined && params[key] !== "0" && params[key] !== "1") || (params.min !== undefined && !["0","3","5"].includes(params.min as string));
  return { truck: invalid || params.truck !== "0", pedestrian: invalid || params.pedestrian !== "0", min: invalid ? 0 : Number(params.min ?? 0), error: invalid ? "유효하지 않은 지도 필터를 기본값으로 표시합니다." : null };
}
