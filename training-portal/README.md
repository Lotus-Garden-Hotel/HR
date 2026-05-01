# 🌸 Training Portal - Lotus Garden Hotel
### PWA + Google Drive | By Waringin Hospitality

![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)
![GAS](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue)
![Host](https://img.shields.io/badge/Hosting-GitHub%20Pages-black)
![Free](https://img.shields.io/badge/Cost-Free-gold)

---

## 📁 Struktur Subfolder

```
repo-github-anda/
└── training-portal/          ← subfolder (tidak konflik dengan sw.js/manifest.json lain)
    ├── training.html          ← App utama PWA
    ├── manifest.json          ← PWA config (scope: /training-portal/)
    ├── sw.js                  ← Service Worker (scope: /training-portal/)
    ├── offline.html           ← Fallback halaman offline
    ├── Code.gs                ← Backend Google Apps Script (backup)
    ├── _headers               ← Security & cache headers
    ├── .gitignore
    ├── README.md
    └── icons/
        ├── icon-72.png
        ├── icon-96.png
        ├── icon-128.png
        ├── icon-144.png
        ├── icon-152.png
        ├── icon-192.png
        ├── icon-384.png
        └── icon-512.png
```

---

## 🏗️ Arsitektur Sistem

```
GitHub Pages                     Google Apps Script (GAS)
/training-portal/                Code.gs (API Backend)
├── training.html  ──fetch──►   doGet(?action=...)   ──►  Google Drive
├── manifest.json               doPost({action:...})       ID: 1W9N3_m5643...
├── sw.js                       └── jsonOut(result)        ├── 📁 Front Office
└── icons/                                                 │   └── 📁 Mei 2025
                                                           │       ├── 📁 OJT Batch 1
                                                           │       └── 📁 Fire Drill
                                                           └── 📁 dst...
```

---

## 🚀 Setup Deployment

### Step 1 — Upload ke GitHub
1. Upload folder `training-portal/` ke repo GitHub Anda
2. Buka **Settings → Pages → Source: Deploy from branch → main → / (root)**
3. URL app: `https://username.github.io/repo-name/training-portal/training.html`

### Step 2 — Setup Google Apps Script
1. Buka [script.google.com](https://script.google.com) → **New Project**
2. Rename project: `Training Portal Lotus Garden`
3. Paste isi `Code.gs` ke editor
4. Folder Drive sudah terkonfigurasi: `1W9N3_m5643SPFklC1w07bWZPIGJif5et`
5. **Deploy → New Deployment → Web App:**
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy URL deployment

### Step 3 — GAS URL sudah terpasang
File `training.html` sudah menggunakan:
```
https://script.google.com/macros/s/AKfycbzc8c.../exec
```

### Step 4 — Inisialisasi Folder Drive
1. Buka app → klik ⚙️ di header
2. Konfirmasi → sistem buat folder otomatis semua departemen

---

## 📱 Install PWA

### Android (Chrome):
Menu **⋮ → Add to Home Screen → Add** ✅

### iPhone (Safari):
**Share → Add to Home Screen → Add** ✅

---

## ✨ Fitur Lengkap

| Fitur | Keterangan |
|-------|-----------|
| 📸 Upload Foto | Kamera langsung / galeri |
| 💧 Watermark | Tanggal, jam, dept, lokasi, logo |
| 🗜️ Kompres | Maks 1200px · JPEG 80% |
| 📁 Folder Bulan | Otomatis (Mei 2025, Juni 2025...) |
| 📂 Sub-Kegiatan | Custom per kegiatan training |
| 🔍 Pencarian | Cari by dept/bulan/kegiatan |
| 📊 Log Sheets | Setiap upload dicatat otomatis |
| 📶 Offline | Service Worker cache app shell |
| 📲 Installable | PWA — install di HP |
| 🔔 Update Banner | Notif auto-update tersedia |

---

## ⚙️ Konfigurasi di training.html

```javascript
const GAS_URL = 'https://script.google.com/macros/s/.../exec';
const BASE    = '/training-portal';
```

## ⚙️ Konfigurasi di Code.gs

```javascript
const ID_FOLDER_INDUK = "1W9N3_m5643SPFklC1w07bWZPIGJif5et";
```

---

*Training Portal PWA v3.1 · Lotus Garden Hotel & Restaurant · Waringin Hospitality*
