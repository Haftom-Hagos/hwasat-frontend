import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BACKEND_URL = "https://hafrepo-2.onrender.com";

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const icons = {
  layers:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  calendar:  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  reset:     "M3 12a9 9 0 109 9M3 3v9h9",
  chevronL:  "M15 18l-6-6 6-6",
  chevronR:  "M9 18l6-6-6-6",
  sun:       "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  moon:      "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  upload:    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  map:       "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16",
  compare:   "M18 20V10M12 20V4M6 20v-6",
  close:     "M18 6L6 18M6 6l12 12",
};

export default function Maps() {
  const mapRef = useRef(null);
  const boundaryLayersCache = useRef({});
  const layerFeatureMap = useRef(new Map());
  const featureMap = useRef(new Map());
  const overlayRef = useRef(null);
  const legendRef = useRef(null);
  const layerControlRef = useRef(null);

  // ── UI state ──
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(false);

  // ── Data state ──
  const [geojsonData, setGeojsonData] = useState({ adm1: null, adm2: null, adm3: null });
  const [dataset, setDataset] = useState("");
  const [index, setIndex] = useState("");
  const [adminLevel, setAdminLevel] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [featureList, setFeatureList] = useState([]);
  const [selectedFeatureGeoJSON, setSelectedFeatureGeoJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [useCustomGeoJSON, setUseCustomGeoJSON] = useState(false);
  const [customGeoJSON, setCustomGeoJSON] = useState(null);
  const fileInputRef = useRef(null);

  // ── Date state ──
  const [fromYear, setFromYear] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toYear, setToYear] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toDay, setToDay] = useState("");

  // ── Change detection state ──
  const [changeMode, setChangeMode] = useState(false);
  const [fromYear2, setFromYear2] = useState("");
  const [fromMonth2, setFromMonth2] = useState("");
  const [fromDay2, setFromDay2] = useState("");
  const [toYear2, setToYear2] = useState("");
  const [toMonth2, setToMonth2] = useState("");
  const [toDay2, setToDay2] = useState("");

  const [indexOptions, setIndexOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  // ── Theme tokens ──
  const t = darkMode ? {
    bg: "#0f1117", sidebar: "#161b27", card: "#1e2535", border: "#2a3347",
    text: "#e2e8f0", muted: "#94a3b8", accent: "#22c55e", accentHover: "#16a34a",
    input: "#1e2535", inputBorder: "#2a3347", inputText: "#e2e8f0",
    btnPrimary: "#1d4ed8", btnSecondary: "#16a34a", btnDanger: "#374151",
    shadow: "0 4px 24px rgba(0,0,0,0.5)",
  } : {
    bg: "#f1f5f9", sidebar: "#ffffff", card: "#f8fafc", border: "#e2e8f0",
    text: "#0f172a", muted: "#64748b", accent: "#16a34a", accentHover: "#15803d",
    input: "#ffffff", inputBorder: "#cbd5e1", inputText: "#0f172a",
    btnPrimary: "#1d4ed8", btnSecondary: "#16a34a", btnDanger: "#6b7280",
    shadow: "0 4px 24px rgba(0,0,0,0.08)",
  };

  const DATASET_CONFIG = {
    landcover: { label: "Land Cover", icon: "🗺️", indices: [{ v: "dynamic", t: "Dynamic World (10m)" }], yearRange: [2015, new Date().getFullYear()], minDate: "2015-07-27" },
    sentinel2: { label: "Sentinel-2", icon: "🛰️", indices: [
      { v: "NDVI", t: "NDVI" }, { v: "NDWI", t: "NDWI" }, { v: "NBR", t: "NBR" },
      { v: "NDBI", t: "NDBI" }, { v: "NDCI", t: "NDCI" }, { v: "GNDVI", t: "GNDVI" },
      { v: "NDRE", t: "NDRE" }, { v: "MNDWI", t: "MNDWI" }, { v: "NDMI", t: "NDMI" },
      { v: "NDSI", t: "NDSI" }, { v: "EVI", t: "EVI" }, { v: "EVI2", t: "EVI2" },
      { v: "SAVI", t: "SAVI" }, { v: "MSAVI", t: "MSAVI" }, { v: "ARVI", t: "ARVI" },
      { v: "GOSAVI", t: "GOSAVI" }, { v: "OSAVI", t: "OSAVI" }, { v: "MCARI", t: "MCARI" },
      { v: "MSI", t: "MSI" }, { v: "BSI", t: "BSI" }, { v: "SIPI", t: "SIPI" }
    ], yearRange: [2017, new Date().getFullYear()], minDate: "2017-06-23" },
    landsat: { label: "Landsat", icon: "🌍", indices: [
      { v: "NDVI", t: "NDVI" }, { v: "GNDVI", t: "GNDVI" }, { v: "NDWI", t: "NDWI" },
      { v: "NBR", t: "NBR" }, { v: "NDBI", t: "NDBI" }, { v: "NDMI", t: "NDMI" },
      { v: "NDSI", t: "NDSI" }, { v: "NDGI", t: "NDGI" }, { v: "EVI", t: "EVI" },
      { v: "SAVI", t: "SAVI" }, { v: "ARVI", t: "ARVI" }, { v: "AVI", t: "AVI" },
      { v: "GCI", t: "GCI" }, { v: "MSI", t: "MSI" }, { v: "BSI", t: "BSI" }, { v: "SIPI", t: "SIPI" }
    ], yearRange: [1984, new Date().getFullYear()], minDate: "1984-03-01" },
    modis: { label: "MODIS", icon: "🌐", indices: [
      { v: "NDVI", t: "NDVI" }, { v: "EVI", t: "EVI" }, { v: "NDWI", t: "NDWI" },
      { v: "NBR", t: "NBR" }, { v: "NDMI", t: "NDMI" }, { v: "NDSI", t: "NDSI" }
    ], yearRange: [2000, new Date().getFullYear()], minDate: "2000-02-18" },
    climate: { label: "Climate", icon: "🌦️", indices: [{ v: "SPI", t: "SPI" }, { v: "VHI", t: "VHI" }], yearRange: [1981, new Date().getFullYear()], minDate: "1981-01-01" },
  };

  const LANDCOVER_PALETTE = {
    water: "#419BDF", trees: "#397D49", grass: "#88B053",
    flooded_vegetation: "#7A87C6", crops: "#E49635", shrub_and_scrub: "#DFC35A",
    built: "#C4281B", bare: "#A59B8F", snow_and_ice: "#B39FE1",
  };

  const getPropName = (lvl) => lvl === "adm1" ? "ADM1_EN" : lvl === "adm2" ? "ADM2_EN" : "ADM3_EN";
  const normalizeColor = (c) => c?.startsWith("#") ? c : /^[0-9A-Fa-f]{6}$/.test(c) ? `#${c}` : c || "#ccc";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: `${String(i + 1).padStart(2, "0")} (${months[i]})`,
  }));
  const dayOptionsFor = (y, m) => (!y || !m) ? [] : Array.from({ length: new Date(Number(y), Number(m), 0).getDate() }, (_, i) => String(i + 1).padStart(2, "0"));

  // ── Map init ──
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map", { center: [9.145, 40.4897], zoom: 6 });
    mapRef.current = map;
    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19, zIndex: 1 }).addTo(map);
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Esri & contributors", maxZoom: 19, zIndex: 1 });
    map._baseStreet = street;
    map._baseSat = sat;
    layerControlRef.current = L.control.layers({ "Street Map": street, "Satellite": sat }, {}, { collapsed: false }).addTo(map);
  }, []);

  // Invalidate map size when sidebar toggles
  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize(), 320);
  }, [sidebarOpen]);

  // ── Load boundaries ──
  useEffect(() => {
    if (useCustomGeoJSON) return;
    Promise.all([
      fetch("/data/ethiopia_admin_level_1_gcs.geojson").then(r => r.json()),
      fetch("/data/ethiopia_admin_level_2_gcs.geojson").then(r => r.json()),
      fetch("/data/ethiopia_admin_level_3_gcs_simplified.geojson").then(r => r.json()),
    ]).then(([adm1, adm2, adm3]) => setGeojsonData({ adm1, adm2, adm3 }))
      .catch(() => setMessage("Failed to load boundary data."));
  }, [useCustomGeoJSON]);

  // ── File upload ──
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const geojson = JSON.parse(ev.target.result);
        let feature = geojson.type === "FeatureCollection" ? geojson.features[0] : geojson;
        if (!feature?.geometry || !["Polygon","MultiPolygon"].includes(feature.geometry.type))
          throw new Error("Must be Polygon or MultiPolygon");
        setCustomGeoJSON(feature);
        setSelectedFeatureGeoJSON(feature);
        setUseCustomGeoJSON(true);
        setMessage("Custom GeoJSON loaded successfully!");
      } catch (err) { setMessage(`Invalid GeoJSON: ${err.message}`); }
    };
    reader.readAsText(file);
  };

  // ── Dataset → indices/years ──
  useEffect(() => {
    if (!dataset) return;
    const cfg = DATASET_CONFIG[dataset];
    setIndexOptions(cfg.indices);
    const [minY, maxY] = cfg.yearRange;
    setYearOptions(Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i));
    setIndex("");
  }, [dataset]);

  // ── Admin level → boundaries ──
  useEffect(() => {
    if (useCustomGeoJSON || !mapRef.current || !geojsonData[adminLevel]) return;
    const map = mapRef.current;
    Object.values(boundaryLayersCache.current).forEach(l => map.removeLayer(l));
    layerFeatureMap.current.clear();
    featureMap.current.clear();
    setFeatureList([]);
    setFeatureName("");
    const prop = getPropName(adminLevel);
    setFeatureList(geojsonData[adminLevel].features.map(f => f.properties[prop]).sort((a, b) => a.localeCompare(b)));
    const layer = L.geoJSON(geojsonData[adminLevel], {
      style: { color: "#3b82f6", weight: 1.2, fillOpacity: 0 },
      onEachFeature: (feature, lyr) => {
        const name = feature.properties[prop];
        layerFeatureMap.current.set(name, lyr);
        featureMap.current.set(name, feature);
        lyr.on("click", () => {
          setFeatureName(name);
          setSelectedFeatureGeoJSON(feature);
          layerFeatureMap.current.forEach((l, n) => l.setStyle({ color: n === name ? "#ef4444" : "#3b82f6", weight: n === name ? 3 : 1.2 }));
          map.fitBounds(lyr.getBounds());
        });
      },
    }).addTo(map);
    boundaryLayersCache.current[adminLevel] = layer;
    map.fitBounds(layer.getBounds());
  }, [adminLevel, geojsonData, useCustomGeoJSON]);

  // ── Custom GeoJSON layer ──
  useEffect(() => {
    if (!useCustomGeoJSON || !customGeoJSON || !mapRef.current) return;
    const map = mapRef.current;
    if (boundaryLayersCache.current.custom) map.removeLayer(boundaryLayersCache.current.custom);
    const layer = L.geoJSON(customGeoJSON, { style: { color: "#ef4444", weight: 3, fillOpacity: 0.15 } }).addTo(map);
    boundaryLayersCache.current.custom = layer;
    map.fitBounds(layer.getBounds());
  }, [customGeoJSON, useCustomGeoJSON]);

  // ── Feature highlight ──
  useEffect(() => {
    if (useCustomGeoJSON || !featureName || !adminLevel || !layerFeatureMap.current.has(featureName)) return;
    const lyr = layerFeatureMap.current.get(featureName);
    setSelectedFeatureGeoJSON(featureMap.current.get(featureName));
    layerFeatureMap.current.forEach((l, n) => l.setStyle({ color: n === featureName ? "#ef4444" : "#3b82f6", weight: n === featureName ? 3 : 1.2 }));
    mapRef.current?.fitBounds(lyr.getBounds());
  }, [featureName, adminLevel, useCustomGeoJSON]);

  // ── Validate dates ──
  const validateDates = () => {
    if (!dataset || !fromYear || !toYear) return true;
    const cfg = DATASET_CONFIG[dataset];
    const minDate = new Date(cfg.minDate);
    const fromDate = new Date(`${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`);
    const toDate = new Date(`${toYear}-${toMonth || "12"}-${toDay || "31"}`);
    if (fromDate < minDate) { setMessage(`Start date must be after ${cfg.minDate} for ${cfg.label}`); return false; }
    if (toDate < fromDate) { setMessage("End date must be after start date"); return false; }
    return true;
  };

  const validateChangeDates = () => {
    if (!dataset || !fromYear || !toYear || !fromYear2 || !toYear2) return true;
    const cfg = DATASET_CONFIG[dataset];
    const minDate = new Date(cfg.minDate);
    const from1 = new Date(`${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`);
    const to1 = new Date(`${toYear}-${toMonth || "12"}-${toDay || "31"}`);
    const from2 = new Date(`${fromYear2}-${fromMonth2 || "01"}-${fromDay2 || "01"}`);
    const to2 = new Date(`${toYear2}-${toMonth2 || "12"}-${toDay2 || "31"}`);
    if (from1 < minDate || from2 < minDate) { setMessage(`Start date must be after ${cfg.minDate}`); return false; }
    if (to1 < from1) { setMessage("Period 1 end must be after start"); return false; }
    if (to2 < from2) { setMessage("Period 2 end must be after start"); return false; }
    return true;
  };

  // ── Overlay + Legend ──
  const addOverlayAndLegend = (data, datasetKey) => {
    const map = mapRef.current;
    if (!map) return;
    if (overlayRef.current) map.removeLayer(overlayRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);
    const tileUrl = data.tiles || data.mode_tiles;
    if (!tileUrl?.startsWith("http")) { setMessage(`No tiles returned for ${datasetKey}. Try a different date range.`); return; }
    const overlay = L.tileLayer(tileUrl, { opacity: 0.85, zIndex: 5 }).addTo(map);
    overlayRef.current = overlay;
    overlay.on("tileerror", (err) => console.error("Tile error:", err));
    if (data.bounds?.length) {
      try { map.fitBounds(data.bounds.map(([lng, lat]) => [lat, lng])); } catch {}
    }
    const vis = data.vis_params || {};
    const palette = (vis.palette || []).map(normalizeColor);
    const min = data.legend?.meta?.min ?? vis.min ?? 0;
    const max = data.legend?.meta?.max ?? vis.max ?? 1;
    const Legend = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create("div");
        div.style.cssText = "background:white;padding:8px 10px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border-radius:6px;font-family:sans-serif;min-width:160px";
        if (datasetKey === "landcover" && data.unique_classes?.length) {
          div.innerHTML = `<b style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em">Land Cover</b><br>`;
          data.unique_classes.forEach((cls, i) => {
            const name = typeof cls === "string" ? cls : cls.class_name || `Class ${i}`;
            const color = LANDCOVER_PALETTE[name] || palette[i % palette.length] || "#ccc";
            div.innerHTML += `<div style="display:flex;align-items:center;margin:3px 0"><i style="background:${color};width:14px;height:14px;border-radius:2px;margin-right:6px;flex-shrink:0"></i><span style="font-size:11px">${name.replace(/_/g," ")}</span></div>`;
          });
        } else {
          const label = data.legend?.label || index;
          div.innerHTML = `<b style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em">${label}</b>
            <div style="width:140px;height:10px;background:linear-gradient(to right,${palette.join(",")});border-radius:3px;margin:6px 0"></div>
            <div style="display:flex;justify-content:space-between;font-size:10px;color:#666"><span>${min.toFixed(2)}</span><span>${max.toFixed(2)}</span></div>`;
        }
        return div;
      },
    });
    legendRef.current = new Legend({ position: "bottomleft" });
    legendRef.current.addTo(map);
    if (layerControlRef.current) map.removeControl(layerControlRef.current);
    layerControlRef.current = L.control.layers(
      { "Street Map": map._baseStreet, "Satellite": map._baseSat },
      { [`${DATASET_CONFIG[datasetKey]?.label || "Data"} Layer`]: overlay },
      { collapsed: false }
    ).addTo(map);
    map.invalidateSize();
  };

  // ── View Selection ──
  const handleViewSelection = async () => {
    const geometry = useCustomGeoJSON ? customGeoJSON?.geometry : selectedFeatureGeoJSON?.geometry;
    if (!geometry) return setMessage(useCustomGeoJSON ? "Upload a GeoJSON first" : "Select a feature first");
    if (!dataset || !index) return setMessage("Select dataset and index");
    if (!fromYear || !toYear) return setMessage("Select date range");
    if (changeMode) {
      if (dataset === "landcover") return setMessage("Change detection not available for land cover");
      if (!fromYear2 || !toYear2) return setMessage("Select Period 2 years");
      if (!validateChangeDates()) return;
      setLoading(true); setMessage(null);
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 120000);
        const res = await fetch(`${BACKEND_URL}/change_detection`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataset, index,
            startDate1: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
            endDate1: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
            startDate2: `${fromYear2}-${fromMonth2 || "01"}-${fromDay2 || "01"}`,
            endDate2: `${toYear2}-${toMonth2 || "12"}-${toDay2 || "31"}`,
            geometry,
          }), signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        addOverlayAndLegend(data, dataset);
        setMessage("Change detection layer loaded successfully.");
      } catch (e) { setMessage(`Failed: ${e.message}`); }
      finally { setLoading(false); }
      return;
    }
    if (!validateDates()) return;
    setLoading(true); setMessage(null);
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 120000);
      const res = await fetch(`${BACKEND_URL}/gee_layers`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, index, startDate: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`, endDate: `${toYear}-${toMonth || "12"}-${toDay || "31"}`, geometry }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (!data.tiles && !data.mode_tiles) throw new Error(`No tiles for ${dataset} ${index}`);
      addOverlayAndLegend(data, dataset);
      setMessage("Layer loaded successfully.");
    } catch (e) { setMessage(`Failed: ${e.message}`); }
    finally { setLoading(false); }
  };

  // ── Download ──
  const handleDownloadClick = async () => {
    const geometry = useCustomGeoJSON ? customGeoJSON?.geometry : selectedFeatureGeoJSON?.geometry;
    if (!geometry) return setMessage(useCustomGeoJSON ? "Upload a GeoJSON first" : "Select a feature first");
    if (!dataset || !index) return setMessage("Select dataset and index");
    if (!fromYear || !toYear) return setMessage("Select date range");
    if (!validateDates()) return;
    setLoading(true);
    try {
      let sf = (useCustomGeoJSON ? customGeoJSON.properties?.name || "Custom" : featureName || "Custom").replace(/[\s\/\\]/g,"_").replace(/[^a-zA-Z0-9_]/g,"");
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1200000);
      if (changeMode) {
        if (dataset === "landcover") { setMessage("Change detection download not available for land cover"); setLoading(false); return; }
        if (!fromYear2 || !toYear2) { setMessage("Select Period 2 years"); setLoading(false); return; }
        const res = await fetch(`${BACKEND_URL}/download_change`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataset, index,
            startDate1: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
            endDate1: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
            startDate2: `${fromYear2}-${fromMonth2 || "01"}-${fromDay2 || "01"}`,
            endDate2: `${toYear2}-${toMonth2 || "12"}-${toDay2 || "31"}`,
            geometry, selectedFeature: sf }),
          signal: controller.signal,
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.detail || `HTTP ${res.status}`); }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `${dataset}_${index}_change_${fromYear}_${toYear}_vs_${fromYear2}_${toYear2}_${sf}.tif`;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
        setMessage("Download successful!");
        return;
      }
      const res = await fetch(`${BACKEND_URL}/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, index,
          startDate: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
          endDate: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
          geometry, selectedFeature: sf }),
        signal: controller.signal,
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || `HTTP ${res.status}`); }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${dataset}_${index}_${fromYear}-${toYear}_${sf}.tif`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Download successful!");
    } catch (e) { setMessage(`Notice: ${e.message}`); }
    finally { setLoading(false); }
  };

  // ── Reset ──
  const handleReset = () => {
    const map = mapRef.current;
    if (!map) return;
    if (overlayRef.current) map.removeLayer(overlayRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);
    Object.values(boundaryLayersCache.current).forEach(l => map.removeLayer(l));
    setDataset(""); setIndex(""); setAdminLevel(""); setFeatureList([]);
    setFeatureName(""); setSelectedFeatureGeoJSON(null); setMessage(null);
    setUseCustomGeoJSON(false); setCustomGeoJSON(null);
    setChangeMode(false);
    setFromYear(""); setFromMonth(""); setFromDay("");
    setToYear(""); setToMonth(""); setToDay("");
    setFromYear2(""); setFromMonth2(""); setFromDay2("");
    setToYear2(""); setToMonth2(""); setToDay2("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    map.setView([9.145, 40.4897], 6);
  };

  // ── Shared input style ──
  const inputStyle = {
    background: t.input, border: `1px solid ${t.inputBorder}`, color: t.inputText,
    padding: "7px 10px", borderRadius: 6, fontSize: 13, width: "100%",
    outline: "none", fontFamily: "sans-serif",
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, display: "block" };
  const sectionStyle = { marginBottom: 20 };
  const sectionTitleStyle = { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 };

  // ── Date row component ──
  const DateRow = ({ label, y, m, d, setY, setM, setD, color }) => (
    <div style={{ marginBottom: 8 }}>
      <span style={{ ...labelStyle, color: color || t.muted }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <select value={y} onChange={e => setY(e.target.value)} style={{ ...inputStyle, flex: 2 }}>
          <option value="">Year</option>
          {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
        <select value={m} onChange={e => setM(e.target.value)} style={{ ...inputStyle, flex: 2 }}>
          <option value="">Month</option>
          {monthOptions.map(mo => <option key={mo.value} value={mo.value}>{mo.label}</option>)}
        </select>
        <select value={d} onChange={e => setD(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          <option value="">Day</option>
          {dayOptionsFor(y, m).map(dd => <option key={dd} value={dd}>{dd}</option>)}
        </select>
      </div>
    </div>
  );

  const SIDEBAR_W = 300;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", background: t.bg, fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden" }}>

      {/* ── Collapsible Sidebar ── */}
      <div style={{
        width: sidebarOpen ? SIDEBAR_W : 0,
        minWidth: sidebarOpen ? SIDEBAR_W : 0,
        background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        transition: "width 0.3s ease, min-width 0.3s ease",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: t.shadow,
        zIndex: 100,
      }}>
        <div style={{ width: SIDEBAR_W, height: "100%", overflowY: "auto", padding: "16px 16px 24px" }}>

          {/* Sidebar header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🛰️</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: t.text }}>Controls</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: t.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* ── Area of Interest ── */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Icon d={icons.map} size={13} />
              Area of Interest
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {["Ethiopia Levels", "Upload GeoJSON"].map((label, i) => (
                <button key={i} onClick={() => { i === 0 ? (setUseCustomGeoJSON(false), setCustomGeoJSON(null)) : setUseCustomGeoJSON(true); }}
                  style={{ flex: 1, padding: "6px 4px", fontSize: 11, borderRadius: 6, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600,
                    background: (i === 0 ? !useCustomGeoJSON : useCustomGeoJSON) ? t.accent : t.card,
                    color: (i === 0 ? !useCustomGeoJSON : useCustomGeoJSON) ? "#fff" : t.muted,
                    border: `1px solid ${(i === 0 ? !useCustomGeoJSON : useCustomGeoJSON) ? t.accent : t.border}`,
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {useCustomGeoJSON ? (
              <div>
                <label style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px" }}>
                  <Icon d={icons.upload} size={14} />
                  <span style={{ fontSize: 12, color: t.muted }}>{customGeoJSON ? (customGeoJSON.properties?.name || "File loaded ✓") : "Click to upload GeoJSON"}</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".geojson,.json" style={{ display: "none" }} />
                </label>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>
                  <span style={labelStyle}>Admin Level</span>
                  <select value={adminLevel} onChange={e => setAdminLevel(e.target.value)} style={inputStyle}>
                    <option value="">Select level</option>
                    <option value="adm1">Level 1 — Regions</option>
                    <option value="adm2">Level 2 — Zones</option>
                    <option value="adm3">Level 3 — Districts</option>
                  </select>
                </div>
                <div>
                  <span style={labelStyle}>Feature</span>
                  <select value={featureName} onChange={e => setFeatureName(e.target.value)} style={inputStyle}>
                    <option value="">Select feature</option>
                    {featureList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* ── Dataset & Index ── */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Icon d={icons.layers} size={13} />
              Dataset & Index
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={labelStyle}>Dataset</span>
              <select value={dataset} onChange={e => setDataset(e.target.value)} style={inputStyle}>
                <option value="">Select dataset</option>
                {Object.entries(DATASET_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <span style={labelStyle}>Index / Variable</span>
              <select value={index} onChange={e => setIndex(e.target.value)} style={inputStyle} disabled={!dataset}>
                <option value="">Select variable</option>
                {indexOptions.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
              </select>
            </div>
          </div>

          {/* ── Mode Toggle ── */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Icon d={icons.compare} size={13} />
              Analysis Mode
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["Single Date", false], ["Change Detection", true]].map(([label, mode]) => (
                <button key={label} onClick={() => { setChangeMode(mode); setMessage(null); }}
                  style={{ flex: 1, padding: "7px 4px", fontSize: 11, borderRadius: 6, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600,
                    background: changeMode === mode ? (mode ? "#ea580c" : t.btnPrimary) : t.card,
                    color: changeMode === mode ? "#fff" : t.muted,
                    border: `1px solid ${changeMode === mode ? (mode ? "#ea580c" : t.btnPrimary) : t.border}`,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Dates ── */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>
              <Icon d={icons.calendar} size={13} />
              {changeMode ? "Period 1" : "Date Range"}
            </div>
            <DateRow label="From" y={fromYear} m={fromMonth} d={fromDay} setY={setFromYear} setM={setFromMonth} setD={setFromDay} />
            <DateRow label="To" y={toYear} m={toMonth} d={toDay} setY={setToYear} setM={setToMonth} setD={setToDay} />
          </div>

          {/* ── Period 2 (change detection) ── */}
          {changeMode && (
            <div style={{ ...sectionStyle, borderLeft: "3px solid #ea580c", paddingLeft: 12 }}>
              <div style={{ ...sectionTitleStyle, color: "#ea580c" }}>
                <Icon d={icons.compare} size={13} />
                Period 2
              </div>
              <div style={{ background: darkMode ? "rgba(234,88,12,0.08)" : "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "6px 10px", marginBottom: 10, fontSize: 11, color: "#9a3412", fontFamily: "sans-serif" }}>
                📊 Result = <b>Period 2 − Period 1</b><br />
                🟢 Green = increase · ⚪ White = no change · 🔴 Red = decrease
              </div>
              <DateRow label="From" y={fromYear2} m={fromMonth2} d={fromDay2} setY={setFromYear2} setM={setFromMonth2} setD={setFromDay2} color="#ea580c" />
              <DateRow label="To" y={toYear2} m={toMonth2} d={toDay2} setY={setToYear2} setM={setToMonth2} setD={setToDay2} color="#ea580c" />
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleViewSelection} disabled={loading}
              style={{ background: t.btnPrimary, color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "sans-serif" }}>
              <Icon d={icons.eye} size={14} /> View Selection
            </button>
            <button onClick={handleDownloadClick} disabled={loading}
              style={{ background: t.btnSecondary, color: "#fff", border: "none", borderRadius: 7, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "sans-serif" }}>
              <Icon d={icons.download} size={14} /> Download Selection
            </button>
            <button onClick={handleReset}
              style={{ background: t.card, color: t.muted, border: `1px solid ${t.border}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "sans-serif" }}>
              <Icon d={icons.reset} size={14} /> Reset Map
            </button>
          </div>

          {/* ── Message ── */}
          {message && (
            <div style={{
              marginTop: 14, padding: "10px 12px", borderRadius: 7, fontSize: 12, fontFamily: "sans-serif", lineHeight: 1.5,
              background: message.toLowerCase().includes("success") || message.toLowerCase().includes("loaded") ? (darkMode ? "rgba(34,197,94,0.1)" : "#f0fdf4") : (darkMode ? "rgba(239,68,68,0.1)" : "#fef2f2"),
              border: `1px solid ${message.toLowerCase().includes("success") || message.toLowerCase().includes("loaded") ? "#86efac" : "#fca5a5"}`,
              color: message.toLowerCase().includes("success") || message.toLowerCase().includes("loaded") ? "#15803d" : "#b91c1c",
            }}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* ── Sidebar toggle button ── */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
        position: "absolute", left: sidebarOpen ? SIDEBAR_W : 0, top: "50%", transform: "translateY(-50%)",
        zIndex: 200, background: t.sidebar, border: `1px solid ${t.border}`,
        borderLeft: sidebarOpen ? "none" : `1px solid ${t.border}`,
        borderRadius: sidebarOpen ? "0 6px 6px 0" : "0 6px 6px 0",
        padding: "12px 5px", cursor: "pointer", color: t.muted,
        transition: "left 0.3s ease", boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}>
        <Icon d={sidebarOpen ? icons.chevronL : icons.chevronR} size={14} />
      </button>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />

        {/* Loading spinner */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.35)", zIndex: 9999, gap: 16 }}>
            <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.3)", borderTop: "4px solid #22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#fff", fontSize: 13, fontFamily: "sans-serif", fontWeight: 500 }}>Processing satellite data...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

    </div>
  );
}
