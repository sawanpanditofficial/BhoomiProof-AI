from pathlib import Path
import io
import re

import cv2
import numpy as np
import pytesseract
import pymupdf
from PIL import Image


# =========================================================
# CONFIGURATION
# =========================================================

OCR_LANGUAGE = "eng"

# Multiple configurations improve OCR reliability
OCR_CONFIGS = [
    "--oem 3 --psm 6",
    "--oem 3 --psm 3",
    "--oem 3 --psm 4",
    "--oem 3 --psm 11",
]

# PDF rendering scale
PDF_RENDER_SCALE = 3.0

# Supported image formats
IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
}


# =========================================================
# VALIDATE FILE
# =========================================================

def validate_file(file_path):
    """
    Validate that the supplied file exists and is a file.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Path is not a file: {file_path}"
        )

    return path


# =========================================================
# IMAGE LOADING
# =========================================================

def load_image(image_path):
    """
    Load an image safely using OpenCV.

    OpenCV can sometimes fail with unusual paths or
    certain image formats, so PIL is used as fallback.
    """

    image_path = validate_file(
        image_path
    )

    # -----------------------------------------------------
    # Try OpenCV
    # -----------------------------------------------------

    image = cv2.imread(
        str(image_path),
        cv2.IMREAD_COLOR
    )

    if image is not None:
        return image

    # -----------------------------------------------------
    # PIL fallback
    # -----------------------------------------------------

    try:

        pil_image = Image.open(
            image_path
        ).convert("RGB")

        rgb = np.array(
            pil_image
        )

        return cv2.cvtColor(
            rgb,
            cv2.COLOR_RGB2BGR
        )

    except Exception as error:

        raise ValueError(
            f"Unable to read image file: "
            f"{image_path}. Error: {error}"
        )


# =========================================================
# RESIZE IMAGE
# =========================================================

def resize_for_ocr(image):
    """
    Resize small images before OCR.

    OCR generally performs better when text has
    sufficient pixel height.
    """

    if image is None:
        raise ValueError(
            "Invalid image supplied"
        )

    height, width = image.shape[:2]

    # If image is already large enough,
    # don't unnecessarily enlarge it.

    target_width = 1800

    if width < target_width:

        scale = (
            target_width / width
        )

        new_width = int(
            width * scale
        )

        new_height = int(
            height * scale
        )

        image = cv2.resize(
            image,
            (
                new_width,
                new_height
            ),
            interpolation=cv2.INTER_CUBIC
        )

    return image


# =========================================================
# IMAGE PREPROCESSING
# =========================================================

def preprocess_image_variants(image):
    """
    Create multiple versions of the same document.

    Different documents require different preprocessing,
    so instead of trusting one preprocessing method,
    we generate multiple OCR candidates.
    """

    if image is None:
        raise ValueError(
            "Invalid image supplied for preprocessing"
        )

    # -----------------------------------------------------
    # Resize
    # -----------------------------------------------------

    image = resize_for_ocr(
        image
    )


    # -----------------------------------------------------
    # Grayscale
    # -----------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )


    # -----------------------------------------------------
    # Denoising
    # -----------------------------------------------------

    denoised = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )


    # -----------------------------------------------------
    # OTSU threshold
    # -----------------------------------------------------

    _, otsu = cv2.threshold(
        denoised,
        0,
        255,
        cv2.THRESH_BINARY +
        cv2.THRESH_OTSU
    )


    # -----------------------------------------------------
    # Adaptive threshold
    # -----------------------------------------------------

    adaptive = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )


    # -----------------------------------------------------
    # Inverted adaptive threshold
    # -----------------------------------------------------

    adaptive_inv = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        31,
        11
    )


    # -----------------------------------------------------
    # Sharpened image
    # -----------------------------------------------------

    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])

    sharpened = cv2.filter2D(
        gray,
        -1,
        kernel
    )


    return {
        "gray": gray,
        "otsu": otsu,
        "adaptive": adaptive,
        "adaptive_inv": adaptive_inv,
        "sharpened": sharpened,
    }


# =========================================================
# CLEAN OCR TEXT
# =========================================================

def clean_ocr_text(text):
    """
    Clean unnecessary OCR whitespace while preserving
    line structure.
    """

    if not text:
        return ""

    # Normalize Windows line endings

    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )

    # Remove excessive spaces

    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    # Remove excessive blank lines

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    return text.strip()


# =========================================================
# OCR QUALITY SCORE
# =========================================================

def calculate_ocr_score(text):
    """
    Estimate OCR quality.

    This is not a confidence score from Tesseract.
    It is only used to select the most useful OCR
    candidate among several preprocessing/configuration
    combinations.
    """

    if not text:
        return 0


    score = 0


    # -----------------------------------------------------
    # Length
    # -----------------------------------------------------

    character_count = len(
        text.strip()
    )

    if character_count >= 20:
        score += 20

    if character_count >= 50:
        score += 10

    if character_count >= 100:
        score += 10


    # -----------------------------------------------------
    # Alphabetic content
    # -----------------------------------------------------

    letters = len(
        re.findall(
            r"[A-Za-z]",
            text
        )
    )

    if letters >= 10:
        score += 15

    if letters >= 30:
        score += 10


    # -----------------------------------------------------
    # Numbers
    # -----------------------------------------------------

    numbers = len(
        re.findall(
            r"\d",
            text
        )
    )

    if numbers >= 2:
        score += 10


    # -----------------------------------------------------
    # Land-record keywords
    # -----------------------------------------------------

    keywords = [
        "owner",
        "name",
        "father",
        "husband",
        "district",
        "village",
        "survey",
        "area",
        "land",
        "registration",
        "date",
        "document",
        "khasra",
        "plot",
    ]


    lower_text = text.lower()


    keyword_matches = sum(
        1
        for keyword in keywords
        if keyword in lower_text
    )


    score += min(
        keyword_matches * 5,
        25
    )


    return score


# =========================================================
# OCR SINGLE IMAGE
# =========================================================

def run_ocr(image):
    """
    Run multiple OCR configurations on one image
    and select the strongest result.
    """

    if image is None:
        raise ValueError(
            "Invalid image supplied for OCR"
        )


    variants = preprocess_image_variants(
        image
    )


    best_text = ""

    best_score = -1


    # -----------------------------------------------------
    # OCR each preprocessing variant
    # -----------------------------------------------------

    for variant_name, processed_image in variants.items():

        for config in OCR_CONFIGS:

            try:

                text = pytesseract.image_to_string(

                    processed_image,

                    lang=OCR_LANGUAGE,

                    config=config

                )


                text = clean_ocr_text(
                    text
                )


                score = calculate_ocr_score(
                    text
                )


                if score > best_score:

                    best_score = score

                    best_text = text


            except Exception:

                # One failed OCR configuration should
                # not stop the entire pipeline.

                continue


    return best_text


# =========================================================
# OCR IMAGE
# =========================================================

def extract_text_from_image(image):
    """
    Perform OCR on an OpenCV image.
    """

    if image is None:
        raise ValueError(
            "Invalid image supplied for OCR"
        )

    return run_ocr(
        image
    )


# =========================================================
# OCR PIL IMAGE
# =========================================================

def extract_text_from_pil_image(image):
    """
    Perform OCR on a PIL image.
    """

    if image is None:
        raise ValueError(
            "Invalid PIL image supplied"
        )


    # -----------------------------------------------------
    # Convert PIL → NumPy
    # -----------------------------------------------------

    rgb_image = np.array(
        image.convert("RGB")
    )


    # -----------------------------------------------------
    # RGB → BGR
    # -----------------------------------------------------

    bgr_image = cv2.cvtColor(
        rgb_image,
        cv2.COLOR_RGB2BGR
    )


    return extract_text_from_image(
        bgr_image
    )


# =========================================================
# OCR PDF PAGE
# =========================================================

def ocr_pdf_page(page):
    """
    Render a PDF page as an image and perform OCR.
    """

    pixmap = page.get_pixmap(

        matrix=pymupdf.Matrix(
            PDF_RENDER_SCALE,
            PDF_RENDER_SCALE
        ),

        alpha=False

    )


    image_bytes = pixmap.tobytes(
        "png"
    )


    image = Image.open(
        io.BytesIO(
            image_bytes
        )
    )


    return extract_text_from_pil_image(
        image
    )


# =========================================================
# PDF TEXT QUALITY CHECK
# =========================================================

def is_native_text_sufficient(text):
    """
    Determine whether native PDF text extraction
    produced enough useful content.

    Short or nearly empty text is treated as a
    scanned/image PDF.
    """

    if not text:
        return False


    cleaned = clean_ocr_text(
        text
    )


    if len(cleaned) < 20:
        return False


    # Count meaningful characters

    alphanumeric = len(
        re.findall(
            r"[A-Za-z0-9]",
            cleaned
        )
    )


    return alphanumeric >= 15


# =========================================================
# OCR PDF
# =========================================================

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF.

    Strategy:

    1. Try native PDF text extraction.
    2. If insufficient, perform OCR.
    3. Preserve page boundaries.
    """

    pdf_path = validate_file(
        pdf_path
    )


    document = None

    pages_text = []


    try:

        # -------------------------------------------------
        # Open PDF
        # -------------------------------------------------

        document = pymupdf.open(
            str(pdf_path)
        )


        # -------------------------------------------------
        # Process every page
        # -------------------------------------------------

        for page_number, page in enumerate(
            document,
            start=1
        ):

            # =============================================
            # NATIVE TEXT EXTRACTION
            # =============================================

            native_text = page.get_text(
                "text"
            )


            native_text = clean_ocr_text(
                native_text
            )


            # =============================================
            # DECIDE OCR
            # =============================================

            if is_native_text_sufficient(
                native_text
            ):

                page_text = native_text


            else:

                # =========================================
                # SCANNED PDF → OCR
                # =========================================

                page_text = ocr_pdf_page(
                    page
                )


            # =============================================
            # STORE PAGE
            # =============================================

            pages_text.append(

                f"\n--- PAGE {page_number} ---\n\n"
                f"{page_text.strip()}"

            )


    finally:

        if document is not None:

            document.close()


    # =====================================================
    # FINAL TEXT
    # =====================================================

    return clean_ocr_text(
        "\n".join(
            pages_text
        )
    )


# =========================================================
# OCR IMAGE FILE
# =========================================================

def extract_text_from_image_file(
    image_path
):
    """
    Read an image file and perform OCR.
    """

    image = load_image(
        image_path
    )


    return extract_text_from_image(
        image
    )


# =========================================================
# MAIN OCR FUNCTION
# =========================================================

def extract_text(file_path):
    """
    Automatically detect file type.

    Supported:

    PDF
    JPG
    JPEG
    PNG
    WEBP
    BMP
    TIFF
    """

    path = validate_file(
        file_path
    )


    extension = path.suffix.lower()


    # =====================================================
    # PDF
    # =====================================================

    if extension == ".pdf":

        return extract_text_from_pdf(
            str(path)
        )


    # =====================================================
    # IMAGE
    # =====================================================

    if extension in IMAGE_EXTENSIONS:

        return extract_text_from_image_file(
            str(path)
        )


    # =====================================================
    # UNSUPPORTED
    # =====================================================

    raise ValueError(

        "Unsupported file format. "

        "Supported formats: "

        "PDF, JPG, JPEG, PNG, WEBP, BMP, TIFF."

    )