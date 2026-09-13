import { useState, useEffect } from "react";
import {
  MessageSquare,
  Smartphone,
  CheckCheck,
  Copy,
  Check,
  Award,
  Volume2,
  Send,
  Edit3,
  Phone,
  Shield,
  ExternalLink
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
    // AudioContext not allowed without user interaction
  }
}

function CitizenAlertSimulator({ record, isOpen, onClose, lang = "en" }) {
  const [platform, setPlatform] = useState("whatsapp"); // "whatsapp" | "sms"
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentToast, setSentToast] = useState(false);

  // Government Hotline Number specified by user
  const GOV_HOTLINE = "9588318046";
  const [recipientPhone, setRecipientPhone] = useState(
    record?.owner_mobile ? String(record.owner_mobile).replace(/^\+91\s?/, "").trim() : GOV_HOTLINE
  );

  const owner = record?.owner_name || "Shri Citizen";
  const docNum = record?.document_number || "DOC-2026-REG";
  const survey = record?.survey_number || "Plot N/A";
  const area = record?.land_area || "Standard Area";
  const village = record?.village || "Tehsil Circle";
  const district = record?.district || "District HQ";
  const ulpin = `09-24-${(record?.record_id || "2026").slice(-4)}-9809-11`;

  const defaultWaMessage =
    lang === "hi"
      ? `🏛️ *राजस्व एवं भूमि सुधार विभाग (भारत सरकार)*\n\nप्रिय *${owner}* जी,\n\nआपकी भूमि का नामांतरण (Mutation) एवं डिजिटल भू-आधार पंजीयन *सफलतापूर्वक सत्यापित* कर दिया गया है।\n\n📋 *भूमि विवरण:*\n• दस्तावेज़ सं.: ${docNum}\n• खसरा/सर्वे सं.: ${survey}\n• रकबा: ${area}\n• मौजा/ग्राम: ${village}, ${district}\n\n🆔 *14-अंकीय भू-आधार (ULPIN):*\n\`${ulpin}\`\n\n🔒 यह प्रविष्टि SHA-256 क्रिप्टोग्राफिक मुहर से सुरक्षित है।\n\nडिजिटल भू-आधार प्रमाणपत्र डाउनलोड करने हेतु नीचे लिंक पर क्लिक करें:\nhttps://bhoomiproof.gov.in/verify/${record?.record_id || ""}`
      : `🏛️ *Dept of Land Resources & Revenue (Govt of India)*\n\nDear *${owner}*,\n\nYour land deed mutation and Bhu-Aadhaar registration has been *successfully verified & registered*.\n\n📋 *Land Details:*\n• Document No: ${docNum}\n• Survey / Khasra: ${survey}\n• Land Area: ${area}\n• Location: ${village}, ${district}\n\n🆔 *14-Digit Bhu-Aadhaar (ULPIN):*\n\`${ulpin}\`\n\n🔒 Cryptographically signed with SHA-256 digital stamp.\n\nClick link to download official certificate:\nhttps://bhoomiproof.gov.in/verify/${record?.record_id || ""}`;

  const defaultSmsMessage =
    lang === "hi"
      ? `[GOV-BHUADR]: Priye ${owner}, aapki zameen Khasra ${survey}, ${village} ka Bhu-Aadhaar ULPIN: ${ulpin} safaltapurvak jari hua. Certificate: https://bhoomiproof.gov.in/c/${record?.record_id || ""}`
      : `[GOV-BHUADR]: Dear ${owner}, land record for Survey ${survey}, ${village} has been issued Bhu-Aadhaar ULPIN: ${ulpin}. Download certificate: https://bhoomiproof.gov.in/c/${record?.record_id || ""}`;

  const [editableWaMessage, setEditableWaMessage] = useState(defaultWaMessage);
  const [editableSmsMessage, setEditableSmsMessage] = useState(defaultSmsMessage);

  useEffect(() => {
    setEditableWaMessage(defaultWaMessage);
    setEditableSmsMessage(defaultSmsMessage);
    setRecipientPhone(GOV_HOTLINE);
  }, [record, lang]);

  if (!isOpen || !record) return null;

  const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const activeMessage = platform === "whatsapp" ? editableWaMessage : editableSmsMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = () => {
    playNotificationChime();
  };

  // 1-Click WhatsApp Dispatch Handler
  const handleSendWhatsApp = () => {
    const rawNumber = (recipientPhone || GOV_HOTLINE).replace(/[^0-9]/g, "");
    const formattedPhone = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const encodedText = encodeURIComponent(editableWaMessage);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    playNotificationChime();
    window.open(waUrl, "_blank");

    setSentToast(true);
    setTimeout(() => setSentToast(false), 4000);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999999,
        background: "rgba(15, 23, 42, 0.82)",
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
          width: "440px",
          maxWidth: "96vw",
          borderRadius: "28px",
          background: "#020617",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 6px #1e293b",
          border: "4px solid #0f172a",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Government Notification Dispatch Header */}
        <div
          style={{
            background: "#0f172a",
            padding: "12px 16px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid #22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>
                {lang === "hi" ? "नागरिक डिजिटल सूचना प्रेषण" : "Official Citizen Alert Gateway"}
              </div>
              <div style={{ fontSize: "10px", color: "#4ade80", fontWeight: 600 }}>
                {lang === "hi" ? "सरकारी व्हाट्सएप हेल्पलाइन: +91 9588318046" : "Govt WhatsApp Hotline: +91 9588318046"}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: isEditing ? "#f59e0b" : "#1e293b",
              color: isEditing ? "#0f172a" : "#cbd5e1",
              border: "1px solid #334155",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Edit3 size={12} />
            {isEditing
              ? (lang === "hi" ? "पूर्वावलोकन" : "Preview")
              : (lang === "hi" ? "संदेश संपादित करें" : "Edit Message")}
          </button>
        </div>

        {/* Recipient Phone Configuration Bar */}
        <div
          style={{
            background: "#1e293b",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #334155",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
            <Phone size={13} color="#94a3b8" />
            <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
              {lang === "hi" ? "प्राप्तकर्ता मोबाइल:" : "Recipient Mobile:"}
            </span>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="9588318046"
              style={{
                background: "#0f172a",
                border: "1px solid #475569",
                borderRadius: "6px",
                padding: "3px 8px",
                color: "#4ade80",
                fontWeight: 700,
                fontSize: "12px",
                width: "120px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            {lang === "hi" ? "1-क्लिक डिस्पैच" : "1-Click Dispatch"}
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

        {/* Sent Confirmation Banner */}
        {sentToast && (
          <div
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "10px 14px",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderBottom: "1px solid #86efac",
            }}
          >
            <CheckCheck size={16} />
            <span>
              {lang === "hi"
                ? `व्हाट्सएप संदेश ${recipientPhone} पर सफलतापूर्वक भेज दिया गया!`
                : `Official alert dispatched via WhatsApp to ${recipientPhone}!`}
            </span>
          </div>
        )}

        {/* Message Editor Mode */}
        {isEditing ? (
          <div style={{ padding: "14px", background: "#0f172a", minHeight: "360px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>
              {lang === "hi" ? "संदेश सामग्री को संपादित करें (कस्टमाइज़):" : "Edit alert message before dispatching:"}
            </div>
            <textarea
              value={platform === "whatsapp" ? editableWaMessage : editableSmsMessage}
              onChange={(e) =>
                platform === "whatsapp"
                  ? setEditableWaMessage(e.target.value)
                  : setEditableSmsMessage(e.target.value)
              }
              rows={12}
              style={{
                width: "100%",
                flex: 1,
                background: "#020617",
                border: "1.5px solid #334155",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "white",
                fontSize: "12px",
                lineHeight: "1.5",
                fontFamily: "monospace",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  if (platform === "whatsapp") setEditableWaMessage(defaultWaMessage);
                  else setEditableSmsMessage(defaultSmsMessage);
                }}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "none",
                  fontSize: "11px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {lang === "hi" ? "डिफ़ॉल्ट पर रीसेट करें" : "Reset to default template"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: "#22c55e",
                  color: "#0f172a",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {lang === "hi" ? "पूर्वावलोकन देखें" : "Done Editing"}
              </button>
            </div>
          </div>
        ) : (
          /* Smartphone Preview Mode */
          <>
            {/* WhatsApp View */}
            {platform === "whatsapp" && (
              <div style={{ background: "#efeae2", minHeight: "360px", display: "flex", flexDirection: "column" }}>
                {/* WhatsApp App Header */}
                <div
                  style={{
                    background: "#075e54",
                    color: "white",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "#128c7e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                      }}
                    >
                      🏛️
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        BhoomiProof India <span style={{ color: "#25d366" }}>✓</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#bbf7d0" }}>Official Government Dispatch (+91 9588318046)</div>
                    </div>
                  </div>
                  <button
                    onClick={handleTestPing}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                    title="Play notification sound"
                  >
                    <Volume2 size={11} /> Ping
                  </button>
                </div>

                {/* Chat Body */}
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    overflowY: "auto",
                    maxHeight: "310px",
                  }}
                >
                  <div style={{ textAlign: "center", margin: "4px 0 8px" }}>
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

                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "0 10px 10px 10px",
                      padding: "10px 12px",
                      maxWidth: "94%",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                      position: "relative",
                      color: "#111827",
                      fontSize: "11.5px",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {editableWaMessage}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "3px",
                        marginTop: "6px",
                        fontSize: "10px",
                        color: "#9ca3af",
                      }}
                    >
                      <span>{nowTime}</span>
                      <CheckCheck size={13} color="#38bdf8" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SMS View */}
            {platform === "sms" && (
              <div style={{ background: "#f8fafc", minHeight: "360px", display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    background: "#1e293b",
                    color: "white",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>VK-BHUADR</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>National Land Registry (+91 9588318046)</div>
                  </div>
                  <button
                    onClick={handleTestPing}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "none",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <Volume2 size={11} /> Ping
                  </button>
                </div>

                <div style={{ flex: 1, padding: "14px", overflowY: "auto", maxHeight: "310px" }}>
                  <div style={{ textAlign: "center", margin: "2px 0 10px" }}>
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                      {lang === "hi" ? `आज, ${nowTime}` : `Today, ${nowTime}`}
                    </span>
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
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {editableSmsMessage}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Actions Bar */}
        <div
          style={{
            background: "#0f172a",
            padding: "12px 14px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "#16a34a" : "#1e293b",
                color: "white",
                border: "1px solid #334155",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied
                ? (lang === "hi" ? "कॉपी हो गया" : "Copied!")
                : (lang === "hi" ? "कॉपी करें" : "Copy")}
            </button>

            {/* 1-Click WhatsApp Dispatch Button */}
            <button
              onClick={handleSendWhatsApp}
              style={{
                background: "#22c55e",
                color: "#0f172a",
                border: "none",
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)",
              }}
            >
              <Send size={13} />
              {lang === "hi" ? "व्हाट्सएप पर भेजें (1-Click)" : "Send via WhatsApp"}
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#334155",
              color: "white",
              border: "none",
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "11px",
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
