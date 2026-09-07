<?php
/** リンク集の一覧（公開ページ用）。 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';

$rows = $pdo->query('
    SELECT `id`, `title`, `url`
    FROM links
    ORDER BY `sort_order`, `id`
')->fetchAll();

send_json(array_map(fn($row) => [
    'id'    => (int)$row['id'],
    'title' => $row['title'],
    'url'   => $row['url'],
], $rows));
