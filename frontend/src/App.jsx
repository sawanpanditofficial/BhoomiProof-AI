import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  ShieldCheck,
  Search,
  RefreshCw,
  FolderOpen,
  Filter,
  SlidersHorizontal,
  Loader2,
  Download,
  Languages,
  Trophy,
  UserCheck,
  LogOut,
  BarChart3,
  Globe,
  Users
} from "lucide-react";

import UploadModal from "./components/UploadModal";
import RecordDetailModal from "./components/RecordDetailModal";
import AuthPage from "./components/AuthPage";
import CitizenPublicPortal from "./components/CitizenPublicPortal";
import CollectorAnalyticsView from "./components/CollectorAnalyticsView";
import UserManagementView from "./components/UserManagementView";
import OfflineSyncBadge from "./components/OfflineSyncBadge";
import { translations } from "./utils/translations";

const API_BASE = "http://localhost:8000";

function App() {
  const [page, setPage] = useState("dashboard"); // "dashboard" | "search" | "verification" | "collector" | "users"
  const [lang, setLang] = useState(() => localStorage.getItem("bhoomi_lang") || "en");
  const [viewMode, setViewMode] = useState("officer"); // "officer" | "citizen"

  // Government Officer Authentication Session State
  const [officer, setOfficer] = useState(() => {
    try {
      const saved = localStorage.getItem("bhoomi_officer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    document.title = "BhoomiProof AI By NepTech Ninjas";
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bhoomi_officer");
    localStorage.removeItem("bhoomi_token");
    setOfficer(null);
  };

  // Only Lead Administrators (Tehsildar / District Magistrate / Super Admin) have User Management access
  // Verification Officers and field personnel are strictly excluded
  const isVerificationOfficer = Boolean(
    officer?.role?.toLowerCase().includes("verification") ||
    officer?.officer_id?.toLowerCase().includes("verify")
  );

  const isAdmin = Boolean(
    !isVerificationOfficer &&
    (
      officer?.is_super_admin ||
      officer?.permissions?.can_manage_users ||
      officer?.role?.toLowerCase().includes("tehsildar") ||
      officer?.role?.toLowerCase().includes("collector") ||
      officer?.role?.toLowerCase().includes("magistrate") ||
      officer?.officer_id?.toLowerCase().includes("sawan.tehsildar")
    )
  );

  const t = translations[lang] || translations.en;

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
    localStorage.setItem("bhoomi_lang", nextLang);
  };

  // Live Dashboard State
  const [stats, setStats] = useState({
    records_processed: 0,
    validated_records: 0,
    issues_detected: 0,
    pending_review: 0,
    average_confidence: 0,
    validation_metrics: {
      ocr_extraction: "96%",
      field_detection: "92%",
      consistency_check: "90%",
    },
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);

  // Verification Queue State
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Load Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setRecordsLoading(true);

    try {
      const [statsRes, recordsRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/stats`),
        fetch(`${API_BASE}/api/records?limit=25`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setStatsLoading(false);
      setRecordsLoading(false);
    }
  }, []);

  // Load Verification Queue
  const fetchVerificationQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/records/verification-queue`);
      if (res.ok) {
        const data = await res.json();
        setVerificationQueue(data.records || []);
      }
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!officer) return;
    let active = true;

    async function init() {
      if (active) {
        await fetchDashboardData();
      }
    }
    init();

    return () => {
      active = false;
    };
  }, [officer, fetchDashboardData]);

  // When page switches to verification, fetch queue
  useEffect(() => {
    if (!officer || page !== "verification") return;
    let active = true;

    async function loadQueue() {
      try {
        const res = await fetch(`${API_BASE}/api/records/verification-queue`);
        if (active && res.ok) {
          const data = await res.json();
          setVerificationQueue(data.records || []);
        }
      } catch (err) {
        console.error("Failed to load verification queue:", err);
      } finally {
        if (active) setQueueLoading(false);
      }
    }

    loadQueue();

    return () => {
      active = false;
    };
  }, [officer, page]);

  // Search Records
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && statusFilter === "All") {
      setSearchExecuted(false);
      return;
    }

    setSearching(true);
    setSearchExecuted(true);

    try {
      const filterParam = statusFilter !== "All" ? `&status=${statusFilter}` : "";
      const queryParam = searchQuery.trim() ? `q=${encodeURIComponent(searchQuery.trim())}` : "q=";
      const res = await fetch(`${API_BASE}/api/records/search?${queryParam}${filterParam}`);

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Export CSV Function for Tehsildars / District Collectors
  const handleExportCSV = (recordsToExport) => {
    const list = recordsToExport && recordsToExport.length > 0 ? recordsToExport : records;
    if (!list || list.length === 0) {
      alert(lang === "hi" ? "निर्यात करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।" : "No records available to export.");
      return;
    }

    const headers = [
      "Document Number",
      "Record ID",
      "Owner Name",
      "Father/Relative Name",
      "Survey/Khasra Number",
      "Land Area",
      "Land Type",
      "Village",
      "District",
      "Status",
      "Risk Score",
      "Risk Level",
      "SHA-256 Hash",
    ];

    const rows = list.map((r) => [
      `"${r.document_number || ""}"`,
      `"${r.record_id || ""}"`,
      `"${r.owner_name || ""}"`,
      `"${r.father_name || ""}"`,
      `"${r.survey_number || ""}"`,
      `"${r.land_area || ""}"`,
      `"${r.land_type || ""}"`,
      `"${r.village || ""}"`,
      `"${r.district || ""}"`,
      `"${r.status || ""}"`,
      `"${r.risk_score || 0}"`,
      `"${r.risk_level || ""}"`,
      `"${r.document_hash || ""}"`,
    ]);

    // Add UTF-8 BOM so Excel opens Hindi & symbols cleanly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bhoomiproof_land_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Called when upload modal finishes processing
  const handleUploadComplete = () => {
    fetchDashboardData();
    if (page === "verification") {
      fetchVerificationQueue();
    }
  };

  // Called when record is edited, deleted, or approved
  const handleRecordUpdated = () => {
    fetchDashboardData();
    if (page === "verification") {
      fetchVerificationQueue();
    }
  };

  // If user selected Public Citizen Portal ("Bhu-Khoj")
  if (viewMode === "citizen") {
    return (
      <CitizenPublicPortal
        onBackToOfficerLogin={() => setViewMode("officer")}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    );
  }

  // If officer is not logged in, display the matching Government Authentication page
  if (!officer) {
    return (
      <AuthPage
        onLoginSuccess={(newOfficer) => setOfficer(newOfficer)}
        onOpenCitizenPortal={() => setViewMode("citizen")}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    );
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="logo"
          onClick={() => setPage("dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="/favicon.svg"
            alt="BhoomiProof AI"
            style={{ width: "38px", height: "38px", borderRadius: "8px", flexShrink: 0 }}
          />
          <div>
            <h2>BhoomiProof AI</h2>
            <span style={{ fontSize: "10px", opacity: 0.8, display: "block" }}>By NepTech Ninjas</span>
          </div>
        </div>

        {/* Authenticated Officer Badge */}
        <div className="sidebar-officer-profile">
          <div className="officer-avatar">
            <UserCheck size={18} color="#1e40af" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <strong style={{ fontSize: "12px", color: "white", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {officer.name || (lang === "hi" ? "अधिकृत अधिकारी" : "Authorized Officer")}
            </strong>
            <small style={{ fontSize: "10px", color: "#93c5fd", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {officer.role || (lang === "hi" ? "तहसीलदार" : "Tehsildar")}
            </small>
          </div>
        </div>

        <nav>
          <a
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            <FileText size={18} />
            {t.dashboard}
          </a>

          <a
            className={page === "search" ? "active" : ""}
            onClick={() => {
              setPage("search");
              setSearchExecuted(false);
            }}
          >
            <Search size={18} />
            {t.search_records}
          </a>

          <a
            className={page === "verification" ? "active" : ""}
            onClick={() => setPage("verification")}
          >
            <ShieldCheck size={18} />
            {t.verification_queue}
            {stats.pending_review > 0 && (
              <span className="nav-counter-pill">{stats.pending_review}</span>
            )}
          </a>

          <a
            className={page === "collector" ? "active" : ""}
            onClick={() => setPage("collector")}
          >
            <BarChart3 size={18} />
            {lang === "hi" ? "कलेक्टर एनालिटिक्स" : "Collector Analytics"}
          </a>

          {isAdmin && (
            <a
              className={page === "users" ? "active" : ""}
              onClick={() => setPage("users")}
            >
              <Users size={18} />
              {lang === "hi" ? "अधिकारी प्रबंधन (Admin)" : "User Management"}
            </a>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={() => setViewMode("citizen")}
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid #f59e0b",
              color: "#fbbf24",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <Globe size={14} />
            <span>{lang === "hi" ? "नागरिक पोर्टल (Bhu-Khoj)" : "Citizen Portal (Bhu-Khoj)"}</span>
          </button>

          <div className="secure" style={{ marginBottom: "12px" }}>
            <ShieldCheck size={18} color="#10b981" />
            <div>
              <strong>{t.govt_portal}</strong>
              <small>{t.sha_tamper_proof}</small>
            </div>
          </div>

          {/* Officer Logout Button */}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Log out of government session"
          >
            <LogOut size={15} />
            <span>{lang === "hi" ? "सत्र समाप्त (लॉगआउट)" : "Logout Session"}</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main">
        {/* SIH Hackathon Official Branding Header Bar */}
        <div className="sih-branding-bar">
          <div className="sih-badge-container">
            <span className="sih-star-badge">
              <Trophy size={14} /> SIH 2026
            </span>
            <span className="sih-team-info">
              {lang === "hi" ? (
                <span><strong>समस्या कोड: SIH26018</strong> • बुद्धिमान भूमि अभिलेख डिजिटलीकरण एवं सत्यापन • टीम: <strong>NepTech Ninjas (#051)</strong></span>
              ) : (
                <span><strong>PS: SIH26018</strong> • Intelligent Land Record Digitization & Validation • Team: <strong>NepTech Ninjas (#051)</strong></span>
              )}
            </span>
          </div>

          <div className="sih-right-controls" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <OfflineSyncBadge lang={lang} />

            <button
              className="lang-toggle-btn"
              onClick={toggleLanguage}
              title="Toggle English / हिन्दी"
            >
              <Languages size={15} />
              <span>{lang === "en" ? "हिन्दी (HI)" : "English (EN)"}</span>
            </button>
          </div>
        </div>

        {page === "collector" ? (
          <CollectorAnalyticsView lang={lang} />
        ) : page === "users" ? (
          isAdmin ? (
            <UserManagementView officer={officer} lang={lang} />
          ) : (
            <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ fontSize: "20px", color: "#182230", marginBottom: "8px" }}>
                {lang === "hi" ? "पहुंच प्रतिबंधित (Access Restricted)" : "Access Restricted"}
              </h2>
              <p style={{ color: "#718096", maxWidth: "520px", margin: "0 auto 20px", fontSize: "14px", lineHeight: "1.6" }}>
                {lang === "hi"
                  ? "यह मॉड्यूल केवल प्रशासनिक अधिकारियों (तहसीलदार / उप-पंजीयक / ज़िला समाहर्ता) के लिए आरक्षित है। अन्य राजस्व कर्मियों को इसमें प्रवेश की अनुमति नहीं है।"
                  : "This module is strictly restricted to Lead Administrators (Tehsildar / Sub-Registrar / District Magistrate). Other field personnel cannot access user directory settings."}
              </p>
              <button className="btn-primary" onClick={() => setPage("dashboard")}>
                {lang === "hi" ? "डैशबोर्ड पर वापस जाएं" : "Return to Dashboard"}
              </button>
            </div>
          )
        ) : page === "search" ? (
          /* ===================================================
             PAGE: SEARCH RECORDS
          =================================================== */
          <div className="search-page">
            <header className="header">
              <div>
                <p className="eyebrow">{t.eyebrow_search}</p>
                <h1>{t.search_heading}</h1>
                <p className="subtitle">{t.search_sub}</p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleExportCSV(searchExecuted ? searchResults : records)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={15} />
                  {t.export_csv}
                </button>

                <button
                  className="upload-button"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload size={18} />
                  {t.upload_record}
                </button>
              </div>
            </header>

            {/* Search Input Box */}
            <form className="search-bar-container" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              {/* Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Filter size={16} color="#64748b" />
                <select
                  className="edit-input"
                  style={{ width: "130px", cursor: "pointer" }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="All">{t.all_statuses}</option>
                  <option value="Verified">{t.status_verified}</option>
                  <option value="Review">{t.status_review}</option>
                  <option value="Rejected">{t.status_rejected}</option>
                </select>
              </div>

              <button type="submit" className="search-btn" disabled={searching}>
                {searching ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                {t.search_btn}
              </button>
            </form>

            {/* Results Table */}
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    {searchExecuted
                      ? `${t.search_records} (${searchResults.length})`
                      : `${t.recent_records} (${records.length})`}
                  </h2>
                  <p>{t.recent_records_sub}</p>
                </div>

                <button
                  className="view-button"
                  onClick={() => handleExportCSV(searchExecuted ? searchResults : records)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} />
                  {t.export_csv}
                </button>
              </div>

              <div className="record-table">
                <div className="table-head" style={{ gridTemplateColumns: "1.2fr 1.2fr 1.2fr 0.8fr 0.8fr" }}>
                  <span>{t.doc_number}</span>
                  <span>{t.record_id}</span>
                  <span>{t.owner_name}</span>
                  <span>{t.survey_number}</span>
                  <span>{t.status}</span>
                </div>

                {(searchExecuted ? searchResults : records).length === 0 ? (
                  <div className="empty-state">
                    <FolderOpen size={40} style={{ margin: "10px auto", opacity: 0.4 }} />
                    <p>{t.empty_search_msg}</p>
                  </div>
                ) : (
                  (searchExecuted ? searchResults : records).map((rec) => (
                    <div
                      key={rec.record_id}
                      className="table-row"
                      style={{ gridTemplateColumns: "1.2fr 1.2fr 1.2fr 0.8fr 0.8fr" }}
                      onClick={() => setSelectedRecordId(rec.record_id)}
                      title="Click to view & edit record"
                    >
                      <strong style={{ color: "#2563eb" }}>
                        {rec.document_number || "Not assigned"}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{rec.record_id}</span>
                      <span>{rec.owner_name}</span>
                      <span>{rec.survey_number}</span>
                      <span
                        className={`status ${
                          rec.status?.toLowerCase() === "verified"
                            ? "verified"
                            : rec.status?.toLowerCase() === "rejected"
                            ? "rejected"
                            : "review"
                        }`}
                      >
                        {lang === "hi"
                          ? rec.status?.toLowerCase() === "verified"
                            ? "सत्यापित"
                            : rec.status?.toLowerCase() === "rejected"
                            ? "अस्वीकृत"
                            : "समीक्षाधीन"
                          : rec.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : page === "verification" ? (
          /* ===================================================
             PAGE: HUMAN VERIFICATION QUEUE
          =================================================== */
          <div className="search-page">
            <header className="header">
              <div>
                <p className="eyebrow">{t.eyebrow_queue}</p>
                <h1>{t.officer_queue_heading}</h1>
                <p className="subtitle">{t.officer_queue_sub}</p>
              </div>

              <button
                className="view-button"
                onClick={fetchVerificationQueue}
                style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <RefreshCw size={14} className={queueLoading ? "spin" : ""} />
                {t.refresh_queue}
              </button>
            </header>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>{t.pending_inspection} ({verificationQueue.length})</h2>
                  <p>{lang === "hi" ? "स्कैन देखकर अपूर्ण फ़ील्ड्स सुधारें और रिकॉर्ड स्वीकृत करें" : "Open any record to inspect the original scan, edit missing fields, and approve"}</p>
                </div>
              </div>

              <div className="record-table">
                <div className="table-head" style={{ gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1fr 1fr" }}>
                  <span>{t.doc_number}</span>
                  <span>{t.owner_name}</span>
                  <span>{t.inspection_attention}</span>
                  <span>{t.risk_level}</span>
                  <span>{t.action}</span>
                </div>

                {queueLoading ? (
                  <div className="empty-state">
                    <Loader2 size={28} className="spin" style={{ margin: "20px auto" }} />
                    <p>{t.loading_queue}</p>
                  </div>
                ) : verificationQueue.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle size={40} color="#16a34a" style={{ margin: "10px auto" }} />
                    <h3>{t.all_verified}</h3>
                    <p>{t.all_verified_sub}</p>
                  </div>
                ) : (
                  verificationQueue.map((rec) => (
                    <div
                      key={rec.record_id}
                      className="table-row"
                      style={{ gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1fr 1fr", alignItems: "center" }}
                      onClick={() => setSelectedRecordId(rec.record_id)}
                    >
                      <strong style={{ color: "#2563eb" }}>
                        {rec.document_number || rec.record_id}
                      </strong>
                      <span>{rec.owner_name}</span>

                      {/* Missing fields badges */}
                      <div>
                        {rec.missing_fields && rec.missing_fields.length > 0 ? (
                          rec.missing_fields.map((mf, i) => (
                            <span
                              key={i}
                              style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                marginRight: "4px",
                                fontWeight: 600,
                              }}
                            >
                              {mf}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "11px", color: "#d97706" }}>
                            {t.rule_anomaly_flagged}
                          </span>
                        )}
                      </div>

                      <span style={{ fontWeight: 600, color: rec.risk_level === "HIGH" ? "#dc2626" : "#d97706" }}>
                        {lang === "hi" ? (rec.risk_level === "LOW" ? "कम" : rec.risk_level === "HIGH" ? "उच्च" : "मध्यम") : rec.risk_level} ({rec.risk_score})
                      </span>

                      <div>
                        <button
                          className="btn-primary"
                          style={{ padding: "6px 12px", fontSize: "11px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecordId(rec.record_id);
                          }}
                        >
                          <SlidersHorizontal size={12} />
                          {t.inspect_and_edit}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================
             PAGE: OFFICER DASHBOARD (LIVE DATA)
          =================================================== */
          <>
            <header className="header">
              <div>
                <p className="eyebrow">{t.eyebrow_dashboard}</p>
                <h1>{t.officer_dashboard}</h1>
                <p className="subtitle">{t.dashboard_subtitle}</p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleExportCSV(records)}
                  title="Export records to Excel CSV"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} />
                  {t.export_csv}
                </button>

                <button
                  className="btn-secondary"
                  onClick={fetchDashboardData}
                  title="Sync with PostgreSQL"
                  style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                >
                  <RefreshCw size={14} className={statsLoading ? "spin" : ""} />
                  {t.sync_db}
                </button>

                {/* Main Dashboard Upload Button -> Triggers Upload Modal */}
                <button
                  className="upload-button"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload size={18} />
                  {t.upload_record}
                </button>
              </div>
            </header>

            {/* Statistics (Real Data from PostgreSQL) */}
            <section className="stats">
              <StatCard
                icon={<FileText />}
                title={t.records_processed}
                value={statsLoading ? "..." : stats.records_processed.toLocaleString()}
                change={t.records_processed_sub}
              />

              <StatCard
                icon={<CheckCircle />}
                title={t.validated_records}
                value={statsLoading ? "..." : stats.validated_records.toLocaleString()}
                change={t.validated_records_sub}
              />

              <StatCard
                icon={<AlertTriangle />}
                title={t.issues_detected}
                value={statsLoading ? "..." : stats.issues_detected.toLocaleString()}
                change={t.issues_detected_sub}
              />

              <StatCard
                icon={<Clock />}
                title={t.pending_review}
                value={statsLoading ? "..." : stats.pending_review.toLocaleString()}
                change={t.pending_review_sub}
              />
            </section>

            {/* Main Content Grid */}
            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>{t.recent_records}</h2>
                    <p>{t.recent_records_sub}</p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="view-button"
                      onClick={() => setPage("search")}
                      style={{ cursor: "pointer" }}
                    >
                      {t.view_all_search}
                    </button>
                  </div>
                </div>

                <div className="record-table">
                  <div className="table-head">
                    <span>{t.doc_number}</span>
                    <span>{t.owner_name}</span>
                    <span>{t.survey_number}</span>
                    <span>{t.status}</span>
                  </div>

                  {recordsLoading ? (
                    <div className="empty-state">
                      <Loader2 size={24} className="spin" style={{ margin: "10px auto" }} />
                      <p>{t.loading_records}</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="empty-state" style={{ padding: "35px 20px" }}>
                      <FolderOpen size={42} style={{ margin: "0 auto 12px", color: "#94a3b8" }} />
                      <h3 style={{ fontSize: "15px", color: "#334155", marginBottom: "6px" }}>
                        {t.empty_db_title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
                        {t.empty_db_sub}
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => setIsUploadModalOpen(true)}
                        style={{ margin: "0 auto" }}
                      >
                        <Upload size={16} />
                        {t.upload_record}
                      </button>
                    </div>
                  ) : (
                    records.map((rec) => (
                      <div
                        key={rec.record_id}
                        className="table-row"
                        onClick={() => setSelectedRecordId(rec.record_id)}
                        title="Click to view & edit details"
                      >
                        <div>
                          <strong style={{ color: "#2563eb", display: "block" }}>
                            {rec.document_number || rec.record_id}
                          </strong>
                          <small style={{ color: "#94a3b8", fontSize: "10px" }}>{rec.record_id}</small>
                        </div>
                        <span>{rec.owner_name}</span>
                        <span>{rec.survey_number}</span>
                        <span
                          className={`status ${
                            rec.status?.toLowerCase() === "verified"
                              ? "verified"
                              : rec.status?.toLowerCase() === "rejected"
                              ? "rejected"
                              : "review"
                          }`}
                        >
                          {lang === "hi"
                            ? rec.status?.toLowerCase() === "verified"
                              ? "सत्यापित"
                              : rec.status?.toLowerCase() === "rejected"
                              ? "अस्वीकृत"
                              : "समीक्षाधीन"
                            : rec.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Validation Intelligence Panel */}
              <div className="panel ai-panel">
                <div className="ai-title">
                  <div className="ai-icon">AI</div>
                  <div>
                    <h2>{t.ai_validation}</h2>
                    <p>{t.ai_validation_sub}</p>
                  </div>
                </div>

                <div className="confidence">
                  <div className="confidence-number">
                    {statsLoading ? "..." : `${stats.average_confidence}%`}
                  </div>
                  <div>
                    <strong>{t.average_confidence}</strong>
                    <p>{t.avg_conf_sub}</p>
                  </div>
                </div>

                <div className="progress">
                  <div
                    style={{
                      width: `${Math.min(stats.average_confidence || 90, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="validation-list">
                  <Validation
                    name={t.ocr_extraction}
                    value={stats.validation_metrics?.ocr_extraction || "96%"}
                  />
                  <Validation
                    name={t.field_detection}
                    value={stats.validation_metrics?.field_detection || "92%"}
                  />
                  <Validation
                    name={t.consistency_check}
                    value={stats.validation_metrics?.consistency_check || "90%"}
                  />
                </div>
              </div>
            </section>

            {/* Workflow Infographic */}
            <section className="workflow-panel">
              <div className="panel-header">
                <div>
                  <h2>{t.workflow_title}</h2>
                  <p>{t.workflow_subtitle}</p>
                </div>
              </div>

              <div className="workflow">
                <WorkflowStep number="01" title={t.step1_title} description={t.step1_desc} />
                <div className="arrow">→</div>
                <WorkflowStep number="02" title={t.step2_title} description={t.step2_desc} />
                <div className="arrow">→</div>
                <WorkflowStep number="03" title={t.step3_title} description={t.step3_desc} />
                <div className="arrow">→</div>
                <WorkflowStep number="04" title={t.step4_title} description={t.step4_desc} />
                <div className="arrow">→</div>
                <WorkflowStep number="05" title={t.step5_title} description={t.step5_desc} />
              </div>
            </section>
          </>
        )}
      </main>

      {/* Upload Pop-up Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        onOpenRecordDetail={(recId) => setSelectedRecordId(recId)}
        onGoToVerificationQueue={(recId) => {
          setPage("verification");
          setSelectedRecordId(recId);
        }}
        lang={lang}
      />

      {/* Record Inspection & Admin Edit Modal */}
      <RecordDetailModal
        recordId={selectedRecordId}
        isOpen={Boolean(selectedRecordId)}
        onClose={() => setSelectedRecordId(null)}
        onRecordUpdated={handleRecordUpdated}
        officer={officer}
        lang={lang}
      />
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function StatCard({ icon, title, value, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <small>{change}</small>
      </div>
    </div>
  );
}

function Validation({ name, value }) {
  return (
    <div className="validation">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <div className="workflow-step">
      <div className="workflow-number">{number}</div>
      <strong>{title}</strong>
      <small>{description}</small>
    </div>
  );
}

export default App;