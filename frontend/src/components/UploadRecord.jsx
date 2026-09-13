import { useState } from "react";

import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import ValidationResult from "./ValidationResult";
import VerificationDashboard from "./VerificationDashboard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// ======================================================
// SAFE VALUE FORMATTER
// ======================================================

function formatDisplayValue(value) {
  // Null / undefined / empty
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not detected";
  }

  // Primitive values
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Not detected";
    }

    return value
      .map((item) => formatDisplayValue(item))
      .join(", ");
  }

  // Objects
  if (typeof value === "object") {
    // Land record owner object
    if (value.name) {
      const parts = [];

      if (value.name) {
        parts.push(`Name: ${value.name}`);
      }

      if (value.father_name) {
        parts.push(
          `Father/Husband: ${value.father_name}`
        );
      }

      if (value.relationship) {
        parts.push(
          `Relationship: ${value.relationship}`
        );
      }

      if (value.ownership_share) {
        parts.push(
          `Ownership Share: ${value.ownership_share}`
        );
      }

      return parts.join(" | ");
    }

    // Generic object
    return Object.entries(value)
      .map(
        ([key, val]) =>
          `${key.replaceAll("_", " ")}: ${formatDisplayValue(val)}`
      )
      .join(" | ");
  }

  return String(value);
}

// ======================================================
// FIELD COMPONENT
// ======================================================

function Field({ label, value }) {
  return (
    <div className="field">
      <span>{label}</span>

      <strong>
        {formatDisplayValue(value)}
      </strong>
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

function UploadRecord({ onRecordUploaded }) {
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // ====================================================
  // FILE SELECTION
  // ====================================================

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a PDF, JPG or PNG file."
      );

      setSelectedFile(null);
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 10 MB."
      );

      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  // ====================================================
  // SAFE JSON RESPONSE
  // ====================================================

  async function getResponseData(response) {
    const contentType =
      response.headers.get("content-type") || "";

    if (
      contentType.includes("application/json")
    ) {
      return await response.json();
    }

    const text =
      await response.text();

    return {
      detail:
        text ||
        "Server returned an unexpected response.",
    };
  }

  // ====================================================
  // UPLOAD + OCR + VALIDATION + EXPLAINABILITY
  // ====================================================

  async function handleUpload() {
    if (!selectedFile) {
      setError(
        "Please select a land record first."
      );

      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedFile
    );

    try {
      // ==================================================
      // STEP 1: UPLOAD
      // ==================================================

      const uploadResponse =
        await fetch(
          `${API_BASE}/api/records/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await getResponseData(
          uploadResponse
        );

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.detail ||
          uploadData.message ||
          "Upload failed."
        );
      }

      const recordId =
        uploadData.record?.record_id ||
        uploadData.record_id;

      if (!recordId) {
        throw new Error(
          "Record ID was not returned by the server."
        );
      }

      console.log("Record uploaded & processed successfully:", recordId);

      // Backend /api/records/upload now returns complete payload
      let verificationData = uploadData.verification;

      if (!verificationData) {
        try {
          const explainResponse = await fetch(
            `${API_BASE}/api/records/explain/${recordId}`,
            { method: "POST" }
          );
          if (explainResponse.ok) {
            const expData = await explainResponse.json();
            verificationData = expData.verification;
          }
        } catch (e) {
          console.warn("Could not fetch additional explanation:", e);
        }
      }

      const combinedResult = {
        record_id: recordId,
        record: uploadData.record || {},
        fields:
          uploadData.extraction?.fields ||
          uploadData.fields ||
          {},
        extraction_confidence:
          uploadData.extraction?.confidence ??
          uploadData.confidence ??
          0,
        validation:
          uploadData.validation || null,
        verification:
          verificationData || null,
        raw_text:
          uploadData.raw_text || "",
      };

      console.log("FINAL COMBINED RESULT:", combinedResult);

      setResult(combinedResult);
      if (typeof onRecordUploaded === "function") {
        onRecordUploaded(combinedResult);
      }

      setSelectedFile(null);

    } catch (error) {
      console.error(
        "Upload processing error:",
        error
      );

      setError(
        error.message ||
        "Something went wrong while processing the land record."
      );

    } finally {
      setUploading(false);
    }
  }

  // ====================================================
  // STEP 5H: HUMAN DECISION
  // ====================================================

  async function handleDecision(
    decision
  ) {
    if (!result?.record_id) {
      setError(
        "Record ID is missing. Cannot verify record."
      );

      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `${API_BASE}/api/records/verify/${result.record_id}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              decision:
                decision,

              verifier:
                "SIH-Demo-Verifier",
            }),
          }
        );

      const data =
        await getResponseData(
          response
        );

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          "Human verification failed."
        );
      }

      console.log(
        "Human decision:",
        data
      );

      // ==================================================
      // UPDATE VERIFICATION RESULT
      // ==================================================

      setResult(
        (previous) => ({
          ...previous,

          verification:
            data.verification ||
            previous.verification,
        })
      );

    } catch (error) {
      console.error(
        "Human verification error:",
        error
      );

      setError(
        error.message ||
        "Verification failed."
      );
    }
  }

  // ====================================================
  // EXTRACT FIELDS SAFELY
  // ====================================================

  const fields =
    result?.fields || {};

  const owners =
    Array.isArray(fields.owners)
      ? fields.owners
      : [];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="upload-page">

      <div className="upload-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="upload-heading">

          <div className="upload-icon">
            <Upload size={25} />
          </div>

          <div>

            <h2>
              Upload Land Record
            </h2>

            <p>
              Upload a scanned land
              document for AI-powered
              digitization.
            </p>

          </div>

        </div>

        {/* =================================================
            FILE INPUT
        ================================================= */}

        <label className="drop-zone">

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={
              handleFileChange
            }
            hidden
            disabled={uploading}
          />

          <FileText size={42} />

          <strong>
            Click to select document
          </strong>

          <span>
            PDF, JPG or PNG •
            Maximum 10 MB
          </span>

        </label>

        {/* =================================================
            SELECTED FILE
        ================================================= */}

        {selectedFile && (

          <div className="selected-file">

            <FileText size={20} />

            <div>

              <strong>
                {selectedFile.name}
              </strong>

              <small>
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)} MB
              </small>

            </div>

          </div>

        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="upload-error">

            <AlertCircle size={18} />

            <span>
              {error}
            </span>

          </div>

        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <div className="extraction-result">

            {/* =============================================
                SUCCESS HEADER
            ============================================= */}

            <div className="result-header">

              <CheckCircle size={22} />

              <div>

                <strong>
                  Land Record Digitized
                  Successfully
                </strong>

                <p>
                  Record ID:{" "}
                  {result.record_id}
                </p>

              </div>

            </div>

            {/* =============================================
                EXTRACTION COMPLETENESS
            ============================================= */}

            <div className="confidence-box">

              <span>
                Extraction Completeness
              </span>

              <strong>
                {
                  result.extraction_confidence ??
                  0
                }%
              </strong>

            </div>

            {/* =============================================
                EXTRACTED FIELDS
            ============================================= */}

            <div className="fields-grid">

              {/* OWNER */}

              <Field
                label="Owner Name"
                value={
                  owners.length
                    ? owners
                        .map(
                          (owner) =>
                            owner?.name ||
                            "Unknown owner"
                        )
                        .join(", ")
                    : null
                }
              />

              {/* FATHER / HUSBAND */}

              <Field
                label="Father / Husband"
                value={
                  owners.length
                    ? owners
                        .map(
                          (owner) =>
                            owner?.father_name
                        )
                        .filter(Boolean)
                        .join(", ")
                    : null
                }
              />

              {/* RELATIONSHIP */}

              <Field
                label="Relationship"
                value={
                  owners.length
                    ? owners
                        .map(
                          (owner) =>
                            owner?.relationship
                        )
                        .filter(Boolean)
                        .join(", ")
                    : null
                }
              />

              {/* OWNERSHIP SHARE */}

              <Field
                label="Ownership Share"
                value={
                  owners.length
                    ? owners
                        .map(
                          (owner) =>
                            owner?.ownership_share
                        )
                        .filter(Boolean)
                        .join(", ")
                    : null
                }
              />

              {/* OWNER MOBILE */}

              <Field
                label="Owner Mobile"
                value={
                  fields.owner_mobile
                }
              />

              {/* AADHAAR CARD */}

              <Field
                label="Aadhaar Card"
                value={
                  fields.owner_aadhar
                }
              />

              {/* PAN CARD */}

              <Field
                label="PAN Card"
                value={
                  fields.owner_pan
                }
              />

              {/* DISTRICT */}

              <Field
                label="District"
                value={
                  fields.district
                }
              />

              {/* VILLAGE */}

              <Field
                label="Village"
                value={
                  fields.village
                }
              />

              {/* SURVEY NUMBER */}

              <Field
                label="Survey Number"
                value={
                  fields.survey_number
                }
              />

              {/* LAND AREA */}

              <Field
                label="Land Area"
                value={
                  fields.land_area
                }
              />

              {/* LAND TYPE */}

              <Field
                label="Land Type"
                value={
                  fields.land_type
                }
              />

              {/* REGISTRATION DATE */}

              <Field
                label="Registration Date"
                value={
                  fields.registration_date
                }
              />

              {/* DOCUMENT NUMBER */}

              <Field
                label="Document Number"
                value={
                  fields.registration_number
                }
              />

            </div>

            {/* =============================================
                EXTRA DETAILS
            ============================================= */}

            <div className="fields-grid">

              <Field
                label="Khata Number"
                value={
                  fields.khata_number
                }
              />

              <Field
                label="Khesra / Plot Number"
                value={
                  fields.khesra_number
                }
              />

              <Field
                label="Mutation Number"
                value={
                  fields.mutation_number
                }
              />

              <Field
                label="Mutation Date"
                value={
                  fields.mutation_date
                }
              />

              <Field
                label="ULPIN / Bhu-Aadhaar"
                value={
                  fields.ulpin
                }
              />

              <Field
                label="Record Status"
                value={
                  fields.record_status
                }
              />

            </div>

            {/* =============================================
                VALIDATION RESULT
            ============================================= */}

            {result.validation && (

              <ValidationResult
                validation={
                  result.validation
                }
              />

            )}

            {/* =============================================
                HUMAN VERIFICATION
            ============================================= */}

            {result.verification && (

              <VerificationDashboard
                result={result}
                onDecision={
                  handleDecision
                }
              />

            )}

          </div>

        )}

        {/* =================================================
            PROCESS BUTTON
        ================================================= */}

        <button
          className="process-button"
          onClick={handleUpload}
          disabled={
            !selectedFile ||
            uploading
          }
        >

          {uploading ? (

            <>
              <Loader2
                size={18}
                className="spin"
              />

              Processing...
            </>

          ) : (

            <>
              <Upload size={18} />

              Upload & Process
            </>

          )}

        </button>

      </div>

    </div>
  );
}

export default UploadRecord;