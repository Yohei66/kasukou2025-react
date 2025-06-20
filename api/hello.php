<?php
header('Content-Type: application/json');
// 簡易 CORS 許可（開発用）
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'message' => 'Hello from PHP!',
    'time'    => date('Y-m-d H:i:s')
]);
