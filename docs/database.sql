-- ==============================================================================
-- Pangkalan Data: vali_lusia_db
-- Sistem Pendaftaran Maklumat Jemaah Andalusia (Vali-Lusia)
-- Disediakan untuk: MariaDB 11.x / MySQL 8.x + PHP 8.5
-- Karakter Enkod: utf8mb4 | Kolasi: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `vali_lusia_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `vali_lusia_db`;

-- Padam jadual lama jika wujud
DROP TABLE IF EXISTS `applicants`;
DROP TABLE IF EXISTS `admin_users`;

-- 1. Jadual Jemaah (Applicants) - Hanya Nama & No Telefon
CREATE TABLE `applicants` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `validation_code` VARCHAR(40) NOT NULL UNIQUE,
    `full_name` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `validation_status` ENUM(
        'PENDING_REVIEW', 
        'ACTION_REQUIRED', 
        'VERIFIED', 
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING_REVIEW',
    `officer_notes` TEXT NULL,
    `reviewed_by` VARCHAR(100) NULL,
    `reviewed_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_validation_code` (`validation_code`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_validation_status` (`validation_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Jadual Pegawai / Pengguna Portal Pentadbir
CREATE TABLE `admin_users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPERADMIN', 'BRANCH_OFFICER') NOT NULL DEFAULT 'BRANCH_OFFICER',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- Data Contoh / Permulaan (Seed Data)
-- ==============================================================================

INSERT INTO `applicants` (`validation_code`, `full_name`, `phone`, `validation_status`, `officer_notes`, `created_at`) VALUES
('VAL-882194', 'MUHAMMAD AMIN BIN ABDULLAH', '012-3456789', 'VERIFIED', 'Jemaah telah dihubungi dan mengesahkan pendaftaran.', NOW() - INTERVAL 1 HOUR),
('VAL-991205', 'SITI AISHAH BINTI ZAINAL', '019-8765432', 'PENDING_REVIEW', NULL, NOW() - INTERVAL 30 MINUTE),
('VAL-773412', 'KHAIRUL ANUAR BIN MD NOR', '017-6543210', 'PENDING_REVIEW', NULL, NOW() - INTERVAL 15 MINUTE);

INSERT INTO `admin_users` (`username`, `full_name`, `email`, `password_hash`, `role`) VALUES
('admin_hq', 'Ustaz Farhan Mohd', 'farhan@andalusia.my', '$2y$12$e8XG7wK/6j8UZbZq8R/aI.gP3K1hL0Qv4zN/xM3vL8YpPq2wZk6eC', 'BRANCH_OFFICER');
