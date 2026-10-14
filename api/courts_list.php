<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$court_type = $_GET['court_type'] ?? '';
$year_month = $_GET['year_month'] ?? '';

if (!$court_type || !$year_month) {
    http_response_code(400);
    echo json_encode(['error' => 'パラメータ不足']);
    exit;
}

$stmt = $pdo->prepare('
    SELECT `id`, `date_str`, `day_of_week`, `court_name`, `time_9_11`, `time_11_13`, `time_13_15`, `time_15_17`, `note`
    FROM courts
    WHERE `court_type` = ? AND `year_month` = ?
    ORDER BY `date_str`, `court_name`
');
$stmt->execute([$court_type, $year_month]);
$rows = $stmt->fetchAll();

$result = array_map(function ($row) {
    return [
        'id'      => (int)$row['id'],
        '日付'    => $row['date_str'],
        '曜日'    => $row['day_of_week'],
        'コート'  => $row['court_name'],
        '9-11'    => $row['time_9_11'],
        '11-13'   => $row['time_11_13'],
        '13-15'   => $row['time_13_15'],
        '15-17'   => $row['time_15_17'],
        '備考'    => $row['note'],
    ];
}, $rows);

echo json_encode($result, JSON_UNESCAPED_UNICODE);
