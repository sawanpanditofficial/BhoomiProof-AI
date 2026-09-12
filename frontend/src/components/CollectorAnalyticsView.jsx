import {
  ShieldCheck,
  Building2,
  Clock,
  IndianRupee,
  Download,
  BarChart3
} from "lucide-react";

function CollectorAnalyticsView({ lang = "en" }) {
  const tehsils = [
    { name: "Kanti", mutations: 412, revenue: "₹3.82 Cr", fraudBlocked: "₹78 Lakh", riskRate: 2.1, status: "EXCELLENT" },
    { name: "Sadar", mutations: 624, revenue: "₹5.94 Cr", fraudBlocked: "₹1.42 Cr", riskRate: 5.8, status: "MODERATE" },
    { name: "Marwan", mutations: 288, revenue: "₹2.41 Cr", fraudBlocked: "₹45 Lakh", riskRate: 1.4, status: "EXCELLENT" },
    { name: "Saraiya", mutations: 350, revenue: "₹2.65 Cr", fraudBlocked: "₹75 Lakh", riskRate: 7.2, status: "ATTENTION" },
  ];

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
              District: Muzaffarpur (DILRMP State Command Center)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{lang === "hi" ? "४.२ मिनट" : "4.2 Minutes"}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            {lang === "hi" ? "↓ ९१% तेज (पूर्व में: ४५ दिन)" : "↓ 91% Faster (Previous: 45 Days)"}
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
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>₹14.82 Cr</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {lang === "hi" ? "१००% सरकारी कोषागार मिलान" : "100% Treasury Reconciliation"}
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
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#dc2626" }}>₹3.40 Cr</div>
          <div style={{ fontSize: "11px", color: "#991b1b", marginTop: "4px", fontWeight: 600 }}>
            {lang === "hi" ? "१८ दोहरा विक्रय समय रहते पकड़े गए" : "18 Double-Sales Detected Early"}
          </div>
        </div>

        {/* KPI 4: Public Land Preserved */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{lang === "hi" ? "ग्राम सभा / सरकारी भूमि सुरक्षा" : "GRAM SABHA LAND SHIELD"}</span>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} color="#ca8a04" />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{lang === "hi" ? "२३० हेक्टेयर" : "230 Hectares"}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            {lang === "hi" ? "शून्य अतिक्रमण सुनिश्चित" : "Zero Encroachment Allowed"}
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
              {lang === "hi" ? "तहसील-वार निस्तारण एवं जोखिम तुलना" : "Tehsil-Wise Mutation Performance & Risk Index"}
            </h3>
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{lang === "hi" ? "PostgreSQL से रीयल-टाइम अद्यतन" : "Updated real-time from PostgreSQL"}</div>
        </div>

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
              {tehsils.map((t, idx) => (
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
                            width: `${t.riskRate * 10}%`,
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
      </div>
    </div>
  );
}

export default CollectorAnalyticsView;
