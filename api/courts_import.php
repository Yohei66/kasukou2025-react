<?php
/**
 * コート予約状況の取り込み（JSON形式）
 *
 * 受け取る JSON は現行サイトと同じ形式:
 *   {
 *     "year": 2026, "month": 11, "location": "onuma",
 *     "days": [
 *       { "day": 1, "dow": "日", "a": ["〇","〇","×","×"], "b": [...], "memo": "..." },
 *       ...
 *     ]
 *   }
 *
 * days は予約のある日だけを含む（該当日が無い＝データ無し）。
 * a / b は A面 / B面の 9-11, 11-13, 13-15, 15-17 の4枠。
 * 値は 〇（確保済み）、×（未確保）、D（Dコートを確保）。
 *
 * DB へは 1日あたり A面・B面の2行として格納する。
 * 同じ court_type / year_month は洗い替え（DELETE してから INSERT）。
 */
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';
require_once 'courts_common.php';

/** 4枠ぶんの値を取り出す。不足分は空文字で埋める */
function normalize_slots($raw): array
{
    $slots = is_array($raw) ? array_values($raw) : [];
    $out = [];
    for ($i = 0; $i < 4; $i++) {
        $v = $slots[$i] ?? '';
        $out[] = is_scalar($v) ? mb_substr(trim((string)$v), 0, 200) : '';
    }
    return $out;
}

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- 入力の取得（ファイルアップロード / 生の JSON ボディ の両対応） ----
$raw = '';
if (isset($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $raw = (string)file_get_contents($_FILES['file']['tmp_name']);
} else {
    $raw = (string)file_get_contents('php://input');
}
if (trim($raw) === '') {
    fail(400, 'JSONが空です');
}

// UTF-8 BOM 除去
$raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);

$data = json_decode($raw, true);
if (!is_array($data)) {
    fail(400, 'JSONを解析できませんでした');
}

// ---- 必須項目の検証 ----
$year  = isset($data['year']) ? (int)$data['year'] : 0;
$month = isset($data['month']) ? (int)$data['month'] : 0;
if ($year < 2000 || $year > 2100) {
    fail(400, 'year が不正です');
}
if ($month < 1 || $month > 12) {
    fail(400, 'month が不正です');
}

$court_type = normalize_court_type((string)($data['location'] ?? ''));
if ($court_type === null) {
    fail(400, 'location は onuma または tatenuma を指定してください');
}

if (!isset($data['days']) || !is_array($data['days'])) {
    fail(400, 'days がありません');
}

$year_month = sprintf('%04d%02d', $year, $month);

// ---- 洗い替えして登録 ----
$pdo->beginTransaction();
try {
    $del = $pdo->prepare('DELETE FROM courts WHERE `court_type` = ? AND `year_month` = ?');
    $del->execute([$court_type, $year_month]);

    $insert = $pdo->prepare('
        INSERT INTO courts
            (`court_type`, `year_month`, `date_str`, `day_of_week`, `court_name`,
             `time_9_11`, `time_11_13`, `time_13_15`, `time_15_17`, `note`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $count = 0;
    foreach ($data['days'] as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $day = isset($entry['day']) ? (int)$entry['day'] : 0;
        if ($day < 1 || $day > 31) {
            continue;
        }

        // 日付は "YYYY-MM-DD" で保持する。並び替えと当日の絞り込みが素直になる
        $date_str = sprintf('%04d-%02d-%02d', $year, $month, $day);
        $dow  = mb_substr(trim((string)($entry['dow'] ?? '')), 0, 2);
        $memo = mb_substr(trim((string)($entry['memo'] ?? '')), 0, 500);

        // 1日ぶんを A面 / B面 の2行に展開する
        foreach (['A' => 'a', 'B' => 'b'] as $court_name => $key) {
            $slots = normalize_slots($entry[$key] ?? null);
            $insert->execute([
                $court_type,
                $year_month,
                $date_str,
                $dow,
                $court_name,
                $slots[0],
                $slots[1],
                $slots[2],
                $slots[3],
                $memo,
            ]);
            $count++;
        }
    }

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fail(500, '登録に失敗しました: ' . $e->getMessage());
}

echo json_encode([
    'success'    => true,
    'count'      => $count,
    'days'       => count($data['days']),
    'court_type' => $court_type,
    'year_month' => $year_month,
], JSON_UNESCAPED_UNICODE);
