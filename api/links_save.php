<?php
/**
 * リンク集の保存（管理者のみ）。
 *
 * 受け取る JSON:
 *   { "links": [ { "title": "春日部市テニス協会", "url": "https://..." }, ... ] }
 *
 * 行事予定表と同じく全件の洗い替え。並び順は配列の順番をそのまま使う。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';
require_once 'admin_guard.php';

admin_require_login();
require_post();

$data = read_json_body();
if (!isset($data['links']) || !is_array($data['links'])) {
    content_fail(400, 'links がありません');
}
if (count($data['links']) > 200) {
    content_fail(400, 'リンクは200件までです');
}

$rows = [];
foreach ($data['links'] as $i => $entry) {
    if (!is_array($entry)) {
        content_fail(400, ($i + 1) . '行目の形式が不正です');
    }
    $title = clean_text($entry['title'] ?? '', 100);
    if ($title === '') {
        content_fail(400, ($i + 1) . '行目: 表示名を入力してください');
    }
    $url = valid_url_or_null($entry['url'] ?? '');
    if ($url === null) {
        content_fail(400, ($i + 1) . '行目: URL は http:// または https:// で始まる形式で入力してください');
    }
    $rows[] = [$title, $url, ($i + 1) * 10];
}

$pdo->beginTransaction();
try {
    $pdo->exec('DELETE FROM links');
    $insert = $pdo->prepare('INSERT INTO links (`title`, `url`, `sort_order`) VALUES (?, ?, ?)');
    foreach ($rows as $row) {
        $insert->execute($row);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    content_fail(500, '保存に失敗しました: ' . $e->getMessage());
}

send_json(['success' => true, 'count' => count($rows)]);
