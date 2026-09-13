import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Trophy,
  Languages
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function AuthPage({ onLoginSuccess, onOpenCitizenPortal, lang = "en", onToggleLang }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [department, setDepartment] = useState("Department of Land Revenue & Registry");
  const [role, setRole] = useState("Tehsildar / Sub-Registrar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatErrorMessage = (err) => {
    const msg = err?.message || "";
    if (msg === "Load failed" || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      return window.location.protocol === "https:"
        ? "Mixed Content Error: Online HTTPS sites cannot connect to http://localhost:8000. Please run the frontend locally at http://localhost:5173 or deploy the backend to a cloud server."
        : "Backend connection error: Ensure the backend is running at http://localhost:8000 via 'uvicorn main:app --reload'.";
    }
    return msg || "Authentication failed";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
    const payload =
      mode === "login"
        ? { officer_id: officerId, password, role }
        : { officer_name: officerName, officer_id: officerId, department, password, role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Save officer profile and token
      localStorage.setItem("bhoomi_officer", JSON.stringify(data.officer));
      localStorage.setItem("bhoomi_token", data.token);

      onLoginSuccess(data.officer);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (selectedRole) => {
    const isVerification = selectedRole.toLowerCase().includes("verification");
    const demoId = isVerification ? "verify.officer@gov.in" : "sawan.tehsildar@gov.in";
    const demoPass = isVerification ? "verify2026" : "admin2026";
    setOfficerId(demoId);
    setPassword(demoPass);
    setRole(selectedRole || "Tehsildar / Sub-Registrar");

    // Immediately trigger login
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: demoId,
          password: demoPass,
          role: selectedRole || "Tehsildar / Sub-Registrar",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (data.success) {
        localStorage.setItem("bhoomi_officer", JSON.stringify(data.officer));
        localStorage.setItem("bhoomi_token", data.token);
        onLoginSuccess(data.officer);
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background ambient lighting */}
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>

      {/* Top SIH Hackathon & Language Bar */}
      <div className="auth-top-bar">
        <div className="sih-star-badge">
          <Trophy size={14} /> SIH 2026 • PS: SIH26018
        </div>
        <button className="lang-toggle-btn" onClick={onToggleLang}>
          <Languages size={14} />
          {lang === "en" ? "हिन्दी (HI)" : "English (EN)"}
        </button>
      </div>

      <div className="auth-card">
        {/* Government Header */}
        <div className="auth-header">
          <div className="auth-crest">
            <svg width="44" height="52" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="14" r="10" stroke="#1e3a8a" strokeWidth="2.5" fill="#f8fafc" />
              <path d="M19 14h10M24 9v10M20.5 10.5l7 7M20.5 17.5l7-7" stroke="#1e3a8a" strokeWidth="1.5" />
              <rect x="14" y="26" width="20" height="4" rx="2" fill="#1e3a8a" />
              <path d="M16 30v14h16V30" stroke="#1e3a8a" strokeWidth="2" fill="#f1f5f9" />
              <rect x="10" y="44" width="28" height="6" rx="2" fill="#1e3a8a" />
              <rect x="6" y="50" width="36" height="4" rx="1" fill="#0f172a" />
            </svg>
            <span className="auth-crest-caption">सत्यमेव जयते</span>
          </div>

          <h2>
            {lang === "hi"
              ? "भारत सरकार • भूमि अभिलेख पोर्टल"
              : "Government of India Land Registry"}
          </h2>
          <p className="auth-subtitle">
            {lang === "hi"
              ? "डिजिटल भारत भूमि आधुनिकीकरण (DILRMP) • अधिकारी लॉगिन"
              : "Digital India Land Records Modernization (DILRMP) • Officer Portal"}
          </p>

          <div className="auth-secure-badge">
            <ShieldCheck size={14} color="#16a34a" />
            <span>{lang === "hi" ? "SHA-256 क्रिप्टोग्राफिक प्रमाणीकरण • आईटी अधिनियम 2000" : "SHA-256 Cryptographic Authentication • IT Act 2000"}</span>
          </div>
        </div>

        {/* Mode Toggle (Login vs Register) */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            {lang === "hi" ? "अधिकारी लॉगिन" : "Officer Login"}
          </button>
          <button
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            {lang === "hi" ? "नया पंजीकरण" : "New Registration"}
          </button>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <>
              <div className="auth-input-group">
                <label>{lang === "hi" ? "अधिकारी का पूरा नाम" : "Officer Full Name"}</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder={lang === "hi" ? "उदा. श्री सावंत पंडित" : "e.g. Shri Sawan Pandit"}
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>{lang === "hi" ? "विभाग / कार्यालय" : "Department / Office"}</label>
                <div className="auth-input-wrapper">
                  <Building size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Department of Land Revenue & Registry"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>
              {lang === "hi"
                ? "शासकीय अधिकारी आईडी / ईमेल"
                : "Government Officer ID / NIC Email"}
            </label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                required
                placeholder="sawan.pandit@gov.in or officer-id"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>{lang === "hi" ? "पासवर्ड / सुरक्षा पिन" : "Security Password / PIN"}</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>{lang === "hi" ? "पद / अधिकार क्षेत्र (Role)" : "Officer Designation / Role"}</label>
            <div className="auth-input-wrapper">
              <KeyRound size={16} className="auth-input-icon" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="auth-select"
              >
                <option value="Tehsildar / Sub-Registrar">
                  {lang === "hi" ? "तहसीलदार / उप-पंजीयक (Tehsildar)" : "Tehsildar / Sub-Registrar"}
                </option>
                <option value="Revenue Inspector / Kanoongo">
                  {lang === "hi" ? "राजस्व निरीक्षक / कानूनगो (Revenue Inspector)" : "Revenue Inspector / Kanoongo"}
                </option>
                <option value="District Land Verification Officer">
                  {lang === "hi" ? "जिला भूमि सत्यापन अधिकारी (Verification Officer)" : "District Land Verification Officer"}
                </option>
              </select>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <>
                <span>
                  {mode === "login"
                    ? lang === "hi"
                      ? "सुरक्षित पोर्टल में प्रवेश करें"
                      : "Authorize & Enter Portal"
                    : lang === "hi"
                    ? "अधिकारी खाता बनाएं"
                    : "Register Government Account"}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Login for Judges & Evaluators */}
        <div className="auth-demo-box">
          <div className="demo-box-header">
            <Sparkles size={14} color="#f59e0b" />
            <span>
              {lang === "hi"
                ? "स्मार्ट इंडिया हैकाथॉन त्वरित परीक्षक लॉगिन (1-Click Demo)"
                : "Smart India Hackathon Quick Demo Login (1-Click)"}
            </span>
          </div>
          <div className="demo-btns-grid">
            <button
              className="demo-role-btn"
              onClick={() => handleQuickDemoLogin("Tehsildar / Sub-Registrar")}
              disabled={loading}
            >
              <CheckCircle size={13} color="#16a34a" />
              <span>{lang === "hi" ? "तहसीलदार (मुख्य प्रशासक)" : "Tehsildar (Lead Admin)"}</span>
            </button>
            <button
              className="demo-role-btn"
              onClick={() => handleQuickDemoLogin("District Land Verification Officer")}
              disabled={loading}
            >
              <CheckCircle size={13} color="#2563eb" />
              <span>{lang === "hi" ? "सत्यापन अधिकारी" : "Verification Officer"}</span>
            </button>
          </div>
        </div>

        {/* Public Citizen Portal Entry Link */}
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            type="button"
            onClick={onOpenCitizenPortal}
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1.5px solid #f59e0b",
              color: "#fbbf24",
              padding: "10px 18px",
              borderRadius: "10px",
              width: "100%",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>🌐</span>
            <span>
              {lang === "hi"
                ? "नागरिक सार्वजनिक भूमि पोर्टल (भू-खोज) खोलें"
                : "Open Public Citizen Portal (Bhu-Khoj)"}
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="auth-footer">
          <p>
            BhoomiProof-AI • Intelligent Land Record Digitization • Team: NepTech Ninjas (#051)
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
