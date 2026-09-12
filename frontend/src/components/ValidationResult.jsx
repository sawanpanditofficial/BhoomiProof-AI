import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// =========================================================
// VALIDATION RESULT COMPONENT
// =========================================================

function ValidationResult({ validation }) {
  if (!validation) {
    return null;
  }

  const {
    overall_status = "UNKNOWN",
    risk_level = "UNKNOWN",
    risk_score = 0,
    summary = {},
    checks = [],
  } = validation;

  const totalChecks = summary.total_checks ?? checks.length;
  const passedCount =
    summary.passed ??
    checks.filter((c) => c.status === "PASS").length;
  const warningCount =
    summary.warnings ??
    checks.filter((c) => c.status === "WARNING").length;
  const failureCount =
    summary.failures ??
    checks.filter((c) => c.status === "FAIL").length;

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PASS":
        return <CheckCircle size={18} />;
      case "WARNING":
        return <AlertTriangle size={18} />;
      case "FAIL":
        return <XCircle size={18} />;
      default:
        return <CheckCircle size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PASS":
        return "pass";
      case "WARNING":
        return "warning";
      case "FAIL":
        return "fail";
      default:
        return "pass";
    }
  };

  return (
    <div className="validation-card">
      {/* Header */}
      <div className="validation-header">
        <ShieldCheck size={24} />
        <div>
          <h3>Automated Validation Results</h3>
          <p>Rule-based consistency, format and fraud risk analysis</p>
        </div>
      </div>

      {/* Status Highlights */}
      <div className="validation-status">
        <div>
          <span>Overall Status</span>
          <strong>{overall_status}</strong>
        </div>
        <div>
          <span>Risk Level</span>
          <strong style={{
            color: risk_level === "HIGH" ? "#c53030" : risk_level === "MEDIUM" ? "#d69e2e" : "#2f855a"
          }}>
            {risk_level}
          </strong>
        </div>
        <div>
          <span>Risk Score</span>
          <strong>{risk_score} / 100</strong>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="validation-summary">
        <div>
          <strong>{totalChecks}</strong>
          <span>Total Checks</span>
        </div>
        <div style={{ borderColor: "#c6f6d5" }}>
          <strong style={{ color: "#2f855a" }}>{passedCount}</strong>
          <span>Passed</span>
        </div>
        <div style={{ borderColor: "#feebc8" }}>
          <strong style={{ color: "#d69e2e" }}>{warningCount}</strong>
          <span>Warnings</span>
        </div>
        <div style={{ borderColor: "#fed7d7" }}>
          <strong style={{ color: "#c53030" }}>{failureCount}</strong>
          <span>Failures</span>
        </div>
      </div>

      {/* Check Items */}
      {checks && checks.length > 0 && (
        <div className="validation-checks">
          {checks.map((check, index) => {
            const statusClass = getStatusClass(check.status);
            return (
              <div key={index} className={`validation-check ${statusClass}`}>
                {getStatusIcon(check.status)}
                <div>
                  <strong>
                    {check.field ? check.field.replaceAll("_", " ") : "Check"}
                  </strong>
                  <span>{check.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ValidationResult;