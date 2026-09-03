<?php
// 当日キャンセルの取り消し（予約の復活） (POST)
// body(JSON): { password, court_type, year_month, date_label, court, time_slot }
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/cancel_db.php';
$config = require __DIR__ . '/config.php';
$slots  = require __DIR__ . '/slots.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$password  = (string)($input['password']   ?? '');
$courtType = trim((string)($input['court_type'] ?? ''));
$yearMonth = trim((string)($input['year_month'] ?? ''));
$dateLabel = trim((string)($input['date_label'] ?? ''));
$court     = trim((string)($input['court']      ?? ''));
$timeSlot  = trim((string)($input['time_slot']  ?? ''));

// パスワード照合（タイミング攻撃対策に hash_equals を使用）
if (!hash_equals((string)$config['cancel_password'], $password)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'パスワードが違います']);
    exit;
}

// 必須項目チェック
if ($courtType === '' || $yearMonth === '' || $dateLabel === '' || $court === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '入力項目が不足しています']);
    exit;
}

if (!in_array($timeSlot, $slots, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '時間帯の指定が不正です']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "DELETE FROM cancellations
         WHERE `court_type` = ? AND `year_month` = ? AND `date_label` = ? AND `court` = ? AND `time_slot` = ?"
    );
    $stmt->execute([$courtType, $yearMonth, $dateLabel, $court, $timeSlot]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
