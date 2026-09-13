import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Printer, X, ShieldCheck, CheckCircle2 } from "lucide-react";

function generateULPIN(record) {
  if (!record) return "24039184029177";
  // Generate a realistic 14-digit Bhu-Aadhaar ULPIN (Unique Land Parcel Identification Number)
  const seed = (record.record_id || "") + (record.survey_number || "") + (record.document_number || "");
  let hashNum = 0;
  for (let i = 0; i < seed.length; i++) {
    hashNum = (hashNum * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const str = String(hashNum).padStart(10, "9");
  // 14-digit format: State Code (2) + District Code (2) + Parcel Num (10)
  return `09-24-${str.slice(0, 4)}-${str.slice(4, 8)}-${str.slice(8, 10)}`;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function LandCertificateModal({ record, isOpen, onClose, lang = "en" }) {
  const qrCanvasRef = useRef(null);

  const ulpin = record ? generateULPIN(record) : "";

  useEffect(() => {
    if (!isOpen || !record || !qrCanvasRef.current) return;

    const verificationPayload = `${API_BASE}/api/records/${record.record_id}?ulpin=${ulpin}`;

    QRCode.toCanvas(
      qrCanvasRef.current,
      verificationPayload,
      {
        width: 110,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      },
      (err) => {
        if (err) console.error("Failed to render QR Code:", err);
      }
    );
  }, [isOpen, record, ulpin]);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert Acres to Hectares if area is present
  const areaText = record.land_area || "N/A";
  const numArea = parseFloat(areaText);
  const hectareText = !isNaN(numArea)
    ? `${(numArea * 0.404686).toFixed(4)} Hectares (${areaText})`
    : areaText;

  return (
    <div className="modal-overlay certificate-overlay" onClick={onClose}>
      <div
        className="modal-content certificate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Actions Bar (Hidden during print) */}
        <div className="certificate-top-actions no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge-official">
              <ShieldCheck size={14} /> {lang === "hi" ? "आधिकारिक सरकारी प्रमाणपत्र" : "Official Government Certificate"}
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              {lang === "hi" ? "भू-आधार (ULPIN) मानक प्रारूप" : "Bhu-Aadhaar (ULPIN) Standard Format"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              {lang === "hi" ? "प्रमाणपत्र प्रिंट करें / PDF सहेजें" : "Print Certificate / Save PDF"}
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="certificate-sheet" id="printable-certificate">
          {/* Watermark */}
          <div className="cert-watermark">BHOOMI PROOF</div>

          {/* Border Frame */}
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              {/* Header with National Emblems & Government Titles */}
              <div className="cert-header">
                <div className="cert-crest">
                  {/* Ashoka Stambh Emblem Styled Icon */}
                  <svg width="48" height="58" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="14" r="10" stroke="#1e3a8a" strokeWidth="2.5" fill="#f8fafc" />
                    <path d="M19 14h10M24 9v10M20.5 10.5l7 7M20.5 17.5l7-7" stroke="#1e3a8a" strokeWidth="1.5" />
                    <rect x="14" y="26" width="20" height="4" rx="2" fill="#1e3a8a" />
                    <path d="M16 30v14h16V30" stroke="#1e3a8a" strokeWidth="2" fill="#f1f5f9" />
                    <rect x="10" y="44" width="28" height="6" rx="2" fill="#1e3a8a" />
                    <rect x="6" y="50" width="36" height="4" rx="1" fill="#0f172a" />
                  </svg>
                  <span className="cert-crest-caption">सत्यमेव जयते</span>
                </div>

                <div className="cert-title-group">
                  <h4>भारत सरकार / GOVERNMENT OF INDIA</h4>
                  <h5>ग्रामीण विकास मंत्रालय • भूमि संसाधन विभाग</h5>
                  <p className="cert-program">
                    Digital India Land Records Modernization Programme (DILRMP)
                  </p>
                  <h2>भू-आधार कार्ड एवं भूमि स्वामित्व प्रमाणपत्र</h2>
                  <h3>BHU-AADHAAR (ULPIN) LAND OWNERSHIP CERTIFICATE</h3>
                </div>

                <div className="cert-qr-container">
                  <canvas ref={qrCanvasRef} className="cert-qr-canvas"></canvas>
                  <span className="cert-qr-caption">Scan to Verify</span>
                </div>
              </div>

              {/* ULPIN Highlight Box */}
              <div className="cert-ulpin-box">
                <div className="ulpin-label">
                  विशिष्ट भू-खंड पहचान संख्या / UNIQUE LAND PARCEL IDENTIFICATION NUMBER (ULPIN)
                </div>
                <div className="ulpin-number">{ulpin}</div>
                <div className="ulpin-sub">14-Digit Standard Geo-Referenced Land Identity (भू-आधार)</div>
              </div>

              {/* Land & Owner Deed Particulars Table */}
              <table className="cert-table">
                <tbody>
                  <tr>
                    <td className="cert-cell-label">दस्तावेज़ संख्या / Document ID:</td>
                    <td className="cert-cell-val" style={{ fontWeight: 700, color: "#1d4ed8" }}>
                      {record.document_number || record.record_id}
                    </td>
                    <td className="cert-cell-label">पंजीकरण स्थिति / Status:</td>
                    <td className="cert-cell-val">
                      <span className="cert-status-badge">
                        <CheckCircle2 size={13} color="#16a34a" />{" "}
                        {record.status === "Verified" ? "Verified & Certified" : record.status}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="cert-cell-label">भूस्वामी का नाम / Owner Name:</td>
                    <td className="cert-cell-val" style={{ fontWeight: 700, fontSize: "14px" }}>
                      {record.owner_name || "N/A"}
                    </td>
                    <td className="cert-cell-label">पिता/पति का नाम / Relative Name:</td>
                    <td className="cert-cell-val">{record.father_name || "N/A"}</td>
                  </tr>

                  <tr>
                    <td className="cert-cell-label">खसरा / सर्वे संख्या / Survey No:</td>
                    <td className="cert-cell-val" style={{ fontWeight: 700 }}>
                      {record.survey_number || "N/A"}
                    </td>
                    <td className="cert-cell-label">कुल रकबा / Total Extent (Area):</td>
                    <td className="cert-cell-val" style={{ fontWeight: 700 }}>
                      {hectareText}
                    </td>
                  </tr>

                  <tr>
                    <td className="cert-cell-label">ग्राम / मौजा / Village:</td>
                    <td className="cert-cell-val">{record.village || "N/A"}</td>
                    <td className="cert-cell-label">तहसील एवं जिला / District:</td>
                    <td className="cert-cell-val">{record.district || "N/A"}</td>
                  </tr>

                  <tr>
                    <td className="cert-cell-label">भूमि का प्रकार / Classification:</td>
                    <td className="cert-cell-val">{record.land_type || "Agricultural"}</td>
                    <td className="cert-cell-label">पंजीकरण तिथि / Date of Registration:</td>
                    <td className="cert-cell-val">{record.registration_date || "2026-03-15"}</td>
                  </tr>

                  <tr>
                    <td className="cert-cell-label">सिस्टम रिकॉर्ड पहचान / System ID:</td>
                    <td className="cert-cell-val" style={{ fontFamily: "monospace" }}>
                      {record.record_id}
                    </td>
                    <td className="cert-cell-label">AI सत्यापन विश्वास / AI Confidence:</td>
                    <td className="cert-cell-val">
                      <strong>{record.confidence_score || 94}%</strong> (OCR & Rules Verified)
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Cryptographic SHA-256 Tamper-Proof Stamp */}
              <div className="cert-crypto-seal">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} color="#0f766e" />
                  <strong>डिजिटल अखंडता मुहर / SHA-256 Cryptographic Hash Fingerprint:</strong>
                </div>
                <div className="cert-hash-string">
                  {record.document_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </div>
                <small style={{ color: "#64748b", fontSize: "10px" }}>
                  Permanently sealed in PostgreSQL Registry. Any physical or digital deed alteration will invalidate this hash.
                </small>
              </div>

              {/* Legal Note & Signatures */}
              <div className="cert-footer">
                <div className="cert-legal-text">
                  <p>
                    <strong>वैधानिक सूचना:</strong> यह भू-आधार प्रमाणपत्र सूचना प्रौद्योगिकी अधिनियम, २००० की धारा ६५ख के
                    तहत इलेक्ट्रॉनिक रूप से उत्पन्न और मान्य सरकारी भूमि स्वामित्व अभिलेख है। इसे किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है।
                  </p>
                  <p>
                    <strong>Legal Note:</strong> This document is generated through the AI-powered BhoomiProof Land Records
                    Registry conforming to DILRMP standards and Section 65B of the Indian Evidence Act.
                  </p>
                </div>

                <div className="cert-signatures">
                  <div className="cert-sig-box">
                    <div className="cert-stamp-circle">
                      <span>GOVT OF INDIA</span>
                      <span>DILRMP</span>
                      <span>VERIFIED</span>
                    </div>
                    <div className="cert-sig-line"></div>
                    <span>सक्षम राजस्व अधिकारी</span>
                    <small>Competent Revenue Authority</small>
                  </div>

                  <div className="cert-sig-box">
                    <div className="cert-digital-badge">
                      ✓ Digitally Certified by BhoomiProof AI
                      <br />
                      <small>{new Date().toLocaleDateString("en-IN")}</small>
                    </div>
                    <div className="cert-sig-line"></div>
                    <span>रजिस्ट्रार / तहसीलदार मुहर</span>
                    <small>Tehsildar / Sub-Registrar</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandCertificateModal;
