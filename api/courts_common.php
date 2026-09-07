<?php
/**
 * コート関連 API の共通処理。
 * courts_import.php / courts_today.php / cancel.php から読み込む。
 */

/** DB に入れる場所の識別子 */
const COURT_TYPES = ['Onuma', 'Tatenuma'];

/** 面（A面・B面） */
const COURT_NAMES = ['A', 'B'];

/** 時間帯に対応するカラム。並び順が slot 番号 0〜3 に対応する */
const SLOT_COLUMNS = ['time_9_11', 'time_11_13', 'time_13_15', 'time_15_17'];

/** 表示順と表示名。トップページはこの順で並べる */
const LOCATIONS = [
    ['key' => 'Tatenuma', 'label' => '立沼'],
    ['key' => 'Onuma',    'label' => '大沼'],
];

/** 中止の理由 */
const CANCEL_REASONS = ['rain', 'heat', 'thunder', 'wind', 'other'];

/** JSON を返して終了する */
function send_json($payload, int $status = 200): void
{
    if ($status !== 200) {
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/** location 表記のゆれ（onuma / Onuma / 大沼）を court_type に正規化する */
function normalize_court_type(string $raw): ?string
{
    $map = [
        'onuma'    => 'Onuma',
        'tatenuma' => 'Tatenuma',
        '大沼'      => 'Onuma',
        '立沼'      => 'Tatenuma',
    ];
    return $map[strtolower(trim($raw))] ?? $map[trim($raw)] ?? null;
}

/**
 * 日本時間の今日。
 * コンテナのタイムゾーンが UTC だと深夜〜早朝に前日を返してしまうため、
 * 日付の判定は必ずこの関数を通す。
 */
function today_jst(): string
{
    return (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format('Y-m-d');
}

/** 日本時間の現在時刻（分まで）。画面表示用 */
function now_jst(): string
{
    return (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format('Y-m-d H:i');
}

/**
 * DB に保存する現在時刻。
 * MariaDB の NOW() はコンテナのタイムゾーン（UTC）を返してしまい、
 * 読み出したときに9時間ずれるため、日本時間の文字列を明示的に渡す。
 */
function now_jst_sql(): string
{
    return (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format('Y-m-d H:i:s');
}

/** 制御文字を除き、長さを詰めた文字列を返す */
function clean_text($value, int $max): string
{
    $v = is_scalar($value) ? trim((string)$value) : '';
    $stripped = preg_replace('/[\x00-\x1F\x7F]/', '', $v);
    if (is_string($stripped)) {
        $v = $stripped;
    }
    return mb_substr($v, 0, $max);
}

/** YYYY-MM-DD 形式でなければ今日を返す */
function valid_date_or_today(?string $raw): string
{
    $date = clean_text($raw ?? '', 10);
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : today_jst();
}
