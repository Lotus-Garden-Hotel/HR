🏨 Employee Assessment System (EAS) - Hospitality Edition

EAS - Hospitality Edition adalah platform ujian web-based yang dirancang khusus untuk industri perhotelan guna mengukur kompetensi karyawan secara objektif, aman, dan terukur. Sistem ini mengintegrasikan Google Apps Script (GAS) sebagai backend, Google Sheets sebagai database, dan antarmuka HTML5/JavaScript yang responsif.
🚀 Fitur Utama
🛡️ Keamanan & Anti-Cheat Berlapis

    Disabled Interactions: Mematikan fungsi klik kanan, salin-tempel (copy-paste), dan blok teks untuk menjaga integritas soal.

    Keyboard Blocker: Memblokir akses ke Developer Tools (F12, Ctrl+Shift+I) dan View Source (Ctrl+U).

    Single-Attempt Logic: Validasi backend yang memastikan satu NIK hanya dapat melakukan satu kali ujian. Akses akan otomatis diblokir jika NIK sudah terdata di hasil ujian.

🔄 Resiliensi & Keandalan

    Auto-Resume System: Menggunakan LocalStorage untuk menyimpan progres ujian. Jika browser tertutup atau koneksi putus, karyawan dapat melanjutkan ujian tanpa kehilangan waktu atau jawaban yang sudah dipilih.

    Auto-Submit: Jawaban otomatis terkirim ke database saat timer menyentuh angka nol.

📊 HR Analytics & Tools

    Real-time Dashboard: Visualisasi performa antar departemen menggunakan Chart.js.

    Weighted Scoring (30/70): Rumus penilaian profesional yang menitikberatkan pada keahlian teknis departemen (70%) dan pemahaman umum hotel (30%).

    Administrative Control: Fitur khusus bagi HR untuk me-reset akses karyawan tertentu agar dapat melakukan ujian ulang (Re-test).

📂 Manajemen Bank Soal

    Mendukung 10+ Departemen (General, FO, HK, F&B, Engineering, Sales, Security, Back Office, A&G, HR).

    Bank soal berbasis Google Sheets yang memudahkan manajemen konten tanpa perlu menyentuh kode program.

🛠️ Tech Stack

    Frontend: HTML5, CSS3, JavaScript (Vanilla).

    Backend: Google Apps Script (GAS).

    Database: Google Sheets API.

    Visualization: Chart.js.

📋 Prasyarat Instalasai

    Google Akun (untuk Google Sheets & Apps Script).

    Spreadsheet dengan struktur tab sesuai departemen (General, FO, HK, dll).

    Penempatan kode GAS sebagai Web App dengan akses "Anyone".

Cara Berkontribusi

Sistem ini dibangun dengan arsitektur Dynamic Routing, sehingga penambahan departemen baru hanya memerlukan penambahan sheet baru di Google Sheets tanpa perlu merombak kode backend.
