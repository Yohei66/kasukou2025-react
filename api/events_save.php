<?php
/**
 * 行事予定表の保存（管理者のみ）。
 *
 * 受け取る JSON:
 *   { "events": [ { "date": "2026-06-01", "title": "球春祭", "place": "大沼" }, ... ] }
 *
 * 件数が多くないので、行ごとの更新ではなく全件の洗い替えにしている。
 * 管理画面の表がそのまま DB の中身になるので、消した行＝削除で分かりやすい。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';
require_once 'admin_guard.php';

admin_require_login();
require_post();

$data = read_json_body();
if (!isset($data['events']) || !is_array($data['events'])) {
    content_fail(400, 'events がありません');
}
if (count($data['events']) > 500) {
    content_fail(400, '行事は500件までです');
}

// 先に全行を検証する。1行でも不正なら何も書き換えない
$rows = [];
foreach ($data['events'] as $i => $entry) {
    if (!is_array($entry)) {
        content_fail(400, ($i + 1) . '行目の形式が不正です');
    }
    $date = valid_date_or_null($entry['date'] ?? '');
    if ($date === null) {
        content_fail(400, ($i + 1) . '行目: 日付を YYYY-MM-DD で入力してください');
    }
    $title = clean_text($entry['title'] ?? '', 100);
    if ($title === '') {
        content_fail(400, ($i + 1) . '行目: 行事名を入力してください');
    }
    $rows[] = [$date, $title, clean_text($entry['place'] ?? '', 50)];
}

$pdo->beginTransaction();
try {
    $pdo->exec('DELETE FROM events');
    $insert = $pdo->prepare('INSERT INTO events (`event_date`, `title`, `place`) VALUES (?, ?, ?)');
    foreach ($rows as $row) {
        $insert->execute($row);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    content_fail(500, '保存に失敗しました: ' . $e->getMessage());
}

send_json(['success' => true, 'count' => count($rows)]);
