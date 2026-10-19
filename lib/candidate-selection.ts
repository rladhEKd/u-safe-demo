import type { InspectionCandidate } from "./types";
export type CandidateParams = Record<string, string | string[] | undefined>;
export function candidateUrl(distance: number, id?: string, record?: string) {
  const query = new URLSearchParams({ distance: String(distance) });
  if (id) query.set("candidate", id);
  if (record) query.set("record", record);
  return `/candidates?${query}`;
}
export function resolveCandidateSelection(params: CandidateParams, candidates: readonly InspectionCandidate[]) {
  const duplicate = Array.isArray(params.distance) || Array.isArray(params.candidate);
  const invalidDistance = typeof params.distance === "string" && !["100", "300", "500"].includes(params.distance);
  const distance = !duplicate && !invalidDistance && params.distance ? Number(params.distance) : 100;
  const id = typeof params.candidate === "string" ? params.candidate : undefined;
  const match = !duplicate && id ? candidates.find((c) => c.id === id) : undefined;
  const selected = match && match.distanceM <= distance ? match : null;
  const errorCode = duplicate ? "duplicate_parameter" : id === "" ? "empty_candidate" : id && !match ? "unknown_candidate" : match && !selected ? "out_of_range" : null;
  const messages = { duplicate_parameter: "중복된 거리 또는 후보 파라미터를 사용할 수 없습니다. 선택을 해제했습니다.", empty_candidate: "빈 후보 ID는 사용할 수 없습니다. 목록에서 후보를 선택하세요.", unknown_candidate: "원본 분석 결과에 없는 후보 ID입니다. 선택하지 않았습니다.", out_of_range: "선택 후보가 현재 거리 기준 밖에 있어 선택을 해제했습니다." };
  const error = errorCode ? `${messages[errorCode]}${invalidDistance ? " 지원하지 않는 거리값은 100m 기준으로 확인했습니다." : ""}` : null;
  const notice = params.notice === "distance_normalized" ? "지원하지 않는 거리값을 100m로 정규화했습니다." : null;
  return { distance, selected, error, errorCode, notice, invalidDistance, visible: candidates.filter((c) => c.distanceM <= distance).sort((a,b) => a.distanceM-b.distanceM || a.id.localeCompare(b.id)) };
}
