<?php
/**
 * 行事予定表の一覧（公開ページ用）。
 * 日付順に全件返す。曜日は日付から求めて添える。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'content_common.php';

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

$rows = $pdo->query('
    SELECT `id`, `event_date`, `title`, `place`
    FROM events
    ORDER BY `event_date`, `id`
')->fetchAll();

$result = array_map(function ($row) {
    $date = new DateTime($row['event_date']);
    return [
        'id'    => (int)$row['id'],
        'date'  => $row['event_date'],
        'dow'   => DOW_LABELS[(int)$date->format('w')],
        'title' => $row['title'],
        'place' => $row['place'],
    ];
}, $rows);

send_json($result);
