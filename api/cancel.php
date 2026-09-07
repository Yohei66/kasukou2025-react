<?php
/**
 * コート中止（キャンセル）連絡 API
 *
 *   GET  ?date=YYYY-MM-DD   … その日の中止状況（省略時は日本時間の今日）
 *   GET  ?month=YYYY-MM     … その月の中止状況（月別ページ用）
 *   POST action=cancel      … 1枠を中止として登録（合言葉必須）
 *   POST action=clear       … 中止を取り消す（合言葉必須）
 *
 * 合言葉は環境変数 CANCEL_PASSWORD から読む。
 * 未設定なら書き込みを一切受け付けない（フェイルクローズ）。
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once 'db.php';
require_once 'courts_common.php';

/** 1件の中止情報を画面表示用の形にする */
function cancel_entry(array $row): array
{
    return [
        'reason'  => $row['reason'],
        'name'    => $row['name'],
        'comment' => $row['comment'],
        'at'      => (new DateTime($row['created_at']))->format('Y-m-d H:i'),
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ---- 参照（合言葉なしで誰でも見られる） --------------------------------
if ($method === 'GET') {
    if (isset($_GET['month'])) {
        $month = clean_text($_GET['month'], 7);
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            send_json(['ok' => false, 'error' => 'bad_month', 'message' => 'month は YYYY-MM 形式で指定してください。'], 400);
        }
        $stmt = $pdo->prepare('SELECT * FROM cancellations WHERE `date_str` LIKE ? ORDER BY `date_str`');
        $stmt->execute([$month . '-%']);
    } else {
        $date = valid_date_or_today($_GET['date'] ?? null);
        $stmt = $pdo->prepare('SELECT * FROM cancellations WHERE `date_str` = ?');
        $stmt->execute([$date]);
    }

    // { "2026-09-07": { "Onuma": { "A": { "slot0": {...} } } } } の形に組み立てる。
    // PHP は "0" のような数値文字列キーを整数添字に変換し、JSON が配列になってしまうため、
    // 時間帯のキーには必ず "slot" を前置して非数値にしておく。
    $out = [];
    foreach ($stmt->fetchAll() as $row) {
        $out[$row['date_str']][$row['court_type']][$row['court_name']]['slot' . (int)$row['slot']] = cancel_entry($row);
    }

    if (isset($month)) {
        send_json(['ok' => true, 'month' => $month, 'cancellations' => (object)$out]);
    }
    send_json([
        'ok' => true,
        'date' => $date,
        'cancellations' => (object)($out[$date] ?? []),
    ]);
}

if ($method !== 'POST') {
    send_json(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

// ---- 更新（合言葉が必要） ------------------------------------------------
$password = (string)(getenv('CANCEL_PASSWORD') ?: '');
if ($password === '') {
    send_json([
        'ok' => false,
        'error' => 'config_missing',
        'message' => '合言葉が未設定です。環境変数 CANCEL_PASSWORD を設定してください。',
    ], 500);
}

$input = $_POST;
if (empty($input)) {
    $decoded = json_decode((string)file_get_contents('php://input'), true);
    if (is_array($decoded)) {
        $input = $decoded;
    }
}

// タイミング攻撃に配慮して hash_equals。総当たりを鈍らせるため失敗時は少し待つ
if (!hash_equals($password, is_string($input['password'] ?? null) ? $input['password'] : '')) {
    usleep(300000);
    send_json(['ok' => false, 'error' => 'bad_password', 'message' => '合言葉が違います。'], 401);
}

$date = valid_date_or_today($input['date'] ?? null);

// location / court_type どちらの名前でも受け取れるようにしておく
$court_type = normalize_court_type((string)($input['court_type'] ?? $input['location'] ?? ''));
$court_name = strtoupper(clean_text($input['court_name'] ?? $input['court'] ?? '', 10));
$slot = clean_text($input['slot'] ?? '', 2);

if ($court_type === null
    || !in_array($court_name, COURT_NAMES, true)
    || !in_array($slot, ['0', '1', '2', '3'], true)) {
    send_json(['ok' => false, 'error' => 'bad_target', 'message' => '対象（場所・面・時間帯）が不正です。'], 400);
}
$slot = (int)$slot;

$action = (string)($input['action'] ?? '');

if ($action === 'cancel') {
    $reason = clean_text($input['reason'] ?? '', 20);
    if (!in_array($reason, CANCEL_REASONS, true)) {
        send_json(['ok' => false, 'error' => 'bad_reason', 'message' => '理由が不正です。'], 400);
    }
    $name = clean_text($input['name'] ?? '', 30);
    if ($name === '') {
        send_json(['ok' => false, 'error' => 'name_required', 'message' => 'キャンセルした人の名前を入力してください。'], 400);
    }
    $comment = clean_text($input['comment'] ?? '', 100);

    // 同じ枠に再登録された場合は上書きする
    $stmt = $pdo->prepare('
        INSERT INTO cancellations
            (`date_str`, `court_type`, `court_name`, `slot`, `reason`, `name`, `comment`, `created_at`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `reason` = VALUES(`reason`),
            `name` = VALUES(`name`),
            `comment` = VALUES(`comment`),
            `created_at` = VALUES(`created_at`)
    ');
    $stmt->execute([$date, $court_type, $court_name, $slot, $reason, $name, $comment, now_jst_sql()]);

    send_json([
        'ok' => true,
        'entry' => ['reason' => $reason, 'name' => $name, 'comment' => $comment, 'at' => now_jst()],
    ]);
}

if ($action === 'clear') {
    $stmt = $pdo->prepare('
        DELETE FROM cancellations
        WHERE `date_str` = ? AND `court_type` = ? AND `court_name` = ? AND `slot` = ?
    ');
    $stmt->execute([$date, $court_type, $court_name, $slot]);
    send_json(['ok' => true]);
}

send_json(['ok' => false, 'error' => 'bad_action'], 400);
