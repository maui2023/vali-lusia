# Product Requirement Document (PRD): Sistem Borang Validasi Travel & Umrah (Vali-Lusia)

---

## 1. Ringkasan Eksekutif & Objektif Projek

* **Nama Sistem:** Vali-Lusia (Sistem Validasi & Pengesahan Dokumen Jemaah Andalusia)
* **Versi:** 1.0.0
* **Status Dokumen:** Sedia untuk Pembangunan (*Ready for Implementation*)
* **Tarikh:** November 2026
* **Sasaran Persekitaran:** PHP 8.5+ & MariaDB 11.x

### 1.1 Latar Belakang
Dalam operasi agensi pelancongan dan umrah berskala besar seperti Andalusia Travel & Tours, pengurusan pendaftaran jemaah dan pengesahan dokumen perjalanan (pasport antarabangsa, visa, bukti pembayaran, sijil vaksinasi, dan perakuan mahram) menghadapi cabaran kritikal:
1. **Ralat Data Manual:** Kesilapan ejaan nama pada pasport, no. kad pengenalan, atau nombor pasport yang lewat dikesan boleh menyebabkan tiket penerbangan terbatal atau permohonan visa ditolak.
2. **Isu Tempoh Sah Pasport:** Imigresen dan syarikat penerbangan antarabangsa menetapkan syarat ketat bahawa pasport antarabangsa mestilah sah **sekurang-kurangnya 6 bulan (180 hari)** sebelum tarikh pelepasan.
3. **Beban Kerja Pegawai Cawangan:** Semakan dokumen secara manual melalui WhatsApp atau salinan fizikal menyebabkan kelewatan, fail bertindih, dan tiada rekod jejak (*audit trail*).
4. **Pematuhan Akta Perlindungan Data Peribadi (PDPA 2010):** Dokumen sensitif jemaah (MyKad, Pasport) memerlukan kaedah penyimpanan selamat dan akses terhad kepada pegawai sah sahaja.

### 1.2 Objektif Projek
* **Digitalisasi & Automasi:** Menyediakan borang validasi layan diri (*self-service validation form*) yang pantas, responsif, dan mudah diakses jemaah melalui telefon pintar mahupun desktop.
* **Validasi Pintar di Hadapan & Belakang (*Dual-Layer Validation*):**
  - Frontend: Validasi masa-nyata (*real-time*) untuk format MyKad Malaysia, tarikh tamat pasport (>6 bulan), format telefon, serta saiz dan format fail.
  - Backend: Validasi ketat PHP 8.5 (Strict typing, Enums, MIME-type verification, Anti-XSS, CSRF, Prepared Statements).
* **Papan Pemuka Semakan Dokumen Pegawai (*Admin Verification Console*):** Membolehkan pegawai operasi menyemak data dan imej dokumen secara bersebelahan (*side-by-side*), meluluskan, atau meminta kemaskini dengan serta-merta.
* **Audit Trail Penuh:** Setiap perubahan status permohonan direkodkan dalam MariaDB beserta cap masa dan identiti penyemak.

---

## 2. Seni Bina & Topologi Sistem (*System Architecture*)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PELAYAN WEB & KLIEN (FRONTEND)                        │
│                                                                                 │
│   [ Jemaah / Pelanggan Awam ]                     [ Pegawai Operasi Cawangan ]  │
│   • docs/index.html (Borang Multi-Step)           • docs/admin_review.html      │
│   • docs/status.html (Semakan Status)             • Semakan Dokumen Bersisi     │
│   • Responsive Mobile/Desktop (Tailwind/CSS)      • Lulus / Tolak / Komen       │
│                               |                                  |              │
│                               +-----------------+----------------+              │
│                                                 |                               │
│                                   (HTTPS / REST / Form Submit)                  │
│                                   - CSRF Token Header / Input                   │
│                                   - JSON & Multipart Data                       │
│                                                 v                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                             BACKEND ENGINE (PHP 8.5)                            │
│                                                                                 │
│   [ Routing & Middleware ]                                                      │
│   ├── Security Middleware (CSRF, Rate Limiting, CORS, XSS Protection)          │
│   └── Authentication Middleware (Session / Role-Based Access Control)           │
│                                                                                 │
│   [ Validation Engine (PHP 8.5 Native) ]                                        │
│   ├── Strict Types (`declare(strict_types=1);`)                                 │
│   ├── Enums: ValidationStatus, DocumentType, Gender, RoomType                   │
│   ├── Readonly DTOs: ApplicantDataDTO, BookingDataDTO                           │
│   ├── Malaysian IC Validator (Algoritma JPN, Tarikh Lahir, Kod Negeri)          │
│   ├── Passport Expiry Rule Engine (Pelepasan vs Luput >= 180 hari)             │
│   └── Secure File Handler (MIME finfo_file, Magic Bytes, Hash Naming)           │
│                                                                                 │
│   [ Data Access Layer ]                                                         │
│   └── PDO MariaDB Driver (Prepared Statements, Transaction Safe)                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          PANGKALAN DATA (MARIADB 11.x)                          │
│                                                                                 │
│   • InnoDB Engine, utf8mb4_unicode_ci                                           │
│   • Jadual: branches, packages, bookings, applicants, documents, audit_logs     │
│   • Indeks Dioptimumkan: (ic_number, booking_ref, status, created_at)           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         STORAN DOKUMEN SELAMAT (STORAGE)                        │
│                                                                                 │
│   • Direktori Luar Public Root: `/storage/secure_uploads/`                      │
│   • Nama Rawak SHA-256 / UUID: `{hash}.{ext}`                                   │
│   • Akses fail melalui PHP Streaming Wrapper (hanya pegawai disahkan / pemilik) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriks Peranan & Skop Pengguna (*User Roles & Personas*)

| Peranan (*Role*) | Akses & Tanggungjawab |
|---|---|
| **Jemaah / Pemohon (Public)** | 1. Mengisi borang validasi perjalanan 4 langkah.<br>2. Memuat naik salinan dokumen (Pasport, MyKad, Resit, Sijil Vaksin).<br>3. Menyemak status validasi permohonan melalui portal `status.html`.<br>4. Memuat turun resit / slip pengesahan setelah permohonan disahkan. |
| **Pegawai Validasi Cawangan (Branch Officer)** | 1. Melihat senarai permohonan masuk bagi cawangan berkaitan.<br>2. Memeriksa kualiti imej pasport, kesahihan tarikh, dan butiran jemaah.<br>3. Meluluskan (*Verify*) atau Mengembalikan (*Request Update*) dengan nota teguran.<br>4. Mengesahkan bilik dan peruntukan tiket. |
| **Penyelia / Pentadbir Sistem (Superadmin)** | 1. Melihat semua cawangan dan statistik keseluruhan.<br>2. Mengurus senarai pakej, tarikh penerbangan, dan kuota.<br>3. Memeriksa audit trail aktiviti semakan kakitangan.<br>4. Mengeksport senarai manifes jemaah (CSV/Excel) untuk pihak syarikat penerbangan dan Kementerian Haji/Pelancongan. |

---

## 4. Alur Kerja Borang Validasi (*Multi-Step Form Workflow*)

Borang direka bentuk dengan konsep **Progressive Disclosure** (4 Langkah Utama):

```
  [ Langkah 1 ]            [ Langkah 2 ]             [ Langkah 3 ]            [ Langkah 4 ]
Maklumat Jemaah  ───►  Pakej & Penerbangan  ───►  Pasport & Dokumen  ───►  Semakan & Hantar
• Nama Penuh           • Pilihan Pakej           • No. Pasport             • Ringkasan Data
• No. MyKad            • Tarikh Pelepasan        • Tarikh Luput Pasport    • Perakuan Syarat
• No. Telefon (WA)     • Cawangan Pilihan        • Muat Naik Pasport       • Perakuan PDPA
• Emel & Waris         • Jenis Bilik & Bantuan   • Muat Naik Dokumen       • Jana No. Rujukan
```

### 4.1 Langkah 1: Maklumat Pemohon & Jemaah
* **Nama Penuh:** Mengikut ejaan tepat dalam pasport antarabangsa (huruf besar automatik).
* **No. Kad Pengenalan (MyKad):** Format `######-##-####` (automatik auto-dash).
  - *Auto-Detection:* Mengekstrak tarikh lahir dan jantina secara automatik daripada 12 digit MyKad.
* **No. Telefon Bimbit / WhatsApp:** Format piawai Malaysia `+601X-XXXXXXX`.
* **Alamat Emel:** Pengesahan format emel sah untuk penghantaran notifikasi pengesahan.
* **Maklumat Waris / Kecemasan:** Nama waris, hubungan, dan nombor telefon kecemasan.

### 4.2 Langkah 2: Maklumat Pakej & Perjalanan
* **No. Rujukan Tempahan (Booking ID):** Cth: `AND-2026-9812` (diperoleh semasa bayaran deposit).
* **Pakej Pilihan:** Pilihan pakej (Umrah Ziarah, Umrah Ramadhan, Percutian Balkan, Turki, dsb).
* **Tarikh Pelepasan (Departure Date):** Tarikh penerbangan yang telah ditempah.
* **Cawangan Andalusia:** Pilihan cawangan pendaftaran (HQ Desa Pandan, Shah Alam, Johor Bahru, dsb).
* **Pilihan Jenis Bilik:** Bilik Berdua (*Double*), Bertiga (*Triple*), Berempat (*Quad*).
* **Keperluan Bantuan Khas:** Pilihan kerusi roda (*wheelchair*), bantuan warga emas, diet khas.

### 4.3 Langkah 3: Maklumat Pasport & Dokumen Sokongan
* **Nombor Pasport:** Format antarabangsa Malaysia (cth: `A12345678` atau `H12345678`).
* **Tarikh Tamat Pasport (Expiry Date):**
  - *Peraturan Validasi:* Sistem automatik mengira perbezaan antara Tarikh Tamat Pasport dengan Tarikh Pelepasan Pakej.
  - Sekiranya kurang daripada 180 hari (6 bulan), borang memaparkan amaran merah keras (*blocking error*): *"Pasport anda tamat tempoh dalam tempoh kurang 6 bulan dari tarikh perjalanan. Sila perbaharui pasport anda terlebih dahulu."*
* **Muat Naik Salinan Pasport:** Gambar muka surat maklumat pasport (jelas, tidak silau/potong).
* **Muat Naik Salinan MyKad:** Depan & belakang.
* **Muat Naik Resit Bayaran Deposit / Penuh:** Bukti pembayaran sah.
* **Muat Naik Sijil Kesihatan / Vaksin:** Sijil suntikan Meningitis ACWY & Influenza.

### 4.4 Langkah 4: Semakan Ringkasan & Perakuan
* **Paparan Ringkasan (*Summary Cards*):** Menunjukkan semua data yang telah diisi untuk semakan kali terakhir.
* **Persetujuan PDPA 2010:** Kotak persetujuan pemprosesan data peribadi bagi urusan visa dan tiket penerbangan.
* **Perakuan Kebenaran Data:** Pengesahan bahawa maklumat dan dokumen yang dimuat naik adalah tulen.
* **Penjanaan Slip Pengesahan:** Setelah berjaya dihantar, sistem menjana kod rujukan semakan unik (cth: `VAL-882194`) berserta kod QR untuk semakan status pantas.

---

## 5. Matriks Peraturan Validasi Terperinci (PHP 8.5)

| Medan (*Field*) | Peraturan Frontend (HTML5/JS) | Peraturan Backend (PHP 8.5 Native) | Mesej Ralat (*Error Message*) |
|---|---|---|---|
| `full_name` | `required`, min 3 aksara, regex `^[A-Za-z\s'@\/\.\-]+$` | `trim()`, `mb_strlen >= 3`, tiada aksara khas berbahaya, `strtoupper()` | "Sila masukkan nama penuh seperti dalam pasport (minimum 3 aksara)." |
| `ic_number` | Regex 12 digit `^\d{6}-?\d{2}-?\d{4}$` | Pembersihan dash, pengesahan 12 digit nombor, semakan kesahihan tarikh lahir (YYMMDD), kod negeri JPN sah | "Nombor Kad Pengenalan tidak sah. Sila masukkan 12 digit nombor MyKad yang tepat." |
| `phone_number` | Regex `^(\+?60|0)1[0-9]-?[0-9]{7,8}$` | Normalisasi ke format antarabangsa `+601xxxxxxxx`, semakan panjang 10-12 digit | "Nombor telefon tidak sah. Sila masukkan nombor telefon bimbit Malaysia yang sah." |
| `email` | `type="email"`, `required` | `filter_var($email, FILTER_VALIDATE_EMAIL)` | "Format emel tidak sah." |
| `passport_number` | `required`, format `^[A-Z0-9]{8,9}$` | `preg_match('/^[A-Z][0-9]{8}$/i', $passport)` | "Nombor pasport mesti mengandungi 1 huruf diikuti 8 digit nombor." |
| `passport_expiry` | `required`, `type="date"` | Perbandingan `DateTimeImmutable`: `$expiry >= $departure->modify('+180 days')` | "Pasport anda mesti sah sekurang-kurangnya 6 bulan (180 hari) dari tarikh pelepasan." |
| `booking_ref` | `required`, format `^AND-[0-9]{4}-[0-9]{4,6}$` | Semakan kewujudan rujukan tempahan dalam jadual `bookings` | "Nombor rujukan tempahan tidak dijumpai dalam pangkalan data." |
| `file_passport` | `accept=".jpg,.jpeg,.png,.pdf"`, saiz <= 5MB | `$_FILES['error'] === UPLOAD_ERR_OK`, saiz <= 5MB, `finfo_file()` menyemak MIME `image/jpeg`, `image/png`, `application/pdf` | "Fail pasport mesti berformat JPG/PNG/PDF dan tidak melebihi 5MB." |
| `file_receipt` | `accept=".jpg,.jpeg,.png,.pdf"`, saiz <= 5MB | Semakan saiz dan MIME type yang sama | "Fail resit pembayaran tidak sah atau melebihi had 5MB." |
| `csrf_token` | Input hidden `name="csrf_token"` | `hash_equals($_SESSION['csrf_token'], $postToken)` | "Sesi borang telah tamat tempoh. Sila muat semula halaman dan cuba lagi." |

---

## 6. Model Pangkalan Data (MariaDB 11.x Schema)

Pangkalan data direka bentuk menggunakan enjin **InnoDB** dengan pengkodan aksara penuh **`utf8mb4`** dan kolasi **`utf8mb4_unicode_ci`**.

```sql
-- Skema Pangkalan Data Vali-Lusia (MariaDB 11.x)
CREATE DATABASE IF NOT EXISTS `vali_lusia_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `vali_lusia_db`;

-- 1. Jadual Cawangan Andalusia
CREATE TABLE IF NOT EXISTS `branches` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `state` VARCHAR(50) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Jadual Pakej Travel / Umrah
CREATE TABLE IF NOT EXISTS `packages` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `title` VARCHAR(200) NOT NULL,
    `category` ENUM('UMRAH', 'PELANCONGAN_ISLAMIK', 'HAJI') NOT NULL DEFAULT 'UMRAH',
    `departure_date` DATE NOT NULL,
    `return_date` DATE NOT NULL,
    `airline` VARCHAR(100) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_departure` (`departure_date`)
) ENGINE=InnoDB;

-- 3. Jadual Tempahan Utama (Bookings)
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_ref` VARCHAR(50) NOT NULL UNIQUE,
    `package_id` INT UNSIGNED NOT NULL,
    `branch_id` INT UNSIGNED NOT NULL,
    `lead_applicant_name` VARCHAR(200) NOT NULL,
    `contact_phone` VARCHAR(30) NOT NULL,
    `contact_email` VARCHAR(150) NOT NULL,
    `total_pax` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `payment_status` ENUM('PENDING', 'DEPOSIT_PAID', 'FULL_PAID') NOT NULL DEFAULT 'DEPOSIT_PAID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_package` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_bookings_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Jadual Jemaah / Penumpang (Applicants)
CREATE TABLE IF NOT EXISTS `applicants` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `validation_code` VARCHAR(40) NOT NULL UNIQUE,
    `full_name` VARCHAR(200) NOT NULL,
    `ic_number` VARCHAR(20) NOT NULL,
    `passport_number` VARCHAR(30) NOT NULL,
    `passport_expiry` DATE NOT NULL,
    `passport_country` VARCHAR(50) NOT NULL DEFAULT 'MALAYSIA',
    `gender` ENUM('LELAKI', 'PEREMPUAN') NOT NULL,
    `birth_date` DATE NOT NULL,
    `room_type` ENUM('QUAD', 'TRIPLE', 'DOUBLE') NOT NULL DEFAULT 'QUAD',
    `special_needs` TEXT NULL,
    `emergency_contact_name` VARCHAR(150) NOT NULL,
    `emergency_contact_phone` VARCHAR(30) NOT NULL,
    `emergency_contact_relationship` VARCHAR(50) NOT NULL,
    `validation_status` ENUM(
        'DRAFT', 
        'PENDING_REVIEW', 
        'ACTION_REQUIRED', 
        'VERIFIED', 
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING_REVIEW',
    `rejection_reason` TEXT NULL,
    `reviewed_by` INT UNSIGNED NULL,
    `reviewed_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_applicants_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    INDEX `idx_ic_number` (`ic_number`),
    INDEX `idx_passport` (`passport_number`),
    INDEX `idx_validation_status` (`validation_status`)
) ENGINE=InnoDB;

-- 5. Jadual Dokumen Sokongan (Applicant Documents)
CREATE TABLE IF NOT EXISTS `applicant_documents` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `applicant_id` BIGINT UNSIGNED NOT NULL,
    `document_type` ENUM('PASSPORT', 'MYKAD', 'RECEIPT', 'VACCINE', 'MAHRAM_PROOF', 'OTHER') NOT NULL,
    `original_filename` VARCHAR(255) NOT NULL,
    `stored_filename` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_size_bytes` INT UNSIGNED NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
    `verification_note` VARCHAR(255) NULL,
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_documents_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Jadual Log Audit (Validation Audit Trail)
CREATE TABLE IF NOT EXISTS `validation_audit_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `applicant_id` BIGINT UNSIGNED NOT NULL,
    `actor_name` VARCHAR(100) NOT NULL DEFAULT 'SISTEM',
    `actor_role` VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    `action` VARCHAR(50) NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `remarks` TEXT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `applicants`(`id`) ON DELETE CASCADE,
    INDEX `idx_applicant_action` (`applicant_id`, `action`)
) ENGINE=InnoDB;

-- 7. Jadual Pengguna Sistem (Users / Staff)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPERADMIN', 'BRANCH_OFFICER', 'AUDITOR') NOT NULL DEFAULT 'BRANCH_OFFICER',
    `branch_id` INT UNSIGNED NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `last_login` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

## 7. Reka Bentuk Kod PHP 8.5 (Architecture & Best Practices)

Dalam PHP 8.5, seni bina modul dibina dengan kelebihan bahasa terkini:

### 7.1 Enum Moden untuk Status
```php
<?php
declare(strict_types=1);

namespace ValiLusia\Enums;

enum ValidationStatus: string
{
    case Draft = 'DRAFT';
    case PendingReview = 'PENDING_REVIEW';
    case ActionRequired = 'ACTION_REQUIRED';
    case Verified = 'VERIFIED';
    case Rejected = 'REJECTED';

    public function badgeClass(): string
    {
        return match($this) {
            self::Draft => 'badge-secondary',
            self::PendingReview => 'badge-warning',
            self::ActionRequired => 'badge-danger',
            self::Verified => 'badge-success',
            self::Rejected => 'badge-dark',
        };
    }

    public function labelMalay(): string
    {
        return match($this) {
            self::Draft => 'Draf',
            self::PendingReview => 'Menunggu Semakan',
            self::ActionRequired => 'Perlu Kemaskini',
            self::Verified => 'Telah Disahkan',
            self::Rejected => 'Ditolak',
        };
    }
}
```

### 7.2 Readonly DTO untuk Data Pemohon
```php
<?php
declare(strict_types=1);

namespace ValiLusia\DTO;

use DateTimeImmutable;
use ValiLusia\Enums\Gender;
use ValiLusia\Enums\RoomType;

readonly class ApplicantSubmissionDTO
{
    public function __construct(
        public string $bookingRef,
        public string $fullName,
        public string $icNumber,
        public string $passportNumber,
        public DateTimeImmutable $passportExpiry,
        public DateTimeImmutable $departureDate,
        public Gender $gender,
        public RoomType $roomType,
        public string $phone,
        public string $email,
        public ?string $specialNeeds = null
    ) {}

    public function isPassportValidForTravel(): bool
    {
        $minValidDate = $this->departureDate->modify('+180 days');
        return $this->passportExpiry >= $minValidDate;
    }
}
```

### 7.3 Validasi Keselamatan Fail Muat Naik (Upload Security)
```php
<?php
declare(strict_types=1);

namespace ValiLusia\Services;

use RuntimeException;

class DocumentUploadService
{
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'application/pdf' => 'pdf',
    ];
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    public function validateAndStore(array $fileInfo, string $uploadDir): string
    {
        if (!isset($fileInfo['error']) || $fileInfo['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException("Ralat muat naik fail.");
        }

        if ($fileInfo['size'] > self::MAX_SIZE_BYTES) {
            throw new RuntimeException("Saiz fail melebihi had maksimum 5MB.");
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $fileInfo['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($mime, self::ALLOWED_MIME)) {
            throw new RuntimeException("Format fail tidak dibenarkan. Hanya JPG, PNG dan PDF sahaja diterima.");
        }

        $ext = self::ALLOWED_MIME[$mime];
        $safeFileName = bin2hex(random_bytes(16)) . '.' . $ext;
        $destination = rtrim($uploadDir, '/') . '/' . $safeFileName;

        if (!move_uploaded_file($fileInfo['tmp_name'], $destination)) {
            throw new RuntimeException("Gagal menyimpan fail ke storan selamat.");
        }

        return $safeFileName;
    }
}
```

---

## 8. Halaman Antaramuka Pengguna (UI/UX Mockups di `docs/`)

Fail antaramuka pengguna disediakan secara lengkap dan interaktif dalam direktori `docs/`:

1. **`docs/index.html` (Borang Validasi Jemaah 4 Langkah)**
   - Header korporat Andalusia dengan warna tema hijau zamrud (*Royal Emerald*), biru laut (*Deep Navy*), dan aksen emas (*Gold*).
   - Penunjuk kemajuan langkah (*Stepper Wizard 1-2-3-4*).
   - Validasi langsung masa-nyata:
     * Pengesahan MyKad automatik mengira umur dan jantina.
     * Amaran automatik jika pasport tamat tempoh dalam tempoh kurang 6 bulan dari tarikh penerbangan.
     * Zon seret dan lepas fail (*Drag-and-Drop file uploader*) dengan pratonton imej segera dan penunjuk saiz fail.
   - Kad semakan ringkasan (*Summary Confirmation Card*) sebelum penghantaran.
   - Modal kejayaan (*Success Modal*) berserta kod pengesahan dan slip tempahan untuk cetakan/simpanan jemaah.

2. **`docs/status.html` (Portal Semakan Status Permohonan Jemaah)**
   - Carian layan diri menggunakan No. MyKad / Pasport & No. Rujukan Tempahan.
   - Paparan garis masa (*Status Timeline*) 4 peringkat:
     1. Borang Dihantar ➔ 2. Dalam Semakan Dokumen ➔ 3. Pengesahan Pakej & Bilik ➔ 4. Selesai / Siap Pelepasan.
   - Penjelasan nota sekiranya pegawai meminta kemaskini dokumen (*Action Required*).
   - Butang muat turun slip pengesahan digital (PDF).

3. **`docs/admin_review.html` (Papan Pemuka Pegawai Operasi & Audit Dokumen)**
   - Paparan senarai permohonan terkini mengikut cawangan dan status.
   - Mod pemeriksaan bersebelahan (*Side-by-side Inspection Modal*):
     * Kiri: Butiran data pemohon dan rekod tempahan.
     * Kanan: Pembaca dokumen interaktif (zoom, putar imej pasport, semakan tarikh imbasan).
   - Butang tindakan pantas: **Luluskan Validasi**, **Minta Kemaskini** (beserta kotak mesej kepada jemaah), atau **Tolak**.
   - Tab Log Audit (*Audit Trail*) memaparkan rekod sejarah semakan secara masa-nyata.

4. **`docs/styles.css`**
   - Reka bentuk moden berasaskan CSS Grid, Flexbox, variabel tema moden, tipografi kemas, penyesuaian kontras mesra pengguna, dan sokongan peranti mudah alih 100%.

5. **`docs/app.js`**
   - Skrip Vanilla JS pintar tanpa sebarang kebergantungan luar (*zero-dependency*), mengandungi fungsi pengesahan nombor kad pengenalan Malaysia, semakan tarikh tamat pasport, pengurusan muat naik fail interaktif, pertukaran langkah borang, dan simulasi data status.

---

## 9. Pematuhan Keselamatan & Privasi Data (PDPA 2010)

Sistem ini mematuhi prinsip utama Akta Perlindungan Data Peribadi 2010 (Malaysia):
1. **Prinsip Am:** Data hanya dikumpul bagi tujuan sah pengesahan perjalanan, pengeluaran tiket penerbangan, pendaftaran visa, dan tempahan bilik penginapan.
2. **Prinsip Keselamatan:**
   - Fail pasport dan MyKad tidak disimpan di direktori awam (*public HTML root*).
   - Akses kepada fail disahkan melalui session pegawai yang berdaftar.
   - Kata laluan pengguna dienkripsi menggunakan algoritma `PASSWORD_ARGON2ID` atau `PASSWORD_BCRYPT` terkini PHP 8.5.
   - Semua input dibersihkan untuk mengelakkan serangan SQL Injection dan Cross-Site Scripting (XSS).
3. **Prinsip Penyimpanan:** Data imej dokumen yang telah selesai perjalanan boleh diarkibkan atau dipadamkan secara automatik mengikut polisi pengekalan data syarikat (*Data Retention Policy*).

---

## 10. Pelan Pelaksanaan & Fasa Pembangunan

| Fasa | Skop Tugas | Hasil / Deliverable |
|---|---|---|
| **Fasa 1: Reka Bentuk & PRD** | Penyediaan PRD menyeluruh, skema pangkalan data MariaDB, dan antaramuka HTML/CSS/JS dalam `docs/`. | Fail `PRD.md`, `docs/index.html`, `docs/status.html`, `docs/admin_review.html`, `docs/styles.css`, `docs/app.js`. |
| **Fasa 2: Pangkalan Data** | Pelaksanaan fail migrasi SQL MariaDB 11.x, indeks, dan data awalan (*seed data* cawangan dan pakej). | `docs/database.sql` dan konfigurasi sambungan PDO PHP 8.5. |
| **Fasa 3: Pembangunan Backend PHP 8.5** | Pembinaan pengendali borang (*Form Handlers*), Enums, DTO, pengesah MyKad/Pasport, dan perkhidmatan muat naik fail. | Kod teras PHP 8.5 dengan prinsip OOP dan PSR-12. |
| **Fasa 4: Integrasi & Ujian (Testing)** | Ujian fungsi borang (*Happy path* & *Edge cases*), ujian muat naik pelbagai fail, ujian keselamatan penetrasi CSRF/XSS, dan semakan prestasi. | Laporan Ujian Validasi (*Test Verification Report*). |
| **Fasa 5: Pelancaran & Audit** | Pemasangan di pelayan produksi, konfigurasi SSL, sandaran automatik MariaDB, dan sesi taklimat pegawai cawangan. | Sistem aktif digunakan oleh jemaah dan pegawai Andalusia. |
