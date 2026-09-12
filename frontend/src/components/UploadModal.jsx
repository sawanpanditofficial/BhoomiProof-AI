import { useState, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Eye,
  ArrowRight,
  FileCheck2
} from "lucide-react";

const API_BASE = "http://localhost:8000";

function UploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  onOpenRecordDetail,
  onGoToVerificationQueue,
  lang = "en"
}) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const steps = [
    lang === "hi" ? "दस्तावेज़ स्कैन को सुरक्षित सर्वर पर अपलोड किया जा रहा है..." : "Uploading document scan to secure server...",
    lang === "hi" ? "SHA-256 क्रिप्टोग्राफिक अखंडता मुहर की गणना की जा रही है..." : "Computing SHA-256 cryptographic integrity hash...",
    lang === "hi" ? "टेसेरैक्ट ओसीआर (OCR) और इमेज प्री-प्रोसेसिंग जारी है..." : "Executing Tesseract OCR & image preprocessing...",
    lang === "hi" ? "एआई फ़ील्ड निष्कर्षण (भूस्वामी, खसरा, रकबा, स्थान)..." : "AI field extraction (Owner, Survey, Area, Location)...",
    lang === "hi" ? "नियम व जोखिम सत्यापन कर पोस्टग्रेएसक्यूएल में पंजीकृत किया जा रहा है..." : "Running rule validation & registering in PostgreSQL...",
  ];

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(selected.type)) {
      setError(lang === "hi" ? "कृपया एक वैध PDF, PNG या JPG भूमि दस्तावेज़ चुनें।" : "Please select a PDF, PNG, or JPG land document.");
      return;
    }

    if (selected.size > 15 * 1024 * 1024) {
      setError(lang === "hi" ? "फ़ाइल का आकार 15 MB की सीमा से अधिक है।" : "File size exceeds 15 MB limit.");
      return;
    }

    setError("");
    setFile(selected);
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const syntheticEvent = { target: { files: [dropped] } };
      handleFileSelect(syntheticEvent);
    }
  };

  const startUpload = async () => {
    if (!file) return;

    setProcessing(true);
    setError("");
    setCurrentStep(0);

    // Progressive step updates while upload/OCR is in flight
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/records/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Document upload and OCR failed.");
      }

      const data = await res.json();
      setCurrentStep(steps.length);
      setUploadResult(data);

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || "Something went wrong during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setProcessing(false);
    setCurrentStep(0);
    setError("");
    setUploadResult(null);
    onClose();
  };

  const isVerifiedClean = uploadResult && uploadResult.record?.status === "Verified";

  return (
    <div className="modal-overlay" onClick={resetModal}>
      <div
        className="upload-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <Upload size={20} color="#2563eb" />
            {lang === "hi" ? "भूमि अभिलेख स्कैन अपलोड करें" : "Upload Land Record Scan"}
          </h2>
          <button className="modal-close-btn" onClick={resetModal}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: FILE PICKER (Before uploading) */}
          {!processing && !uploadResult && (
            <>
              <div
                className="drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                />

                <div className="upload-icon-circle">
                  <Upload size={28} color="#2563eb" />
                </div>

                <h3>
                  {file
                    ? file.name
                    : lang === "hi"
                    ? "भूमि विलेख स्कैन यहाँ खींचें या चुनें"
                    : "Drag & drop land deed scan or browse"}
                </h3>
                <p>
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to Process`
                    : lang === "hi"
                    ? "समर्थित प्रारूप: PDF, PNG, JPEG (अधिकतम 15 MB)"
                    : "Supported formats: PDF, PNG, JPEG (up to 15 MB)"}
                </p>

                {file && (
                  <span className="file-ready-badge">
                    <CheckCircle size={14} />{" "}
                    {lang === "hi" ? "दस्तावेज़ तैयार है" : "Document Selected"}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button className="btn-secondary" onClick={resetModal}>
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  className="btn-primary"
                  onClick={startUpload}
                  disabled={!file}
                  style={{ opacity: !file ? 0.6 : 1 }}
                >
                  <FileCheck2 size={16} />
                  {lang === "hi" ? "डिजिटलीकरण एवं सत्यापन प्रारंभ करें" : "Start Digitization & Verification"}
                </button>
              </div>
            </>
          )}

          {/* STEP 2: PROCESSING SEQUENCE (Real-time Pipeline) */}
          {processing && (
            <div>
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <Loader2 size={38} className="spin" color="#2563eb" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "16px", color: "#0f172a" }}>
                  {lang === "hi" ? "भूमि अभिलेख का डिजिटलीकरण एवं सत्यापन प्रगति पर है..." : "Digitizing & Validating Land Record..."}
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  {lang === "hi"
                    ? "स्वचालित ओसीआर, एआई निष्कर्षण, क्रिप्टोग्राफिक हैशिंग और डेटाबेस रजिस्ट्री चल रही है..."
                    : "Performing automated OCR, NLP extraction, security hashing and database registration..."}
                </p>
              </div>

              <div className="upload-steps-list">
                {steps.map((stepText, idx) => (
                  <div
                    key={idx}
                    className={`upload-step-item ${
                      idx < currentStep
                        ? "done"
                        : idx === currentStep
                        ? "active"
                        : ""
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle size={16} color="#16a34a" />
                    ) : idx === currentStep ? (
                      <Loader2 size={16} className="spin" color="#2563eb" />
                    ) : (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid #cbd5e1",
                        }}
                      />
                    )}
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: RESULT FLOW (All Okay -> View Pop-up, Or Issues -> Direct Human Verification) */}
          {uploadResult && (
            <div>
              {/* IF ALL OKAY: VERIFIED */}
              {isVerifiedClean ? (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle size={28} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "16px", color: "#14532d", display: "block" }}>
                        {lang === "hi"
                          ? "✓ सभी जांच सफल! रिकॉर्ड पूरी तरह सत्यापित व पंजीकृत है"
                          : "✓ All Checks Passed! Record Verified & Stored Cleanly"}
                      </strong>
                      <p style={{ fontSize: "12px", color: "#166534", marginTop: "4px", lineHeight: "1.5" }}>
                        {uploadResult.record?.decision_notes || (lang === "hi"
                          ? "सभी आवश्यक फ़ील्ड्स (भूस्वामी, खसरा, रकबा, मौजा) सफलतापूर्वक पहचान लिए गए हैं।"
                          : "All required fields were detected cleanly and passed consistency rules.")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* IF ANY ISSUE: DIRECT TO HUMAN VERIFICATION */
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <AlertTriangle size={28} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "16px", color: "#78350f", display: "block" }}>
                        {lang === "hi"
                          ? "⚠ मानवीय सत्यापन आवश्यक — रिकॉर्ड सत्यापन कतार में भेजा गया"
                          : "⚠ Attention Required — Routed to Human Verification Queue"}
                      </strong>
                      <p style={{ fontSize: "12px", color: "#92400e", marginTop: "4px", lineHeight: "1.5" }}>
                        {lang === "hi"
                          ? "दस्तावेज़ के धुंधलेपन अथवा अपूर्णता के कारण कुछ फ़ील्ड्स स्वतः नहीं पहचाने जा सके। कृपया सत्यापन कतार में जाकर स्कैन देखकर पुष्टि करें।"
                          : "The OCR could not reliably detect all fields due to scan quality. It has been routed directly to human verification for officer inspection."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Identity & Security Hash */}
              <div className="detail-grid" style={{ marginBottom: "16px" }}>
                <div className="detail-item">
                  <label>{lang === "hi" ? "दस्तावेज़ संख्या (Unique ID)" : "Document Number (Unique ID)"}</label>
                  <span style={{ color: "#2563eb", fontWeight: 700 }}>
                    {uploadResult.record?.document_number}
                  </span>
                </div>
                <div className="detail-item">
                  <label>{lang === "hi" ? "सिस्टम रिकॉर्ड आईडी" : "System Record ID"}</label>
                  <span>{uploadResult.record?.record_id}</span>
                </div>
              </div>

              {/* SHA-256 Security Badge */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ShieldCheck size={18} color="#16a34a" />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <label style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, display: "block" }}>
                    {lang === "hi" ? "SHA-256 क्रिप्टोग्राफिक छेड़छाड़-मुक्त मुहर" : "SHA-256 Cryptographic Tamper-Proof Hash"}
                  </label>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#0f172a",
                      display: "block",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {uploadResult.record?.document_hash}
                  </span>
                </div>
              </div>

              {/* Detected vs Missing Fields Overview */}
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ fontSize: "13px", color: "#334155", display: "block", marginBottom: "8px" }}>
                  {lang === "hi" ? "फ़ील्ड पहचान एवं पूर्णता ऑडिट रिपोर्ट:" : "Field Detection & Completeness Audit:"}
                </strong>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {uploadResult.completeness?.detected_fields?.map((field, i) => (
                    <span key={i} className="field-badge-tag detected">
                      ✓ {field}
                    </span>
                  ))}

                  {uploadResult.completeness?.missing_fields?.map((field, i) => (
                    <span key={i} className="field-badge-tag missing">
                      ⚠ {field} ({lang === "hi" ? "पहचान नहीं हुई" : "Not Detected"})
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS BASED ON RESULT */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "22px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                <button className="btn-secondary" onClick={resetModal}>
                  {lang === "hi" ? "बंद करें" : "Close"}
                </button>

                {isVerifiedClean ? (
                  /* IF ALL OKAY -> DIRECT POP-UP TO VIEW DOCUMENT */
                  <button
                    className="btn-success"
                    style={{ padding: "9px 18px", fontSize: "13px" }}
                    onClick={() => {
                      const recId = uploadResult.record?.record_id;
                      resetModal();
                      if (onOpenRecordDetail) onOpenRecordDetail(recId);
                    }}
                  >
                    <Eye size={16} />
                    <span>{lang === "hi" ? "दस्तावेज़ विवरण एवं भू-आधार देखें" : "View Document Details & Certificate"}</span>
                  </button>
                ) : (
                  /* IF ANY ISSUE -> DIRECT TO HUMAN VERIFICATION QUEUE */
                  <button
                    className="btn-primary"
                    style={{ padding: "9px 18px", fontSize: "13px", background: "#d97706" }}
                    onClick={() => {
                      const recId = uploadResult.record?.record_id;
                      resetModal();
                      if (onGoToVerificationQueue) {
                        onGoToVerificationQueue(recId);
                      } else if (onOpenRecordDetail) {
                        onOpenRecordDetail(recId);
                      }
                    }}
                  >
                    <span>{lang === "hi" ? "मानवीय सत्यापन कतार में सुधारें" : "Go to Human Verification Queue"}</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
