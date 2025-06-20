<?php
// api/login.php
header('Content-Type: application/json');
session_start();
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
file_put_contents('php_input.log', print_r($input, true)); // 追加
$username = $input['username']  ?? '';
$password = $input['password']  ?? '';

// ユーザー取得
$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '認証に失敗しました']);
    exit;
}

// 認証成功 → セッションに保存
$_SESSION['user_id'] = $user['id'];
echo json_encode(['success' => true]);
