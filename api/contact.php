<?php
/**
 * 見学・体験の問い合わせ受付
 *
 *   POST /api/contact.php
 *     { name, email, experience, preferred_days[], message, website }
 *
 * 送信内容はまず DB に保存し、そのうえでメール通知する。
 * メールが飛ばなくても問い合わせは残るので、取りこぼしが起きない。
 *
 * 宛先は環境変数 CONTACT_TO、差出人は CONTACT_FROM で設定する。
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once 'db.php';
require_once 'courts_common.php';

/** 1時間に同じ IP から受け付ける上限 */
const RATE_LIMIT_PER_HOUR = 5;

/** 用件。件名と、テニス歴・希望日を扱うかどうかが変わる */
const TOPICS = [
    'visit'    => '見学・体験のお申し込み',
    'question' => 'クラブについてのご質問',
    'other'    => 'その他のお問い合わせ',
];

const EXPERIENCES = [
    'none'      => 'テニスは未経験',
    'blank'     => '学生時代以来のブランクあり',
    'some'      => '数年の経験あり',
    'active'    => '現在もプレーしている',
    'unknown'   => '未回答',
];

/** 参加希望日は第3希望まで */
const MAX_PREFERRED_DATES = 3;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    send_json(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$input = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

// ハニーポット。人間には見えない項目なので、埋まっていればボット。
// 相手に見破られないよう、成功したように見せて黙って捨てる。
if (clean_text($input['website'] ?? '', 100) !== '') {
    send_json(['ok' => true]);
}

$name = clean_text($input['name'] ?? '', 60);
$email = clean_text($input['email'] ?? '', 120);
$message = clean_text($input['message'] ?? '', 2000);

$errors = [];
if ($name === '') {
    $errors['name'] = 'お名前を入力してください。';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'メールアドレスを正しく入力してください。';
}
if ($message === '') {
    $errors['message'] = 'お問い合わせ内容を入力してください。';
}
if ($errors) {
    send_json(['ok' => false, 'error' => 'validation', 'errors' => $errors], 400);
}

$topicKey = clean_text($input['topic'] ?? '', 20);
$topic = TOPICS[$topicKey] ?? TOPICS['other'];

// テニス歴と希望日は見学・体験のときだけ意味を持つ
$isVisit = $topicKey === 'visit';

$experience = '';
if ($isVisit) {
    $experienceKey = clean_text($input['experience'] ?? '', 20);
    $experience = EXPERIENCES[$experienceKey] ?? EXPERIENCES['unknown'];
}

$dates = [];
if ($isVisit && isset($input['preferred_dates']) && is_array($input['preferred_dates'])) {
    $today = today_jst();
    foreach ($input['preferred_dates'] as $raw) {
        if (count($dates) >= MAX_PREFERRED_DATES) {
            break;
        }
        $d = clean_text($raw, 10);
        // 形式が正しく、過去日でなく、重複していないものだけ受け付ける
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)
            && $d >= $today
            && !in_array($d, $dates, true)) {
            $dates[] = $d;
        }
    }
}
$preferredDates = implode(' / ', $dates);

$ip = clean_text($_SERVER['REMOTE_ADDR'] ?? '', 45);

// 同じ相手からの連投を抑える
try {
    $stmt = $pdo->prepare('
        SELECT COUNT(*) FROM inquiries
        WHERE `ip` = ? AND `created_at` >= DATE_SUB(?, INTERVAL 1 HOUR)
    ');
    $stmt->execute([$ip, now_jst_sql()]);
    if ((int)$stmt->fetchColumn() >= RATE_LIMIT_PER_HOUR) {
        send_json([
            'ok' => false,
            'error' => 'rate_limited',
            'message' => '短時間に送信が続いています。しばらく時間をおいてからお試しください。',
        ], 429);
    }
} catch (Throwable $e) {
    // 上限チェックに失敗しても受付自体は続ける
}

// ---- 保存 ----
try {
    $stmt = $pdo->prepare('
        INSERT INTO inquiries
            (`name`, `email`, `topic`, `experience`, `preferred_dates`, `message`, `ip`, `mail_sent`, `created_at`)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    ');
    $stmt->execute([$name, $email, $topic, $experience, $preferredDates, $message, $ip, now_jst_sql()]);
    $id = (int)$pdo->lastInsertId();
} catch (Throwable $e) {
    send_json([
        'ok' => false,
        'error' => 'save_failed',
        'message' => '送信に失敗しました。時間をおいてお試しください。',
    ], 500);
}

// ---- メール通知 ----
$to = (string)(getenv('CONTACT_TO') ?: '');
$from = (string)(getenv('CONTACT_FROM') ?: '');
$sent = false;

if ($to !== '' && $from !== '') {
    $subject = '【HP】' . $topic . '（' . $name . ' 様）';

    $lines = [
        'ホームページのフォームから問い合わせがありました。',
        '',
        '受付日時: ' . now_jst(),
        '用件　　: ' . $topic,
        'お名前　: ' . $name,
        'メール　: ' . $email,
    ];
    if ($isVisit) {
        $lines[] = 'テニス歴: ' . $experience;
        $lines[] = '希望日　: ' . ($preferredDates !== '' ? $preferredDates : '未記入');
    }
    $lines = array_merge($lines, [
        '',
        '--- お問い合わせ内容 ---',
        $message,
        '',
        '（受付番号: ' . $id . '）',
    ]);
    $body = implode("\n", $lines);

    // 差出人はクラブ側のアドレスにし、返信先だけ問い合わせ者にする。
    // 送信者を相手のアドレスにすると SPF で弾かれて届かなくなるため。
    $headers = implode("\r\n", [
        'From: ' . mb_encode_mimeheader('春日部硬式テニスクラブ') . ' <' . $from . '>',
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
    ]);

    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    $sent = @mb_send_mail($to, $subject, $body, $headers);

    if ($sent) {
        try {
            $pdo->prepare('UPDATE inquiries SET `mail_sent` = 1 WHERE id = ?')->execute([$id]);
        } catch (Throwable $e) {
            // 通知は済んでいるので、フラグ更新の失敗は無視してよい
        }
    }
}

// メールが飛ばなくても内容は保存済みなので、利用者には成功として返す
send_json(['ok' => true, 'mail_sent' => $sent]);
