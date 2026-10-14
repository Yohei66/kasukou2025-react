<?php
// 管理者ログイン。ユーザーテーブルは使わず、環境変数の単一管理者と照合する。
header('Content-Type: application/json; charset=utf-8');
require_once 'admin_guard.php';
admin_session_start();

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$username = is_string($input['username'] ?? null) ? $input['username'] : '';
$password = is_string($input['password'] ?? null) ? $input['password'] : '';

if (!admin_verify($username, $password)) {
    usleep(300000); // 総当たりをわずかに鈍らせる
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '認証に失敗しました'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 認証成功。セッションを作り直して固定化攻撃を防ぐ
session_regenerate_id(true);
$_SESSION['admin_logged_in'] = true;
echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
