import { useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  Maximize2,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

function DocumentViewerModal({
  isOpen,
  onClose,
  fileUrl,
  documentNumber,
  recordId,
  documentHash,
  lang = "en"
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !fileUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999999,
        background: "rgba(10, 15, 29, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: "95vw",
          maxWidth: "1100px",
          height: "90vh",
          maxHeight: "900px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
          background: "#0f172a",
          border: "1px solid #334155",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "#1e293b",
            borderBottom: "1px solid #334155",
            color: "white",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Document Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={18} color="white" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#f8fafc" }}>
                  {lang === "hi" ? "दस्तावेज़ स्कैन:" : "Deed Scan:"} {documentNumber || recordId}
                </strong>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ShieldCheck size={11} /> {lang === "hi" ? "आधिकारिक अभिलेख" : "Official Scan"}
                </span>
              </div>
              {documentHash && (
                <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace", marginTop: "2px" }}>
                  SHA-256: {documentHash.slice(0, 24)}...
                </div>
              )}
            </div>
          </div>

          {/* Action & Zoom Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#0f172a",
                borderRadius: "8px",
                padding: "2px",
                border: "1px solid #334155",
              }}
            >
              <button
                onClick={handleZoomOut}
                title={lang === "hi" ? "ज़ूम आउट" : "Zoom Out"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ZoomOut size={15} />
              </button>
              <span
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  padding: "0 6px",
                  minWidth: "46px",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title={lang === "hi" ? "ज़ूम इन" : "Zoom In"}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Rotate Button */}
            <button
              onClick={handleRotate}
              title={lang === "hi" ? "घुमाएं (90°)" : "Rotate (90°)"}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#cbd5e1",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
              }}
            >
              <RotateCw size={14} />
              <span style={{ display: "none" }}>{rotation}°</span>
            </button>

            {/* Reset View Button */}
            <button
              onClick={handleReset}
              title={lang === "hi" ? "रीसेट दृश्य" : "Reset View"}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#cbd5e1",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
              }}
            >
              <Maximize2 size={13} />
              <span>{lang === "hi" ? "रीसेट" : "Reset"}</span>
            </button>

            {/* Direct Open in New Tab Fallback */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              title={lang === "hi" ? "नए टैब में खोलें" : "Open in New Tab"}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                color: "#93c5fd",
                padding: "6px 10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} />
            </a>

            {/* Download Button */}
            <a
              href={fileUrl}
              download={`${documentNumber || recordId}_scan`}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Download size={13} />
              <span>{lang === "hi" ? "डाउनलोड" : "Download"}</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "4px",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewport / Document Stage */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            padding: "20px",
            position: "relative",
          }}
        >
          <div
            style={{
              transition: "transform 0.2s ease-out",
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* If PDF render iframe, else render img directly */}
            {fileUrl && fileUrl.toLowerCase().includes(".pdf") ? (
              <iframe
                src={fileUrl}
                title={`Land Document ${documentNumber || recordId}`}
                style={{
                  width: "780px",
                  maxWidth: "90vw",
                  height: "76vh",
                  borderRadius: "8px",
                  border: "none",
                  background: "white",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                }}
              />
            ) : (
              <img
                src={fileUrl}
                alt={`Land Document ${documentNumber || recordId}`}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "76vh",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  background: "white",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewerModal;
