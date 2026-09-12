from datetime import datetime


# =========================================================
# VERIFICATION DECISIONS
# =========================================================

VALID_DECISIONS = [
    "ACCEPT",
    "REVIEW",
    "REJECT"
]


# =========================================================
# EXPLANATION GENERATOR
# =========================================================

def generate_explanations(validation):

    explanations = []

    checks = validation.get(
        "checks",
        []
    )

    for check in checks:

        status = check.get(
            "status"
        )

        severity = check.get(
            "severity"
        )

        message = check.get(
            "message"
        )

        field = check.get(
            "field"
        )


        # -----------------------------------------
        # FAILED CHECK
        # -----------------------------------------

        if status == "FAIL":

            explanations.append({

                "type": "FAILURE",

                "field": field,

                "severity": severity,

                "title": "Validation failed",

                "reason": message,

                "action":
                    "Human verification required"

            })


        # -----------------------------------------
        # WARNING
        # -----------------------------------------

        elif status == "WARNING":

            explanations.append({

                "type": "ANOMALY",

                "field": field,

                "severity": severity,

                "title": "Potential inconsistency detected",

                "reason": message,

                "action":
                    "Review the original document"

            })


    return explanations


# =========================================================
# RECOMMENDATION
# =========================================================

def generate_recommendation(
    validation
):

    status = validation.get(
        "overall_status"
    )

    risk_level = validation.get(
        "risk_level"
    )

    risk_score = validation.get(
        "risk_score",
        0
    )


    if (
        status == "VERIFIED" and
        risk_level == "LOW"
    ):

        return {

            "decision":
                "ACCEPT",

            "message":
                "Record passed the configured automated checks.",

            "human_verification":
                False

        }


    if risk_level == "MEDIUM":

        return {

            "decision":
                "REVIEW",

            "message":
                "Potential inconsistencies require human verification.",

            "human_verification":
                True

        }


    return {

        "decision":
            "REVIEW",

        "message":
            "Multiple or high-severity validation issues detected.",

        "human_verification":
            True

    }


# =========================================================
# CREATE VERIFICATION RESULT
# =========================================================

def create_verification_result(
    validation
):

    explanations = generate_explanations(
        validation
    )

    recommendation = generate_recommendation(
        validation
    )


    return {

        "verification_status":
            "PENDING",

        "recommended_decision":
            recommendation["decision"],

        "risk_score":
            validation.get(
                "risk_score",
                0
            ),

        "risk_level":
            validation.get(
                "risk_level",
                "UNKNOWN"
            ),

        "explanations":
            explanations,

        "recommendation":
            recommendation,

        "verified_by":
            None,

        "verified_at":
            None

    }


# =========================================================
# HUMAN DECISION
# =========================================================

def apply_human_decision(
    verification,
    decision,
    verifier="demo-user"
):

    decision = decision.upper()


    if decision not in VALID_DECISIONS:

        raise ValueError(
            "Invalid verification decision"
        )


    verification["verification_status"] = (
        decision
    )

    verification["verified_by"] = (
        verifier
    )

    verification["verified_at"] = (
        datetime.now().isoformat()
    )


    return verification