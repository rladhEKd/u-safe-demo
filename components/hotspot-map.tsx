"use client";
import { useEffect } from "react";
import { geoJSON } from "leaflet";
import { GeoJSON, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { Hotspot, HotspotCollection, HotspotProperties, InspectionCandidate } from "@/lib/types";
import { fmt, kindLabel, recordKey } from "@/lib/mvp";

function MapFocus({ selected, candidate, features }: { selected: HotspotProperties | null; candidate: InspectionCandidate | null; features: Hotspot[] }) {
  const map = useMap();
  useEffect(() => {
    if (candidate) {
      const keys = [recordKey(candidate.truck), recordKey(candidate.pedestrian)];
      const pair = features.filter((f) => keys.includes(recordKey(f.properties)));
      const collection: HotspotCollection = { type: "FeatureCollection", features: pair };
      const bounds = geoJSON(collection).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
    } else if (selected) map.setView([selected.lat, selected.lon], 15);
  }, [map, selected, candidate, features]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
export default function HotspotMap({ features, selected, candidate, onSelect }: {
  features: Hotspot[]; selected: HotspotProperties | null; candidate: InspectionCandidate | null; onSelect: (p: HotspotProperties) => void;
}) {
  return <MapContainer center={[35.55, 129.32]} zoom={11} className="hotspot-map">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19} />
    <MapFocus selected={selected} candidate={candidate} features={features} />
    {features.map((feature) => {
      const p = feature.properties;
      const active = selected && recordKey(selected) === recordKey(p);
      const paired = candidate && [recordKey(candidate.truck), recordKey(candidate.pedestrian)].includes(recordKey(p));
      return <GeoJSON key={recordKey(p)} data={feature} style={{ color: p.kind === "truck" ? "#dc554c" : "#277bb8", weight: paired ? 6 : active ? 4 : 2, fillOpacity: paired || active ? 0.4 : 0.2, dashArray: paired ? "8 4" : undefined }} eventHandlers={{ click: () => onSelect(p) }}>
        <Popup><strong>{p.name}</strong><br />{kindLabel(p.kind)} 사고다발지역<br />사고 {fmt(p.accidents)}건 · 선정 ID {p.selection_id}<br />사망 {fmt(p.fatal)}명 · 중상 {fmt(p.serious)}명</Popup>
      </GeoJSON>;
    })}
  </MapContainer>;
}
