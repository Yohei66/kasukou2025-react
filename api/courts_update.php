<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id = isset($data['id']) ? (int)$data['id'] : 0;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'IDが必要です']);
    exit;
}

$stmt = $pdo->prepare('
    UPDATE courts SET
        `time_9_11`  = ?,
        `time_11_13` = ?,
        `time_13_15` = ?,
        `time_15_17` = ?,
        `note`       = ?
    WHERE `id` = ?
');

$stmt->execute([
    $data['9-11']  ?? '',
    $data['11-13'] ?? '',
    $data['13-15'] ?? '',
    $data['15-17'] ?? '',
    $data['備考']  ?? '',
    $id,
]);

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
