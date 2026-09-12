import os
from pathlib import Path
from ocr_engine import extract_text

uploads_dir = Path("uploads")
test_file = None

if uploads_dir.exists():
    available_files = list(uploads_dir.glob("*.png")) + list(uploads_dir.glob("*.pdf")) + list(uploads_dir.glob("*.jpg"))
    if available_files:
        test_file = str(available_files[0])

if not test_file or not os.path.exists(test_file):
    print("No sample documents found in uploads/ folder to test.")
    exit(0)

print("\n" + "=" * 60)
print(f"OCR RESULT FOR: {test_file}")
print("=" * 60 + "\n")

text = extract_text(test_file)
print(text)
