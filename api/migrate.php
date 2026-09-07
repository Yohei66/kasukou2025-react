<?php
require_once 'db.php';

$pdo->exec("
    CREATE TABLE IF NOT EXISTS courts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `court_type` VARCHAR(50) NOT NULL,
        `year_month` CHAR(6) NOT NULL,
        `date_str` VARCHAR(10) NOT NULL,
        `day_of_week` VARCHAR(2) NOT NULL,
        `court_name` VARCHAR(100) NOT NULL,
        `time_9_11` VARCHAR(200) DEFAULT '',
        `time_11_13` VARCHAR(200) DEFAULT '',
        `time_13_15` VARCHAR(200) DEFAULT '',
        `time_15_17` VARCHAR(200) DEFAULT '',
        `note` VARCHAR(500) DEFAULT '',
        UNIQUE KEY unique_record (`court_type`, `year_month`, `date_str`, `court_name`)
    )
");

// コートの中止（キャンセル）連絡。
// 1枠（日付 × 場所 × 面 × 時間帯）につき最大1件なので、その組み合わせに一意制約を張る。
$pdo->exec("
    CREATE TABLE IF NOT EXISTS cancellations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `date_str` CHAR(10) NOT NULL,
        `court_type` VARCHAR(20) NOT NULL,
        `court_name` VARCHAR(10) NOT NULL,
        `slot` TINYINT NOT NULL,
        `reason` VARCHAR(20) NOT NULL,
        `name` VARCHAR(30) NOT NULL,
        `comment` VARCHAR(100) NOT NULL DEFAULT '',
        `created_at` DATETIME NOT NULL,
        UNIQUE KEY unique_slot (`date_str`, `court_type`, `court_name`, `slot`),
        KEY idx_date (`date_str`)
    )
");

// 見学・体験の問い合わせ。
// メール送信に失敗しても内容が消えないよう、まず DB に保存してから送る。
$pdo->exec("
    CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(60) NOT NULL,
        `email` VARCHAR(120) NOT NULL,
        `topic` VARCHAR(20) NOT NULL DEFAULT '',
        `experience` VARCHAR(40) NOT NULL DEFAULT '',
        `preferred_dates` VARCHAR(120) NOT NULL DEFAULT '',
        `message` TEXT NOT NULL,
        `ip` VARCHAR(45) NOT NULL DEFAULT '',
        `mail_sent` TINYINT NOT NULL DEFAULT 0,
        `created_at` DATETIME NOT NULL,
        KEY idx_created (`created_at`)
    )
");

// 用件の追加と、参加できそうな曜日 → 参加希望日 への差し替え。
// 既に作成済みのテーブルにも追従させる（MariaDB の IF NOT EXISTS / IF EXISTS を使用）
$pdo->exec("
    ALTER TABLE inquiries
        ADD COLUMN IF NOT EXISTS `topic` VARCHAR(20) NOT NULL DEFAULT '' AFTER `email`,
        ADD COLUMN IF NOT EXISTS `preferred_dates` VARCHAR(120) NOT NULL DEFAULT '' AFTER `experience`,
        DROP COLUMN IF EXISTS `preferred_days`
");

echo json_encode(['success' => true, 'message' => 'マイグレーション完了']);
