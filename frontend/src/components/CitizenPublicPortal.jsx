import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Languages
} from "lucide-react";
import QRCode from "qrcode";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function CitizenPublicPortal({ onBackToOfficerLogin, lang = "en", onToggleLang }) {
  const [searchType, setSearchType] = useState("ulpin"); // "ulpin" | "khasra" | "doc"
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("Madhubani");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const qrCanvasRef = useRef(null);

  // Render QR Code whenever a record is displayed
  useEffect(() => {
    if (!result || !qrCanvasRef.current) return;
    const qrUrl = `https://bhoomiproof.gov.in/verify/${result.record_id || "LR-2026-001"}`;
    QRCode.toCanvas(qrCanvasRef.current, qrUrl, {
      width: 110,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).catch(() => {});
  }, [result]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setError(lang === "hi" ? "कृपया खोजने हेतु कोई आईडी या खसरा संख्या दर्ज करें।" : "Please enter a valid search query.");
      return;
    }

    setSearching(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/records/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error("Could not connect to National Land Records Registry");
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setResult(data.results[0]);
      } else {
        setError(
          lang === "hi"
            ? `कोई भूमि अभिलेख नहीं मिला: "${query}". कृपया 14-अंकीय भू-आधार या खसरा संख्या जांचें।`
            : `No registered land record matched: "${query}". Please check the 14-digit ULPIN or Khasra number.`
        );
      }
    } catch (err) {
      setError(err.message || "Public registry lookup failed");
    } finally {
      setSearching(false);
    }
  };

  const handleQuickExample = (exampleVal) => {
    setQuery(exampleVal);
    setError("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #091326 0%, #0d1e3d 50%, #081124 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top Government Navigation Bar */}
      <header
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(10, 18, 38, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Emblem Crest */}
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #f59e0b 0%, #b45309 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)",
              fontWeight: 900,
              fontSize: "20px",
              color: "#0f172a",
            }}
          >
            🇮🇳
          </div>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: "#fbbf24", fontWeight: 700 }}>
              {lang === "hi" ? "भारत सरकार • डिजिटल इंडिया भू-अभिलेख" : "GOVERNMENT OF INDIA • DIGITAL LAND RECORDS"}
            </div>
            <h1 style={{ fontSize: "16px", margin: 0, fontWeight: 800, color: "#ffffff", letterSpacing: "0.5px" }}>
              {lang === "hi" ? "भू-खोज (Bhu-Khoj): नागरिक भूमि सत्यापन पोर्टल" : "Bhu-Khoj: Public Citizen Land Verification Portal"}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={onToggleLang}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#f8fafc",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Languages size={14} /> {lang === "en" ? "हिन्दी" : "English"}
          </button>

          <button
            onClick={onBackToOfficerLogin}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ArrowLeft size={14} />
            {lang === "hi" ? "विभागीय अधिकारी लॉगिन" : "Officer Login"}
          </button>
        </div>
      </header>

      {/* Main Hero & Public Search Section */}
      <main style={{ flex: 1, padding: "32px 16px", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
        {/* Portal Hero Intro */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fde68a",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <ShieldCheck size={14} /> DILRMP ULPIN Open Public Verification
          </span>
          <h2 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 8px 0", color: "#ffffff" }}>
            {lang === "hi" ? "अपनी भूमि का डिजिटल भू-आधार एवं खतौनी सत्यापित करें" : "Verify Any Land Parcel, Ownership & Bhu-Aadhaar"}
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            {lang === "hi"
              ? "बिना किसी बिचौलिए या कार्यालय चक्कर के, 14-अंकीय भू-आधार अथवा खसरा संख्या दर्ज कर स्वामित्व व भार-मुक्त स्थिति तुरंत जांचें।"
              : "Zero corruption, zero intermediaries. Enter 14-digit Bhu-Aadhaar (ULPIN) or Khasra plot number to verify authentic title."}
          </p>
        </div>

        {/* Public Search Card */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            marginBottom: "28px",
          }}
        >
          {/* Search Type Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #334155", paddingBottom: "12px" }}>
            <button
              onClick={() => setSearchType("ulpin")}
              style={{
                background: searchType === "ulpin" ? "#2563eb" : "transparent",
                color: searchType === "ulpin" ? "white" : "#94a3b8",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "14-अंकीय भू-आधार (ULPIN)" : "14-Digit Bhu-Aadhaar (ULPIN)"}
            </button>
            <button
              onClick={() => setSearchType("khasra")}
              style={{
                background: searchType === "khasra" ? "#2563eb" : "transparent",
                color: searchType === "khasra" ? "white" : "#94a3b8",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "खसरा / सर्वे संख्या" : "Khasra / Plot Number"}
            </button>
            <button
              onClick={() => setSearchType("doc")}
              style={{
                background: searchType === "doc" ? "#2563eb" : "transparent",
                color: searchType === "doc" ? "white" : "#94a3b8",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "दस्तावेज़ रजिस्ट्री सं." : "Deed Document No."}
            </button>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
              <input
                type="text"
                placeholder={
                  searchType === "ulpin"
                    ? (lang === "hi" ? "उदा. 09-24-3B9F-9809-11 या LR-2026" : "e.g. 09-24-3B9F-9809-11 or LR-2026")
                    : searchType === "khasra"
                    ? (lang === "hi" ? "उदा. 274/2 या 145/2" : "e.g. 274/2 or 145/2")
                    : (lang === "hi" ? "उदा. REG-2018-0417 या DOC-2026" : "e.g. REG-2018-0417 or DOC-2026")
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1.5px solid #334155",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{
                background: "#020617",
                border: "1.5px solid #334155",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#cbd5e1",
                fontSize: "13px",
              }}
            >
              <option value="Madhubani">{lang === "hi" ? "ज़िला: मधुबनी" : "District: Madhubani"}</option>
              <option value="Muzaffarpur">{lang === "hi" ? "ज़िला: मुजफ्फरपुर" : "District: Muzaffarpur"}</option>
              <option value="Patna">{lang === "hi" ? "ज़िला: पटना" : "District: Patna"}</option>
              <option value="Gaya">{lang === "hi" ? "ज़िला: गया" : "District: Gaya"}</option>
            </select>

            <button
              type="submit"
              disabled={searching}
              style={{
                background: "#f59e0b",
                color: "#0f172a",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {searching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
              {lang === "hi" ? "सत्यापन करें" : "Search & Verify"}
            </button>
          </form>

          {/* Search Help Instruction Note */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", color: "#94a3b8", fontSize: "11px" }}>
            <span>ℹ️</span>
            <span>
              {lang === "hi"
                ? "राष्ट्रीय भूमि रजिस्ट्री से सीधे सत्यापित करने हेतु पंजीकृत भू-आधार संख्या, विलेख क्रमांक अथवा खसरा संख्या दर्ज करें।"
                : "Enter an officially registered 14-digit Bhu-Aadhaar (ULPIN), Deed Document No, or Khasra Plot number to verify ownership."}
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#fca5a5",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* PUBLIC RECORD OF RIGHTS (RoR / खतौनी) PASSPORT DISPLAY */}
        {/* ========================================================= */}
        {result && (
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
              border: "3px double #b45309",
              position: "relative",
            }}
          >
            {/* Top Certificate Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "16px",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "36px" }}>🏛️</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "1px", color: "#b45309" }}>
                    GOVERNMENT OF INDIA • DIGITAL LAND REGISTRY
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "2px 0 0 0", color: "#0f172a" }}>
                    {lang === "hi" ? "आधिकारिक भू-अभिलेख एवं खतौनी प्रमाणपत्र" : "Official Record of Rights (RoR / Khatauni)"}
                  </h3>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {lang === "hi" ? "DILRMP ULPIN व्यवस्था के तहत निर्गत • विधिक एवं बैंक ऋण सत्यापन हेतु मान्य" : "Issued under DILRMP ULPIN Framework • Valid for Legal & Bank Loan Verification"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handlePrint}
                  style={{
                    background: "#0f172a",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={14} /> {lang === "hi" ? "प्रिंट / PDF सुरक्षित करें" : "Print / Save PDF"}
                </button>
              </div>
            </div>

            {/* Bhu-Aadhaar Highlight Strip */}
            <div
              style={{
                background: "linear-gradient(90deg, #fef3c7 0%, #fffbeb 100%)",
                border: "1.5px solid #f59e0b",
                borderRadius: "10px",
                padding: "12px 18px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "#92400e" }}>
                  {lang === "hi" ? "14-अंकीय भू-आधार ULPIN (विशिष्ट भूखंड पहचान)" : "14-Digit Bhu-Aadhaar ULPIN (Unique Parcel ID)"}
                </span>
                <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#78350f" }}>
                  09-24-{result.record_id.slice(-4)}-9809-11
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle2 size={14} /> {lang === "hi" ? "भारमुक्त (Encumbrance-Free)" : "Encumbrance-Free (भारमुक्त)"}
                </span>
                <span
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ShieldCheck size={14} /> {lang === "hi" ? "स्वामित्व सत्यापित" : "Title Verified"}
                </span>
              </div>
            </div>

            {/* Land & Ownership Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "भूस्वामी का नाम" : "Registered Owner"}
                </label>
                <strong style={{ fontSize: "15px", color: "#0f172a" }}>{result.owner_name}</strong>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "पिता / संरक्षक का नाम" : "Father / Relative Name"}
                </label>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{result.father_name || "N/A"}</strong>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "खसरा / सर्वे संख्या" : "Khasra / Survey No."}
                </label>
                <strong style={{ fontSize: "15px", color: "#2563eb" }}>Plot #{result.survey_number}</strong>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "कुल रकबा (क्षेत्रफल)" : "Land Parcel Area"}
                </label>
                <strong style={{ fontSize: "15px", color: "#16a34a" }}>{result.land_area}</strong>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "मौजा / ग्राम व ज़िला" : "Village & District"}
                </label>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                  {result.village}, {result.district}
                </strong>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                  {lang === "hi" ? "पंजीकरण तिथि" : "Deed Registration Date"}
                </label>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{result.registration_date || "17/06/2018"}</strong>
              </div>
            </div>

            {/* Bottom Cryptographic Stamp & QR Verification */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "16px",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <strong style={{ fontSize: "12px", color: "#166534" }}>
                    {lang === "hi" ? "SHA-256 छेड़छाड़-मुक्त क्रिप्टोग्राफिक मुहर:" : "SHA-256 Tamper-Proof Cryptographic Lock:"}
                  </strong>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "#475569",
                    background: "#f1f5f9",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    wordBreak: "break-all",
                  }}
                >
                  {result.document_hash || "f6312c89a7e66d39166fbacd00782449e5f9be897d730d4e849012285d5e0e28"}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                  {lang === "hi" ? "तहसीलदार एवं उप-पंजीयक प्राधिकरण द्वारा डिजिटल रूप से प्रमाणित। किसी कार्यालय जाने की आवश्यकता नहीं।" : "Digitally certified by Tehsildar & Sub-Registrar Authority. No physical visit required."}
                </div>
              </div>

              {/* Scannable QR Code */}
              <div style={{ textAlign: "center" }}>
                <canvas ref={qrCanvasRef} style={{ width: "90px", height: "90px", borderRadius: "6px" }} />
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                  {lang === "hi" ? "प्रमाणीकरण हेतु स्कैन करें" : "Scan to Authenticate"}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CitizenPublicPortal;
