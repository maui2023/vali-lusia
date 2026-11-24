# Product Requirement Document (PRD): Sistem Maklumat Jemaah

---

## 1. Ringkasan Eksekutif & Objektif Projek

* **Nama Sistem:** Sistem Pendaftaran Maklumat Jemaah Andalusia
* **Versi:** 2.0.0 (Simplified Streamlined Edition)
* **Status Dokumen:** Sedia untuk Pembangunan (*Ready for Implementation*)
* **Tarikh:** November 2026
* **Sasaran Persekitaran:** PHP 8.5+ & MariaDB 11.x

### 1.1 Latar Belakang & Rasional Perubahan
Bagi memaksimumkan kadar pendaftaran (*conversion rate*) jemaah dan mengurangkan kerumitan pengguna semasa pendaftaran awal:
* Borang lama yang mengandungi banyak langkah (MyKad, pengesahan pasport 6 bulan, muat naik dokumen, resit deposit, maklumat waris) telah **dipermudahkan sepenuhnya**.
* **Keperluan Terkini:** Borang hanya menerima **Nama Penuh** dan **Nombor Telefon (WhatsApp)** sahaja. Semua medan dan langkah lain telah dibuang.
* Pegawai operasi Andalusia akan menghubungi jemaah secara terus melalui telefon / WhatsApp untuk semakan pakej dan pengumpulan dokumen seterusnya.

### 1.2 Ciri-Ciri Utama Sistem

1. **Borang Pendaftaran Pantas (docs/index.html):**
   - Hanya 2 medan input:
     - **Nama Penuh** (Wajib, format huruf besar automatik).
     - **No. Telefon / WhatsApp** (Wajib, validasi format nombor telefon sah).
   - Penjanaan Kod Rujukan unik automatik (format: `VAL-######`).
   - Modal pengesahan kejayaan bersama pilihan cetak slip rujukan.

2. **Portal Semakan Status (docs/status.html):**
   - Carian status permohonan menggunakan **No. Telefon** atau **Kod Rujukan**.
   - Garis masa 3 fasa: *Maklumat Diterima*, *Semakan Pegawai*, dan *Selesai / Dihubungi*.
   - Paparan nama pemohon, nombor telefon, tarikh, dan catatan pegawai.

3. **Portal Pengurusan Pegawai (docs/admin_review.html):**
   - Papan pemuka senarai pemohon dengan integrasi data masa-nyata.
   - Pautan pantas terus ke **WhatsApp** jemaah (`https://wa.me/...`).
   - Tindakan kelulusan, kemaskini status, dan penulisan catatan pegawai.

4. **Skema Pangkalan Data (docs/database.sql):**
   - Jadual `applicants` dipermudahkan:
     - `id`, `validation_code`, `full_name`, `phone`, `validation_status`, `officer_notes`, `created_at`, `updated_at`.

---

## 2. Spesifikasi Medan & Validasi

| Medan | Jenis Data | Validasi Frontend | Validasi Backend | Keterangan |
|---|---|---|---|---|
| `full_name` | String (200) | Minimum 3 aksara, huruf besar automatik | `string`, sanitasi HTML, regex huruf & ruang | Nama jemaah |
| `phone` | String (30) | Format digit & tanda sengkang, 9-14 digit | `string`, format E.164 atau nombor Malaysia | No. telefon bimbit/WhatsApp |
| `validation_code`| String (40) | Format `VAL-######` | Unik, dijana sistem | Kod jejak permohonan |
| `validation_status`| ENUM | - | `PENDING_REVIEW`, `ACTION_REQUIRED`, `VERIFIED`, `REJECTED` | Status semasa |
