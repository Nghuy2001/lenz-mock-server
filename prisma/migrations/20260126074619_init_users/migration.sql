-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(50) NOT NULL,
    `user_type` INTEGER NOT NULL,
    `user_identifier` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `application_status` INTEGER NOT NULL,
    `push_enabled` BOOLEAN NOT NULL,
    `access_token` TEXT NULL,
    `refresh_token` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_user_identifier_key`(`user_identifier`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
