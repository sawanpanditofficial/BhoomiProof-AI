import os
from pathlib import Path
from ocr_engine import extract_text
from field_extractor import extract_land_record_fields

uploads_dir = Path("uploads")
test_file = None

# Look for available test file
if uploads_dir.exists():
    available_files = list(uploads_dir.glob("*.png")) + list(uploads_dir.glob("*.pdf")) + list(uploads_dir.glob("*.jpg"))
    if available_files:
        test_file = str(available_files[0])

if not test_file or not os.path.exists(test_file):
    print("No sample documents found in uploads/ folder to test.")
    exit(0)

print("=" * 70)
print(f"LAND RECORD EXTRACTION TEST: {test_file}")
print("=" * 70)

# OCR
text = extract_text(test_file)

# Extraction
data = extract_land_record_fields(text)

print("\nEXTRACTED DATA")
print("=" * 70)

for key, value in data.items():
    print(f"\n{key}:")
    print(value)

print("\n" + "=" * 70)
print("EXTRACTION COMPLETE")
print("=" * 70)