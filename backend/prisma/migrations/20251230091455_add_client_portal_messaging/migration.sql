/*
  Warnings:

  - You are about to drop the column `client_name` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `scope_document_url` on the `bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference_code]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_scope` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_code` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `service_id` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `documents` DROP FOREIGN KEY `documents_booking_id_fkey`;

-- DropIndex
DROP INDEX `bookings_service_id_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `documents_booking_id_fkey` ON `documents`;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `client_name`,
    DROP COLUMN `company`,
    DROP COLUMN `email`,
    DROP COLUMN `message`,
    DROP COLUMN `phone`,
    DROP COLUMN `scope_document_url`,
    ADD COLUMN `additional_info` TEXT NULL,
    ADD COLUMN `assigned_to` INTEGER NULL,
    ADD COLUMN `budget` VARCHAR(191) NULL,
    ADD COLUMN `client_id` INTEGER NOT NULL,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    ADD COLUMN `project_scope` TEXT NOT NULL,
    ADD COLUMN `reference_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `status_history` JSON NULL,
    ADD COLUMN `timeline` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `service_id` INTEGER NOT NULL,
    MODIFY `status` ENUM('new', 'contacted', 'in_progress', 'testing', 'report_ready', 'completed', 'cancelled') NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE `case_studies` ADD COLUMN `impact_metric` VARCHAR(255) NULL,
    ADD COLUMN `logo` VARCHAR(100) NULL,
    ADD COLUMN `stats` JSON NULL;

-- AlterTable
ALTER TABLE `homepage_content` ADD COLUMN `eyebrow` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `subtitle` TEXT NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `faq` JSON NULL,
    ADD COLUMN `hero_image` VARCHAR(500) NULL,
    MODIFY `type` ENUM('web_pentest', 'mobile_pentest', 'osint', 'incident_response', 'red_teaming', 'cloud_security', 'threat_intel', 'training', 'api_security', 'other') NOT NULL;

-- AlterTable
ALTER TABLE `statistics` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `suffix` VARCHAR(10) NULL;

-- CreateTable
CREATE TABLE `clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `phone` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_login_at` DATETIME(3) NULL,

    UNIQUE INDEX `clients_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `sender_type` ENUM('client', 'admin') NOT NULL,
    `client_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `content` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `uploaded_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_logos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(500) NULL,
    `category` VARCHAR(191) NULL,
    `website` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `technologies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `category` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `process_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `step_number` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `bookings_reference_code_key` ON `bookings`(`reference_code`);

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_attachments` ADD CONSTRAINT `message_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_files` ADD CONSTRAINT `booking_files_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
