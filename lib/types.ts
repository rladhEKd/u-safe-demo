import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
export type HotspotProperties = {
  kind: "truck" | "pedestrian"; id: string; selection_id: string; name: string;
  accidents: number; fatal: number; serious: number; lat: number; lon: number;
};
export type HotspotGeometry = Polygon | MultiPolygon;
export type Hotspot = Feature<HotspotGeometry, HotspotProperties>;
export type HotspotCollection = FeatureCollection<HotspotGeometry, HotspotProperties>;
export type InspectionCandidate = {
  id: string; truck: HotspotProperties; pedestrian: HotspotProperties;
  distanceM: number; sameCenter: boolean; sameName: boolean;
};
export type TrafficSite = {
  site: string; road: string; location: string; pdf_page: number;
  values: string[]; source_line: string; total_vehicles: number;
  trucks: number; large_trucks: number; truck_share_pct: number;
};
export type TrafficSort = "trucks" | "truck_share_pct" | "total_vehicles";
