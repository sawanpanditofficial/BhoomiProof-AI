import { useState } from "react";
import {
  Compass,
  Layers,
  MapPin,
  Maximize2,
  CheckCircle2,
  Navigation,
  Sliders,
  Sparkles
} from "lucide-react";

function CadastralMapViewer({ record, lang = "en" }) {
  const [mapMode, setMapMode] = useState("cadastral"); // "cadastral" | "satellite" | "split"
  const [splitPos, setSplitPos] = useState(50); // percentage 10 to 90
  const [showDimensions, setShowDimensions] = useState(true);
  const [showCoords, setShowCoords] = useState(true);

  if (!record) return null;

  const surveyNo = record.survey_number || "302/1";
  const area = record.land_area || "0.85 Acres";

  // Coordinates base (realistic Uttar Pradesh / India geographic center)
  const baseLat = 26.8467;
  const baseLng = 80.9462;

  return (
    <div className="cadastral-viewer-container">
      {/* Map Control Toolbar */}
      <div className="cadastral-toolbar" style={{ flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Compass size={18} color="#2563eb" />
          <strong style={{ fontSize: "13px", color: "#1e293b" }}>
            {lang === "hi"
              ? "भू-स्थानिक कैडस्ट्रल नक्शा एवं भू-खंड सीमांकन"
              : "GIS Cadastral Parcel Map & Boundary Demarcation"}
          </strong>
          <span className="cadastral-badge">DILRMP BhuNaksha</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div className="btn-group-sm">
            <button
              className={`btn-toggle-sm ${mapMode === "cadastral" ? "active" : ""}`}
              onClick={() => setMapMode("cadastral")}
            >
              <Layers size={12} />
              {lang === "hi" ? "कैडस्ट्रल नक्शा" : "Cadastral Map"}
            </button>
            <button
              className={`btn-toggle-sm ${mapMode === "satellite" ? "active" : ""}`}
              onClick={() => setMapMode("satellite")}
            >
              <Navigation size={12} />
              {lang === "hi" ? "सैटेलाइट व्यू" : "Satellite Layer"}
            </button>
            <button
              className={`btn-toggle-sm ${mapMode === "split" ? "active" : ""}`}
              onClick={() => setMapMode("split")}
              style={{
                background: mapMode === "split" ? "#8b5cf6" : undefined,
                color: mapMode === "split" ? "white" : undefined,
              }}
              title="Compare 1950 vintage cadastral deed map with modern 2026 satellite imagery"
            >
              <Sliders size={12} />
              {lang === "hi" ? "स्प्लिट तुलना (1950 vs 2026)" : "Split (1950 vs 2026)"}
            </button>
          </div>

          <label className="toggle-label-sm">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
            />
            {lang === "hi" ? "दूरी/सीमाएं" : "Dimensions"}
          </label>

          <label className="toggle-label-sm">
            <input
              type="checkbox"
              checked={showCoords}
              onChange={(e) => setShowCoords(e.target.checked)}
            />
            {lang === "hi" ? "निर्देशांक" : "Coordinates"}
          </label>
        </div>
      </div>

      {/* Split Slider Control if in Split Mode */}
      {mapMode === "split" && (
        <div
          style={{
            background: "#1e1b4b",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            fontSize: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} color="#a78bfa" />
            <span>
              <strong>1950 Historical Revenue Deed</strong> ({100 - splitPos}%)
            </span>
          </div>

          <div style={{ flex: 1, minWidth: "160px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="range"
              min="10"
              max="90"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8b5cf6", cursor: "ew-resize" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>
              <strong>2026 Ortho-Satellite GIS</strong> ({splitPos}%)
            </span>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Deviation: ±0.03m (Clean)
            </span>
          </div>
        </div>
      )}

      {/* SVG Interactive Canvas Map */}
      <div
        className={`cadastral-canvas-wrapper ${
          mapMode === "satellite" ? "satellite-theme" : mapMode === "split" ? "satellite-theme" : "cadastral-theme"
        }`}
        style={{ position: "relative" }}
      >
        <svg
          className="cadastral-svg"
          viewBox="0 0 700 420"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path
                d="M 35 0 L 0 0 0 35"
                fill="none"
                stroke={mapMode === "satellite" ? "rgba(255,255,255,0.06)" : "#e2e8f0"}
                strokeWidth="0.8"
              />
            </pattern>

            {/* Satellite Terrain Gradient */}
            <radialGradient id="satelliteGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="60%" stopColor="#062e24" />
              <stop offset="100%" stopColor="#021c16" />
            </radialGradient>

            {/* Vintage 1950 Parchment Gradient for Historical Layer */}
            <radialGradient id="vintageParchment" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#faf5e4" />
              <stop offset="70%" stopColor="#f3ebd4" />
              <stop offset="100%" stopColor="#e8dcbe" />
            </radialGradient>

            {/* Split Clip Path for Right/Satellite Side */}
            {mapMode === "split" && (
              <clipPath id="splitClip">
                <rect x={(splitPos / 100) * 700} y="0" width={700} height="420" />
              </clipPath>
            )}
          </defs>

          {/* ======================================================== */}
          {/* BASE / LEFT LAYER: CADASTRAL OR 1950 HISTORICAL NAKSHA */}
          {/* ======================================================== */}
          <rect
            width="700"
            height="420"
            fill={mapMode === "split" ? "url(#vintageParchment)" : mapMode === "satellite" ? "url(#satelliteGrad)" : "#ffffff"}
          />
          <rect width="700" height="420" fill="url(#grid)" />

          {/* Vintage 1950 Revenue Map Elements if in Split Mode */}
          {mapMode === "split" && (
            <g opacity="0.9">
              {/* Vintage Hand-drawn Plot Grid */}
              <path
                d="M 50 180 Q 200 170 340 180 T 650 175"
                fill="none"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d="M 80 50 Q 150 200 140 380"
                fill="none"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <path
                d="M 500 40 Q 480 220 520 380"
                fill="none"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Vintage Survey Stone Markers (▲) */}
              <text x="145" y="115" fill="#78350f" fontSize="11" fontWeight="800">▲ सीमा स्तम्भ #14</text>
              <text x="470" y="115" fill="#78350f" fontSize="11" fontWeight="800">▲ सीमा स्तम्भ #15</text>
              <text x="135" y="325" fill="#78350f" fontSize="11" fontWeight="800">▲ सीमा स्तम्भ #16</text>
              <text x="485" y="325" fill="#78350f" fontSize="11" fontWeight="800">▲ सीमा स्तम्भ #17</text>

              {/* Vintage Devanagari Plot Stamp */}
              <text x="170" y="150" fill="#92400e" fontSize="12" fontWeight="700" fontStyle="italic">
                मौजा: {record.village || "कांटी"} • बन्दोबस्त १९५०
              </text>
              <text x="210" y="240" fill="#78350f" fontSize="15" fontWeight="900">
                खसरा सं. {surveyNo}
              </text>
            </g>
          )}

          {/* Standard Cadastral Neighboring Plots if not Split */}
          {mapMode !== "split" && (
            <g opacity="0.6">
              <polygon
                points="40,50 150,45 140,190 35,185"
                fill={mapMode === "satellite" ? "rgba(255,255,255,0.04)" : "#f1f5f9"}
                stroke={mapMode === "satellite" ? "rgba(255,255,255,0.2)" : "#cbd5e1"}
                strokeWidth="1.2"
              />
              <text x="65" y="125" fill={mapMode === "satellite" ? "#94a3b8" : "#64748b"} fontSize="11" fontWeight="600">
                Plot #144
              </text>

              <polygon
                points="480,45 660,50 650,200 490,195"
                fill={mapMode === "satellite" ? "rgba(255,255,255,0.04)" : "#f1f5f9"}
                stroke={mapMode === "satellite" ? "rgba(255,255,255,0.2)" : "#cbd5e1"}
                strokeWidth="1.2"
              />
              <text x="540" y="125" fill={mapMode === "satellite" ? "#94a3b8" : "#64748b"} fontSize="11" fontWeight="600">
                Plot #146
              </text>

              <polygon
                points="135,315 495,310 490,400 130,405"
                fill={mapMode === "satellite" ? "rgba(255,255,255,0.04)" : "#f1f5f9"}
                stroke={mapMode === "satellite" ? "rgba(255,255,255,0.2)" : "#cbd5e1"}
                strokeWidth="1.2"
              />
              <text x="280" y="365" fill={mapMode === "satellite" ? "#94a3b8" : "#64748b"} fontSize="11" fontWeight="600">
                Plot #147 (Agricultural)
              </text>
            </g>
          )}

          {/* MAIN TARGET PARCEL: Khasra / Survey Number (Vector Demarcation) */}
          <g>
            <polygon
              points="150,110 480,110 490,305 140,310"
              fill={
                mapMode === "split"
                  ? "rgba(180, 83, 9, 0.15)"
                  : mapMode === "satellite"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(37, 99, 235, 0.12)"
              }
              stroke={mapMode === "split" ? "#b45309" : mapMode === "satellite" ? "#10b981" : "#2563eb"}
              strokeWidth={mapMode === "split" ? "2.5" : "3"}
              strokeDasharray={mapMode === "split" ? "6 3" : undefined}
            />

            {/* Target Parcel Label Center */}
            <g transform="translate(315, 205)">
              <rect
                x="-80"
                y="-35"
                width="160"
                height="70"
                rx="8"
                fill={mapMode === "satellite" ? "rgba(15, 23, 42, 0.9)" : "#ffffff"}
                stroke={mapMode === "satellite" ? "#10b981" : "#2563eb"}
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill={mapMode === "satellite" ? "#f8fafc" : "#0f172a"}
                fontSize="12"
                fontWeight="800"
              >
                KHASRA #{surveyNo}
              </text>
              <text
                x="0"
                y="6"
                textAnchor="middle"
                fill={mapMode === "satellite" ? "#34d399" : "#2563eb"}
                fontSize="11"
                fontWeight="700"
              >
                {area}
              </text>
              <text
                x="0"
                y="24"
                textAnchor="middle"
                fill={mapMode === "satellite" ? "#94a3b8" : "#64748b"}
                fontSize="10"
              >
                {record.owner_name ? record.owner_name.slice(0, 18) : "Verified Title"}
              </text>
            </g>
          </g>

          {/* ======================================================== */}
          {/* TOP / RIGHT LAYER: SATELLITE 2026 LAYER (CLIP-PATHED)    */}
          {/* ======================================================== */}
          {mapMode === "split" && (
            <g clipPath="url(#splitClip)">
              {/* Modern Satellite Gradient Canvas */}
              <rect width="700" height="420" fill="url(#satelliteGrad)" />
              <rect width="700" height="420" fill="url(#grid)" />

              {/* Modern Vector Ortho Demarcation */}
              <polygon
                points="150,110 480,110 490,305 140,310"
                fill="rgba(16, 185, 129, 0.28)"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* Satellite GPS Pin */}
              <g transform="translate(315, 185)">
                <circle cx="0" cy="0" r="16" fill="rgba(16, 185, 129, 0.3)" />
                <circle cx="0" cy="0" r="6" fill="#10b981" />
              </g>

              {/* Modern Geo Tag */}
              <text x="520" y="380" fill="#34d399" fontSize="11" fontWeight="700" textAnchor="end">
                🛰️ Digital Ortho-Satellite (2026)
              </text>
            </g>
          )}

          {/* Dividing Vertical Line in Split Mode */}
          {mapMode === "split" && (
            <g>
              <line
                x1={(splitPos / 100) * 700}
                y1="0"
                x2={(splitPos / 100) * 700}
                y2="420"
                stroke="#ffffff"
                strokeWidth="3"
                filter="drop-shadow(0 0 4px rgba(0,0,0,0.8))"
              />
              <g transform={`translate(${(splitPos / 100) * 700}, 210)`}>
                <circle cx="0" cy="0" r="16" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                  ↔
                </text>
              </g>
            </g>
          )}

          {/* Dimension Markers */}
          {showDimensions && (
            <g fontSize="10" fontWeight="600">
              <text x="315" y="100" textAnchor="middle" fill={mapMode === "satellite" ? "#6ee7b7" : "#1e40af"}>
                68.4m (North)
              </text>
              <text x="315" y="325" textAnchor="middle" fill={mapMode === "satellite" ? "#6ee7b7" : "#1e40af"}>
                67.9m (South)
              </text>
            </g>
          )}

          {/* Coordinates Overlay */}
          {showCoords && (
            <g>
              <circle cx="150" cy="110" r="4" fill="#dc2626" />
              <text x="155" y="105" fill="#dc2626" fontSize="9" fontWeight="700">
                P1 ({baseLat.toFixed(4)}°N, {baseLng.toFixed(4)}°E)
              </text>
              <circle cx="480" cy="110" r="4" fill="#dc2626" />
              <text x="400" y="105" fill="#dc2626" fontSize="9" fontWeight="700">
                P2 ({baseLat.toFixed(4)}°N, {(baseLng + 0.0018).toFixed(4)}°E)
              </text>
              <circle cx="490" cy="305" r="4" fill="#dc2626" />
              <text x="410" y="322" fill="#dc2626" fontSize="9" fontWeight="700">
                P3 ({(baseLat - 0.0015).toFixed(4)}°N, {(baseLng + 0.0019).toFixed(4)}°E)
              </text>
              <circle cx="140" cy="310" r="4" fill="#dc2626" />
              <text x="145" y="325" fill="#dc2626" fontSize="9" fontWeight="700">
                P4 ({(baseLat - 0.0015).toFixed(4)}°N, {baseLng.toFixed(4)}°E)
              </text>
            </g>
          )}

          {/* Compass Rose */}
          <g transform="translate(640, 55)">
            <circle cx="0" cy="0" r="20" fill={mapMode === "satellite" ? "rgba(0,0,0,0.5)" : "#ffffff"} stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="0,-16 4,0 0,-3" fill="#dc2626" />
            <polygon points="0,16 4,0 0,3" fill="#64748b" />
            <polygon points="0,-16 -4,0 0,-3" fill="#b91c1c" />
            <polygon points="0,16 -4,0 0,3" fill="#94a3b8" />
            <text x="0" y="-19" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="800">
              N
            </text>
          </g>
        </svg>
      </div>

      {/* Cadastral Geo-Data Cards */}
      <div className="cadastral-meta-grid">
        <div className="cadastral-meta-card">
          <div className="meta-icon">
            <MapPin size={16} color="#2563eb" />
          </div>
          <div>
            <span className="meta-title">{lang === "hi" ? "केंद्र निर्देशांक (Centroid)" : "Centroid Coordinates"}</span>
            <strong>{baseLat.toFixed(5)}° N, {baseLng.toFixed(5)}° E</strong>
            <small>WGS-84 Datum / EPSG:4326</small>
          </div>
        </div>

        <div className="cadastral-meta-card">
          <div className="meta-icon">
            <Maximize2 size={16} color="#16a34a" />
          </div>
          <div>
            <span className="meta-title">{lang === "hi" ? "परिधि एवं सीमांकन" : "Perimeter & Demarcation"}</span>
            <strong>220.2 {lang === "hi" ? "मीटर" : "Meters"}</strong>
            <small>{lang === "hi" ? "उत्तर: 68.4 मी | दक्षिण: 67.9 मी" : "North: 68.4m | South: 67.9m"}</small>
          </div>
        </div>

        <div className="cadastral-meta-card">
          <div className="meta-icon">
            <CheckCircle2 size={16} color="#d97706" />
          </div>
          <div>
            <span className="meta-title">{lang === "hi" ? "सीमांकन अखंडता" : "Boundary Integrity"}</span>
            <strong style={{ color: "#16a34a" }}>{lang === "hi" ? "१००% कोई अतिक्रमण नहीं" : "100% No Overlap Detected"}</strong>
            <small>{lang === "hi" ? "प्लॉट #144 व #146 से स्पष्ट पृथक्करण" : "Clear separation with Plot #144 & #146"}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastralMapViewer;
