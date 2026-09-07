<?php
/**
 * ドキュメントの名前・並び順の保存と削除（管理者のみ）。
 *
 * 受け取る JSON:
 *   { "documents": [ { "id": 3, "title": "クラブ規約" }, ... ] }
 *
 * 配列の順番がそのまま表示順になる。
 * ここに無い id は削除とみなし、PDF の実体も消す。
 * 新規登録は documents_upload.php（ファイルが要るため）。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';
require_once 'admin_guard.php';

admin_require_login();
require_post();

$data = read_json_body();
if (!isset($data['documents']) || !is_array($data['documents'])) {
    content_fail(400, 'documents がありません');
}

// 送られてきた行を検証する。存在しない id は弾く
$existing = [];
foreach ($pdo->query('SELECT `id`, `file_name` FROM documents')->fetchAll() as $row) {
    $existing[(int)$row['id']] = $row['file_name'];
}

$rows = [];
$keep = [];
foreach ($data['documents'] as $i => $entry) {
    if (!is_array($entry)) {
        content_fail(400, ($i + 1) . '行目の形式が不正です');
    }
    $id = (int)($entry['id'] ?? 0);
    if (!isset($existing[$id])) {
        content_fail(400, ($i + 1) . '行目: 対象のドキュメントが見つかりません');
    }
    if (isset($keep[$id])) {
        content_fail(400, '同じドキュメントが重複しています');
    }
    $title = clean_text($entry['title'] ?? '', 100);
    if ($title === '') {
        content_fail(400, ($i + 1) . '行目: 名前を入力してください');
    }
    $keep[$id] = true;
    $rows[] = [$title, ($i + 1) * 10, $id];
}

// 一覧から外れたものが削除対象
$deleteIds = array_values(array_diff(array_keys($existing), array_keys($keep)));

$pdo->beginTransaction();
try {
    $update = $pdo->prepare('UPDATE documents SET `title` = ?, `sort_order` = ? WHERE `id` = ?');
    foreach ($rows as $row) {
        $update->execute($row);
    }
    if ($deleteIds) {
        $placeholders = implode(',', array_fill(0, count($deleteIds), '?'));
        $pdo->prepare("DELETE FROM documents WHERE `id` IN ($placeholders)")->execute($deleteIds);
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    content_fail(500, '保存に失敗しました: ' . $e->getMessage());
}

// DB から消えてから実ファイルを片付ける（順番が逆だと、失敗時にリンク切れが残る）
foreach ($deleteIds as $id) {
    $path = document_path((string)$existing[$id]);
    if ($path !== null && is_file($path)) {
        @unlink($path);
    }
}

send_json(['success' => true, 'count' => count($rows), 'deleted' => count($deleteIds)]);
