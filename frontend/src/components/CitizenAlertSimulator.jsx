import { useState } from "react";
import {
  MessageSquare,
  Smartphone,
  CheckCheck,
  Copy,
  Check,
  Award,
  Volume2
} from "lucide-react";

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext not allowed without user interaction or unavailable
  }
}

function CitizenAlertSimulator({ record, isOpen, onClose, lang = "en" }) {
  const [platform, setPlatform] = useState("whatsapp"); // "whatsapp" | "sms"
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const owner = record.owner_name || "Shri Ramesh Sharma";
  const docNum = record.document_number || "DOC-2026-9809";
  const survey = record.survey_number || "302/1";
  const area = record.land_area || "0.85 Acres";
  const village = record.village || "Kanti";
  const district = record.district || "Muzaffarpur";
  const ulpin = `09-24-${(record.record_id || "2026").slice(-4)}-9809-11`;

  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const whatsappMessage =
    lang === "hi"
      ? `🏛️ *राजस्व एवं भूमि सुधार विभाग (भारत सरकार)*\n\nप्रिय *${owner}* जी,\n\nआपकी भूमि का नामांतरण (Mutation) एवं डिजिटल भू-आधार पंजीयन *सफलतापूर्वक सत्यापित* कर दिया गया है।\n\n📋 *भूमि विवरण:*\n• दस्तावेज़ सं.: ${docNum}\n• खसरा/सर्वे सं.: ${survey}\n• रकबा: ${area}\n• मौजा/ग्राम: ${village}, ${district}\n\n🆔 *14-अंकीय भू-आधार (ULPIN):*\n\`${ulpin}\`\n\n🔒 यह प्रविष्टि SHA-256 क्रिप्टोग्राफिक मुहर से सुरक्षित है।\n\nडिजिटल भू-आधार प्रमाणपत्र डाउनलोड करने हेतु नीचे लिंक पर क्लिक करें:`
      : `🏛️ *Dept of Land Resources & Revenue (Govt of India)*\n\nDear *${owner}*,\n\nYour land deed mutation and Bhu-Aadhaar registration has been *successfully verified & registered*.\n\n📋 *Land Details:*\n• Document No: ${docNum}\n• Survey / Khasra: ${survey}\n• Land Area: ${area}\n• Location: ${village}, ${district}\n\n🆔 *14-Digit Bhu-Aadhaar (ULPIN):*\n\`${ulpin}\`\n\n🔒 Cryptographically signed with SHA-256 digital stamp.\n\nClick link to download official certificate:`;

  const smsText =
    lang === "hi"
      ? `[GOV-BHUADR]: Priye ${owner}, aapki zameen Khasra ${survey}, ${village} ka Bhu-Aadhaar ULPIN: ${ulpin} safaltapurvak jari hua. Certificate: https://bhoomiproof.gov.in/c/${record.record_id}`
      : `[GOV-BHUADR]: Dear ${owner}, land record for Survey ${survey}, ${village} has been issued Bhu-Aadhaar ULPIN: ${ulpin}. Download certificate: https://bhoomiproof.gov.in/c/${record.record_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(platform === "whatsapp" ? whatsappMessage : smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = () => {
    playNotificationChime();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999999,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "390px",
          maxWidth: "95vw",
          borderRadius: "32px",
          background: "#020617",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 6px #1e293b",
          border: "4px solid #0f172a",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Smartphone Speaker & Camera Notch */}
        <div
          style={{
            height: "24px",
            background: "#020617",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "14px",
              background: "#1e293b",
              borderRadius: "0 0 10px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div style={{ width: "32px", height: "3px", background: "#334155", borderRadius: "2px" }} />
            <div style={{ width: "6px", height: "6px", background: "#1e40af", borderRadius: "50%" }} />
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div
          style={{
            display: "flex",
            background: "#0f172a",
            padding: "6px",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <button
            onClick={() => setPlatform("whatsapp")}
            style={{
              flex: 1,
              padding: "7px 0",
              border: "none",
              borderRadius: "8px",
              background: platform === "whatsapp" ? "#22c55e" : "transparent",
              color: platform === "whatsapp" ? "white" : "#94a3b8",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <MessageSquare size={14} /> WhatsApp
          </button>
          <button
            onClick={() => setPlatform("sms")}
            style={{
              flex: 1,
              padding: "7px 0",
              border: "none",
              borderRadius: "8px",
              background: platform === "sms" ? "#2563eb" : "transparent",
              color: platform === "sms" ? "white" : "#94a3b8",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <Smartphone size={14} /> Official SMS
          </button>
        </div>

        {/* ================= WHATSAPP VIEW ================= */}
        {platform === "whatsapp" && (
          <div style={{ background: "#efeae2", minHeight: "440px", display: "flex", flexDirection: "column" }}>
            {/* WhatsApp App Header */}
            <div
              style={{
                background: "#075e54",
                color: "white",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#128c7e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  🏛️
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    BhoomiProof India <span style={{ color: "#25d366" }}>✓</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#bbf7d0" }}>Official Government Business</div>
                </div>
              </div>
              <button
                onClick={handleTestPing}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Play notification sound"
              >
                <Volume2 size={12} /> Ping
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                padding: "12px",
                backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                overflowY: "auto",
                maxHeight: "360px",
              }}
            >
              {/* Timestamp Stamp */}
              <div style={{ textAlign: "center", margin: "6px 0 10px" }}>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    color: "#64748b",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {lang === "hi" ? "आज" : "TODAY"}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "0 10px 10px 10px",
                  padding: "10px 12px",
                  maxWidth: "92%",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                  position: "relative",
                  color: "#111827",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                {whatsappMessage}

                {/* Simulated Interactive Button */}
                <div
                  style={{
                    marginTop: "10px",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      color: "#166534",
                      fontSize: "11px",
                      fontWeight: 700,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Award size={13} /> {lang === "hi" ? "भू-आधार प्रमाणपत्र (PDF)" : "Bhu-Aadhaar Certificate (PDF)"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "3px",
                    marginTop: "4px",
                    fontSize: "10px",
                    color: "#9ca3af",
                  }}
                >
                  <span>{nowTime}</span>
                  <CheckCheck size={14} color="#38bdf8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SMS VIEW ================= */}
        {platform === "sms" && (
          <div style={{ background: "#f8fafc", minHeight: "440px", display: "flex", flexDirection: "column" }}>
            {/* SMS Header */}
            <div
              style={{
                background: "#1e293b",
                color: "white",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>VK-BHUADR</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>National Land Registry (DILRMP)</div>
              </div>
              <button
                onClick={handleTestPing}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Volume2 size={12} /> {lang === "hi" ? "परीक्षण पिंग" : "Ping"}
              </button>
            </div>

            {/* SMS Body */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", maxHeight: "360px" }}>
              <div style={{ textAlign: "center", margin: "4px 0 12px" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>{lang === "hi" ? `आज, ${nowTime}` : `Today, ${nowTime}`}</span>
              </div>

              <div
                style={{
                  background: "#e2e8f0",
                  color: "#0f172a",
                  padding: "12px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  maxWidth: "92%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                {smsText}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div
          style={{
            background: "#0f172a",
            padding: "12px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#16a34a" : "#1e293b",
              color: "white",
              border: "1px solid #334155",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? (lang === "hi" ? "कॉपी हो गया" : "Copied!") : (lang === "hi" ? "संदेश कॉपी करें" : "Copy Message")}
          </button>

          <button
            onClick={onClose}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "6px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CitizenAlertSimulator;
