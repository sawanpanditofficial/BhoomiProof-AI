import { useState } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  CloudUpload,
  Loader2
} from "lucide-react";

function OfflineSyncBadge({ lang = "en" }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingCount, setPendingCount] = useState(2);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");

  const handleToggleMode = () => {
    setIsOfflineMode((prev) => !prev);
  };

  const handleSyncNow = () => {
    if (pendingCount === 0) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setPendingCount(0);
      setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1400);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: isOfflineMode ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.12)",
        border: `1px solid ${isOfflineMode ? "#f59e0b" : "#10b981"}`,
        borderRadius: "20px",
        padding: "3px 10px",
        fontSize: "11px",
      }}
    >
      <button
        onClick={handleToggleMode}
        style={{
          background: "transparent",
          border: "none",
          color: isOfflineMode ? "#d97706" : "#059669",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontWeight: 700,
          padding: 0,
        }}
        title="Toggle simulated Patwari Field Offline / Online Mode"
      >
        {isOfflineMode ? <WifiOff size={13} /> : <Wifi size={13} />}
        <span>{isOfflineMode ? (lang === "hi" ? "पटवारी फील्ड (ऑफलाइन)" : "Patwari Offline") : (lang === "hi" ? "राज्य क्लाउड (लाइव)" : "State Cloud (Live)")}</span>
      </button>

      {isOfflineMode && pendingCount > 0 && (
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          style={{
            background: "#d97706",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Sync local encrypted inspections to state database"
        >
          {syncing ? <Loader2 size={10} className="spin" /> : <CloudUpload size={10} />}
          <span>
            {syncing
              ? (lang === "hi" ? "सिंक हो रहा है..." : "Syncing...")
              : (lang === "hi" ? `सिंक करें (${pendingCount})` : `Sync (${pendingCount})`)}
          </span>
        </button>
      )}

      {isOfflineMode && pendingCount === 0 && (
        <span style={{ color: "#059669", fontSize: "10px", display: "flex", alignItems: "center", gap: "2px" }}>
          <CheckCircle2 size={11} /> {lang === "hi" ? `सिंक पूर्ण (${lastSynced})` : `Synced (${lastSynced})`}
        </span>
      )}
    </div>
  );
}

export default OfflineSyncBadge;
