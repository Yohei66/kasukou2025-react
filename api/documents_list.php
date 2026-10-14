<?php
/**
 * ドキュメント（PDF）の一覧（公開ページ用）。
 * path は API から見た相対パス。画面側は "/api/" を付けて参照する。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';

$rows = $pdo->query('
    SELECT `id`, `title`, `file_name`, `original_name`
    FROM documents
    ORDER BY `sort_order`, `id`
')->fetchAll();

send_json(array_map(fn($row) => [
    'id'           => (int)$row['id'],
    'title'        => $row['title'],
    'path'         => 'public/documents/' . rawurlencode($row['file_name']),
    'originalName' => $row['original_name'] !== '' ? $row['original_name'] : $row['file_name'],
], $rows));
