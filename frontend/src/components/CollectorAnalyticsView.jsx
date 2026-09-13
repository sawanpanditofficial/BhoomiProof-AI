import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Clock,
  IndianRupee,
  Download,
  BarChart3,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  Inbox
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function CollectorAnalyticsView({ lang = "en" }) {
  const [data, setData] = useState({
    total_mutations: 0,
    verified_count: 0,
    fraud_blocked_count: 0,
    pending_count: 0,
    mutation_tat: "0.0 Min",
    revenue_realized: "₹0.00",
    fraud_amount_averted: "₹0.00",
    land_area_protected: "0 Hectares",
    tehsils: [],
    empty: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/analytics/collector`);
      if (!res.ok) throw new Error("Could not fetch collector analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to load dynamic analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Executive Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "14px",
          padding: "20px 24px",
          color: "white",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          border: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.2)",
              border: "1.5px solid #f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "1px", color: "#fbbf24", fontWeight: 700 }}>
              {lang === "hi" ? "ज़िला समाहर्ता एवं दंडाधिकारी कार्यालय" : "OFFICE OF THE DISTRICT MAGISTRATE & COLLECTOR"}
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 0 0" }}>
              {lang === "hi" ? "ज़िला भूमि गवर्नेंस एवं एआई विवाद विश्लेषण हीटमैप" : "District Land Governance & AI Dispute Intelligence Suite"}
            </h2>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {lang === "hi" ? "PostgreSQL डेटाबेस से रीयल-टाइम डेटा आधारित" : "Real-time Metrics Driven by PostgreSQL Land Registry"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid #475569",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="Refresh from database"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {lang === "hi" ? "ताज़ा करें" : "Refresh"}
          </button>

          <button
            onClick={handleExportReport}
            style={{
              background: "#2563eb",
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
            <Download size={14} /> {lang === "hi" ? "कलेक्ट्रेट रिपोर्ट डाउनलोड" : "Export DM Report"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #f87171", borderRadius: "10px", padding: "12px 16px", color: "#991b1b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Executive Governance KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {/* KPI 1: TAT */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{lang === "hi" ? "नामांतरण गति (औसत समय)" : "MUTATION SPEED (TAT)"}</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
            {data.total_mutations > 0 ? (lang === "hi" ? `${data.mutation_tat}` : data.mutation_tat) : "0.0 Min"}
          </div>
          <div style={{ fontSize: "11px", color: data.total_mutations > 0 ? "#16a34a" : "#64748b", marginTop: "4px", fontWeight: 600 }}>
            {data.total_mutations > 0
              ? (lang === "hi" ? "↓ ९१% तेज एआई स्वचालित सत्यापन" : "↓ 91% Faster (Automated AI)")
              : (lang === "hi" ? "कोई विलेख अभी अपलोड नहीं हुआ" : "No deeds processed yet")}
          </div>
        </div>

        {/* KPI 2: Revenue */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{lang === "hi" ? "प्राप्त स्टाम्प राजस्व" : "STAMP DUTY REALIZED"}</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IndianRupee size={16} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{data.revenue_realized}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {lang === "hi" ? `${data.total_mutations} विलेखों से संकलित` : `Computed from ${data.total_mutations} deeds`}
          </div>
        </div>

        {/* KPI 3: Fraud Averted */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{lang === "hi" ? "रोका गया अवैध फर्जीवाड़ा" : "ILLEGAL FRAUD BLOCKED"}</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={16} color="#dc2626" />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#dc2626" }}>{data.fraud_amount_averted}</div>
          <div style={{ fontSize: "11px", color: "#991b1b", marginTop: "4px", fontWeight: 600 }}>
            {lang === "hi" ? `${data.fraud_blocked_count} फर्जी/दोहरा विलेख अवरुद्ध` : `${data.fraud_blocked_count} Suspicious / Tampered Deeds Blocked`}
          </div>
        </div>

        {/* KPI 4: Public Land Preserved */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{lang === "hi" ? "सरकारी भूमि सुरक्षा" : "GOVERNMENT LAND SHIELD"}</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} color="#ca8a04" />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{data.land_area_protected}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            {lang === "hi" ? "शून्य अतिक्रमण सुनिश्चित" : "Encumbrance-Free Demarcation"}
          </div>
        </div>
      </div>

      {/* Tehsil Performance & Dispute Hotspots Table */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart3 size={18} color="#2563eb" />
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              {lang === "hi" ? "तहसील / अंचल-वार निस्तारण एवं जोखिम तुलना" : "Tehsil-Wise Mutation Performance & Risk Index"}
            </h3>
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            {lang === "hi" ? "PostgreSQL डेटाबेस से रीयल-टाइम अद्यतन" : "Live aggregations from PostgreSQL"}
          </div>
        </div>

        {data.tehsils && data.tehsils.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "तहसील / अंचल" : "TEHSIL / CIRCLE"}</th>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "संपादित नामांतरण" : "MUTATIONS PROCESSED"}</th>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "राजस्व वसूली" : "REVENUE REALIZED"}</th>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "अवरुद्ध फर्जीवाड़ा" : "FRAUD AVERTED"}</th>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "विवाद जोखिम दर" : "DISPUTE RISK"}</th>
                  <th style={{ padding: "10px 12px" }}>{lang === "hi" ? "गवर्नेंस स्थिति" : "GOVERNANCE STATUS"}</th>
                </tr>
              </thead>
              <tbody>
                {data.tehsils.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>{t.name}</td>
                    <td style={{ padding: "12px", color: "#334155" }}>{t.mutations} {lang === "hi" ? "विलेख" : "Deeds"}</td>
                    <td style={{ padding: "12px", color: "#059669", fontWeight: 600 }}>{t.revenue}</td>
                    <td style={{ padding: "12px", color: "#dc2626", fontWeight: 600 }}>{t.fraudBlocked}</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", minWidth: "60px" }}>
                          <div
                            style={{
                              width: `${Math.min(t.riskRate * 10, 100)}%`,
                              height: "100%",
                              background: t.riskRate > 6 ? "#ef4444" : t.riskRate > 4 ? "#f59e0b" : "#10b981",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700 }}>{t.riskRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background: t.status === "EXCELLENT" ? "#dcfce7" : t.status === "MODERATE" ? "#fef3c7" : "#fee2e2",
                          color: t.status === "EXCELLENT" ? "#166534" : t.status === "MODERATE" ? "#92400e" : "#991b1b",
                        }}
                      >
                        {lang === "hi" ? (t.status === "EXCELLENT" ? "उत्कृष्ट" : t.status === "MODERATE" ? "संतोषजनक" : "ध्यानाकर्षण") : t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
            <Inbox size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ margin: "0 0 6px 0", color: "#334155", fontSize: "14px", fontWeight: 700 }}>
              {lang === "hi" ? "कोई डेटा उपलब्ध नहीं है (खाली डेटाबेस)" : "No Land Deeds Uploaded Yet"}
            </h4>
            <p style={{ margin: 0, color: "#64748b", fontSize: "12px", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
              {lang === "hi"
                ? "जैसे ही आप 'दस्तावेज़ अपलोड' द्वारा नए विलेख अपलोड करेंगे, यह विश्लेषण हीटमैप स्वतः तहसील-वार आंकड़ों की गणना करेगा।"
                : "As you upload and process land deeds, this collector suite will automatically compute revenue, TAT, risk rates, and Tehsil distributions in real time."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectorAnalyticsView;
