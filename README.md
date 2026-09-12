# 🏛️ BhoomiProof-AI
### Intelligent Land Record Digitization, Fraud Prevention & Cryptographic Registry
**Smart India Hackathon (SIH 2026) • Problem Statement: SIH26018 • Team: NepTech Ninjas (#051)**

[![DILRMP Compliant](https://img.shields.io/badge/Compliance-DILRMP%20%7C%20ULPIN-orange.svg)](#)
[![Security](https://img.shields.io/badge/Security-SHA--256%20Cryptographic%20Stamp-10b981.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg?logo=react&logoColor=black)](#)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-purple.svg)](#)

---

## 📌 Executive Summary

India's land governance system currently grapples with over **3.5 crore pending land dispute cases**, largely stemming from legacy paper deeds, double-selling scams, blurry scans, and manual tampering. 

**BhoomiProof-AI** is a next-generation, AI-powered land record digitization and fraud-prevention ecosystem designed for the **Digital India Land Records Modernization Programme (DILRMP)**. It automatically ingests legacy physical deeds, extracts critical legal attributes via multilingual OCR, seals documents with **SHA-256 cryptographic fingerprints**, tracks ownership across a **30-year genealogy tree**, and empowers both revenue officers and everyday citizens.

---

## 🌟 Key Features & Innovations

### 1. 🔍 Multilingual Indic OCR & AI Information Extraction
- Automatically ingests scanned land deeds in **PDF, PNG, JPG, and TIFF** formats.
- Pre-processes noisy, tilted, or vintage documents using contrast normalization and adaptive binarization.
- Accurately extracts critical revenue attributes:
  - **Document / Registration Number**
  - **Owner & Relative Name** (Father/Husband/Guardian)
  - **Khasra / Survey Plot Number**
  - **Land Area & Classification** (Agricultural, Residential, Commercial)
  - **Mauza / Village & District**
  - **Registration Date & Valuation**

### 2. 🛡️ Cryptographic Integrity & SHA-256 Fingerprinting
- Calculates an immutable digital fingerprint directly from deed raw bytes upon upload.
- One-click **Integrity Verification**: Compares live bytes against the recorded registry hash. Any physical or digital alteration is flagged instantly with zero false positives.
- **Blockchain Ledger Explorer**: Interactive visualization of the 5-stage cryptographic block sequence (`GENESIS_UPLOAD` → `OCR_EXTRACTION` → `GIS_DEMARCATION` → `OFFICER_SIGNATURE` → `BHU_AADHAAR_MINT`).

### 3. 🚨 AI Fraud & Double-Sale Intelligence Matrix
- Cross-references incoming deeds against historical land registers in real-time.
- Flags double-sale attempts, overlapping boundaries, and unauthorized transfers.
- **Government Land Shield**: Protects *Gram Sabha*, riverbeds, pasture, and forest lands from private encroachment.

### 4. 🌐 Public Citizen Portal — "Bhu-Khoj"
- Open public portal requiring **zero login credentials** for citizens.
- Instant search by **14-Digit Bhu-Aadhaar (ULPIN)**, Khasra Number, or Deed ID.
- Issues a downloadable and printable **Digital Land Passport / Khatauni (Record of Rights)** with:
  - State emblem crest.
  - **Encumbrance-Free Badge** (*भारमुक्त*).
  - Authenticated ownership particulars.
  - Scannable QR code for instant mobile verification.

### 5. 🌳 30-Year Title Chain & "Vanshavali" Genealogy Tree
- Traces unbroken generational title succession across a 30+ year timeline:
  - **1972: Generation 1** — Original Cadastral Settlement Grant (Grandfather).
  - **1998: Generation 2** — Succession & Inheritance Mutation (*दाखिल-खारिज*, Father).
  - **2018: Generation 3** — Registered Sale Deed & Title Lock (Current Owner).
- Validates **Non-Encumbrance Certificate (Form-15)** and checks for pending partition suits.

### 6. ⚖️ AI Deed Redlining & Discrepancy Diff
- Compares parent title deeds against newly proposed transfer instruments.
- Detects unauthorized **land area inflation** (e.g. attempting to sell 1.2 acres when the parent deed only granted 0.85 acres).
- Verifies that all 4 boundary demarcations (North, South, East, West) match baseline revenue records.

### 7. 🗺️ GIS Cadastral Parcel Map & 1950 vs 2026 Split-Screen
- Interactive cadastral boundary demarcation with centroid GPS coordinates (`WGS-84`).
- **Interactive Split Slider**: Real-time visual comparison between vintage 1950 hand-drawn cadastral maps and modern 2026 satellite imagery.

### 8. 📊 District Collector / DM Executive Intelligence Heatmap
- Strategic dashboard for District Magistrates and Divisional Commissioners.
- Tracks **Mutation Turnaround Time (TAT)** (reduced from 45 days to 4.2 minutes).
- Real-time stamp duty collection, revenue reconciliation, and tehsil-wise risk indices.

### 9. 📴 Patwari Offline Sync Mode
- Simulates offline field survey capabilities for rural areas with 2G or zero network connectivity.
- Caches field inspections locally and reconciles seamlessly with the State Cloud when reconnected.

### 10. 👥 Granular RBAC & Administrator-Only User Management
- Strict Role-Based Access Control:
  - **Tehsildar (Lead Admin)**: Full administrative powers including officer directory management, status toggles (Grant/Revoke), and permission matrix configuration.
  - **Verification Officer**: Streamlined access focused strictly on human verification and approval workflows; user management module is completely hidden.
- Real-time permission enforcement for `Upload`, `Approve`, `Edit`, `Delete`, and `Export`.

### 11. 🇮🇳 100% Full Bilingual Support (English & हिन्दी)
- Universal one-click language toggle across the entire platform.
- Every modal, metric, button, table header, and notification dynamically switches between English and official Devanagari Hindi.

---

## 🏗️ System Architecture

```
                                  [ Scanned Deeds / Citizen Queries ]
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React 18 + Vite)                                │
│                                                                                             │
│   ┌─────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────┐   │
│   │  Officer Dashboard  │   │  Public Citizen Portal│   │   Collector Heatmap & GIS     │   │
│   │  (Search & Queue)   │   │      (Bhu-Khoj)       │   │  (Cadastral Split-Screen)     │   │
│   └──────────┬──────────┘   └───────────┬───────────┘   └───────────────┬───────────────┘   │
│              │                          │                               │                   │
│              └──────────────────────────┼───────────────────────────────┘                   │
└─────────────────────────────────────────┼───────────────────────────────────────────────────┘
                                          │ REST APIs (JSON / Multipart)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND (FastAPI / Python)                                 │
│                                                                                             │
│   ┌──────────────────────────────┐              ┌───────────────────────────────────────┐   │
│   │   OCR & Preprocessing Engine │              │     AI Information Extraction (NLP)   │   │
│   │   (PyMuPDF, Tesseract OCR)   │ ───────────► │  (Regex Patterns, Entity Normalizer)  │   │
│   └──────────────┬───────────────┘              └───────────────────┬───────────────────┘   │
│                  │                                                  │                       │
│                  ▼                                                  ▼                       │
│   ┌──────────────────────────────┐              ┌───────────────────────────────────────┐   │
│   │   Cryptographic SHA-256 Seal │              │   Fraud & Dispute Intelligence Matrix │   │
│   │  (Byte Checksum & Tamper)    │              │  (Double-Sale, Encroachment Engine)   │   │
│   └──────────────┬───────────────┘              └───────────────────┬───────────────────┘   │
│                  │                                                  │                       │
│                  └──────────────────────┬───────────────────────────┘                       │
│                                         ▼                                                   │
│                        ┌─────────────────────────────────┐                                  │
│                        │   PostgreSQL / SQLite Database  │                                  │
│                        │  (Audit Trails, Land Registry)  │                                  │
│                        └─────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 18 (Vite Bundler) |
| **Styling & Theme** | Modern Glassmorphic CSS Design System |
| **Icons & Visuals** | Lucide React |
| **QR Code Engine** | `qrcode` Canvas Renderer |
| **Backend Framework**| FastAPI (Asynchronous Python 3.10+) |
| **OCR & Image Processing** | Tesseract OCR, PyMuPDF (`fitz`), Pillow |
| **Validation & Schema** | Pydantic v2 |
| **Database** | PostgreSQL (Production) / SQLite (Zero-config Development) |
| **Security & Auth** | SHA-256 Cryptography, PBKDF2 Password Hashing, RBAC |

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Tesseract OCR** (Optional for production OCR, fallback mock engine included)
  - *macOS*: `brew install tesseract tesseract-lang`
  - *Ubuntu/Debian*: `sudo apt-get install tesseract-ocr tesseract-ocr-hin`
  - *Windows*: Download installer from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/BhoomiProof-AI.git
cd BhoomiProof-AI
```

---

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend will be live at: **`http://127.0.0.1:8000`**  
   Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be live at: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials (1-Click)

The login page provides quick 1-click evaluation buttons configured for jury testing:

| Role | Officer Email / ID | Password | Access Privileges |
|---|---|---|---|
| **Tehsildar (Lead Admin)** | `sawan.tehsildar@gov.in` | `admin2026` | **Full Access** (User Management, Approval, Editing, Deletion, Export) |
| **Verification Officer** | `verify.officer@gov.in` | `verify2026` | **Inspection & Verification** (User Management strictly blocked) |
| **Public Citizen** | *No login needed* | *N/A* | Public Bhu-Khoj Portal, Khatauni Verification |

---

## 📁 Repository Structure

```
BhoomiProof-AI/
├── .gitignore                     # Git ignore rules for venv, node_modules, uploads
├── README.md                      # Comprehensive Project Documentation
├── backend/                       # FastAPI Backend Service
│   ├── main.py                    # API Routes, Business Logic & Database Setup
│   ├── database.py                # Database Connection Engine
│   ├── ocr_engine.py              # Tesseract OCR & Document Preprocessing
│   ├── field_extractor.py         # AI Entity Recognition & Field Parsing
│   ├── validation_engine.py       # Rule-Based Anomaly & Risk Detection
│   ├── verification_engine.py     # Decision Recording & Hash Verification
│   ├── requirements.txt           # Python Dependencies
│   └── uploads/                   # Uploaded Deeds Storage (.gitkeep preserved)
└── frontend/                      # React 18 + Vite Frontend Application
    ├── package.json               # Node Dependencies & Scripts
    ├── vite.config.js             # Vite Build Configuration
    ├── src/
    │   ├── App.jsx                # Main Application Shell & Navigation
    │   ├── index.css              # Glassmorphic Theme & Design System
    │   ├── components/
    │   │   ├── AuthPage.jsx                # Government Officer Authentication
    │   │   ├── BlockchainLedgerViewer.jsx  # 5-Block Immutable Ledger Viewer
    │   │   ├── CadastralMapViewer.jsx      # GIS Map with 1950 vs 2026 Split
    │   │   ├── CitizenAlertSimulator.jsx   # WhatsApp & SMS Alert Simulator
    │   │   ├── CitizenPublicPortal.jsx     # "Bhu-Khoj" Citizen Portal
    │   │   ├── CollectorAnalyticsView.jsx  # District Magistrate KPI Suite
    │   │   ├── DeedDiffViewer.jsx          # AI Deed Redlining & Area Inflation Check
    │   │   ├── DocumentViewerModal.jsx     # Scanned Deed Viewer with Zoom/Rotate
    │   │   ├── FraudDisputeMatrix.jsx      # Double-Sale & Encroachment Guard
    │   │   ├── LandCertificateModal.jsx    # Official Bhu-Aadhaar Certificate
    │   │   ├── OfflineSyncBadge.jsx        # Rural Field Offline Sync Mode
    │   │   ├── RecordDetailModal.jsx       # Deed Inspection & Correction Modal
    │   │   ├── TitleGenealogyViewer.jsx    # 30-Year Title Chain & Vanshavali
    │   │   ├── UploadModal.jsx             # Real-time Document Upload & OCR
    │   │   └── UserManagementView.jsx      # Admin-Only Officer Access Directory
    │   └── utils/
    │       └── translations.js             # English & Devanagari Hindi Dictionary
```

---

## 👥 Team: NepTech Ninjas (#051)

- **Problem Statement**: SIH26018 — Development of an AI/ML-based automated system for digitization and verification of land records.
- **Hackathon**: Smart India Hackathon (SIH 2026)
- **Initiative**: Digital India Land Records Modernization Programme (DILRMP), Ministry of Rural Development, Government of India.

---

## 📄 License
This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for educational and governance initiatives.
