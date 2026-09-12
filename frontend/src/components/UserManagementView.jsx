import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Search,
  Plus,
  Check,
  X,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Info
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function UserManagementView({ officer, lang = "en" }) {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "active" | "suspended"
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form state for adding a new officer
  const [formData, setFormData] = useState({
    name: "",
    officer_id: "",
    email: "",
    phone: "",
    role: "Lekhpal / Patwari",
    jurisdiction: "Madhubani Sadar",
    department: "Department of Land Revenue (DILRMP)",
    permissions: {
      can_upload: true,
      can_approve: false,
      can_edit: false,
      can_delete: false,
      can_export: true,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  // Admin Check: Only Lead Administrators (Tehsildar / DM) are allowed. Verification Officers are strictly excluded.
  const isVerificationOfficer = Boolean(
    officer?.role?.toLowerCase().includes("verification") ||
    officer?.officer_id?.toLowerCase().includes("verify")
  );

  const isAdmin = Boolean(
    !isVerificationOfficer &&
    (
      officer?.is_super_admin ||
      officer?.permissions?.can_manage_users ||
      officer?.role?.toLowerCase().includes("tehsildar") ||
      officer?.role?.toLowerCase().includes("collector") ||
      officer?.role?.toLowerCase().includes("magistrate") ||
      officer?.officer_id?.toLowerCase().includes("sawan.tehsildar")
    )
  );

  const fetchOfficers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch officer directory");
      const data = await res.json();
      setOfficers(data.officers || []);
    } catch (err) {
      setError(err.message || "Network error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/admin/users`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch officer directory");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setOfficers(data.officers || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Network error fetching users");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Officer Access (Active / Suspended)
  const handleToggleActive = async (targetOfficer) => {
    const newStatus = !targetOfficer.is_active;
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${targetOfficer.id}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Could not update officer access");
      const data = await res.json();

      setOfficers((prev) =>
        prev.map((u) => (u.id === targetOfficer.id ? data.officer : u))
      );

      showToast(
        newStatus
          ? `${targetOfficer.name} ko Access Grant (सक्रिय) kar diya gaya hai.`
          : `${targetOfficer.name} ka Access REVOKE / SUSPEND (प्रतिबंधित) kar diya gaya.`
      );
    } catch (err) {
      alert(`Error updating access: ${err.message}`);
    }
  };

  // Toggle Granular Permission
  const handleTogglePermission = async (targetOfficer, permKey) => {
    const currentPerms = targetOfficer.permissions || {};
    const updatedVal = !currentPerms[permKey];
    const newPerms = { ...currentPerms, [permKey]: updatedVal };

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${targetOfficer.id}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: newPerms }),
        }
      );
      if (!res.ok) throw new Error("Permission update failed");
      const data = await res.json();

      setOfficers((prev) =>
        prev.map((u) => (u.id === targetOfficer.id ? data.officer : u))
      );

      showToast(
        `${targetOfficer.name}: ${permKey.replace("can_", "").toUpperCase()} permission ${
          updatedVal ? "ENABLED (सक्षम)" : "DISABLED (अक्षम)"
        }`
      );
    } catch (err) {
      alert(`Permission error: ${err.message}`);
    }
  };

  // Delete Officer
  const handleDeleteOfficer = async (targetOfficer) => {
    if (targetOfficer.officer_id === "sawan.tehsildar@gov.in") {
      alert("Lead Administrator (Shri Sawan Pandit) cannot be deleted.");
      return;
    }

    if (
      !window.confirm(
        `Kya aap nishchit roop se ${targetOfficer.name} (${targetOfficer.role}) ko registry se hatana chahte hain?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${targetOfficer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Deletion failed");
      }

      setOfficers((prev) => prev.filter((u) => u.id !== targetOfficer.id));
      showToast(`${targetOfficer.name} ko Safaltapoorvak remove kar diya gaya.`);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Role preset helper
  const handleRolePreset = (roleName) => {
    let perms = {
      can_upload: true,
      can_approve: false,
      can_edit: false,
      can_delete: false,
      can_export: true,
    };

    if (roleName.includes("Tehsildar") || roleName.includes("Sub-Registrar")) {
      perms = {
        can_upload: true,
        can_approve: true,
        can_edit: true,
        can_delete: true,
        can_export: true,
      };
    } else if (roleName.includes("Kanoongo") || roleName.includes("Inspector")) {
      perms = {
        can_upload: true,
        can_approve: true,
        can_edit: true,
        can_delete: false,
        can_export: true,
      };
    } else if (roleName.includes("Collector") || roleName.includes("Magistrate")) {
      perms = {
        can_upload: true,
        can_approve: true,
        can_edit: false,
        can_delete: false,
        can_export: true,
      };
    } else if (roleName.includes("Operator")) {
      perms = {
        can_upload: true,
        can_approve: false,
        can_edit: false,
        can_delete: false,
        can_export: false,
      };
    }

    setFormData((prev) => ({
      ...prev,
      role: roleName,
      permissions: perms,
    }));
  };

  // Submit New Officer
  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.officer_id || !formData.email) {
      alert("Kripya Naam, Officer ID aur Email enter karein.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      setOfficers((prev) => [...prev, data.officer]);
      setShowAddModal(false);
      showToast(`Naya Adhikari ${data.officer.name} safaltapoorvak jod diya gaya!`);

      setFormData({
        name: "",
        officer_id: "",
        email: "",
        phone: "",
        role: "Lekhpal / Patwari",
        jurisdiction: "Madhubani Sadar",
        department: "Department of Land Revenue (DILRMP)",
        permissions: {
          can_upload: true,
          can_approve: false,
          can_edit: false,
          can_delete: false,
          can_export: true,
        },
      });
    } catch (err) {
      alert(`Error creating officer: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // If not admin, render access restriction notice
  if (!isAdmin) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "60px 20px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <ShieldAlert size={30} />
        </div>
        <h2 style={{ fontSize: "20px", color: "#182230", marginBottom: "8px" }}>
          {lang === "hi" ? "पहुंच प्रतिबंधित (Access Restricted)" : "Access Restricted"}
        </h2>
        <p style={{ color: "#718096", maxWidth: "500px", margin: "0 auto", fontSize: "14px", lineHeight: "1.6" }}>
          {lang === "hi"
            ? "उपयोगकर्ता एवं अधिकार प्रबंधन केवल अधिकृत प्रशासनिक अधिकारियों (तहसीलदार / कलेक्टर) के लिए उपलब्ध है।"
            : "User management and RBAC access control are strictly restricted to Lead Administrators (Tehsildar / District Magistrate)."}
        </p>
      </div>
    );
  }

  // Filter logic
  const filteredOfficers = officers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.officer_id?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.jurisdiction?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);

    const matchesRole =
      filterRole === "all" ||
      u.role?.toLowerCase().includes(filterRole.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "suspended" && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = officers.filter((u) => u.is_active).length;
  const suspendedCount = officers.filter((u) => !u.is_active).length;
  const adminCount = officers.filter((u) => u.is_super_admin).length;

  return (
    <div className="user-management-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#102a43",
            color: "#ffffff",
            border: "1px solid #2f80ed",
            padding: "14px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <Sparkles size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header matching App.jsx / CollectorAnalyticsView theme */}
      <header className="header">
        <div>
          <p className="eyebrow">DILRMP ACCESS CONTROL & RBAC</p>
          <h1>{lang === "hi" ? "अधिकारी एवं अनुमति प्रबंधन" : "Officer Directory & Access Control"}</h1>
          <p className="subtitle">
            {lang === "hi"
              ? "कलेक्टर व तहसीलदार स्तर से अधिकारियों की लॉग-इन अनुमति (Grant/Revoke) और कार्य अधिकार नियंत्रित करें"
              : "Grant or Revoke portal access, define granular capabilities, and manage officer directory"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="btn-secondary"
            onClick={fetchOfficers}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            title="Refresh Directory"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>{lang === "hi" ? "ताज़ा करें" : "Refresh"}</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={16} />
            <span>{lang === "hi" ? "+ नया अधिकारी जोड़ें" : "+ Add New Officer"}</span>
          </button>
        </div>
      </header>

      {/* Stat Cards matching .stats and .stat-card theme */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#eaf3ff", color: "#1769aa" }}>
            <Users size={20} />
          </div>
          <div>
            <p>{lang === "hi" ? "कुल पंजीकृत अधिकारी" : "Total Officers"}</p>
            <h3>{officers.length}</h3>
            <small style={{ color: "#1769aa" }}>
              {lang === "hi" ? "राजस्व कर्मी सूची" : "Active Personnel"}
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f7ed", color: "#26823c" }}>
            <UserCheck size={20} />
          </div>
          <div>
            <p>{lang === "hi" ? "सक्रिय (Access Granted)" : "Access Granted"}</p>
            <h3 style={{ color: "#26823c" }}>{activeCount}</h3>
            <small style={{ color: "#26823c" }}>
              {lang === "hi" ? "लॉग-इन अनुमत" : "Permitted to login"}
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
            <UserX size={20} />
          </div>
          <div>
            <p>{lang === "hi" ? "निलंबित (Access Revoked)" : "Access Revoked"}</p>
            <h3 style={{ color: "#dc2626" }}>{suspendedCount}</h3>
            <small style={{ color: "#dc2626" }}>
              {lang === "hi" ? "लॉग-इन प्रतिबंधित" : "Blocked by Admin"}
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
            <Shield size={20} />
          </div>
          <div>
            <p>{lang === "hi" ? "प्रशासनिक अधिकारी (Admin)" : "Lead Administrators"}</p>
            <h3 style={{ color: "#b45309" }}>{adminCount}</h3>
            <small style={{ color: "#b45309" }}>
              {lang === "hi" ? "तहसीलदार / कलेक्टर" : "Tehsildar & DM"}
            </small>
          </div>
        </div>
      </section>

      {/* Search & Filters Bar */}
      <div
        className="panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8a96a6",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "hi"
                ? "अधिकारी का नाम, सरकारी आईडी, ईमेल या तहसील खोजें..."
                : "Search officer by name, GOV ID, email, jurisdiction..."
            }
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              background: "#f8fafc",
              border: "1px solid #d8dee8",
              borderRadius: "8px",
              color: "#182230",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ minWidth: "190px" }}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "#f8fafc",
              border: "1px solid #d8dee8",
              borderRadius: "8px",
              color: "#182230",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">{lang === "hi" ? "सभी पद (All Designations)" : "All Designations"}</option>
            <option value="tehsildar">Tehsildar / Sub-Registrar</option>
            <option value="kanoongo">Revenue Inspector (Kanoongo)</option>
            <option value="patwari">Lekhpal / Patwari</option>
            <option value="collector">District Magistrate / Collector</option>
            <option value="operator">Data Entry Operator</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "8px",
            padding: "3px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => setFilterStatus("all")}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: filterStatus === "all" ? "#ffffff" : "transparent",
              color: filterStatus === "all" ? "#182230" : "#64748b",
              boxShadow: filterStatus === "all" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {lang === "hi" ? "सभी" : "All"} ({officers.length})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: filterStatus === "active" ? "#ffffff" : "transparent",
              color: filterStatus === "active" ? "#166534" : "#64748b",
              boxShadow: filterStatus === "active" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            🟢 {lang === "hi" ? "सक्रिय" : "Active"} ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus("suspended")}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: filterStatus === "suspended" ? "#ffffff" : "transparent",
              color: filterStatus === "suspended" ? "#dc2626" : "#64748b",
              boxShadow: filterStatus === "suspended" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            🔴 {lang === "hi" ? "निलंबित" : "Revoked"} ({suspendedCount})
          </button>
        </div>
      </div>

      {/* Directory Table Panel */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#718096" }}>
            <RefreshCw size={26} className="spin" style={{ margin: "0 auto 12px" }} />
            <p>{lang === "hi" ? "अधिकारी सूची लोड हो रही है..." : "Loading officer directory..."}</p>
          </div>
        ) : error ? (
          <div style={{ padding: "24px", color: "#dc2626", textAlign: "center" }}>
            {error}
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#718096" }}>
            <AlertCircle size={36} style={{ margin: "0 auto 12px", color: "#94a3b8" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#182230" }}>
              {lang === "hi" ? "कोई अधिकारी नहीं मिला" : "No officers found matching criteria"}
            </p>
            <p style={{ fontSize: "13px" }}>
              {lang === "hi" ? "खोज शब्द या फ़िल्टर बदलकर पुनः प्रयास करें।" : "Try clearing filters or search terms."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #edf0f4",
                    color: "#64748b",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "14px 20px" }}>{lang === "hi" ? "अधिकारी विवरण" : "Officer Identity"}</th>
                  <th style={{ padding: "14px 20px" }}>{lang === "hi" ? "पद व तहसील" : "Role & Jurisdiction"}</th>
                  <th style={{ padding: "14px 20px" }}>{lang === "hi" ? "लॉग-इन अनुमति" : "Portal Access"}</th>
                  <th style={{ padding: "14px 20px" }}>
                    {lang === "hi" ? "कार्य अधिकार (Permissions Matrix)" : "Assigned Capabilities"}
                  </th>
                  <th style={{ padding: "14px 20px" }}>{lang === "hi" ? "अंतिम सक्रियता" : "Last Active"}</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>{lang === "hi" ? "कार्य" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((u) => {
                  const perms = u.permissions || {};
                  const isSelf = officer?.officer_id?.toLowerCase() === u.officer_id?.toLowerCase();
                  const isSuperAdmin = u.is_super_admin;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #edf0f4",
                        background: !u.is_active ? "#fef2f2" : "white",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Officer Identity */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: u.is_active ? "#eaf3ff" : "#f1f5f9",
                              border: u.is_active ? "1.5px solid #2f80ed" : "1.5px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: u.is_active ? "#1769aa" : "#64748b",
                              fontWeight: 700,
                              fontSize: "14px",
                              flexShrink: 0,
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 700, color: "#182230", fontSize: "14px" }}>
                                {u.name}
                              </span>
                              {isSuperAdmin && (
                                <span
                                  style={{
                                    background: "#fef3c7",
                                    border: "1px solid #fde68a",
                                    color: "#92400e",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                  }}
                                >
                                  LEAD ADMIN
                                </span>
                              )}
                              {isSelf && (
                                <span
                                  style={{
                                    background: "#e0f2fe",
                                    border: "1px solid #bae6fd",
                                    color: "#0369a1",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                  }}
                                >
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              ID: <code style={{ color: "#1769aa", fontWeight: 600 }}>{u.officer_id}</code>
                            </div>
                            <div style={{ fontSize: "11px", color: "#8a96a6", display: "flex", gap: "10px", marginTop: "2px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <Mail size={11} /> {u.email}
                              </span>
                              {u.phone && (
                                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                  <Phone size={11} /> {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Jurisdiction */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600, color: "#182230" }}>{u.role}</div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "2px",
                          }}
                        >
                          <MapPin size={11} color="#f59e0b" />
                          <span>{u.jurisdiction || "Headquarters"}</span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#8a96a6", marginTop: "2px" }}>
                          {u.department}
                        </div>
                      </td>

                      {/* Portal Access Status Switch */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={u.officer_id === "sawan.tehsildar@gov.in"}
                          title={
                            u.is_active
                              ? "Click to Revoke officer login access"
                              : "Click to Grant officer login access"
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            border: u.is_active ? "1px solid #86efac" : "1px solid #fca5a5",
                            background: u.is_active ? "#e8f7ed" : "#fee2e2",
                            color: u.is_active ? "#166534" : "#991b1b",
                            cursor: u.officer_id === "sawan.tehsildar@gov.in" ? "not-allowed" : "pointer",
                            fontSize: "12px",
                            fontWeight: 700,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {u.is_active ? <Unlock size={13} /> : <Lock size={13} />}
                          <span>{u.is_active ? "🟢 Active (Granted)" : "🔴 Suspended (Revoked)"}</span>
                        </button>
                        {!u.is_active && (
                          <div style={{ fontSize: "10px", color: "#dc2626", marginTop: "3px", fontWeight: 500 }}>
                            *Login blocked (HTTP 403)
                          </div>
                        )}
                      </td>

                      {/* Granular Permissions Matrix */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "340px" }}>
                          {/* Upload */}
                          <button
                            onClick={() => handleTogglePermission(u, "can_upload")}
                            disabled={!u.is_active}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: perms.can_upload ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                              background: perms.can_upload ? "#eff6ff" : "#f8fafc",
                              color: perms.can_upload ? "#1d4ed8" : "#94a3b8",
                              cursor: u.is_active ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Toggle Document Upload Permission"
                          >
                            {perms.can_upload ? <Check size={11} /> : <X size={11} />}
                            Upload
                          </button>

                          {/* Approve */}
                          <button
                            onClick={() => handleTogglePermission(u, "can_approve")}
                            disabled={!u.is_active}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: perms.can_approve ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                              background: perms.can_approve ? "#ecfdf5" : "#f8fafc",
                              color: perms.can_approve ? "#047857" : "#94a3b8",
                              cursor: u.is_active ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Toggle Verification / Approval Permission"
                          >
                            {perms.can_approve ? <Check size={11} /> : <X size={11} />}
                            Approve
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleTogglePermission(u, "can_edit")}
                            disabled={!u.is_active}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: perms.can_edit ? "1px solid #fde68a" : "1px solid #e2e8f0",
                              background: perms.can_edit ? "#fffbeb" : "#f8fafc",
                              color: perms.can_edit ? "#b45309" : "#94a3b8",
                              cursor: u.is_active ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Toggle Land Record Edit Permission"
                          >
                            {perms.can_edit ? <Check size={11} /> : <X size={11} />}
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleTogglePermission(u, "can_delete")}
                            disabled={!u.is_active}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: perms.can_delete ? "1px solid #fecaca" : "1px solid #e2e8f0",
                              background: perms.can_delete ? "#fef2f2" : "#f8fafc",
                              color: perms.can_delete ? "#b91c1c" : "#94a3b8",
                              cursor: u.is_active ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Toggle Record Deletion Permission"
                          >
                            {perms.can_delete ? <Check size={11} /> : <X size={11} />}
                            Delete
                          </button>

                          {/* Export */}
                          <button
                            onClick={() => handleTogglePermission(u, "can_export")}
                            disabled={!u.is_active}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: perms.can_export ? "1px solid #ddd6fe" : "1px solid #e2e8f0",
                              background: perms.can_export ? "#f5f3ff" : "#f8fafc",
                              color: perms.can_export ? "#6d28d9" : "#94a3b8",
                              cursor: u.is_active ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Toggle CSV / Report Export Permission"
                          >
                            {perms.can_export ? <Check size={11} /> : <X size={11} />}
                            Export
                          </button>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle", color: "#64748b", fontSize: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Clock size={12} color="#8a96a6" />
                          <span>{u.last_login || "Never"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", verticalAlign: "middle", textAlign: "right" }}>
                        {u.officer_id !== "sawan.tehsildar@gov.in" && (
                          <button
                            onClick={() => handleDeleteOfficer(u)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#dc2626",
                              padding: "6px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            title="Remove Officer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Directive Notice */}
      <div
        style={{
          marginTop: "20px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <Info size={22} color="#2563eb" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "12px", color: "#1e40af", lineHeight: "1.6" }}>
          <strong>
            {lang === "hi" ? "राष्ट्रीय भू-अभिलेख सुरक्षा नियम (DILRMP RBAC Guidelines):" : "National DILRMP RBAC Directive:"}
          </strong>{" "}
          {lang === "hi"
            ? "केवल अधिकृत प्रशासनिक अधिकारी ही इस मॉड्यूल तक पहुंच सकते हैं। निलंबित (Revoked) अधिकारी सिस्टम में लॉग-इन नहीं कर सकते। कार्य अधिकारों में बदलाव तुरंत प्रभाव से लागू होता है।"
            : "Only Lead Administrators have access to this directory. Revoked officers cannot generate authentication tokens. Assigned capability switches dynamically restrict features across all modules."}
        </div>
      </div>

      {/* ADD NEW OFFICER MODAL matching UploadModal theme */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 42, 67, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e6eaf0",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #edf0f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "#eaf3ff",
                    color: "#1769aa",
                    padding: "8px",
                    borderRadius: "8px",
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#102a43" }}>
                    {lang === "hi" ? "नया राजस्व अधिकारी पंजीकृत करें" : "Register New Revenue Officer"}
                  </h3>
                  <small style={{ color: "#718096" }}>
                    {lang === "hi" ? "अधिकारी विवरण एवं कार्य अधिकार निर्धारित करें" : "Set profile and assigned RBAC privileges"}
                  </small>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#718096",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateOfficer} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "अधिकारी का पूरा नाम *" : "Officer Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "सरकारी आईडी (Login ID) *" : "Government Officer ID *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ramesh.patwari@gov.in"
                    value={formData.officer_id}
                    onChange={(e) => setFormData({ ...formData, officer_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "आधिकारिक ईमेल *" : "Official Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh.patwari@gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "संपर्क नंबर" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "पद / पदनाम (Designation)" : "Official Role / Designation"}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRolePreset(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Lekhpal / Patwari">Lekhpal / Patwari (Field Survey)</option>
                    <option value="Revenue Inspector (Kanoongo)">Revenue Inspector (Kanoongo)</option>
                    <option value="Tehsildar / Sub-Registrar">Tehsildar / Sub-Registrar (Full Admin)</option>
                    <option value="District Magistrate / Collector">District Magistrate / Collector</option>
                    <option value="Registry Data Operator">Registry Data Operator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#182230", marginBottom: "6px" }}>
                    {lang === "hi" ? "तहसील / अधिकार क्षेत्र" : "Tehsil / Jurisdiction"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Madhubani Sadar, Benipatti"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#f8fafc",
                      border: "1px solid #d8dee8",
                      borderRadius: "8px",
                      color: "#182230",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Granular Checkboxes Panel */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1769aa", marginBottom: "12px" }}>
                  {lang === "hi" ? "प्रारंभिक कार्य अनुमतियां (Assigned Capabilities):" : "Initial RBAC Permissions:"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#182230", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_upload}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, can_upload: e.target.checked },
                        })
                      }
                    />
                    <span>{lang === "hi" ? "दस्तावेज़ अपलोड (Upload)" : "Can Upload Documents"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#182230", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_approve}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, can_approve: e.target.checked },
                        })
                      }
                    />
                    <span>{lang === "hi" ? "स्वीकृति / सत्यापन (Approve)" : "Can Approve / Verify"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#182230", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_edit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, can_edit: e.target.checked },
                        })
                      }
                    />
                    <span>{lang === "hi" ? "अभिलेख संपादन (Edit)" : "Can Edit Land Records"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#182230", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_delete}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, can_delete: e.target.checked },
                        })
                      }
                    />
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>
                      {lang === "hi" ? "रिकॉर्ड विलोपन (Delete)" : "Can Delete Records"}
                    </span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#182230", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.can_export}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, can_export: e.target.checked },
                        })
                      }
                    />
                    <span>{lang === "hi" ? "CSV / रिपोर्ट एक्सपोर्ट" : "Can Export CSV / Reports"}</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    lang === "hi" ? "सहेजा जा रहा है..." : "Registering..."
                  ) : (
                    lang === "hi" ? "अधिकारी पंजीकृत करें" : "Register Officer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
