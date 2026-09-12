import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  HelpCircle,
  Building2,
  Scale,
  RefreshCw,
  Loader2
} from "lucide-react";

const API_BASE = "http://localhost:8000";

function FraudDisputeMatrix({ recordId, lang = "en" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    if (!recordId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/records/${recordId}/fraud-check`);
      if (!res.ok) throw new Error("Could not retrieve fraud intelligence analysis");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to load fraud matrix");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!recordId) return;
    let active = true;

    async function loadAnalysis() {
      try {
        const res = await fetch(`${API_BASE}/api/records/${recordId}/fraud-check`);
        if (!res.ok) throw new Error("Could not retrieve fraud intelligence analysis");
        const json = await res.json();
        if (active) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load fraud matrix");
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [recordId]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
        <Loader2 size={24} className="spin" style={{ margin: "0 auto 8px" }} />
        <p style={{ fontSize: "12px" }}>
          {lang === "hi" ? "एआई फ्रॉड एवं दोहरा विक्रय विश्लेषण जारी..." : "Running AI Double-Sale & Encroachment Matrix..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", color: "#b91c1c", fontSize: "12px" }}>
        <AlertTriangle size={16} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const isCritical = data.risk_tier === "CRITICAL";
  const isHigh = data.risk_tier === "HIGH";
  const isClean = data.risk_tier === "LOW" && data.fraud_score === 0;

  const badgeColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : isClean ? "#10b981" : "#f59e0b";
  const badgeBg = isCritical ? "#fef2f2" : isHigh ? "#fff7ed" : isClean ? "#ecfdf5" : "#fffbeb";

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1.5px solid ${isCritical ? "#fca5a5" : "#e2e8f0"}`,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "12px",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: badgeBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${badgeColor}33`,
            }}
          >
            {isCritical || isHigh ? (
              <ShieldAlert size={20} color={badgeColor} />
            ) : (
              <ShieldCheck size={20} color={badgeColor} />
            )}
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {lang === "hi"
                ? "एआई फ्रॉड एवं विवाद विश्लेषण मैट्रिक्स"
                : "AI Fraud & Dispute Intelligence Matrix"}
            </h4>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              {lang === "hi" ? "दोहरा विक्रय एवं अतिक्रमण रोकथाम प्रणाली" : "Double-Sale & Encroachment Protection Engine"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeColor}40`,
            }}
          >
            {lang === "hi" ? (data.risk_tier === "CRITICAL" ? "गंभीर जोखिम" : data.risk_tier === "HIGH" ? "उच्च जोखिम" : data.risk_tier === "LOW" ? "कम जोखिम" : "मध्यम जोखिम") : `${data.risk_tier} RISK`} ({data.fraud_score} / 100)
          </span>
          <button
            onClick={handleRefresh}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              padding: "4px",
            }}
            title="Refresh Analysis"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 4 Multi-Point Security Gauge Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        {/* Card 1: Double Sale */}
        <div
          style={{
            background: data.double_sale_status === "DUPLICATE_DETECTED" ? "#fef2f2" : "#f8fafc",
            border: `1px solid ${data.double_sale_status === "DUPLICATE_DETECTED" ? "#fca5a5" : "#e2e8f0"}`,
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
            <FileWarning size={13} color={data.double_sale_status === "DUPLICATE_DETECTED" ? "#ef4444" : "#10b981"} />
            <strong>{lang === "hi" ? "दोहरा विक्रय जांच" : "Double-Sale Check"}</strong>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: data.double_sale_status === "DUPLICATE_DETECTED" ? "#dc2626" : "#059669" }}>
            {data.double_sale_status === "DUPLICATE_DETECTED"
              ? (lang === "hi" ? "⚠ दोहरा विक्रय संदिग्ध" : "⚠ Duplicate Detected")
              : (lang === "hi" ? "✓ कोई विवाद नहीं" : "✓ No Duplicate Deed")}
          </div>
        </div>

        {/* Card 2: Government Land Encroachment */}
        <div
          style={{
            background: isCritical ? "#fef2f2" : "#f8fafc",
            border: `1px solid ${isCritical ? "#fca5a5" : "#e2e8f0"}`,
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
            <Building2 size={13} color="#2563eb" />
            <strong>{lang === "hi" ? "सरकारी भूमि जांच" : "Govt / Gram Sabha"}</strong>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: isCritical ? "#dc2626" : "#059669" }}>
            {isCritical
              ? (lang === "hi" ? "⚠ प्रतिबंधित श्रेणी" : "⚠ Restricted Category")
              : (lang === "hi" ? "✓ निजी स्वामित्व मुक्त" : "✓ Clear Private Title")}
          </div>
        </div>

        {/* Card 3: Boundary Integrity */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
            <Scale size={13} color="#059669" />
            <strong>{lang === "hi" ? "सीमांकन अखंडता" : "Boundary Match"}</strong>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
            {data.cadastral_boundary_integrity} DILRMP
          </div>
        </div>

        {/* Card 4: Action Verdict */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
            <HelpCircle size={13} color="#7c3aed" />
            <strong>{lang === "hi" ? "सिस्टम निष्कर्ष" : "System Verdict"}</strong>
          </div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: badgeColor }}>
            {data.verdict.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {/* Flags & Warnings List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.flags.map((flag, idx) => {
          const isFlagCritical = flag.severity === "CRITICAL";
          const isFlagHigh = flag.severity === "HIGH";
          const isFlagSafe = flag.severity === "SAFE";

          const flagBg = isFlagCritical ? "#fef2f2" : isFlagHigh ? "#fff7ed" : isFlagSafe ? "#f0fdf4" : "#fffbeb";
          const flagBorder = isFlagCritical ? "#fecaca" : isFlagHigh ? "#fed7aa" : isFlagSafe ? "#bbf7d0" : "#fef08a";
          const flagColor = isFlagCritical ? "#991b1b" : isFlagHigh ? "#9a3412" : isFlagSafe ? "#166534" : "#854d0e";

          return (
            <div
              key={idx}
              style={{
                background: flagBg,
                border: `1px solid ${flagBorder}`,
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              {isFlagSafe ? (
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
              ) : (
                <AlertTriangle size={18} color={isFlagCritical ? "#dc2626" : "#d97706"} style={{ flexShrink: 0, marginTop: "2px" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: "12px", color: flagColor }}>{flag.title}</strong>
                  <span
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      background: "white",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      color: flagColor,
                    }}
                  >
                    {flag.severity}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: flagColor, margin: "3px 0 0 0", lineHeight: "1.4" }}>
                  {flag.details}
                </p>
                {flag.reference_doc && (
                  <div style={{ marginTop: "4px", fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
                    {lang === "hi" ? "संदर्भ दस्तावेज़: " : "Reference Document: "}{flag.reference_doc} • {lang === "hi" ? "भूस्वामी: " : "Owner: "}{flag.matched_owner}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FraudDisputeMatrix;
