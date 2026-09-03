<?php
// 当日キャンセルの登録 (POST)
// body(JSON): { password, court_type, year_month, date_label, court, time_slot, reason, canceller }
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
$reason    = trim((string)($input['reason']     ?? ''));
$canceller = trim((string)($input['canceller'] ?? ''));

// パスワード照合（タイミング攻撃対策に hash_equals を使用）
if (!hash_equals((string)$config['cancel_password'], $password)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'パスワードが違います']);
    exit;
}

// 必須項目チェック
if ($courtType === '' || $yearMonth === '' || $dateLabel === '' || $court === '' || $canceller === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '入力項目が不足しています']);
    exit;
}

// 時間帯チェック（CSVのヘッダーに存在する時間帯のみ受け付ける）
if (!in_array($timeSlot, $slots, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '時間帯の指定が不正です']);
    exit;
}

try {
    // 同じ枠に対する再登録は上書き（理由・キャンセル者・日時を更新）
    $stmt = $pdo->prepare(
        "INSERT INTO cancellations
            (`court_type`, `year_month`, `date_label`, `court`, `time_slot`, `reason`, `canceller`, `cancelled_at`)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
            `reason` = VALUES(`reason`),
            `canceller` = VALUES(`canceller`),
            `cancelled_at` = NOW()"
    );
    $stmt->execute([$courtType, $yearMonth, $dateLabel, $court, $timeSlot, $reason, $canceller]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
