<?php
// 現在のセッションがログイン済みかを返す。画面のガード（RequireAuth）が参照する。
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once 'admin_guard.php';

echo json_encode(['authenticated' => admin_is_logged_in()], JSON_UNESCAPED_UNICODE);
