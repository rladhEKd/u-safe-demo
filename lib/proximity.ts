import proj4 from "proj4";
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js";
import GeometryFactory from "jsts/org/locationtech/jts/geom/GeometryFactory.js";
import DistanceOp from "jsts/org/locationtech/jts/operation/distance/DistanceOp.js";
import IsValidOp from "jsts/org/locationtech/jts/operation/valid/IsValidOp.js";
import type { Position } from "geojson";
import type { HotspotCollection, HotspotGeometry, InspectionCandidate } from "./types";

// Only the validated Ulsan extent is supported. Distances are UTM grid metres.
export const UTM52N = "+proj=utm +zone=52 +datum=WGS84 +units=m +no_defs";
const projection = proj4("EPSG:4326", UTM52N);
const reader = new GeoJSONReader(new GeometryFactory());

function projectRing(ring: Position[]) {
  if (ring.length < 4 || ring[0][0] !== ring.at(-1)?.[0] || ring[0][1] !== ring.at(-1)?.[1]) {
    throw new Error("공간 분석 중단: 닫히지 않았거나 너무 짧은 폴리곤 링");
  }
  for (const p of ring) {
    if (p.length !== 2 || !p.every(Number.isFinite) || p[0] < 128 || p[0] > 130 || p[1] < 35 || p[1] > 36) {
      throw new Error("공간 분석 중단: 울산 WGS84 경도·위도 범위를 벗어난 좌표");
    }
  }
  const output: number[][] = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    // Conservative degree bound: subdivide original GeoJSON straight segments
    // to at most ~10m before projection, without altering stored source data.
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 112000 / 10));
    for (let s = 0; s < steps; s++) {
      output.push(projection.forward([a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps]));
    }
  }
  output.push([...output[0]]);
  return output;
}

export function projectGeometry(geometry: HotspotGeometry): HotspotGeometry {
  if (geometry.type === "Polygon") return { type: "Polygon", coordinates: geometry.coordinates.map(projectRing) };
  if (geometry.type === "MultiPolygon") return { type: "MultiPolygon", coordinates: geometry.coordinates.map((polygon) => polygon.map(projectRing)) };
  throw new Error("공간 분석 중단: Polygon/MultiPolygon만 지원합니다.");
}

function readValid(geometry: HotspotGeometry) {
  const projected = reader.read(projectGeometry(geometry));
  if (projected.isEmpty() || !new IsValidOp(projected).isValid()) throw new Error("공간 분석 중단: 유효하지 않은 도형");
  return projected;
}

export function polygonDistanceM(a: HotspotGeometry, b: HotspotGeometry) {
  return DistanceOp.distance(readValid(a), readValid(b));
}

export function analyzeProximity(collection: HotspotCollection): InspectionCandidate[] {
  if ("crs" in collection) throw new Error("공간 분석 중단: 별도 CRS 선언을 확인해야 합니다.");
  const prepared = collection.features.map((f) => {
    if (f.properties.kind !== "truck" && f.properties.kind !== "pedestrian") throw new Error("공간 분석 중단: 알 수 없는 사고 유형");
    return { p: f.properties, geometry: readValid(f.geometry) };
  });
  const trucks = prepared.filter((f) => f.p.kind === "truck");
  const pedestrians = prepared.filter((f) => f.p.kind === "pedestrian");
  const candidates: InspectionCandidate[] = [];
  for (const truck of trucks) for (const pedestrian of pedestrians) {
    const distanceM = DistanceOp.distance(truck.geometry, pedestrian.geometry);
    if (!Number.isFinite(distanceM) || distanceM < 0) throw new Error("공간 분석 중단: 거리 계산 실패");
    candidates.push({
      id: `${truck.p.kind}:${truck.p.selection_id}:${truck.p.id}|${pedestrian.p.kind}:${pedestrian.p.selection_id}:${pedestrian.p.id}`,
      truck: truck.p, pedestrian: pedestrian.p, distanceM,
      sameCenter: truck.p.lat === pedestrian.p.lat && truck.p.lon === pedestrian.p.lon,
      sameName: truck.p.name.replace(/울산광역시|울산|\s/g, "") === pedestrian.p.name.replace(/울산광역시|울산|\s/g, ""),
    });
  }
  return candidates.sort((a, b) => a.distanceM - b.distanceM || a.id.localeCompare(b.id));
}
