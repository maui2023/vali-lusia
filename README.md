# 🕋 Vali-Lusia: Sistem Borang Validasi Travel & Umrah Andalusia

Sistem borang validasi layan diri (*self-service validation form*) dan pengesahan dokumen perjalanan jemaah untuk **Andalusia Travel & Tours**. Dibina khusus berasaskan **PHP 8.5+** dan **MariaDB 11.x** bagi menyeragamkan pengumpulan data, menyemak kesahihan pasport (syarat sah > 6 bulan), dan mempermudah semakan dokumen oleh pegawai cawangan.

---

## 📄 Dokumen Keperluan Produk (PRD)

Dokumen lengkap spesifikasi sistem, seni bina, skema pangkalan data, dan matriks validasi boleh dirujuk di:
* [PRD.md](file:///home/maui/github/vali-lusia/PRD.md) (atau [docs/PRD.md](file:///home/maui/github/vali-lusia/docs/PRD.md))

---

## 🎨 Antaramuka Pengguna (UI/UX Mockups) dalam Direktori `docs/`

Semua fail reka bentuk antaramuka dibina menggunakan HTML5 semantik, CSS3 moden responsif (tanpa sebarang kebergantungan luar), dan JavaScript interaktif:

| Halaman | Fail | Penerangan |
|---|---|---|
| **Borang Validasi Jemaah** | [docs/index.html](file:///home/maui/github/vali-lusia/docs/index.html) | Borang multi-langkah (*4-Step Wizard*) dengan validasi masa-nyata MyKad Malaysia, kalkulasi automatik tarikh sah pasport 6 bulan, zon seret fail (*drag-and-drop*), kad ringkasan, dan slip rujukan. |
| **Portal Semakan Status** | [docs/status.html](file:///home/maui/github/vali-lusia/docs/status.html) | Portal layan diri jemaah untuk menyemak kemajuan pengesahan melalui garis masa (*stepper timeline*), senarai status dokumen, dan nota pegawai. |
| **Portal Pegawai Operasi** | [docs/admin_review.html](file:///home/maui/github/vali-lusia/docs/admin_review.html) | Papan pemuka semakan dokumen bersebelahan (*side-by-side inspection*), butang kelulusan/kemaskini, dan log audit. |
| **Gaya Reka Bentuk (CSS)** | [docs/styles.css](file:///home/maui/github/vali-lusia/docs/styles.css) | Tema korporat eksklusif Andalusia (*Royal Emerald*, *Deep Navy*, dan aksen *Gold*). |
| **Logik Validasi (JS)** | [docs/app.js](file:///home/maui/github/vali-lusia/docs/app.js) | Enjin validasi MyKad, pengiraan hari tamat pasport, pratonton imej/PDF, dan integrasi LocalStorage. |
| **Skema MariaDB 11.x** | [docs/database.sql](file:///home/maui/github/vali-lusia/docs/database.sql) | DDL lengkap jadual `branches`, `packages`, `bookings`, `applicants`, `applicant_documents`, `validation_audit_logs`, dan `users`. |

---

## 🚀 Cara Menjalankan Pratonton Tempatan (Local Preview)

Anda boleh menjalankan pelayan pembangunan PHP 8.5 terbina dalam terus ke folder `docs/`:

```bash
cd /home/maui/github/vali-lusia
php -S 0.0.0.0:8080 -t docs/
```

Kemudian buka di pelayar web:
* Borang Jemaah: `http://localhost:8080/index.html`
* Semakan Status: `http://localhost:8080/status.html`
* Portal Pegawai: `http://localhost:8080/admin_review.html`

---

## 🔒 Ciri-Ciri Utama & Keselamatan

1. **Validasi MyKad Malaysia:** Algoritma pengesahan 12 digit automatik mengekstrak tarikh lahir dan jantina jemaah serta mengesahkan format JPN.
2. **Peraturan Pasport 6 Bulan (180 Hari):** Sistem automatik membandingkan tarikh tamat pasport dengan tarikh penerbangan pakej dan memberi amaran sekiranya tidak memenuhi syarat penerbangan antarabangsa.
3. **Penyimpanan Dokumen Selamat:** Dokumen sensitif disimpan di luar *public root* dengan penamaan unik hash SHA-256 bagi mematuhi Akta Perlindungan Data Peribadi (PDPA 2010).
4. **PHP 8.5 Native Standards:** Menggunakan *Strict Types*, *Readonly DTOs*, *Enums*, dan *Prepared Statements* bagi menghalang serangan SQLi dan XSS.
