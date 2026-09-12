import re
from datetime import datetime


# =========================================================
# REQUIRED FIELDS
# =========================================================

REQUIRED_FIELDS = [
    "owner_name",
    "district",
    "village",
    "survey_number",
    "area"
]


# =========================================================
# FIELD DISPLAY NAMES
# =========================================================

FIELD_NAMES = {

    "owner_name": "Owner Name",

    "father_name": "Father / Husband Name",

    "district": "District",

    "village": "Village",

    "survey_number": "Survey Number",

    "area": "Land Area",

    "land_type": "Land Type",

    "registration_date": "Registration Date",

    "document_number": "Document Number"
}


# =========================================================
# 1. COMPLETENESS VALIDATION
# =========================================================

def validate_completeness(fields):

    results = []

    missing_fields = []


    for field in REQUIRED_FIELDS:

        value = fields.get(field)
        if (value is None or not str(value).strip()) and field == "area":
            value = fields.get("land_area")

        if value is None or not str(value).strip():

            missing_fields.append(
                FIELD_NAMES[field]
            )

            results.append({

                "field": field,

                "status": "FAIL",

                "severity": "HIGH",

                "message":
                    f"{FIELD_NAMES[field]} is missing"

            })

        else:

            results.append({

                "field": field,

                "status": "PASS",

                "severity": "NONE",

                "message":
                    f"{FIELD_NAMES[field]} detected"

            })


    return {
        "passed": len(missing_fields) == 0,
        "missing_fields": missing_fields,
        "checks": results
    }


# =========================================================
# 2. SURVEY NUMBER VALIDATION
# =========================================================

def validate_survey_number(value):

    if not value:

        return {

            "status": "FAIL",

            "severity": "HIGH",

            "message": "Survey number is missing"

        }


    # Examples:
    # 145
    # 145/2
    # 145-A
    # 145/2-B

    pattern = r"^[A-Za-z0-9]+(?:[\/\-][A-Za-z0-9]+)*$"


    if re.match(pattern, value):

        return {

            "status": "PASS",

            "severity": "NONE",

            "message":
                "Survey number format appears valid"

        }


    return {

        "status": "WARNING",

        "severity": "MEDIUM",

        "message":
            "Survey number has an unusual format"

    }


# =========================================================
# 3. AREA VALIDATION
# =========================================================

def validate_area(value):

    if not value:

        return {

            "status": "FAIL",

            "severity": "HIGH",

            "message": "Land area is missing"

        }


    match = re.search(
        r"([0-9]+(?:\.[0-9]+)?)",
        str(value)
    )


    if not match:

        return {

            "status": "WARNING",

            "severity": "MEDIUM",

            "message":
                "Could not determine numeric land area"

        }


    area = float(
        match.group(1)
    )


    if area <= 0:

        return {

            "status": "FAIL",

            "severity": "HIGH",

            "message":
                "Land area must be greater than zero"

        }


    # Prototype anomaly threshold.
    # This is NOT a legal land-size limit.

    if area > 1000:

        return {

            "status": "WARNING",

            "severity": "HIGH",

            "message":
                "Unusually large land area detected"

        }


    return {

        "status": "PASS",

        "severity": "NONE",

        "message":
            "Land area appears reasonable"

    }


# =========================================================
# 4. DATE VALIDATION
# =========================================================

def validate_date(value):

    if not value:

        return {

            "status": "WARNING",

            "severity": "MEDIUM",

            "message":
                "Registration date not detected"

        }


    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d/%m/%y",
        "%d-%m-%y"
    ]


    for date_format in formats:

        try:

            parsed_date = datetime.strptime(
                value,
                date_format
            )


            if parsed_date > datetime.now():

                return {

                    "status": "WARNING",

                    "severity": "HIGH",

                    "message":
                        "Registration date is in the future"

                }


            return {

                "status": "PASS",

                "severity": "NONE",

                "message":
                    "Registration date appears valid"

            }


        except ValueError:

            continue


    return {

        "status": "WARNING",

        "severity": "MEDIUM",

        "message":
            "Registration date has an unusual format"

    }


# =========================================================
# 5. TEXT SANITY VALIDATION
# =========================================================

def validate_text_field(
    field_name,
    value
):

    if not value:

        return {

            "status": "WARNING",

            "severity": "MEDIUM",

            "message":
                f"{FIELD_NAMES[field_name]} not detected"

        }


    value = str(value).strip()


    if len(value) < 2:

        return {

            "status": "WARNING",

            "severity": "MEDIUM",

            "message":
                f"{FIELD_NAMES[field_name]} is unusually short"

        }


    return {

        "status": "PASS",

        "severity": "NONE",

        "message":
            f"{FIELD_NAMES[field_name]} looks reasonable"

    }


# =========================================================
# 6. CROSS-FIELD VALIDATION
# =========================================================

def validate_cross_fields(fields):

    checks = []


    owner = fields.get(
        "owner_name"
    )

    father = fields.get(
        "father_name"
    )


    # Owner and father name shouldn't be identical
    if (
        owner and
        father and
        owner.lower().strip() ==
        father.lower().strip()
    ):

        checks.append({

            "status": "WARNING",

            "severity": "MEDIUM",

            "message":
                "Owner name and father/husband name are identical"

        })


    else:

        checks.append({

            "status": "PASS",

            "severity": "NONE",

            "message":
                "Owner relationship fields appear consistent"

        })


    return checks


# =========================================================
# 7. RISK SCORE
# =========================================================

def calculate_risk_score(
    validation_results
):

    score = 0


    severity_weights = {

        "LOW": 5,

        "MEDIUM": 15,

        "HIGH": 30

    }


    for result in validation_results:

        severity = result.get(
            "severity",
            "NONE"
        )


        score += severity_weights.get(
            severity,
            0
        )


    return min(
        score,
        100
    )


# =========================================================
# 8. OVERALL STATUS
# =========================================================

def determine_status(
    risk_score
):

    if risk_score <= 15:

        return {

            "status": "VERIFIED",

            "risk_level": "LOW"

        }


    if risk_score <= 40:

        return {

            "status": "REVIEW",

            "risk_level": "MEDIUM"

        }


    return {

        "status": "REVIEW",

        "risk_level": "HIGH"

    }


# =========================================================
# MAIN VALIDATION FUNCTION
# =========================================================

def validate_land_record(fields):

    all_checks = []


    # -----------------------------------------------
    # Completeness
    # -----------------------------------------------

    completeness = validate_completeness(
        fields
    )

    all_checks.extend(
        completeness["checks"]
    )


    # -----------------------------------------------
    # Survey Number
    # -----------------------------------------------

    survey_result = validate_survey_number(
        fields.get("survey_number")
    )

    all_checks.append({

        "field": "survey_number",

        **survey_result

    })


    # -----------------------------------------------
    # Area
    # -----------------------------------------------

    area_result = validate_area(
        fields.get("area") or fields.get("land_area")
    )

    all_checks.append({

        "field": "area",

        **area_result

    })


    # -----------------------------------------------
    # Date
    # -----------------------------------------------

    date_result = validate_date(
        fields.get("registration_date")
    )

    all_checks.append({

        "field": "registration_date",

        **date_result

    })


    # -----------------------------------------------
    # Text fields
    # -----------------------------------------------

    for field in [
        "owner_name",
        "district",
        "village"
    ]:

        result = validate_text_field(

            field,

            fields.get(field)

        )

        all_checks.append({

            "field": field,

            **result

        })


    # -----------------------------------------------
    # Cross-field validation
    # -----------------------------------------------

    cross_checks = validate_cross_fields(
        fields
    )

    for check in cross_checks:

        all_checks.append({

            "field": "cross_field",

            **check

        })


    # -----------------------------------------------
    # Risk calculation
    # -----------------------------------------------

    risk_score = calculate_risk_score(
        all_checks
    )


    overall = determine_status(
        risk_score
    )


    # -----------------------------------------------
    # Summary
    # -----------------------------------------------

    passed = sum(
        1
        for check in all_checks
        if check["status"] == "PASS"
    )


    warnings = sum(
        1
        for check in all_checks
        if check["status"] == "WARNING"
    )


    failures = sum(
        1
        for check in all_checks
        if check["status"] == "FAIL"
    )


    return {

        "overall_status":
            overall["status"],

        "risk_level":
            overall["risk_level"],

        "risk_score":
            risk_score,

        "summary": {

            "total_checks":
                len(all_checks),

            "passed":
                passed,

            "warnings":
                warnings,

            "failures":
                failures

        },

        "checks":
            all_checks

    }
