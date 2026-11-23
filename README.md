# 🕋 Vali-Lusia: Sistem Pendaftaran Maklumat Jemaah Andalusia

Sistem borang pendaftaran ringkas (*streamlined registration form*) untuk **Andalusia Travel & Tours**. Sistem ini telah dipermudahkan khusus untuk hanya menerima maklumat **Nama Penuh** dan **Nombor Telefon (WhatsApp)** bagi memaksimumkan kemudahan pengguna dan mempercepat proses pendaftaran.

---

## 🎨 Antaramuka Pengguna (UI/UX) dalam Direktori `docs/`

Semua fail antaramuka dibina menggunakan HTML5 semantik, CSS3 moden responsif, dan JavaScript interaktif:

| Halaman | Fail | Penerangan |
|---|---|---|
| **Borang Maklumat Jemaah** | [docs/index.html](file:///home/maui/github/vali-lusia/docs/index.html) | Borang pantas satu langkah dengan **Nama Penuh** dan **No. Telefon (WhatsApp)**, validasi masa-nyata, penjanaan Kod Rujukan unik (`VAL-######`), dan modal kejayaan dengan butang cetak slip. |
| **Portal Semakan Status** | [docs/status.html](file:///home/maui/github/vali-lusia/docs/status.html) | Portal semakan status permohonan menggunakan **No. Telefon** atau **Kod Validasi**, lengkap dengan garis masa status dan catatan pegawai. |
| **Portal Pegawai Operasi** | [docs/admin_review.html](file:///home/maui/github/vali-lusia/docs/admin_review.html) | Papan pemuka senarai jemaah, statistik permohonan, pautan terus ke WhatsApp jemaah, dan fungsi kemaskini status. |
| **Gaya Reka Bentuk (CSS)** | [docs/styles.css](file:///home/maui/github/vali-lusia/docs/styles.css) | Tema korporat eksklusif Andalusia (*Royal Emerald*, *Deep Navy*, dan aksen *Gold*). |
| **Logik Borang (JS)** | [docs/app.js](file:///home/maui/github/vali-lusia/docs/app.js) | Validasi nama & telefon, format auto nombor telefon tempatan, dan penyimpanan ke LocalStorage. |
| **Skema MariaDB 11.x** | [docs/database.sql](file:///home/maui/github/vali-lusia/docs/database.sql) | DDL pangkalan data jadual `applicants` (hanya `full_name` dan `phone`) serta jadual `admin_users`. |

---

## 🚀 Cara Menjalankan Pratonton Tempatan (Local Preview)

Jalankan pelayan pembangunan tempatan PHP:

```bash
cd /home/maui/github/vali-lusia
php -S 0.0.0.0:8080 -t docs/
```

Kemudian layari melalui pelayar web:
* Borang Jemaah: `http://localhost:8080/index.html`
* Semakan Status: `http://localhost:8080/status.html`
* Portal Pegawai: `http://localhost:8080/admin_review.html`

---

## 🔒 Ringkasan Ciri-Ciri

1. **Hanya Nama & No. Telefon:** Mengurangkan geseran (*friction*) pendaftaran pengguna kepada minimum.
2. **Pautan WhatsApp Bersepadu:** Pegawai boleh terus berhubung dengan jemaah melalui butang WhatsApp pada papan pemuka pegawai.
3. **Semakan Fleksibel:** Jemaah boleh menyemak status permohonan mereka hanya menggunakan nombor telefon atau kod rujukan.
