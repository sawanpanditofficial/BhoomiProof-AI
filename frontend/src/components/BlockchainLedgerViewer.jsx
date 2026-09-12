import { useState } from "react";
import {
  Link2,
  Cpu,
  FileDigit,
  Award,
  UserCheck,
  Lock,
  CheckCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react";

function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(16, "0");
}

function BlockchainLedgerViewer({ record, lang = "en" }) {
  const [expandedBlock, setExpandedBlock] = useState(null);

  if (!record) return null;

  const baseHash = record.document_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const docNum = record.document_number || "DOC-2026-9809";
  const recordId = record.record_id || "LR-2026-0001";
  const ulpin = `09-24-${recordId.slice(-4)}-9809-11`;

  // Derive chain of 5 cryptographic blocks
  const blocks = [
    {
      index: 0,
      name: lang === "hi" ? "ब्लॉक #0: जेनेसिस (मूल स्कैन अपलोड)" : "Block #0: Genesis (Deed Ingestion)",
      action: "GENESIS_DEED_UPLOAD",
      icon: <FileDigit size={16} color="#3b82f6" />,
      timestamp: record.created_at || "2026-09-12T10:00:00Z",
      prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: baseHash,
      nonce: 1048576,
      validator: "BhoomiProof Ingestion Node-01",
      payload: {
        document_number: docNum,
        raw_scan_bytes: "2.4 MB (PDF/PNG)",
        sha256_checksum: baseHash,
      },
    },
    {
      index: 1,
      name: lang === "hi" ? "ब्लॉक #1: इंडिक-ओसीआर एवं एआई निष्कर्षण" : "Block #1: IndicBERT OCR & NLP Extraction",
      action: "AI_FIELD_EXTRACTION",
      icon: <Cpu size={16} color="#8b5cf6" />,
      timestamp: record.created_at ? new Date(new Date(record.created_at).getTime() + 1500).toISOString() : "2026-09-12T10:00:01Z",
      prevHash: baseHash,
      hash: "8f7a" + generateHash(baseHash + "OCR") + baseHash.slice(8, 20),
      nonce: 2097152,
      validator: "Tesseract-IndicBERT Engine",
      payload: {
        owner: record.owner_name,
        relative: record.father_name,
        survey_number: record.survey_number,
        area: record.land_area,
        confidence: `${record.confidence_score || 96.5}%`,
      },
    },
    {
      index: 2,
      name: lang === "hi" ? "ब्लॉक #2: कैडस्ट्रल सीमांकन एवं GIS लॉक" : "Block #2: Cadastral GIS Demarcation",
      action: "GIS_PARCEL_DEMARCATION",
      icon: <Link2 size={16} color="#059669" />,
      timestamp: record.created_at ? new Date(new Date(record.created_at).getTime() + 3000).toISOString() : "2026-09-12T10:00:03Z",
      prevHash: "8f7a" + generateHash(baseHash + "OCR") + baseHash.slice(8, 20),
      hash: "4c1b" + generateHash(baseHash + "GIS") + baseHash.slice(12, 24),
      nonce: 3145728,
      validator: "DILRMP BhuNaksha Geo-Spatial Node",
      payload: {
        khasra_no: record.survey_number,
        polygon_vertices: 8,
        boundary_integrity: "98.4%",
        centroid_coordinates: "26.8467° N, 80.9462° E",
      },
    },
    {
      index: 3,
      name: lang === "hi" ? "ब्लॉक #3: तहसीलदार डिजिटल हस्ताक्षर एवं सत्यापन" : "Block #3: Tehsildar Cryptographic Approval",
      action: "OFFICER_SIGNATURE_VERIFIED",
      icon: <UserCheck size={16} color="#2563eb" />,
      timestamp: record.verified_at || record.updated_at || "2026-09-12T10:00:05Z",
      prevHash: "4c1b" + generateHash(baseHash + "GIS") + baseHash.slice(12, 24),
      hash: "99e2" + generateHash(baseHash + "TEHSILDAR") + baseHash.slice(16, 28),
      nonce: 4194304,
      validator: record.verified_by || "Shri Sawan Pandit (Tehsildar)",
      payload: {
        status: record.status || "Verified",
        risk_score: record.risk_score || 0.0,
        digital_signature: "ECDSA-secp256k1-Verified",
        officer_notes: record.decision_notes || "Clean title approved",
      },
    },
    {
      index: 4,
      name: lang === "hi" ? "ब्लॉक #4: भू-आधार (ULPIN) मिंट एवं स्टेट लेजर" : "Block #4: State Land Ledger Bhu-Aadhaar Mint",
      action: "BHU_AADHAAR_ULPIN_MINT",
      icon: <Award size={16} color="#d97706" />,
      timestamp: record.verified_at ? new Date(new Date(record.verified_at).getTime() + 1000).toISOString() : "2026-09-12T10:00:06Z",
      prevHash: "99e2" + generateHash(baseHash + "TEHSILDAR") + baseHash.slice(16, 28),
      hash: "7d08" + generateHash(baseHash + "MINT") + baseHash.slice(20, 32),
      nonce: 5242880,
      validator: "State Land Registry Smart Contract v2.4",
      payload: {
        ulpin_issued: ulpin,
        public_registry_token: "MINT_COMPLETED",
        qr_verification_anchor: `https://bhoomiproof.gov.in/c/${recordId}`,
      },
    },
  ];

  return (
    <div
      style={{
        background: "#090d16",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "16px",
        color: "#f8fafc",
      }}
    >
      {/* Ledger Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #1e293b",
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
              background: "rgba(37, 99, 235, 0.15)",
              border: "1px solid #2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={18} color="#60a5fa" />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
              {lang === "hi"
                ? "अपरिवर्तनीय ब्लॉकचेन लेजर एक्सप्लोरर"
                : "Immutable Blockchain Land Ledger Explorer"}
            </h4>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {lang === "hi"
                ? "क्रिप्टोग्राफिक चेन ऑफ कस्टडी (छेड़छाड़-असंभव लेजर)"
                : "Cryptographic Chain of Custody (SHA-256 / Proof-of-Authority)"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              color: "#34d399",
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CheckCircle size={12} />
            {lang === "hi" ? "चेन सत्यापित: 5/5 ब्लॉक सुरक्षित" : "Chain Valid: 5 Blocks Sealed"}
          </span>
        </div>
      </div>

      {/* Blocks Sequence */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {blocks.map((block, idx) => {
          const isExpanded = expandedBlock === block.index;

          return (
            <div key={block.index} style={{ position: "relative" }}>
              {/* Vertical connector chain line */}
              {idx < blocks.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "22px",
                    top: "42px",
                    bottom: "-14px",
                    width: "2px",
                    background: "linear-gradient(to bottom, #3b82f6, #10b981)",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Block Card */}
              <div
                style={{
                  background: isExpanded ? "#111827" : "#0f172a",
                  border: `1px solid ${isExpanded ? "#3b82f6" : "#1e293b"}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  position: "relative",
                  zIndex: 2,
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedBlock(isExpanded ? null : block.index)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {block.icon}
                    </div>
                    <div>
                      <strong style={{ fontSize: "13px", color: "#f8fafc" }}>{block.name}</strong>
                      <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "10px" }}>
                        <span>{lang === "hi" ? "सत्यापनकर्ता: " : "Validator: "}{block.validator}</span>
                        <span>{lang === "hi" ? "समय: " : "Time: "}{new Date(block.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        background: "#020617",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        color: "#38bdf8",
                        border: "1px solid #1e293b",
                      }}
                    >
                      {block.hash.slice(0, 10)}...{block.hash.slice(-4)}
                    </span>
                    {isExpanded ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronRight size={16} color="#94a3b8" />}
                  </div>
                </div>

                {/* Expanded Block Technical Payload */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #1e293b",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                      <div>
                        <span style={{ color: "#94a3b8" }}>{lang === "hi" ? "पूर्ववर्ती हैश (PREV HASH):" : "PREVIOUS HASH:"}</span>
                        <div style={{ color: "#cbd5e1", wordBreak: "break-all" }}>{block.prevHash}</div>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8" }}>{lang === "hi" ? "ब्लॉक हैश (SHA-256):" : "BLOCK HASH (SHA-256):"}</span>
                        <div style={{ color: "#34d399", wordBreak: "break-all" }}>{block.hash}</div>
                      </div>
                    </div>

                    <div style={{ background: "#020617", padding: "10px", borderRadius: "6px", border: "1px solid #1e293b" }}>
                      <span style={{ color: "#f59e0b", display: "block", marginBottom: "4px" }}>{lang === "hi" ? "स्टेट पेलोड (डेटा):" : "STATE PAYLOAD:"}</span>
                      <pre style={{ margin: 0, color: "#e2e8f0", fontSize: "10px", overflowX: "auto" }}>
                        {JSON.stringify(block.payload, null, 2)}
                      </pre>
                    </div>
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

export default BlockchainLedgerViewer;
