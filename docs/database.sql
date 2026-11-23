-- ==============================================================================
-- Pangkalan Data: vali_lusia_db
-- Sistem Borang Validasi Travel & Umrah Andalusia (Vali-Lusia)
-- Disediakan untuk: MariaDB 11.x / MySQL 8.x + PHP 8.5
-- Karakter Enkod: utf8mb4 | Kolasi: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `vali_lusia_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `vali_lusia_db`;

-- 1. Jadual Cawangan Andalusia
DROP TABLE IF EXISTS `validation_audit_logs`;
DROP TABLE IF EXISTS `applicant_documents`;
DROP TABLE IF EXISTS `applicants`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `packages`;
DROP TABLE IF EXISTS `branches`;

CREATE TABLE `branches` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `state` VARCHAR(50) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Jadual Pakej Travel / Umrah
CREATE TABLE `packages` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Jadual Tempahan Utama (Bookings)
CREATE TABLE `bookings` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Jadual Jemaah / Penumpang (Applicants)
CREATE TABLE `applicants` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Jadual Dokumen Sokongan (Applicant Documents)
CREATE TABLE `applicant_documents` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Jadual Log Audit (Validation Audit Trail)
CREATE TABLE `validation_audit_logs` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Jadual Pengguna Sistem (Users / Staff)
CREATE TABLE `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DATA AWALAN (SEED DATA)
-- ==============================================================================

-- Cawangan Andalusia
INSERT INTO `branches` (`code`, `name`, `phone`, `email`, `state`) VALUES
('BR-HQ', 'Ibu Pejabat Desa Pandan, KL', '03-9284 8888', 'hq@andalusiatravel.com.my', 'Kuala Lumpur'),
('BR-SA', 'Cawangan Shah Alam Seksyen 9', '03-5511 2233', 'shahalam@andalusiatravel.com.my', 'Selangor'),
('BR-JB', 'Cawangan Johor Bahru (Bandar Baru Uda)', '07-234 5678', 'jb@andalusiatravel.com.my', 'Johor'),
('BR-KB', 'Cawangan Kota Bharu', '09-741 2345', 'kotabharu@andalusiatravel.com.my', 'Kelantan'),
('BR-PNG', 'Cawangan Seberang Jaya, Pulau Pinang', '04-398 7654', 'penang@andalusiatravel.com.my', 'Pulau Pinang');

-- Pakej Perjalanan / Umrah
INSERT INTO `packages` (`code`, `title`, `category`, `departure_date`, `return_date`, `airline`) VALUES
('PKG-UMR-2612', 'Pakej Umrah Cuti Sekolah Disember 2026 (12H 10M)', 'UMRAH', '2026-12-18', '2026-12-29', 'Saudi Arabian Airlines (SV)'),
('PKG-UMR-2701', 'Pakej Umrah Awal Rejab Musim Sejuk (12H 10M)', 'UMRAH', '2027-01-15', '2027-01-26', 'Malaysia Airlines (MH)'),
('PKG-UMR-2703', 'Pakej Umrah Ramadhan Al-Mubarak 1448H', 'UMRAH', '2027-03-05', '2027-03-20', 'Saudi Arabian Airlines (SV)'),
('PKG-TUR-2612', 'Pelancongan Grand Turki & Bursa Musim Salji', 'PELANCONGAN_ISLAMIK', '2026-12-22', '2027-01-01', 'Turkish Airlines (TK)');

-- Tempahan Contoh
INSERT INTO `bookings` (`id`, `booking_ref`, `package_id`, `branch_id`, `lead_applicant_name`, `contact_phone`, `contact_email`, `total_pax`, `payment_status`) VALUES
(1, 'AND-2026-8801', 1, 1, 'MUHAMMAD AMIN BIN ABDULLAH', '012-3456789', 'amin.abdullah@gmail.com', 2, 'FULL_PAID'),
(2, 'AND-2026-8802', 2, 2, 'SITI AISHAH BINTI ZAINAL', '019-8765432', 'aishah.zainal@yahoo.com', 1, 'DEPOSIT_PAID');

-- Jemaah Contoh
INSERT INTO `applicants` (`id`, `booking_id`, `validation_code`, `full_name`, `ic_number`, `passport_number`, `passport_expiry`, `passport_country`, `gender`, `birth_date`, `room_type`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `validation_status`) VALUES
(1, 1, 'VAL-882194', 'MUHAMMAD AMIN BIN ABDULLAH', '880512-14-5521', 'A52918234', '2028-11-20', 'MALAYSIA', 'LELAKI', '1988-05-12', 'DOUBLE', 'FATIMAH BINTI OMAR', '012-9988776', 'ISTERI', 'VERIFIED'),
(2, 2, 'VAL-991205', 'SITI AISHAH BINTI ZAINAL', '920815-10-6188', 'A77123490', '2027-09-30', 'MALAYSIA', 'PEREMPUAN', '1992-08-15', 'QUAD', 'ZAINAL BIN HASHIM', '013-3344556', 'BAPA', 'PENDING_REVIEW');

-- Dokumen Contoh
INSERT INTO `applicant_documents` (`applicant_id`, `document_type`, `original_filename`, `stored_filename`, `file_path`, `file_size_bytes`, `mime_type`, `is_verified`, `verification_note`) VALUES
(1, 'PASSPORT', 'passport_amin.jpg', 'doc_f3a1c8b9d0e2_passport.jpg', '/storage/secure_uploads/doc_f3a1c8b9d0e2_passport.jpg', 1450200, 'image/jpeg', 1, 'Pasport jelas, tarikh tamat sah > 6 bulan.'),
(1, 'MYKAD', 'mykad_amin.pdf', 'doc_a9c8b7e6f5d4_mykad.pdf', '/storage/secure_uploads/doc_a9c8b7e6f5d4_mykad.pdf', 840500, 'application/pdf', 1, 'Salinan MyKad depan belakang lengkap.'),
(2, 'PASSPORT', 'passport_aishah.jpg', 'doc_b1c2d3e4f5a6_passport.jpg', '/storage/secure_uploads/doc_b1c2d3e4f5a6_passport.jpg', 2100400, 'image/jpeg', 0, 'Menunggu semakan pegawai');

-- Log Audit
INSERT INTO `validation_audit_logs` (`applicant_id`, `actor_name`, `actor_role`, `action`, `previous_status`, `new_status`, `remarks`, `ip_address`) VALUES
(1, 'SISTEM', 'SYSTEM', 'SUBMISSION_RECEIVED', 'DRAFT', 'PENDING_REVIEW', 'Borang validasi dihantar secara dalam talian.', '127.0.0.1'),
(1, 'USTAZ FARHAN (PEGAWAI HQ)', 'BRANCH_OFFICER', 'STATUS_UPDATED', 'PENDING_REVIEW', 'VERIFIED', 'Semua dokumen telah disemak dan disahkan lengkap serta memenuhi syarat visa Saudi.', '192.168.1.50'),
(2, 'SISTEM', 'SYSTEM', 'SUBMISSION_RECEIVED', 'DRAFT', 'PENDING_REVIEW', 'Borang validasi dihantar secara dalam talian.', '127.0.0.1');

-- Pengguna Sistem
INSERT INTO `users` (`name`, `username`, `email`, `password_hash`, `role`, `branch_id`) VALUES
('Pentadbir Sistem', 'admin', 'admin@andalusiatravel.com.my', '$2y$12$K19oQz8u5uI4oW1cM8gQReXmXjT7jZ3vN6c6uQx9p5jD1f8l1b1v2', 'SUPERADMIN', 1),
('Ustaz Farhan Mohd', 'farhan', 'farhan@andalusiatravel.com.my', '$2y$12$K19oQz8u5uI4oW1cM8gQReXmXjT7jZ3vN6c6uQx9p5jD1f8l1b1v2', 'BRANCH_OFFICER', 1),
('Nurul Huda', 'huda_sa', 'huda@andalusiatravel.com.my', '$2y$12$K19oQz8u5uI4oW1cM8gQReXmXjT7jZ3vN6c6uQx9p5jD1f8l1b1v2', 'BRANCH_OFFICER', 2);
