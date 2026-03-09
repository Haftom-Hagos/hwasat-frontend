import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BACKEND_URL = "https://hafrepo-2.onrender.com";

export default function Maps() {
  const mapRef = useRef(null);
  const boundaryLayersCache = useRef({});
  const layerFeatureMap = useRef(new Map());
  const featureMap = useRef(new Map());
  const overlayRef = useRef(null);
  const legendRef = useRef(null);
  const layerControlRef = useRef(null);

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

  const [fromYear, setFromYear] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toYear, setToYear] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toDay, setToDay] = useState("");
  // Change detection mode
  const [changeMode, setChangeMode] = useState(false);

  // Period 2 dates (for change detection)
  const [fromYear2, setFromYear2] = useState("");
  const [fromMonth2, setFromMonth2] = useState("");
  const [fromDay2, setFromDay2] = useState("");
  const [toYear2, setToYear2] = useState("");
  const [toMonth2, setToMonth2] = useState("");
  const [toDay2, setToDay2] = useState("");

  const [indexOptions, setIndexOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  // 🗂️ Dataset configuration
  const DATASET_CONFIG = {
  landcover: { label: "Land cover", indices: [{ v: "dynamic", t: "Dynamic World (10m)" }], yearRange: [2015, new Date().getFullYear()], minDate: "2015-07-27" },
  sentinel2: { label: "Sentinel-2", indices: [
    { v: "NDVI", t: "NDVI" },
    { v: "NDWI", t: "NDWI" },
    { v: "NBR", t: "NBR" },
    { v: "NDBI", t: "NDBI" },
    { v: "NDCI", t: "NDCI" },
    { v: "GNDVI", t: "GNDVI" },
    { v: "NDRE", t: "NDRE" },
    { v: "MNDWI", t: "MNDWI" },
    { v: "NDMI", t: "NDMI" },
    { v: "NDSI", t: "NDSI" },
    { v: "EVI", t: "EVI" },
    { v: "EVI2", t: "EVI2" },
    { v: "SAVI", t: "SAVI" },
    { v: "MSAVI", t: "MSAVI" },
    { v: "ARVI", t: "ARVI" },
    { v: "GOSAVI", t: "GOSAVI" },
    { v: "OSAVI", t: "OSAVI" },
    { v: "MCARI", t: "MCARI" },
    { v: "MSI", t: "MSI" },
    { v: "BSI", t: "BSI" },
    { v: "SIPI", t: "SIPI" }
  ], yearRange: [2017, new Date().getFullYear()], minDate: "2017-06-23" },
  landsat: { label: "Landsat", indices: [
    { v: "NDVI", t: "NDVI" },
    { v: "GNDVI", t: "GNDVI" },
    { v: "NDWI", t: "NDWI" },
    { v: "NBR", t: "NBR" },
    { v: "NDBI", t: "NDBI" },
    { v: "NDMI", t: "NDMI" },
    { v: "NDSI", t: "NDSI" },
    { v: "NDGI", t: "NDGI" },
    { v: "EVI", t: "EVI" },
    { v: "SAVI", t: "SAVI" },
    { v: "ARVI", t: "ARVI" },
    { v: "AVI", t: "AVI" },
    { v: "GCI", t: "GCI" },
    { v: "MSI", t: "MSI" },
    { v: "BSI", t: "BSI" },
    { v: "SIPI", t: "SIPI" }
  ], yearRange: [1984, new Date().getFullYear()], minDate: "1984-03-01" },
  modis: { label: "MODIS", indices: [
    { v: "NDVI", t: "NDVI" },
    { v: "EVI", t: "EVI" },
    { v: "NDWI", t: "NDWI" },
    { v: "NBR", t: "NBR" },
    { v: "NDMI", t: "NDMI" },
    { v: "NDSI", t: "NDSI" }
  ], yearRange: [2000, new Date().getFullYear()], minDate: "2000-02-18" },
  climate: { label: "Climate", indices: [{ v: "SPI", t: "SPI" }, { v: "VHI", t: "VHI" }], yearRange: [1981, new Date().getFullYear()], minDate: "1981-01-01" },
};


  const LANDCOVER_PALETTE = {
    water: "#419BDF",
    trees: "#397D49",
    grass: "#88B053",
    flooded_vegetation: "#7A87C6",
    crops: "#E49635",
    shrub_and_scrub: "#DFC35A",
    built: "#C4281B",
    bare: "#A59B8F",
    snow_and_ice: "#B39FE1",
  };

  const getPropName = (lvl) => (lvl === "adm1" ? "ADM1_EN" : lvl === "adm2" ? "ADM2_EN" : "ADM3_EN");
  const normalizeColor = (c) => (c?.startsWith("#") ? c : /^[0-9A-Fa-f]{6}$/.test(c) ? `#${c}` : c || "#ccc");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: `${String(i + 1).padStart(2, "0")} (${months[i]})`,
  }));

  // 🗺️ Initialize map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map", { center: [9.145, 40.4897], zoom: 6 });
    mapRef.current = map;

    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
      zIndex: 1,
    }).addTo(map);
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri & contributors",
      maxZoom: 19,
      zIndex: 1,
    });
    map._baseStreet = street;
    map._baseSat = sat;
    layerControlRef.current = L.control.layers({ "Street Map": street, "Satellite": sat }, {}, { collapsed: false }).addTo(map);
  }, []);

  // 📁 Load boundaries (only for Ethiopia mode)
  useEffect(() => {
    if (useCustomGeoJSON) return;
    Promise.all([
      fetch("/data/ethiopia_admin_level_1_gcs.geojson").then((r) => r.json()),
      fetch("/data/ethiopia_admin_level_2_gcs.geojson").then((r) => r.json()),
      fetch("/data/ethiopia_admin_level_3_gcs_simplified.geojson").then((r) => r.json()),
    ])
      .then(([adm1, adm2, adm3]) => setGeojsonData({ adm1, adm2, adm3 }))
      .catch((err) => {
        setMessage("Failed to load boundary data. Please try again.");
      });
  }, [useCustomGeoJSON]);

  // Handle custom GeoJSON upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result);
        let feature;
        if (geojson.type === "FeatureCollection") {
          if (geojson.features.length === 0) throw new Error("No features in GeoJSON");
          feature = geojson.features[0];
        } else if (geojson.type === "Feature") {
          feature = geojson;
        } else {
          throw new Error("Invalid GeoJSON format - must be Feature or FeatureCollection");
        }
        if (!feature.geometry || !["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
          throw new Error("Geometry must be Polygon or MultiPolygon");
        }
        setCustomGeoJSON(feature);
        setSelectedFeatureGeoJSON(feature);
        setUseCustomGeoJSON(true);
        setMessage("Custom GeoJSON loaded successfully!");
      } catch (error) {
        setMessage(`Invalid GeoJSON file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Toggle between Ethiopia and custom
  const toggleBoundaryMode = () => {
    if (useCustomGeoJSON) {
      setUseCustomGeoJSON(false);
      setCustomGeoJSON(null);
      setSelectedFeatureGeoJSON(null);
      setAdminLevel("");
      setFeatureName("");
      setFeatureList([]);
      fileInputRef.current.value = "";
    } else {
      setUseCustomGeoJSON(true);
    }
  };

  // 🎛️ Update indices and years per dataset
  useEffect(() => {
    if (!dataset) return;
    const cfg = DATASET_CONFIG[dataset];
    setIndexOptions(cfg.indices);
    const [minY, maxY] = cfg.yearRange;
    setYearOptions(Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i));
  }, [dataset]);

  // Validate dates
  const validateDates = () => {
    if (!dataset || !fromYear || !toYear) return true;
    const cfg = DATASET_CONFIG[dataset];
    const minDate = new Date(cfg.minDate);
    const fromDate = new Date(`${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`);
    const toDate = new Date(`${toYear}-${toMonth || "12"}-${toDay || "31"}`);
    if (fromDate < minDate) {
      setMessage(`Start date must be after ${cfg.minDate} for ${cfg.label}`);
      return false;
    }
    if (toDate < fromDate) {
      setMessage("End date must be after start date");
      return false;
    }
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
    if (from1 < minDate || from2 < minDate) {
      setMessage(`Start date must be after ${cfg.minDate} for ${cfg.label}`);
      return false;
    }
    if (to1 < from1) { setMessage("Period 1 end date must be after start date"); return false; }
    if (to2 < from2) { setMessage("Period 2 end date must be after start date"); return false; }
    return true;
  };

  // 📆 Month/Day dropdowns
  const dayOptionsFor = (y, m) => (!y || !m) ? [] : Array.from({ length: new Date(Number(y), Number(m), 0).getDate() }, (_, i) => String(i + 1).padStart(2, "0"));

  // 🗺️ Admin level → show boundaries and features (Ethiopia mode only)
  useEffect(() => {
    if (useCustomGeoJSON || !mapRef.current || !geojsonData[adminLevel]) return;
    const map = mapRef.current;
    Object.values(boundaryLayersCache.current).forEach((l) => map.removeLayer(l));
    layerFeatureMap.current.clear();
    featureMap.current.clear();
    setFeatureList([]);
    setFeatureName("");

    const prop = getPropName(adminLevel);
    const names = geojsonData[adminLevel].features.map((f) => f.properties[prop]).sort((a, b) => a.localeCompare(b));
    setFeatureList(names);

    const layer = L.geoJSON(geojsonData[adminLevel], {
      style: { color: "#3388ff", weight: 1.2, fillOpacity: 0 },
      onEachFeature: (feature, lyr) => {
        const name = feature.properties[prop];
        layerFeatureMap.current.set(name, lyr);
        featureMap.current.set(name, feature);
        lyr.on("click", () => {
          setFeatureName(name);
          setSelectedFeatureGeoJSON(feature);
          layerFeatureMap.current.forEach((l, n) => l.setStyle({
            color: n === name ? "#ff0000" : "#3388ff",
            weight: n === name ? 3 : 1.2,
          }));
          map.fitBounds(lyr.getBounds());
        });
      },
    }).addTo(map);
    boundaryLayersCache.current[adminLevel] = layer;
    map.fitBounds(layer.getBounds());
  }, [adminLevel, geojsonData, useCustomGeoJSON]);

  // Load custom GeoJSON layer
  useEffect(() => {
    if (!useCustomGeoJSON || !customGeoJSON || !mapRef.current) return;
    const map = mapRef.current;
    if (boundaryLayersCache.current.custom) map.removeLayer(boundaryLayersCache.current.custom);
    const customLayer = L.geoJSON(customGeoJSON, {
      style: { color: "#ff0000", weight: 3, fillOpacity: 0.2 },
      onEachFeature: (feature, lyr) => {
        lyr.on("click", () => {
          map.fitBounds(lyr.getBounds());
        });
      },
    }).addTo(map);
    boundaryLayersCache.current.custom = customLayer;
    map.fitBounds(customLayer.getBounds());
  }, [customGeoJSON, useCustomGeoJSON]);

  // Highlight and fit on dropdown selection (Ethiopia mode only)
  useEffect(() => {
    if (useCustomGeoJSON || !featureName || !adminLevel || !layerFeatureMap.current.has(featureName)) return;
    const lyr = layerFeatureMap.current.get(featureName);
    const feature = featureMap.current.get(featureName);
    setSelectedFeatureGeoJSON(feature);
    layerFeatureMap.current.forEach((l, n) => l.setStyle({
      color: n === featureName ? "#ff0000" : "#3388ff",
      weight: n === featureName ? 3 : 1.2,
    }));
    const map = mapRef.current;
    if (map) {
      map.fitBounds(lyr.getBounds());
    }
  }, [featureName, adminLevel, useCustomGeoJSON]);

  // 🎨 Overlay + Legend builder
  const addOverlayAndLegend = (data, datasetKey) => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) map.removeLayer(overlayRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);

    const tileUrl = data.tiles || data.mode_tiles;
    if (!tileUrl || !tileUrl.startsWith("http")) {
      const errorMsg = datasetKey === 'landsat'
        ? `No valid map tiles returned for ${datasetKey} ${data.legend?.label || index}. Try a wider date range or different region.`
        : `No valid map tiles returned for ${datasetKey} ${data.legend?.label || index}. Please try a different date range or index.`;
      setMessage(errorMsg);
      return;
    }

    console.log(`Loading tile URL: ${tileUrl}`); // Debug tile URL

	const overlay = L.tileLayer(tileUrl, { opacity: 0.85, zIndex: 5 }).addTo(map);
    overlayRef.current = overlay;

	overlay.on('tileerror', (err) => {
      console.error('Tile error:', err);
    });

    

    if (data.bounds?.length) {
      try {
        const latlngs = data.bounds.map(([lng, lat]) => [lat, lng]);
        map.fitBounds(latlngs);
      } catch {
        setMessage("Failed to adjust map bounds.");
      }
    }
	
    const vis = data.vis_params || {};
    const palette = (vis.palette || []).map(normalizeColor);
    const min = data.legend?.meta?.min ?? vis.min ?? 0;
    const max = data.legend?.meta?.max ?? vis.max ?? 1;

	const indexDescriptions = {
	  // Sentinel-2
	  'sentinel2_NDVI': 'Sentinel-2 NDVI',
	  'sentinel2_NDWI': 'Sentinel-2 NDWI',
	  'sentinel2_NBR': 'Sentinel-2 NBR',
	  'sentinel2_NDBI': 'Sentinel-2 NDBI',
	  'sentinel2_NDCI': 'Sentinel-2 NDCI',
	  'sentinel2_GNDVI': 'Sentinel-2 GNDVI',
	  'sentinel2_NDRE': 'Sentinel-2 NDRE',
	  'sentinel2_MNDWI': 'Sentinel-2 MNDWI',
	  'sentinel2_NDMI': 'Sentinel-2 NDMI',
	  'sentinel2_NDSI': 'Sentinel-2 NDSI',
	  'sentinel2_EVI': 'Sentinel-2 EVI',
	  'sentinel2_EVI2': 'Sentinel-2 EVI2',
	  'sentinel2_SAVI': 'Sentinel-2 SAVI',
	  'sentinel2_MSAVI': 'Sentinel-2 MSAVI',
	  'sentinel2_ARVI': 'Sentinel-2 ARVI',
	  'sentinel2_GOSAVI': 'Sentinel-2 GOSAVI',
	  'sentinel2_OSAVI': 'Sentinel-2 OSAVI',
	  'sentinel2_MCAR': 'Sentinel-2 MCARI',
	  'sentinel2_MSI': 'Sentinel-2 MSI',
	  'sentinel2_BSI': 'Sentinel-2 BSI',
	  'sentinel2_SIPI': 'Sentinel-2 SIPI',
	  // Landsat
	  'landsat_NDVI': 'Landsat NDVI',
	  'landsat_GNDVI': 'Landsat GNDVI',
	  'landsat_NDWI': 'Landsat NDWI',
	  'landsat_NBR': 'Landsat NBR',
	  'landsat_NDBI': 'Landsat NDBI',
	  'landsat_NDMI': 'Landsat NDMI',
	  'landsat_NDSI': 'Landsat NDSI',
	  'landsat_NDGI': 'Landsat NDGI',
	  'landsat_EVI': 'Landsat EVI',
	  'landsat_SAVI': 'Landsat SAVI',
	  'landsat_ARVI': 'Landsat ARVI',
	  'landsat_AVI': 'Landsat AVI',
	  'landsat_GCI': 'Landsat GCI',
	  'landsat_MSI': 'Landsat MSI',
	  'landsat_BSI': 'Landsat BSI',
	  'landsat_SIPI': 'Landsat SIPI',
	  // MODIS
	  'modis_NDVI': 'MODIS NDVI',
	  'modis_EVI': 'MODIS EVI',
	  'modis_NDWI': 'MODIS NDWI',
	  'modis_NBR': 'MODIS NBR',
	  'modis_NDMI': 'MODIS NDMI',
	  'modis_NDSI': 'MODIS NDSI',
	  // Climate
	  'climate_SPI': 'Climate SPI',
	  'climate_VHI': 'Climate VHI',
	  // Landcover
	  'landcover_dynamic': 'Land Cover Dynamic',
	};

		const Legend = L.Control.extend({
		  onAdd() {
			const div = L.DomUtil.create("div", "info legend");
			div.style.background = "white";
			div.style.padding = "6px 8px";
			div.style.fontSize = "12px";
			div.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

			if (datasetKey === "landcover" && data.unique_classes?.length) {
			  div.innerHTML = `<b>Land Cover Dynamic</b><br>`;
			  data.unique_classes.forEach((cls, i) => {
				const className = typeof cls === "string" ? cls : cls.class_name || `Class ${i}`;
				const color = LANDCOVER_PALETTE[className] || palette[i % palette.length] || "#ccc";
				const displayName = className.replace(/_/g, " ");
				div.innerHTML += `
				  <div style="display:flex;align-items:center;margin:2px 0">
					<i style="background:${color};width:18px;height:18px;border:1px solid #999;margin-right:6px;"></i>${displayName}
				  </div>`;
			  });
			} else {
			  const grad = `linear-gradient(to right, ${palette.join(",")})`;
			  const legendKey = `${datasetKey}_${data.legend?.label || index}`;
			  const description = indexDescriptions[legendKey] || `${DATASET_CONFIG[datasetKey]?.label || 'Data'} ${data.legend?.label || index}`;
			  div.innerHTML = `
				<div><b>${description}</b></div>
				<div style="width:160px;height:14px;background:${grad};border:1px solid #ccc;margin:4px 0;border-radius:4px;"></div>
				<div style="display:flex;justify-content:space-between;font-size:11px"><span>${min.toFixed(2)}</span><span>${max.toFixed(2)}</span></div>`;
			}
			return div;
		  },
		});

		legendRef.current = new Legend({ position: "bottomleft" });
		legendRef.current.addTo(map);

		if (layerControlRef.current) {
		  map.removeControl(layerControlRef.current);
		}
		const overlayName = `${DATASET_CONFIG[datasetKey]?.label || "Data"} Layer`;
		const overlaysObj = { [overlayName]: overlayRef.current };
		layerControlRef.current = L.control.layers(
		  { "Street Map": map._baseStreet, "Satellite": map._baseSat },
		  overlaysObj,
		  { collapsed: false }
		).addTo(map);

		map.invalidateSize(); // Ensure map is redrawn
		};

  // 📤 View
  const handleViewSelection = async () => {
    const geometry = useCustomGeoJSON ? customGeoJSON.geometry : selectedFeatureGeoJSON?.geometry;
    if (!geometry) return setMessage(useCustomGeoJSON ? "Upload a GeoJSON first" : "Select a feature first");
    if (!dataset || !index) return setMessage("Select dataset and index");
    if (!fromYear || !toYear) return setMessage("Select from and to years");

    // Change detection mode
    if (changeMode) {
      if (dataset === 'landcover') return setMessage("Change detection is not available for land cover data");
      if (!fromYear2 || !toYear2) return setMessage("Select Period 2 years");
      if (!validateChangeDates()) return;
      setLoading(true);
      setMessage(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);
        const res = await fetch(`${BACKEND_URL}/change_detection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataset, index,
            startDate1: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
            endDate1: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
            startDate2: `${fromYear2}-${fromMonth2 || "01"}-${fromDay2 || "01"}`,
            endDate2: `${toYear2}-${toMonth2 || "12"}-${toDay2 || "31"}`,
            geometry,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        addOverlayAndLegend(data, dataset);
        setMessage("Change detection layer loaded successfully.");
      } catch (e) {
        setMessage(`Failed to load change detection: ${e.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal mode — existing code unchanged
    if (!validateDates()) return;
    setLoading(true);
    setMessage(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(`${BACKEND_URL}/gee_layers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset, index,
          startDate: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
          endDate: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
          geometry,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      if (!data.tiles && !data.mode_tiles) {
        throw new Error(`No tiles available for ${dataset} ${index}`);
      }
      addOverlayAndLegend(data, dataset);
      setMessage("Layer loaded successfully.");
    } catch (e) {
      setMessage(`Failed to visualize selection: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Download
const handleDownloadClick = async () => {
    const geometry = useCustomGeoJSON ? customGeoJSON.geometry : selectedFeatureGeoJSON?.geometry;
    if (!geometry) return setMessage(useCustomGeoJSON ? "Upload a GeoJSON first" : "Select a feature first");
    if (!dataset || !index) return setMessage("Select dataset and index");
    if (!fromYear || !toYear) return setMessage("Select from and to years");
    if (!validateDates()) return;
    setLoading(true);
    try {
      let selectedFeature = useCustomGeoJSON ? (customGeoJSON.properties?.name || "Custom") : (featureName || "Custom");
      selectedFeature = selectedFeature.replace(/[\s\/\\]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

      const startDay = fromDay || "01";
      const startMonth = fromMonth || "01";
      const startYear = fromYear.slice(-2);
      const endDay = toDay || "31";
      const endMonth = toMonth || "12";
      const endYear = toYear.slice(-2);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200000);

      // Change detection download
      if (changeMode) {
        if (dataset === 'landcover') {
          setMessage("Change detection download not available for land cover");
          setLoading(false);
          return;
        }
        if (!fromYear2 || !toYear2) {
          setMessage("Select Period 2 years for change detection");
          setLoading(false);
          return;
        }
        const res = await fetch(`${BACKEND_URL}/download_change`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataset, index,
            startDate1: `${fromYear}-${fromMonth || "01"}-${fromDay || "01"}`,
            endDate1: `${toYear}-${toMonth || "12"}-${toDay || "31"}`,
            startDate2: `${fromYear2}-${fromMonth2 || "01"}-${fromDay2 || "01"}`,
            endDate2: `${toYear2}-${toMonth2 || "12"}-${toDay2 || "31"}`,
            geometry, selectedFeature,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || `Download failed: ${res.status}`);
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataset}_${index}_change_${startDay}${startMonth}${startYear}_vs_${fromDay2 || "01"}${fromMonth2 || "01"}${toYear2.slice(-2)}_${selectedFeature}.tif`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage("Change detection download successful!");
        return;
      }

      // Normal download — existing code unchanged
      const res = await fetch(`${BACKEND_URL}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset, index,
          startDate: `${fromYear}-${startMonth}-${startDay}`,
          endDate: `${toYear}-${endMonth}-${endDay}`,
          geometry, selectedFeature,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Download failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataset}_${index}_${startDay}_${startMonth}_${startYear}_to_${endDay}_${endMonth}_${endYear}_${selectedFeature}.tif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Download successful!");
    } catch (e) {
      setMessage(`Notice: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    const map = mapRef.current;
    if (!map) return;
    if (overlayRef.current) map.removeLayer(overlayRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);
    Object.values(boundaryLayersCache.current).forEach((l) => map.removeLayer(l));
    setDataset("");
    setIndex("");
    setAdminLevel("");
    setFeatureList([]);
    setFeatureName("");
    setSelectedFeatureGeoJSON(null);
    setMessage(null);
    setUseCustomGeoJSON(false);
    setCustomGeoJSON(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    map.setView([9.145, 40.4897], 6);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-700 mb-3">Explore Land Cover & Vegetation Indices</h1>

      <div className="relative mb-4 rounded-xl overflow-hidden shadow" style={{ height: 520 }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.3)", zIndex: 9999 }}>
            <div style={{ width: 60, height: 60, border: "6px solid #ccc", borderTop: "6px solid #2f855a", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      {/* --- Controls --- */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Boundary Mode:</label>
          <label className="flex items-center">
            <input
              type="radio"
              name="boundaryMode"
              value="ethiopia"
              checked={!useCustomGeoJSON}
              onChange={() => setUseCustomGeoJSON(false)}
              className="mr-1"
            />
            <span className="text-sm">Ethiopia Levels</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="boundaryMode"
              value="custom"
              checked={useCustomGeoJSON}
              onChange={() => setUseCustomGeoJSON(true)}
              className="mr-1"
            />
            <span className="text-sm">Upload GeoJSON</span>
          </label>
        </div>

        {useCustomGeoJSON && (
		  <div className="flex items-center gap-2">
			<input
			  type="file"
			  ref={fileInputRef}
			  onChange={handleFileUpload}
			  accept=".geojson,.json"
			  className="border p-2 rounded text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer focus:ring-2 focus:ring-blue-500 w-50"
			  title="Upload GeoJSON file"
			/>
			{customGeoJSON && (
			  <span className="text-sm text-gray-600">
				{customGeoJSON.properties?.name || customGeoJSON.fileName}
			  </span>
			)}
		  </div>
		)}




        {!useCustomGeoJSON && (
          <>
            <select value={adminLevel} onChange={(e) => setAdminLevel(e.target.value)} className="border p-2 rounded w-36">
              <option value="">Admin level</option>
              <option value="adm1">Level 1 (Regions)</option>
              <option value="adm2">Level 2 (Zones)</option>
              <option value="adm3">Level 3 (Districts)</option>
            </select>

            <select value={featureName} onChange={(e) => setFeatureName(e.target.value)} className="border p-2 rounded w-40">
              <option value="">Select feature</option>
              {featureList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </>
        )}
		        <select value={dataset} onChange={(e) => setDataset(e.target.value)} className="border p-2 rounded w-32">
          <option value="">Dataset</option>
          {Object.entries(DATASET_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select value={index} onChange={(e) => setIndex(e.target.value)} className="border p-2 rounded w-30">
          <option value="">Variable</option>
          {indexOptions.map((o) => (
            <option key={o.v} value={o.v}>{o.t}</option>
          ))}
        </select>
      </div>

      {/* Dates */}
	  {/* Change Detection Toggle */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-medium text-gray-700">Mode:</span>
        <button
          onClick={() => { setChangeMode(false); setMessage(null); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${!changeMode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
        >
          Single Date
        </button>
        <button
          onClick={() => { setChangeMode(true); setMessage(null); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${changeMode ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
        >
          Change Detection
        </button>
      </div>

      {/* Dates */}
      <div className="flex gap-6 mb-3 flex-wrap">
        {/* Period 1 (or single date) */}
        <div>
          <div className="font-semibold mb-1 text-sm">{changeMode ? "Period 1 — From" : "From"}</div>
          <div className="flex gap-2">
            <select value={fromYear} onChange={(e) => setFromYear(e.target.value)} className="border p-2 rounded w-20">
              <option value="">Year</option>
              {yearOptions.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
            </select>
            <select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className="border p-2 rounded w-24">
              <option value="">Month</option>
              {monthOptions.map((mo) => (<option key={mo.value} value={mo.value}>{mo.label}</option>))}
            </select>
            <select value={fromDay} onChange={(e) => setFromDay(e.target.value)} className="border p-2 rounded w-18">
              <option value="">Day</option>
              {dayOptionsFor(fromYear, fromMonth).map((dd) => (<option key={dd} value={dd}>{dd}</option>))}
            </select>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-1 text-sm">{changeMode ? "Period 1 — To" : "To"}</div>
          <div className="flex gap-2">
            <select value={toYear} onChange={(e) => setToYear(e.target.value)} className="border p-2 rounded w-20">
              <option value="">Year</option>
              {yearOptions.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
            </select>
            <select value={toMonth} onChange={(e) => setToMonth(e.target.value)} className="border p-2 rounded w-24">
              <option value="">Month</option>
              {monthOptions.map((mo) => (<option key={mo.value} value={mo.value}>{mo.label}</option>))}
            </select>
            <select value={toDay} onChange={(e) => setToDay(e.target.value)} className="border p-2 rounded w-18">
              <option value="">Day</option>
              {dayOptionsFor(toYear, toMonth).map((dd) => (<option key={dd} value={dd}>{dd}</option>))}
            </select>
          </div>
        </div>

        {/* Period 2 — only shown in change detection mode */}
        {changeMode && (
          <>
            <div>
              <div className="font-semibold mb-1 text-sm text-orange-600">Period 2 — From</div>
              <div className="flex gap-2">
                <select value={fromYear2} onChange={(e) => setFromYear2(e.target.value)} className="border p-2 rounded w-20 border-orange-300">
                  <option value="">Year</option>
                  {yearOptions.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
                </select>
                <select value={fromMonth2} onChange={(e) => setFromMonth2(e.target.value)} className="border p-2 rounded w-24 border-orange-300">
                  <option value="">Month</option>
                  {monthOptions.map((mo) => (<option key={mo.value} value={mo.value}>{mo.label}</option>))}
                </select>
                <select value={fromDay2} onChange={(e) => setFromDay2(e.target.value)} className="border p-2 rounded w-18 border-orange-300">
                  <option value="">Day</option>
                  {dayOptionsFor(fromYear2, fromMonth2).map((dd) => (<option key={dd} value={dd}>{dd}</option>))}
                </select>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1 text-sm text-orange-600">Period 2 — To</div>
              <div className="flex gap-2">
                <select value={toYear2} onChange={(e) => setToYear2(e.target.value)} className="border p-2 rounded w-20 border-orange-300">
                  <option value="">Year</option>
                  {yearOptions.map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
                </select>
                <select value={toMonth2} onChange={(e) => setToMonth2(e.target.value)} className="border p-2 rounded w-24 border-orange-300">
                  <option value="">Month</option>
                  {monthOptions.map((mo) => (<option key={mo.value} value={mo.value}>{mo.label}</option>))}
                </select>
                <select value={toDay2} onChange={(e) => setToDay2(e.target.value)} className="border p-2 rounded w-18 border-orange-300">
                  <option value="">Day</option>
                  {dayOptionsFor(toYear2, toMonth2).map((dd) => (<option key={dd} value={dd}>{dd}</option>))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={handleViewSelection} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          View Selection
        </button>
        <button onClick={handleDownloadClick} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
          Download Selection
        </button>
        <button onClick={handleReset} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
          Reset Map
        </button>
      </div>

      {message && (
        <div className={`border p-3 rounded mt-3 ${message.includes("success") || message.includes("loaded") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <b className={`${message.includes("success") || message.includes("loaded") ? "text-green-800" : "text-red-800"}`}>{message}</b>
        </div>
      )}
    </div>
  );
}
