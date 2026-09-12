import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";

// ======================================================
// SAFE VALUE FORMATTER
// ======================================================

function formatValue(value) {
  // ----------------------------------------------------
  // Empty values
  // ----------------------------------------------------

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not detected";
  }

  // ----------------------------------------------------
  // Primitive values
  // ----------------------------------------------------

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  // ----------------------------------------------------
  // Arrays
  // ----------------------------------------------------

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Not detected";
    }

    return value
      .map((item) => formatValue(item))
      .join(", ");
  }

  // ----------------------------------------------------
  // Objects
  // ----------------------------------------------------

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const formattedKey = key
          .replaceAll("_", " ")
          .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
          );

        return `${formattedKey}: ${formatValue(val)}`;
      })
      .join(" | ");
  }

  // ----------------------------------------------------
  // Fallback
  // ----------------------------------------------------

  return String(value);
}

// ======================================================
// SAFE KEY FORMATTER
// ======================================================

function formatKey(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

function VerificationDashboard({
  result,
  onDecision,
}) {
  // ====================================================
  // SAFETY CHECK
  // ====================================================

  if (!result) {
    return null;
  }

  // ====================================================
  // GET DATA SAFELY
  // ====================================================

  const validation =
    result.validation || {};

  const verification =
    result.verification || {};

  const fields =
    result.fields || {};

  // ====================================================
  // VERIFICATION VALUES
  // ====================================================

  const recommendedDecision =
    verification.recommended_decision ||
    "REVIEW";

  const riskLevel =
    verification.risk_level ||
    "UNKNOWN";

  const riskScore =
    verification.risk_score ??
    0;

  // ====================================================
  // EXPLANATIONS
  // ====================================================

  const explanations =
    Array.isArray(
      verification.explanations
    )
      ? verification.explanations
      : [];

  // ====================================================
  // RECOMMENDATION
  // ====================================================

  const recommendation =
    verification.recommendation || {};

  const recommendationMessage =
    typeof recommendation === "string"
      ? recommendation
      : recommendation.message ||
        "No AI recommendation available.";

  // ====================================================
  // OWNER DATA
  // ====================================================

  const owners =
    Array.isArray(fields.owners)
      ? fields.owners
      : [];

  // ====================================================
  // HUMAN DECISION
  // ====================================================

  function handleDecision(decision) {
    if (typeof onDecision === "function") {
      onDecision(decision);
    }
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="verification-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="verification-title">

        <ShieldCheck size={26} />

        <div>

          <h2>
            Human Verification Center
          </h2>

          <p>
            Review AI-extracted information
            before final approval.
          </p>

        </div>

      </div>

      {/* =================================================
          STATUS
      ================================================= */}

      <div className="verification-status">

        <div>

          <span>
            STATUS
          </span>

          <strong>
            {formatValue(
              recommendedDecision
            )}
          </strong>

        </div>

        <div>

          <span>
            RISK LEVEL
          </span>

          <strong>
            {formatValue(riskLevel)}
          </strong>

        </div>

        <div>

          <span>
            RISK SCORE
          </span>

          <strong>
            {formatValue(riskScore)}
            /100
          </strong>

        </div>

      </div>

      {/* =================================================
          EXTRACTED RECORD
      ================================================= */}

      <div className="verification-section">

        <div className="section-heading">

          <FileText size={18} />

          <h3>
            Extracted Land Record
          </h3>

        </div>

        {/* =================================================
            OWNER CARDS
        ================================================= */}

        {owners.length > 0 && (

          <div className="owner-list">

            <div className="owner-list-title">
              <strong>
                Land Owner(s)
              </strong>
            </div>

            {owners.map(
              (owner, index) => (

                <div
                  className="owner-card"
                  key={index}
                >

                  <div className="record-field">

                    <span>
                      Owner Name
                    </span>

                    <strong>
                      {formatValue(
                        owner?.name
                      )}
                    </strong>

                  </div>

                  <div className="record-field">

                    <span>
                      Father / Husband
                    </span>

                    <strong>
                      {formatValue(
                        owner?.father_name
                      )}
                    </strong>

                  </div>

                  <div className="record-field">

                    <span>
                      Relationship
                    </span>

                    <strong>
                      {formatValue(
                        owner?.relationship
                      )}
                    </strong>

                  </div>

                  <div className="record-field">

                    <span>
                      Ownership Share
                    </span>

                    <strong>
                      {formatValue(
                        owner?.ownership_share
                      )}
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        )}

        {/* =================================================
            OTHER RECORD FIELDS
        ================================================= */}

        <div className="record-fields">

          {Object.entries(fields)
            .filter(
              ([key]) =>
                key !== "owners"
            )
            .map(
              ([key, value]) => (

                <div
                  className="record-field"
                  key={key}
                >

                  <span>
                    {formatKey(key)}
                  </span>

                  <strong>
                    {formatValue(value)}
                  </strong>

                </div>

              )
            )}

        </div>

      </div>

      {/* =================================================
          VALIDATION SUMMARY
      ================================================= */}

      <div className="verification-section">

        <div className="section-heading">

          <ShieldCheck size={18} />

          <h3>
            Validation Summary
          </h3>

        </div>

        <div className="validation-summary">

          <div className="record-field">

            <span>
              Validation Status
            </span>

            <strong>
              {formatValue(
                validation.status ||
                validation.overall_status ||
                validation.result ||
                "Review Required"
              )}
            </strong>

          </div>

          <div className="record-field">

            <span>
              Validation Confidence
            </span>

            <strong>
              {formatValue(
                validation.confidence ??
                validation.validation_confidence ??
                validation.score ??
                "Not available"
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          EXPLANATIONS
      ================================================= */}

      <div className="verification-section">

        <div className="section-heading">

          <AlertTriangle size={18} />

          <h3>
            Why Was This Flagged?
          </h3>

        </div>

        {explanations.length === 0 ? (

          <div className="no-anomalies">

            <CheckCircle size={20} />

            <div>

              <strong>
                No significant anomalies detected
              </strong>

              <p>
                The record passed the
                configured automated
                consistency checks.
              </p>

            </div>

          </div>

        ) : (

          <div className="explanation-list">

            {explanations.map(
              (item, index) => {

                // ----------------------------------------
                // Handle explanation object
                // ----------------------------------------

                if (
                  typeof item === "object" &&
                  item !== null
                ) {
                  return (

                    <div
                      className="explanation"
                      key={index}
                    >

                      <AlertTriangle
                        size={20}
                      />

                      <div>

                        <strong>
                          {formatValue(
                            item.title ||
                            "Validation Issue"
                          )}
                        </strong>

                        <p>
                          <b>
                            Field:
                          </b>{" "}
                          {formatValue(
                            item.field
                          )}
                        </p>

                        <p>
                          <b>
                            Reason:
                          </b>{" "}
                          {formatValue(
                            item.reason
                          )}
                        </p>

                        <p>
                          <b>
                            Action:
                          </b>{" "}
                          {formatValue(
                            item.action
                          )}
                        </p>

                      </div>

                    </div>

                  );
                }

                // ----------------------------------------
                // Handle string explanation
                // ----------------------------------------

                return (

                  <div
                    className="explanation"
                    key={index}
                  >

                    <AlertTriangle
                      size={20}
                    />

                    <div>

                      <p>
                        {formatValue(item)}
                      </p>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

      {/* =================================================
          AI RECOMMENDATION
      ================================================= */}

      <div className="recommendation">

        <strong>
          AI Recommendation
        </strong>

        <p>
          {formatValue(
            recommendationMessage
          )}
        </p>

      </div>

      {/* =================================================
          HUMAN DECISION
      ================================================= */}

      <div className="verification-actions">

        {/* ---------------------------------------------
            VIEW DOCUMENT
        --------------------------------------------- */}

        <button
          type="button"
          className="view-document"
          onClick={() => {
            alert(
              "Original document viewer will be connected in the next step."
            );
          }}
        >

          <FileText size={17} />

          View Original Document

        </button>

        {/* ---------------------------------------------
            ACCEPT
        --------------------------------------------- */}

        <button
          type="button"
          className="accept-button"
          onClick={() =>
            handleDecision("ACCEPT")
          }
        >

          <CheckCircle size={17} />

          Accept Record

        </button>

        {/* ---------------------------------------------
            REVIEW
        --------------------------------------------- */}

        <button
          type="button"
          className="review-button"
          onClick={() =>
            handleDecision("REVIEW")
          }
        >

          <AlertTriangle size={17} />

          Send for Review

        </button>

        {/* ---------------------------------------------
            REJECT
        --------------------------------------------- */}

        <button
          type="button"
          className="reject-button"
          onClick={() =>
            handleDecision("REJECT")
          }
        >

          <XCircle size={17} />

          Reject

        </button>

      </div>

    </div>
  );
}

export default VerificationDashboard;