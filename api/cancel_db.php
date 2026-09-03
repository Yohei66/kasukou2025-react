<?php
// キャンセル情報用のDB接続とテーブル準備（初回アクセス時に自動作成）
require __DIR__ . '/db.php';

$pdo->exec(
    "CREATE TABLE IF NOT EXISTS cancellations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        `court_type`   VARCHAR(20)  NOT NULL,   -- Onuma / Tatenuma
        `year_month`   VARCHAR(6)   NOT NULL,   -- 例: 202506
        `date_label`   VARCHAR(20)  NOT NULL,   -- 例: 6月1日
        `court`        VARCHAR(10)  NOT NULL,   -- 例: A / B
        `time_slot`    VARCHAR(10)  NOT NULL,   -- 例: 9-11
        `reason`       VARCHAR(255) NOT NULL,   -- キャンセル理由（雨・熱中症アラート等）
        `canceller`    VARCHAR(100) NOT NULL,   -- キャンセル者の氏名
        `cancelled_at` DATETIME     NOT NULL,   -- キャンセルした日時
        `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_reservation (`court_type`, `year_month`, `date_label`, `court`, `time_slot`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

// --- マイグレーション -------------------------------------------------
// コート単位（time_slot なし）で作られた旧テーブルを時間帯単位へ移行する
$hasTimeSlot = (int)$pdo->query(
    "SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'cancellations'
       AND COLUMN_NAME = 'time_slot'"
)->fetchColumn();

if ($hasTimeSlot === 0) {
    $slots = require __DIR__ . '/slots.php';

    $pdo->exec("ALTER TABLE cancellations ADD COLUMN `time_slot` VARCHAR(10) NOT NULL DEFAULT '' AFTER `court`");
    try {
        $pdo->exec("ALTER TABLE cancellations DROP INDEX uniq_reservation");
    } catch (Exception $e) {
        // 旧インデックスが無い場合は無視
    }

    // 旧データ（コート丸ごと中止）は全時間帯の中止として展開する
    $old = $pdo->query("SELECT * FROM cancellations WHERE `time_slot` = ''")->fetchAll();
    if ($old) {
        $ins = $pdo->prepare(
            "INSERT INTO cancellations
                (`court_type`, `year_month`, `date_label`, `court`, `time_slot`, `reason`, `canceller`, `cancelled_at`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        foreach ($old as $row) {
            foreach ($slots as $slot) {
                $ins->execute([
                    $row['court_type'], $row['year_month'], $row['date_label'],
                    $row['court'], $slot, $row['reason'], $row['canceller'], $row['cancelled_at'],
                ]);
            }
        }
        $pdo->exec("DELETE FROM cancellations WHERE `time_slot` = ''");
    }

    $pdo->exec(
        "ALTER TABLE cancellations
         ADD UNIQUE KEY uniq_reservation (`court_type`, `year_month`, `date_label`, `court`, `time_slot`)"
    );
}
