# =========================================================
# LAND RECORD FIELD EXTRACTOR
# BhoomiProof AI
# =========================================================

import re


# =========================================================
# VALUE CLEANING
# =========================================================

def clean_value(value):

    if value is None:
        return None


    value = str(value)


    # Normalize spaces

    value = re.sub(
        r"[ \t]+",
        " ",
        value
    )


    # Normalize strange OCR characters

    value = value.replace(
        "\u00a0",
        " "
    )


    value = value.strip()


    # Remove leading separators

    value = re.sub(
        r"^[\s:;,\-|]+",
        "",
        value
    )


    value = value.strip()


    if not value:
        return None


    return value


# =========================================================
# NORMALIZE OCR TEXT
# =========================================================

def normalize_text(text):

    if not text:

        return ""


    text = str(text)


    # Normalize line endings

    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )


    # Normalize unusual spaces

    text = text.replace(
        "\u00a0",
        " "
    )


    # Remove null characters

    text = text.replace(
        "\x00",
        ""
    )


    return text


# =========================================================
# OCR LABEL NORMALIZATION
# =========================================================

def normalize_label_for_ocr(label):

    """
    Create a regex pattern tolerant of OCR spacing.
    """

    words = label.split()


    return r"\s+".join(
        re.escape(word)
        for word in words
    )


# =========================================================
# REMOVE TRAILING FIELD LABEL
# =========================================================

FIELD_LABELS = [

    "District",

    "Village",

    "Khata Number",

    "Survey Number",

    "Khesra / Plot Number",

    "Land Area",

    "Area",

    "Land Type",

    "Owner Name",

    "Father's Name",

    "Father Name",

    "Relationship",

    "Ownership Share",

    "Registration Date",

    "Registration Number",

    "Mutation Number",

    "Mutation Date",

    "ULPIN / Bhu-Aadhaar",

    "ULPIN",

    "Bhu-Aadhaar",

    "Record ID",

    "Verification Code",

    "Record Status"

]


def remove_trailing_labels(value):

    if not value:

        return None


    value = clean_value(
        value
    )


    if not value:

        return None


    # If OCR captured another label after the value,
    # remove it.

    for label in FIELD_LABELS:

        pattern = rf"\s+{normalize_label_for_ocr(label)}\s*:?.*$"


        value = re.sub(

            pattern,

            "",

            value,

            flags=re.IGNORECASE

        )


    return clean_value(
        value
    )


# =========================================================
# EXTRACT FIELD AFTER LABEL
# =========================================================

def extract_after_label(
    text,
    label
):

    if not text or not label:

        return None


    text = normalize_text(
        text
    )


    label_pattern = (
        normalize_label_for_ocr(label)
    )


    # =====================================================
    # CASE 1
    # Label on one line
    # Value on next line
    #
    # District
    # Madhubani
    # =====================================================

    pattern = rf"""

        (?im)

        ^\s*

        {label_pattern}

        \s*

        [:;]?

        \s*

        \n

        \s*

        ([^\n]+)

    """


    match = re.search(

        pattern,

        text,

        re.IGNORECASE |

        re.VERBOSE

    )


    if match:

        value = clean_value(
            match.group(1)
        )


        if value:

            if value.lower() != label.lower():

                return remove_trailing_labels(
                    value
                )


    # =====================================================
    # CASE 2
    #
    # District: Madhubani
    #
    # District - Madhubani
    #
    # District Madhubani
    # =====================================================

    pattern = rf"""

        (?im)

        ^\s*

        {label_pattern}

        \s*

        (?:

            :

            |

            -

            |

            \|

            |

            ;

        )?

        \s*

        ([^\n]+)

    """


    match = re.search(

        pattern,

        text,

        re.IGNORECASE |

        re.VERBOSE

    )


    if match:

        value = clean_value(
            match.group(1)
        )


        if value:

            if value.lower() != label.lower():

                return remove_trailing_labels(
                    value
                )


    # =====================================================
    # CASE 3
    #
    # OCR may remove line structure
    #
    # District Madhubani
    # =====================================================

    pattern = rf"""

        {label_pattern}

        \s+

        ([A-Za-z0-9][^\n]*)

    """


    match = re.search(

        pattern,

        text,

        re.IGNORECASE |

        re.VERBOSE

    )


    if match:

        value = clean_value(
            match.group(1)
        )


        if value:

            if value.lower() != label.lower():

                return remove_trailing_labels(
                    value
                )


    return None


# =========================================================
# EXTRACT MULTIPLE FIELD VALUES
# =========================================================

def extract_all_after_label(
    text,
    label
):

    if not text or not label:

        return []


    text = normalize_text(
        text
    )


    label_pattern = (
        normalize_label_for_ocr(label)
    )


    results = []


    # =====================================================
    # CASE 1: NEXT LINE
    # =====================================================

    pattern = rf"""

        (?im)

        ^\s*

        {label_pattern}

        \s*

        [:;]?

        \s*

        \n

        \s*

        ([^\n]+)

    """


    matches = re.findall(

        pattern,

        text,

        re.IGNORECASE |

        re.VERBOSE

    )


    for value in matches:

        value = clean_value(
            value
        )


        if not value:

            continue


        if value.lower() == label.lower():

            continue


        value = remove_trailing_labels(
            value
        )


        if value:

            results.append(
                value
            )


    # =====================================================
    # CASE 2: SAME LINE
    # =====================================================

    pattern = rf"""

        (?im)

        ^\s*

        {label_pattern}

        \s*

        (?:

            :

            |

            -

            |

            \|

            |

            ;

        )?

        \s*

        ([^\n]+)

    """


    matches = re.findall(

        pattern,

        text,

        re.IGNORECASE |

        re.VERBOSE

    )


    for value in matches:

        value = clean_value(
            value
        )


        if not value:

            continue


        if value.lower() == label.lower():

            continue


        value = remove_trailing_labels(
            value
        )


        if value:

            if value not in results:

                results.append(
                    value
                )


    # =====================================================
    # REMOVE DUPLICATES
    # =====================================================

    unique_results = []


    for value in results:

        if value not in unique_results:

            unique_results.append(
                value
            )


    return unique_results


# =========================================================
# SMART FIELD EXTRACTION
# =========================================================

def extract_field(
    text,
    labels
):

    """
    Try multiple possible labels.
    """

    for label in labels:

        value = extract_after_label(
            text,
            label
        )


        if value:

            return value


    return None


# =========================================================
# MAIN LAND RECORD EXTRACTION
# =========================================================

def extract_land_record_fields(text):

    text = normalize_text(
        text
    )


    # =====================================================
    # LOCATION
    # =====================================================

    district = extract_field(

        text,

        [

            "District",

            "DISTRICT"

        ]

    )


    village = extract_field(

        text,

        [

            "Village",

            "VILLAGE",

            "Village Name"

        ]

    )


    # =====================================================
    # LAND PARCEL
    # =====================================================

    khata_number = extract_field(

        text,

        [

            "Khata Number",

            "Khata No",

            "Khata"

        ]

    )


    survey_number = extract_field(

        text,

        [

            "Survey Number",

            "Survey No",

            "Survey",

            "Khasra Number",

            "Khasra No"

        ]

    )


    khesra_number = extract_field(

        text,

        [

            "Khesra / Plot Number",

            "Khesra Number",

            "Khesra No",

            "Plot Number",

            "Plot No"

        ]

    )


    land_area = extract_field(

        text,

        [

            "Land Area",

            "Area",

            "Land Size"

        ]

    )


    land_type = extract_field(

        text,

        [

            "Land Type",

            "Property Type",

            "Land Classification"

        ]

    )


    # =====================================================
    # OWNER
    # =====================================================

    owners = []


    for label in [

        "Owner Name",

        "Owner",

        "Name of Owner"

    ]:

        owners = extract_all_after_label(

            text,

            label

        )


        if owners:

            break


    fathers = []


    for label in [

        "Father's Name",

        "Father Name",

        "Father / Husband Name",

        "Husband Name"

    ]:

        fathers = extract_all_after_label(

            text,

            label

        )


        if fathers:

            break


    relationships = extract_all_after_label(

        text,

        "Relationship"

    )


    ownership_shares = extract_all_after_label(

        text,

        "Ownership Share"

    )


    # =====================================================
    # REGISTRATION
    # =====================================================

    registration_date = extract_field(

        text,

        [

            "Registration Date",

            "Date of Registration",

            "Registered Date"

        ]

    )


    registration_number = extract_field(

        text,

        [

            "Registration Number",

            "Registration No",

            "Reg Number",

            "Reg No"

        ]

    )


    # =====================================================
    # MUTATION
    # =====================================================

    mutation_number = extract_field(

        text,

        [

            "Mutation Number",

            "Mutation No"

        ]

    )


    mutation_date = extract_field(

        text,

        [

            "Mutation Date",

            "Date of Mutation"

        ]

    )


    # =====================================================
    # DIGITAL IDENTIFICATION
    # =====================================================

    ulpin = extract_field(

        text,

        [

            "ULPIN / Bhu-Aadhaar",

            "ULPIN",

            "Bhu-Aadhaar"

        ]

    )


    record_id = extract_field(

        text,

        [

            "Record ID",

            "Record Number"

        ]

    )


    verification_code = extract_field(

        text,

        [

            "Verification Code",

            "Verification ID"

        ]

    )


    record_status = extract_field(

        text,

        [

            "Record Status",

            "Status"

        ]

    )


    # =====================================================
    # BUILD OWNER OBJECTS
    # =====================================================

    owner_records = []


    max_owners = max(

        len(owners),

        len(fathers),

        len(relationships),

        len(ownership_shares),

        0

    )


    for index in range(
        max_owners
    ):

        owner_records.append({

            "name":

                owners[index]

                if index < len(owners)

                else None,


            "father_name":

                fathers[index]

                if index < len(fathers)

                else None,


            "relationship":

                relationships[index]

                if index < len(relationships)

                else None,


            "ownership_share":

                ownership_shares[index]

                if index < len(ownership_shares)

                else None

        })


    # =====================================================
    # PRIMARY OWNER
    # =====================================================

    primary_owner = (

        owner_records[0]

        if owner_records

        else {}

    )


    owner_name = primary_owner.get(
        "name"
    )


    father_name = primary_owner.get(
        "father_name"
    )


    # =====================================================
    # FINAL RESULT
    # =====================================================

    return {

        "owner_name":
            owner_name,

        "father_name":
            father_name,

        "district":
            district,

        "village":
            village,

        "survey_number":
            survey_number,

        "land_area":
            land_area,

        "land_type":
            land_type,

        "registration_date":
            registration_date,

        "registration_number":
            registration_number,

        "khata_number":
            khata_number,

        "khesra_number":
            khesra_number,

        "owners":
            owner_records,

        "mutation_number":
            mutation_number,

        "mutation_date":
            mutation_date,

        "ulpin":
            ulpin,

        "record_id":
            record_id,

        "verification_code":
            verification_code,

        "record_status":
            record_status
    }


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

extract_land_fields = (
    extract_land_record_fields
)