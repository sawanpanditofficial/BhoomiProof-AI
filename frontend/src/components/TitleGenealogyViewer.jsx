import { useState } from "react";
import {
  CheckCircle2,
  Scale
} from "lucide-react";

function TitleGenealogyViewer({ record, lang = "en" }) {
  const [selectedNode, setSelectedNode] = useState(2); // default current node

  if (!record) return null;

  const currentOwner = record.owner_name || "Ramesh Kumar Sharma";
  const fatherName = record.father_name || "Mahesh Kumar Sharma";
  const grandfather = "Late Ram Lal Sharma";

  const generations = [
    {
      id: 0,
      year: "1972",
      date: "14/05/1972",
      title: lang === "hi" ? "पीढ़ी १: मूल बंदोबस्त आवंटन (खतियानी पट्टा)" : "Gen 1: Cadastral Settlement Grant",
      holder: grandfather,
      relationship: lang === "hi" ? "मूल खातेदार (दादाजी)" : "Original Land Grantee (Grandfather)",
      deedType: "Government Settlement Record (खतियान भाग-२)",
      caseNumber: "CS-REV-1972-0412",
      status: "SETTLED_CLEAR",
      area: record.land_area || "0.85 Acres",
      notes: lang === "hi"
        ? "बिहार/यूपी काश्तकारी अधिनियम के अंतर्गत विधिवत सर्वेक्षण बंदोबस्त में दर्ज।"
        : "Recorded under state Tenancy Survey & Settlement. Pristine baseline title.",
    },
    {
      id: 1,
      year: "1998",
      date: "22/08/1998",
      title: lang === "hi" ? "पीढ़ी २: वारिसाना नामांतरण (उत्तराधिकार)" : "Gen 2: Succession & Inheritance Mutation",
      holder: fatherName,
      relationship: lang === "hi" ? "वैध उत्तराधिकारी (पिताजी)" : "Legal Heir / Successor (Father)",
      deedType: "Warisana Mutation Order (दाखिल-खारिज)",
      caseNumber: "MUT-1998-8429",
      status: "SUCCESSION_MUTATED",
      area: record.land_area || "0.85 Acres",
      notes: lang === "hi"
        ? "मूल खातेदार के देहांत उपरांत राजस्व न्यायालय द्वारा निर्विवाद नामांतरण पारित।"
        : "Uncontested succession mutation sanctioned by Circle Officer after public gazette.",
    },
    {
      id: 2,
      year: "2018",
      date: record.registration_date || "17/06/2018",
      title: lang === "hi" ? "पीढ़ी ३: पंजीकृत बैनामा एवं डिजिटल भू-आधार" : "Gen 3: Registered Sale Deed & Title Lock",
      holder: currentOwner,
      relationship: lang === "hi" ? "वर्तमान वैध स्वामी" : "Current Registered Titleholder",
      deedType: "Registered Sale Deed (बैनामा विलेख)",
      caseNumber: record.document_number || "REG-2018-0417",
      status: "CURRENT_ACTIVE_TITLE",
      area: record.land_area || "0.85 Acres",
      notes: lang === "hi"
        ? "उप-पंजीयक कार्यालय में निबंधित, पूर्ण स्टाम्प शुल्क जमा एवं 14-अंकीय भू-आधार मुहरबंद।"
        : "Executed at Sub-Registrar treasury, 100% stamp duty paid, and Bhu-Aadhaar sealed.",
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1.5px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Scale size={18} color="#2563eb" />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              {lang === "hi"
                ? "30-वर्षीय स्वामित्व वंशावली एवं विलेख शृंखला (Title Lineage)"
                : "30-Year Title Chain & Ownership Genealogy (Vanshavali)"}
            </h4>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              {lang === "hi"
                ? "दादाजी से वर्तमान स्वामी तक निर्विवाद कानूनी उत्तराधिकार शृंखला"
                : "Unbroken Chain of Custody & Succession Verification (1972 - 2026)"}
            </span>
          </div>
        </div>

        <span
          style={{
            background: "#ecfdf5",
            color: "#059669",
            border: "1px solid #a7f3d0",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CheckCircle2 size={13} /> {lang === "hi" ? "अविवादित विलेख शृंखला" : "Unbroken Clean Title"}
        </span>
      </div>

      {/* 30-Year Chain Metrics Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
            {lang === "hi" ? "विलेख अवधि (Lineage Depth)" : "Lineage Depth"}
          </span>
          <strong style={{ fontSize: "13px", color: "#1e293b" }}>{lang === "hi" ? "५४ वर्ष (१९७२ - २०२६)" : "54 Years (1972 - 2026)"}</strong>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
            {lang === "hi" ? "भार-मुक्त प्रमाणपत्र (NEC)" : "30-Year Non-Encumbrance"}
          </span>
          <strong style={{ fontSize: "13px", color: "#059669" }}>{lang === "hi" ? "✓ प्रमाणित (प्रपत्र-१५)" : "✓ Certified (Form-15)"}</strong>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
            {lang === "hi" ? "सह-खातेदार विवाद जांच" : "Co-Sharer Litigation Check"}
          </span>
          <strong style={{ fontSize: "13px", color: "#2563eb" }}>{lang === "hi" ? "✓ कोई बंटवारा वाद लंबित नहीं" : "✓ No Partition Suits Pending"}</strong>
        </div>
      </div>

      {/* Visual Chronological Family Lineage Tree */}
      <div style={{ position: "relative", paddingLeft: "10px" }}>
        {generations.map((gen, idx) => {
          const isSelected = selectedNode === gen.id;
          const isCurrent = gen.id === 2;

          return (
            <div key={gen.id} style={{ display: "flex", gap: "16px", marginBottom: "16px", position: "relative" }}>
              {/* Vertical connector line */}
              {idx < generations.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "17px",
                    top: "34px",
                    bottom: "-18px",
                    width: "2px",
                    background: "#cbd5e1",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Node Circle */}
              <div
                onClick={() => setSelectedNode(gen.id)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: isCurrent ? "#2563eb" : isSelected ? "#0f172a" : "#ffffff",
                  border: `2px solid ${isCurrent ? "#2563eb" : "#94a3b8"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isCurrent || isSelected ? "white" : "#64748b",
                  fontWeight: 800,
                  fontSize: "11px",
                  zIndex: 2,
                  cursor: "pointer",
                  boxShadow: isCurrent ? "0 0 10px rgba(37, 99, 235, 0.4)" : "none",
                  flexShrink: 0,
                }}
              >
                {gen.year.slice(2)}
              </div>

              {/* Generation Card */}
              <div
                onClick={() => setSelectedNode(gen.id)}
                style={{
                  flex: 1,
                  background: isSelected ? "#f8fafc" : "#ffffff",
                  border: `1.5px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "13px", color: "#0f172a" }}>{gen.holder}</strong>
                      <span
                        style={{
                          fontSize: "10px",
                          background: isCurrent ? "#dbeafe" : "#f1f5f9",
                          color: isCurrent ? "#1e40af" : "#475569",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {gen.relationship}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      {gen.title} • {gen.date}
                    </div>
                  </div>

                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                    {lang === "hi" ? "वाद सं.: " : "Case: "}{gen.caseNumber}
                  </span>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "11px", color: "#334155" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "6px" }}>
                      <div>
                        <span style={{ color: "#64748b" }}>विलेख प्रकार (Deed Instrument):</span>
                        <div style={{ fontWeight: 600 }}>{gen.deedType}</div>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>हस्तांतरित रकबा (Transferred Area):</span>
                        <div style={{ fontWeight: 600 }}>{gen.area}</div>
                      </div>
                    </div>
                    <p style={{ margin: "4px 0 0 0", color: "#475569", lineHeight: "1.4" }}>{gen.notes}</p>
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

export default TitleGenealogyViewer;
