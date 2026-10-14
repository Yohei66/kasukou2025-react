<?php
/**
 * 本日（または指定日）のコート予約状況と、その日の中止連絡をまとめて返す。
 *
 * GET /api/courts_today.php                 … 今日（日本時間）
 * GET /api/courts_today.php?date=2026-11-06 … 指定日（動作確認用）
 *
 * courts_import.php が date_str を "YYYY-MM-DD" で保存しているため、
 * 日付の完全一致で当日分を引ける。
 * 予約状況と中止情報を1回のリクエストで返すので、画面側は待ち時間が1回で済む。
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once 'db.php';
require_once 'courts_common.php';

$date = valid_date_or_today($_GET['date'] ?? null);

try {
    $stmt = $pdo->prepare('
        SELECT `court_type`, `day_of_week`, `court_name`,
               `time_9_11`, `time_11_13`, `time_13_15`, `time_15_17`, `note`
        FROM courts
        WHERE `date_str` = ?
        ORDER BY `court_type`, `court_name`
    ');
    $stmt->execute([$date]);
    $rows = $stmt->fetchAll();

    $cancelStmt = $pdo->prepare('SELECT * FROM cancellations WHERE `date_str` = ?');
    $cancelStmt->execute([$date]);
    $cancelRows = $cancelStmt->fetchAll();
} catch (Throwable $e) {
    send_json(['ok' => false, 'error' => 'query_failed'], 500);
}

// [court_type][court_name][slot] で引けるようにしておく
$cancels = [];
foreach ($cancelRows as $row) {
    $cancels[$row['court_type']][$row['court_name']][(int)$row['slot']] = [
        'reason'  => $row['reason'],
        'name'    => $row['name'],
        'comment' => $row['comment'],
        'at'      => (new DateTime($row['created_at']))->format('Y-m-d H:i'),
    ];
}

$dayOfWeek = '';
$byLocation = [];
foreach ($rows as $row) {
    $type = $row['court_type'];
    if ($dayOfWeek === '' && $row['day_of_week'] !== '') {
        $dayOfWeek = $row['day_of_week'];
    }
    if (!isset($byLocation[$type])) {
        $byLocation[$type] = ['note' => '', 'courts' => []];
    }
    // 備考は日付単位の情報なので、最初に見つかったものを採用する
    if ($byLocation[$type]['note'] === '' && $row['note'] !== '') {
        $byLocation[$type]['note'] = $row['note'];
    }

    $name = (string)$row['court_name'];
    $slots = [];
    $slotCancels = [];
    foreach (SLOT_COLUMNS as $i => $col) {
        $slots[] = (string)$row[$col];
        $slotCancels[] = $cancels[$type][$name][$i] ?? null;
    }
    $byLocation[$type]['courts'][] = [
        'name'    => $name,
        'slots'   => $slots,
        'cancels' => $slotCancels,
    ];
}

$locations = [];
foreach (LOCATIONS as $loc) {
    $found = isset($byLocation[$loc['key']]);
    $locations[] = [
        'key'    => $loc['key'],
        'label'  => $loc['label'],
        'found'  => $found,
        'note'   => $found ? $byLocation[$loc['key']]['note'] : '',
        'courts' => $found ? $byLocation[$loc['key']]['courts'] : [],
    ];
}

send_json([
    'ok'          => true,
    'date'        => $date,
    'day_of_week' => $dayOfWeek,
    'locations'   => $locations,
]);
