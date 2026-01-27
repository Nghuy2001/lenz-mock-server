-- CreateTable
CREATE TABLE `mock_response` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `response` JSON NOT NULL,
    `status_code` INTEGER NOT NULL DEFAULT 200,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mock_response_file_name_key`(`file_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
