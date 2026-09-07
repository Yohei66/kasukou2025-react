<?php
/**
 * 管理者認証の共通処理。
 * 管理者は1人だけなので、ユーザーテーブルは持たず設定値と照合する。
 *   ADMIN_USER     … 管理者のユーザー名
 *   ADMIN_PASSWORD … 管理者のパスワード
 * 値の置き場所（config.php / 環境変数）は config_load.php を参照。
 * ログイン成功時にセッションへ印を付け、書き込み系 API はそれを確認する。
 */
require_once __DIR__ . '/config_load.php';

/** ログインセッションを開始しておく（各APIの先頭で呼ぶ） */
function admin_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

/** 現在のセッションがログイン済みか */
function admin_is_logged_in(): bool
{
    admin_session_start();
    return !empty($_SESSION['admin_logged_in']);
}

/**
 * ユーザー名・パスワードを環境変数と照合する。
 * 環境変数が未設定なら、誰も入れない（フェイルクローズ）。
 */
function admin_verify(string $user, string $password): bool
{
    $envUser = config_value('ADMIN_USER');
    $envPass = config_value('ADMIN_PASSWORD');
    if ($envUser === '' || $envPass === '') {
        return false;
    }
    // タイミング攻撃に配慮して hash_equals で比較する
    return hash_equals($envUser, $user) && hash_equals($envPass, $password);
}

/** ログイン済みでなければ 401 を返して処理を止める（書き込み系 API の先頭で呼ぶ） */
function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(401);
        echo json_encode(
            ['success' => false, 'error' => 'unauthorized', 'message' => 'ログインが必要です'],
            JSON_UNESCAPED_UNICODE
        );
        exit;
    }
}
