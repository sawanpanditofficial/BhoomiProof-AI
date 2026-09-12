import { useState, useEffect } from "react";
import {
  FileText,
  X,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Save,
  Check,
  Ban,
  Loader2,
  History,
  Award,
  MapPin,
  Info,
  Trash2,
  Maximize2,
  Download,
  MessageSquare,
  FileDiff,
  GitCommit
} from "lucide-react";
import CadastralMapViewer from "./CadastralMapViewer";
import LandCertificateModal from "./LandCertificateModal";
import DocumentViewerModal from "./DocumentViewerModal";
import FraudDisputeMatrix from "./FraudDisputeMatrix";
import CitizenAlertSimulator from "./CitizenAlertSimulator";
import BlockchainLedgerViewer from "./BlockchainLedgerViewer";
import TitleGenealogyViewer from "./TitleGenealogyViewer";
import DeedDiffViewer from "./DeedDiffViewer";

const API_BASE = "http://localhost:8000";

function RecordDetailModal({ recordId, isOpen, onClose, onRecordUpdated, officer, lang = "en" }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("deed"); // "deed" | "scan" | "lineage" | "gis" | "audit"
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [isCitizenAlertOpen, setIsCitizenAlertOpen] = useState(false);
  const [isDeedDiffOpen, setIsDeedDiffOpen] = useState(false);

  // Granular RBAC Permissions
  const permissions = officer?.permissions || {};
  const canDelete = permissions.can_delete ?? true;
  const canEdit = permissions.can_edit ?? true;
  const canApprove = permissions.can_approve ?? true;

  // Edit form state
  const [formData, setFormData] = useState({
    owner_name: "",
    father_name: "",
    district: "",
    village: "",
    survey_number: "",
    land_area: "",
    land_type: "",
    registration_date: "",
    document_number: "",
    admin_notes: "",
  });

  // Tamper Verification State
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !recordId) return;

    let active = true;

    async function fetchDetails() {
      try {
        const res = await fetch(`${API_BASE}/api/records/${recordId}`);
        if (!res.ok) throw new Error("Could not load land record details");
        const data = await res.json();
        if (active) {
          setDetail(data);
          setFormData({
            owner_name: data.owner_name || "",
            father_name: data.father_name || "",
            district: data.district || "",
            village: data.village || "",
            survey_number: data.survey_number || "",
            land_area: data.land_area || "",
            land_type: data.land_type || "",
            registration_date: data.registration_date || "",
            document_number: data.document_number || "",
            admin_notes: "",
          });
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      active = false;
    };
  }, [isOpen, recordId]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Admin Save Corrections (PUT)
  const handleSaveCorrections = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/records/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          editor_name: "Officer Admin",
        }),
      });

      if (!res.ok) throw new Error("Failed to update land record in database");

      // Reload updated details
      const updatedRes = await fetch(`${API_BASE}/api/records/${recordId}`);
      const updatedData = await updatedRes.json();
      setDetail(updatedData);
      setIsEditing(false);

      if (onRecordUpdated) onRecordUpdated(updatedData);
    } catch (err) {
      setError(err.message || "Failed to save corrections");
    } finally {
      setSaving(false);
    }
  };

  // Officer Decision (Approve / Reject)
  const handleDecision = async (decision) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/records/verify/${recordId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decision,
          verifier: "Officer Admin",
          notes: formData.admin_notes || (decision === "ACCEPT" ? "Approved by officer review" : "Rejected by officer"),
        }),
      });

      if (!res.ok) throw new Error("Failed to record officer decision");

      const updatedRes = await fetch(`${API_BASE}/api/records/${recordId}`);
      const updatedData = await updatedRes.json();
      setDetail(updatedData);
      setIsEditing(false);

      if (onRecordUpdated) onRecordUpdated(updatedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Tamper Verification (SHA-256 integrity check)
  const handleVerifyHash = async () => {
    if (!recordId) return;
    setVerifyingHash(true);
    setTamperResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/records/${recordId}/verify-hash`);
      if (res.ok) {
        const data = await res.json();
        setTamperResult(data);
      }
    } catch (err) {
      console.error("Failed to verify hash:", err);
    } finally {
      setVerifyingHash(false);
    }
  };

  // Delete Record & File
  const handleDeleteRecord = async () => {
    const docLabel = detail?.document_number || recordId;
    const confirmMsg =
      lang === "hi"
        ? `क्या आप सचमुच इस भूमि रिकॉर्ड (${docLabel}) और इसकी स्कैन फ़ाइल को हमेशा के लिए हटाना चाहते हैं?`
        : `Are you sure you want to permanently delete this land record (${docLabel}) and its scanned document file?`;

    if (!window.confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/records/${recordId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to delete record");
      }

      onClose();
      if (onRecordUpdated) onRecordUpdated();
    } catch (err) {
      alert(err.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          style={{ maxWidth: "880px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h2>
              <FileText size={20} color="#2563eb" />
              {lang === "hi" ? "भूमि अभिलेख:" : "Land Record:"} {detail?.document_number || recordId}
            </h2>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="empty-state">
                <Loader2 size={32} className="spin" style={{ margin: "20px auto" }} />
                <p>{lang === "hi" ? "PostgreSQL से भूमि रिकॉर्ड विवरण लोड हो रहा है..." : "Fetching land record details from PostgreSQL..."}</p>
              </div>
            ) : error ? (
              <div style={{ padding: "20px", color: "#b91c1c" }}>
                <AlertTriangle size={24} style={{ marginBottom: "8px" }} />
                <p>{error}</p>
              </div>
            ) : detail ? (
              <>
                {/* Top Banner with Status, Actions, & Bhu-Aadhaar Certificate Button */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`status ${detail.status?.toLowerCase() || "review"}`}>
                      {lang === "hi" ? (detail.status === "Verified" ? "सत्यापित" : detail.status === "Rejected" ? "अस्वीकृत" : "समीक्षाधीन") : detail.status}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {lang === "hi" ? "जोखिम स्कोर:" : "Risk:"} <strong>{detail.risk_score} / 100</strong> ({lang === "hi" ? (detail.risk_level === "LOW" ? "कम" : detail.risk_level === "HIGH" ? "उच्च" : "मध्यम") : detail.risk_level})
                    </span>
                    {detail.is_manually_edited && (
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#92400e",
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {lang === "hi" ? "प्रशासक द्वारा संपादित" : "Admin Edited"}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {/* Bhu-Aadhaar Certificate Generator Button */}
                    <button
                      className="btn-certificate-pill"
                      onClick={() => setIsCertificateOpen(true)}
                      title="Issue official Bhu-Aadhaar certificate with ULPIN & QR"
                    >
                      <Award size={14} />
                      {lang === "hi" ? "भू-आधार प्रमाणपत्र" : "Bhu-Aadhaar Certificate"}
                    </button>

                    {/* Citizen WhatsApp & SMS Alert Simulator Button */}
                    <button
                      className="btn-certificate-pill"
                      style={{ background: "#059669", borderColor: "#10b981", color: "white" }}
                      onClick={() => setIsCitizenAlertOpen(true)}
                      title="Simulate WhatsApp & SMS mutation delivery alert for citizen"
                    >
                      <MessageSquare size={14} />
                      {lang === "hi" ? "नागरिक अलर्ट (SMS/WhatsApp)" : "Citizen Alert (SMS/WhatsApp)"}
                    </button>

                    {/* AI Deed Redlining Diff Button */}
                    <button
                      className="btn-certificate-pill"
                      style={{ background: "#7c3aed", borderColor: "#8b5cf6", color: "white" }}
                      onClick={() => setIsDeedDiffOpen(true)}
                      title="Compare parent title deed against current sale deed for area inflation"
                    >
                      <FileDiff size={14} />
                      {lang === "hi" ? "विलेख तुलना (Diff)" : "Deed Diff"}
                    </button>

                    <button
                      className="record-action-btn"
                      onClick={() => setIsDocViewerOpen(true)}
                      title="View original digitized deed scan in website viewer"
                    >
                      <ExternalLink size={14} />
                      {lang === "hi" ? "स्कैन देखें" : "View Scan"}
                    </button>

                    {canEdit && (
                      <button
                        className={isEditing ? "btn-secondary" : "btn-primary"}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 size={14} />
                        {isEditing ? (lang === "hi" ? "संपादन रद्द करें" : "Cancel Edit") : (lang === "hi" ? "फ़ील्ड्स संपादित करें" : "Edit Fields (Admin)")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Missing Fields Banner if in Review */}
                {detail.missing_fields && detail.missing_fields.length > 0 && (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      color: "#92400e",
                    }}
                  >
                    <strong>{lang === "hi" ? "मानवीय सत्यापन हेतु ध्यानाकर्षण: " : "Human Verification Attention: "}</strong>
                    {lang === "hi" ? "ओसीआर इन फ़ील्ड्स को स्पष्ट रूप से नहीं पहचान सका: " : "The OCR could not reliably detect: "}
                    {detail.missing_fields.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          marginLeft: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {m}
                      </span>
                    ))}
                    {lang === "hi" ? "। कृपया स्कैन देखकर सुधार करने हेतु 'फ़ील्ड्स संपादित करें' का उपयोग करें।" : ". Please use \"Edit Fields\" to correct from scan and approve."}
                  </div>
                )}

                {/* Detail Tabs Navigation */}
                <div className="detail-tabs-bar">
                  <button
                    className={`detail-tab-btn ${activeTab === "deed" ? "active" : ""}`}
                    onClick={() => setActiveTab("deed")}
                  >
                    <Info size={14} />
                    {lang === "hi" ? "दस्तावेज़ विवरण" : "Deed Information"}
                  </button>

                  <button
                    className={`detail-tab-btn ${activeTab === "scan" ? "active" : ""}`}
                    onClick={() => setActiveTab("scan")}
                  >
                    <FileText size={14} />
                    {lang === "hi" ? "मूल दस्तावेज़ स्कैन" : "Scanned Deed"}
                  </button>

                  <button
                    className={`detail-tab-btn ${activeTab === "lineage" ? "active" : ""}`}
                    onClick={() => setActiveTab("lineage")}
                  >
                    <GitCommit size={14} />
                    {lang === "hi" ? "वंशावली (Title Lineage)" : "Title Lineage"}
                  </button>

                  <button
                    className={`detail-tab-btn ${activeTab === "gis" ? "active" : ""}`}
                    onClick={() => setActiveTab("gis")}
                  >
                    <MapPin size={14} />
                    {lang === "hi" ? "कैडस्ट्रल नक्शा (GIS)" : "GIS Cadastral Map"}
                  </button>

                  <button
                    className={`detail-tab-btn ${activeTab === "audit" ? "active" : ""}`}
                    onClick={() => setActiveTab("audit")}
                  >
                    <ShieldCheck size={14} />
                    {lang === "hi" ? "सुरक्षा एवं ऑडिट" : "Security & Audit Trail"}
                  </button>
                </div>

                {/* TAB 1: DEED INFORMATION */}
                {activeTab === "deed" && (
                  <div>
                    {/* AI Double-Sale & Encroachment Fraud Intelligence Matrix */}
                    <FraudDisputeMatrix recordId={detail.record_id} lang={lang} />

                    {/* SHA-256 Digital Security & Tamper Detection Stamp */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ShieldCheck size={16} color="#16a34a" />
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#334155" }}>
                            {lang === "hi" ? "SHA-256 क्रिप्टोग्राफिक मुहर:" : "SHA-256 Cryptographic Stamp:"}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              color: "#64748b",
                              maxWidth: "280px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {detail.document_hash || "Calculated on deed upload"}
                          </span>
                        </div>

                        <button
                          className="record-action-btn"
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                          onClick={handleVerifyHash}
                          disabled={verifyingHash}
                        >
                          {verifyingHash ? (
                            <Loader2 size={12} className="spin" />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          {lang === "hi" ? "अखंडता जांचें" : "Verify Integrity"}
                        </button>
                      </div>

                      {tamperResult && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "11px",
                            color: tamperResult.is_tamper_free ? "#166534" : "#b91c1c",
                            fontWeight: 600,
                          }}
                        >
                          {tamperResult.is_tamper_free
                            ? (lang === "hi" ? "✓ हैश मूल स्कैन से बाइट-दर-बाइट मेल खाता है। दस्तावेज़ पूरी तरह प्रामाणिक और छेड़छाड़-मुक्त है।" : "✓ Hash matches original scan byte-for-byte. Document is authentic & tamper-free.")
                            : (lang === "hi" ? "⚠ चेतावनी: हैश में विसंगति पाई गई अथवा दस्तावेज़ संशोधित है।" : "⚠ WARNING: Hash mismatch or document modified.")}
                        </div>
                      )}
                    </div>

                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>{lang === "hi" ? "दस्तावेज़ संख्या (Unique ID)" : "Document Number (Unique ID)"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.document_number}
                            onChange={(e) => handleInputChange("document_number", e.target.value)}
                          />
                        ) : (
                          <span style={{ color: "#2563eb", fontWeight: 700 }}>
                            {detail.document_number || "Not assigned"}
                          </span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "भूस्वामी का नाम" : "Owner Name"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.owner_name}
                            onChange={(e) => handleInputChange("owner_name", e.target.value)}
                          />
                        ) : (
                          <span>{detail.owner_name || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "पिता/पति का नाम" : "Father / Relative Name"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.father_name}
                            onChange={(e) => handleInputChange("father_name", e.target.value)}
                          />
                        ) : (
                          <span>{detail.father_name || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "जिला" : "District"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.district}
                            onChange={(e) => handleInputChange("district", e.target.value)}
                          />
                        ) : (
                          <span>{detail.district || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "ग्राम / मौजा" : "Village / Mauza"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.village}
                            onChange={(e) => handleInputChange("village", e.target.value)}
                          />
                        ) : (
                          <span>{detail.village || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "खसरा / सर्वे संख्या" : "Survey / Plot Number"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.survey_number}
                            onChange={(e) => handleInputChange("survey_number", e.target.value)}
                          />
                        ) : (
                          <span>{detail.survey_number || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "रकबा / क्षेत्रफल" : "Land Area"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.land_area}
                            onChange={(e) => handleInputChange("land_area", e.target.value)}
                          />
                        ) : (
                          <span>{detail.land_area || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "भूमि वर्गीकरण" : "Land Classification"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.land_type}
                            onChange={(e) => handleInputChange("land_type", e.target.value)}
                          />
                        ) : (
                          <span>{detail.land_type || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "पंजीकरण तिथि" : "Registration Date"}</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={formData.registration_date}
                            onChange={(e) => handleInputChange("registration_date", e.target.value)}
                          />
                        ) : (
                          <span>{detail.registration_date || "Not detected"}</span>
                        )}
                      </div>

                      <div className="detail-item">
                        <label>{lang === "hi" ? "सिस्टम रिकॉर्ड आईडी" : "System Record ID"}</label>
                        <span>{detail.record_id}</span>
                      </div>
                    </div>

                    {isEditing && (
                      <div style={{ marginTop: "14px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "4px" }}>
                          {lang === "hi" ? "प्रशासक टिप्पणी / संशोधन का कारण" : "Admin Notes / Reason for Modification"}
                        </label>
                        <input
                          type="text"
                          className="edit-input"
                          placeholder={lang === "hi" ? "उदा. मूल स्कैन प्रति देखकर खसरा संख्या में सुधार किया गया" : "e.g. Corrected blurry survey number by inspecting original scan document"}
                          value={formData.admin_notes}
                          onChange={(e) => handleInputChange("admin_notes", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: IN-APP SCANNED DEED VIEWER */}
                {activeTab === "scan" && (
                  <div style={{ padding: "8px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f1f5f9",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        marginBottom: "14px",
                        border: "1px solid #cbd5e1",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FileText size={16} color="#2563eb" />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                          {lang === "hi" ? "मूल डिजिटल स्कैन प्रति" : "Original Scanned Deed Document"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-primary"
                          style={{ fontSize: "12px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "5px" }}
                          onClick={() => setIsDocViewerOpen(true)}
                        >
                          <Maximize2 size={13} />
                          {lang === "hi" ? "फुल-स्क्रीन व्यूअर (ज़ूम/रोटेट)" : "Fullscreen Viewer (Zoom/Rotate)"}
                        </button>
                        <a
                          href={`${API_BASE}/api/records/${detail.record_id}/file`}
                          download={`${detail.document_number || detail.record_id}_scan`}
                          className="btn-secondary"
                          style={{ fontSize: "12px", padding: "5px 12px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Download size={13} />
                          {lang === "hi" ? "डाउनलोड" : "Download"}
                        </a>
                      </div>
                    </div>

                    {/* Embedded scan container */}
                    <div
                      style={{
                        width: "100%",
                        minHeight: "520px",
                        height: "58vh",
                        background: "#0f172a",
                        borderRadius: "10px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #334155",
                      }}
                    >
                      <object
                        data={`${API_BASE}/api/records/${detail.record_id}/file`}
                        type="application/pdf"
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          background: "white",
                        }}
                      >
                        <img
                          src={`${API_BASE}/api/records/${detail.record_id}/file`}
                          alt="Deed scan"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            background: "white",
                          }}
                        />
                      </object>
                    </div>
                  </div>
                )}

                {/* TAB 3: 30-YEAR TITLE CHAIN & VANSHAVALI */}
                {activeTab === "lineage" && (
                  <TitleGenealogyViewer record={detail} lang={lang} />
                )}

                {/* TAB 4: GIS CADASTRAL MAP */}
                {activeTab === "gis" && (
                  <CadastralMapViewer record={detail} lang={lang} />
                )}

                {/* TAB 3: AUDIT TRAIL & SECURITY */}
                {activeTab === "audit" && (
                  <div style={{ padding: "8px 0" }}>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <h4 style={{ fontSize: "13px", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <ShieldCheck size={16} color="#2563eb" />
                        {lang === "hi" ? "क्रिप्टोग्राफिक सत्यापन इंजन" : "Cryptographic Verification Engine"}
                      </h4>
                      <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                        {lang === "hi"
                          ? "भूमिप्रूफ पर अपलोड किया गया प्रत्येक दस्तावेज़ SHA-256 डिजिटल फ़िंगरप्रिंट से सुरक्षित होता है। किसी भी प्रकार की अनधिकृत छेड़छाड़ तुरंत अखंडता विफलता के रूप में चिह्नित हो जाती है।"
                          : "Every deed uploaded to BhoomiProof is stamped with a SHA-256 digital fingerprint calculated directly from the raw document bytes. Any tampering or unauthorized modification will instantly flag an integrity failure."}
                      </p>
                    </div>

                    {detail.audit_trail && detail.audit_trail.length > 0 ? (
                      <div>
                        <h4 style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <History size={14} />
                          {lang === "hi" ? `छेड़छाड़-मुक्त ऑडिट ट्रेल (${detail.audit_trail.length} घटनाएं दर्ज)` : `Tamper-Proof Audit Trail (${detail.audit_trail.length} events recorded)`}
                        </h4>
                        <div style={{ maxHeight: "250px", overflowY: "auto", background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "12px" }}>
                          {detail.audit_trail.map((audit, i) => (
                            <div key={i} style={{ borderBottom: "1px solid #e2e8f0", padding: "8px 0", color: "#334155" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>{audit.action}</strong>
                                <small style={{ color: "#94a3b8" }}>
                                  {audit.timestamp ? new Date(audit.timestamp).toLocaleString() : ""}
                                </small>
                              </div>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                {lang === "hi" ? "उपयोगकर्ता / इंजन: " : "User / Engine: "} {audit.editor || audit.verifier || "BhoomiProof System"}
                              </span>
                              {audit.notes && (
                                <div style={{ marginTop: "4px", color: "#2563eb", background: "#eff6ff", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}>
                                  {lang === "hi" ? "टिप्पणी: " : "Note: "} {audit.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {lang === "hi" ? "अभी तक कोई संशोधन दर्ज नहीं हुआ। रिकॉर्ड मूल स्थिति में है।" : "No modification events recorded yet. Record in pristine state."}
                      </p>
                    )}

                    {/* Visual Blockchain Ledger Explorer */}
                    <div style={{ marginTop: "16px" }}>
                      <BlockchainLedgerViewer record={detail} lang={lang} />
                    </div>
                  </div>
                )}

              </>
            ) : null}
          </div>

          {/* Action Buttons in Dedicated Fixed Footer */}
          {detail && (
            <div className="modal-footer">
              <div>
                {detail.status === "Review" && canApprove && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-success"
                      onClick={() => handleDecision("ACCEPT")}
                      disabled={saving}
                    >
                      <Check size={16} />
                      {lang === "hi" ? "सत्यापित व स्वीकृत करें" : "Approve & Verify Record"}
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() => handleDecision("REJECT")}
                      disabled={saving}
                    >
                      <Ban size={16} />
                      {lang === "hi" ? "अस्वीकृत करें" : "Reject"}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {!isEditing && canDelete && (
                  <button
                    className="btn-danger"
                    onClick={handleDeleteRecord}
                    disabled={deleting || saving}
                    title="Permanently delete this record and scan file"
                    style={{ background: "#ef4444" }}
                  >
                    {deleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                    <span>{lang === "hi" ? "फ़ाइल हटाएं" : "Delete File"}</span>
                  </button>
                )}

                {isEditing ? (
                  <>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                      {lang === "hi" ? "रद्द करें" : "Cancel"}
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleSaveCorrections}
                      disabled={saving}
                    >
                      {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                      {lang === "hi" ? "संशोधन सुरक्षित करें (PostgreSQL)" : "Save Corrections to PostgreSQL"}
                    </button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={onClose}>
                    {lang === "hi" ? "बंद करें" : "Close"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Bhu-Aadhaar Certificate Modal */}
      {isCertificateOpen && detail && (
        <LandCertificateModal
          record={detail}
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          lang={lang}
        />
      )}

      {/* In-App Scanned Document Viewer Lightbox */}
      {isDocViewerOpen && detail && (
        <DocumentViewerModal
          isOpen={isDocViewerOpen}
          onClose={() => setIsDocViewerOpen(false)}
          fileUrl={`${API_BASE}/api/records/${detail.record_id}/file`}
          documentNumber={detail.document_number}
          recordId={detail.record_id}
          documentHash={detail.document_hash}
          lang={lang}
        />
      )}

      {/* Citizen WhatsApp & SMS Mutation Alert Simulator */}
      {isCitizenAlertOpen && detail && (
        <CitizenAlertSimulator
          record={detail}
          isOpen={isCitizenAlertOpen}
          onClose={() => setIsCitizenAlertOpen(false)}
          lang={lang}
        />
      )}

      {/* AI Deed Redlining & Discrepancy Diff Modal */}
      {isDeedDiffOpen && detail && (
        <DeedDiffViewer
          record={detail}
          isOpen={isDeedDiffOpen}
          onClose={() => setIsDeedDiffOpen(false)}
          lang={lang}
        />
      )}
    </>
  );
}

export default RecordDetailModal;
