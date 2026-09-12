from validation_engine import validate_land_record


record = {

    "owner_name": "Ram Kumar",

    "father_name": "Shyam Kumar",

    "district": "Madhubani",

    "village": "",

    "survey_number": "145/2",

    "area": "5000 Acres",

    "land_type": "Agricultural",

    "registration_date": "12/04/2021",

    "document_number": "DOC-2021-4587"

}


result = validate_land_record(
    record
)


print("\n")
print("=" * 60)
print("LAND RECORD VALIDATION")
print("=" * 60)

print(
    "\nStatus:",
    result["overall_status"]
)

print(
    "Risk Level:",
    result["risk_level"]
)

print(
    "Risk Score:",
    result["risk_score"]
)


print("\nSummary:")

for key, value in result["summary"].items():

    print(
        f"{key}: {value}"
    )


print("\nChecks:")

for check in result["checks"]:

    print(
        f"[{check['status']}] "
        f"{check['message']}"
    )