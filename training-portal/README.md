# 🌸 Training Portal - Lotus Garden Hotel
### By Waringin Hospitality | PWA + Google Drive

![PWA](https://img.shields.io/badge/PWA-Ready-green)
![GAS](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue)
![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-black)
![License](https://img.shields.io/badge/License-Private-red)

---

## 📁 Struktur Repo

```
lotus-training-portal/
├── training.html      ← App utama (PWA)
├── manifest.json      ← PWA config (install di HP)
├── sw.js              ← Service Worker (offline support)
├── Code.gs            ← Backend Google Apps Script
├── icons/             ← App icons semua ukuran
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
└── README.md
```

---

## 🏗️ Arsitektur

```
GitHub Pages (Frontend PWA)          Google Apps Script (Backend API)
├── training.html   ←── fetch ───→   Code.gs
├── manifest.json                    └── Google Drive
├── sw.js                                 ├── 📁 Front Office
└── icons/                                │   └── 📁 April 2025
                                          ├── 📁 Housekeeping
                                          └── dst...
```

---

## 🚀 Setup & Deploy

### Step 1 — GitHub Pages

1. Fork / clone repo ini
2. Buka **Settings** → **Pages**
3. Source: **Deploy from branch** → `main` → `/ (root)`
4. Save → URL: `https://username.github.io/lotus-training-portal/training.html`

### Step 2 — Google Apps Script

1. Buka [script.google.com](https://script.google.com)
2. **New Project** → nama: `Training Portal Lotus Garden`
3. Paste isi `Code.gs` ke editor
4. **Ganti** `ID_FOLDER_INDUK` dengan ID folder Google Drive Anda:
   ```javascript
   const ID_FOLDER_INDUK = "1ABC...xyz"; // ID folder Drive Anda
   ```
5. **Deploy** → **New Deployment** → **Web App**:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy URL deployment

### Step 3 — Hubungkan ke Frontend

Di `training.html` baris ini sudah terisi URL GAS:
```javascript
const GAS_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

### Step 4 — Inisialisasi Folder Drive

1. Buka app → klik ⚙️ di header
2. Konfirmasi → sistem buat folder otomatis:
```
📁 [Folder Induk Drive]
├── 📁 Front Office
├── 📁 Housekeeping
├── 📁 F&B Product
├── 📁 Engineering
├── 📁 Accounting
└── 📁 Human Resources
```

---

## 📱 Install PWA di HP

### Android (Chrome):
1. Buka URL app di Chrome
2. Ketuk **⋮** → **"Add to Home Screen"**
3. Ketuk **"Add"** ✅

### iPhone (Safari):
1. Buka URL app di Safari
2. Ketuk ikon **Share** → **"Add to Home Screen"**
3. Ketuk **"Add"** ✅

---

## ✨ Fitur

| Fitur | Keterangan |
|-------|-----------|
| 📸 Upload Foto | Kamera langsung atau galeri |
| 💧 Watermark Otomatis | Tanggal, jam, dept, lokasi, branding |
| 🗜️ Kompresi | Maks 1200px, JPEG 80% |
| 📁 Folder Bulan | Otomatis sesuai bulan berjalan |
| 📂 Sub-Kegiatan | Custom, staff buat sendiri |
| 🔍 Pencarian | Cari dept, bulan, kegiatan |
| 📊 Log Sheets | Setiap upload tercatat otomatis |
| 📶 Offline Support | Service Worker cache app shell |
| 📲 Installable | PWA — bisa install di HP |
| 🌙 Install Banner | Prompt install otomatis |

---

## 🔧 Konfigurasi

### Tambah Departemen Baru:
Di `Code.gs`:
```javascript
const DEPARTMENTS = [
  "Front Office",
  "Housekeeping",
  // tambah di sini:
  "Sales & Marketing",
];
```

Di `training.html` bagian `DEPT_SVG` dan `ICONS`, tambahkan entry baru.

### Ganti GAS URL:
```javascript
// training.html baris pertama script
const GAS_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

---

## 📞 Support
**Lotus Garden Hotel & Restaurant**  
By Waringin Hospitality  
*Training Portal PWA v3.1*
