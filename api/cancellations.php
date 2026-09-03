<?php
// キャンセル一覧の取得 (GET)
// 例: /api/cancellations.php?court_type=Onuma&year_month=202506
//     /api/cancellations.php?year_month=202506&date_label=6月7日  （トップの当日枠用：両コート分）
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/cancel_db.php';

// 指定されたパラメータだけで絞り込む（未指定は全件）
$filters = [
    'court_type' => trim((string)($_GET['court_type'] ?? '')),
    'year_month' => trim((string)($_GET['year_month'] ?? '')),
    'date_label' => trim((string)($_GET['date_label'] ?? '')),
];

$where  = [];
$params = [];
foreach ($filters as $column => $value) {
    if ($value !== '') {
        $where[]  = "`$column` = ?";
        $params[] = $value;
    }
}

$sql = "SELECT `court_type`, `year_month`, `date_label`, `court`, `time_slot`, `reason`, `canceller`, `cancelled_at`
        FROM cancellations";
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'cancellations' => $stmt->fetchAll()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
