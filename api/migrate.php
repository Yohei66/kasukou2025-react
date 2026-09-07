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

// 行事予定表。1行=1行事のシンプルな構成。
// 曜日は日付から求められるので持たない（編集時に日付と食い違うのを防ぐ）。
$pdo->exec("
    CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `event_date` DATE NOT NULL,
        `title` VARCHAR(100) NOT NULL,
        `place` VARCHAR(50) NOT NULL DEFAULT '',
        KEY idx_event_date (`event_date`)
    )
");

// ドキュメント（PDF）。実体は api/public/documents/ に置き、ここには名前だけを持つ。
// sort_order は画面に出す順番。同値なら id 順。
$pdo->exec("
    CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(100) NOT NULL,
        `file_name` VARCHAR(255) NOT NULL,
        `original_name` VARCHAR(255) NOT NULL DEFAULT '',
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` DATETIME NOT NULL,
        KEY idx_sort (`sort_order`)
    )
");

// 外部サイトへのリンク集。
$pdo->exec("
    CREATE TABLE IF NOT EXISTS links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(100) NOT NULL,
        `url` VARCHAR(500) NOT NULL,
        `sort_order` INT NOT NULL DEFAULT 0,
        KEY idx_sort (`sort_order`)
    )
");

/**
 * 初期データの投入。
 * DB 化する前に画面へベタ書きされていた内容を、テーブルが空のときだけ入れる。
 * 管理画面で消した項目が復活しないよう、必ず件数を見てから入れること。
 */
function seed_if_empty(PDO $pdo, string $table, string $sql, array $rows): void
{
    if ((int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn() > 0) {
        return;
    }
    $stmt = $pdo->prepare($sql);
    foreach ($rows as $row) {
        $stmt->execute($row);
    }
}

// ドキュメントの初期値。PDF の実体は api/public/documents/ に同名で置いてある
$seedDocuments = [
    ['クラブ規約', 'kiyaku20240601.pdf'],
    ['入部届け', 'nyuukaitodoke202503.pdf'],
    ['ジュニア誓約書', 'seiyakusho2021.pdf'],
    ['休退復部届け', 'kyuubutodoke202503.pdf'],
    ['クラブ運営のアンケート結果', '2015_questionnaire.pdf'],
    ['クラブ細部マナー事項', 'tennis_manner.pdf'],
];
$documentRows = [];
foreach ($seedDocuments as $i => $doc) {
    $documentRows[] = [$doc[0], $doc[1], $doc[1], ($i + 1) * 10, date('Y-m-d H:i:s')];
}
seed_if_empty(
    $pdo,
    'documents',
    'INSERT INTO documents (`title`, `file_name`, `original_name`, `sort_order`, `created_at`) VALUES (?, ?, ?, ?, ?)',
    $documentRows
);

seed_if_empty(
    $pdo,
    'links',
    'INSERT INTO links (`title`, `url`, `sort_order`) VALUES (?, ?, ?)',
    [
        ['春日部市テニス協会', 'https://www.k-t-a.org/', 10],
        ['埼玉県テニス協会', 'https://sta-tennis.org/', 20],
        ['日本女子テニス連盟埼玉県支部', 'https://jltf-saitama.org/', 30],
    ]
);

echo json_encode(['success' => true, 'message' => 'マイグレーション完了']);
