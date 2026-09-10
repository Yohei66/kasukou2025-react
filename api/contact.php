<?php
/**
 * 見学・体験の問い合わせ受付
 *
 *   POST /api/contact.php
 *     { name, email, experience, preferred_days[], message, website }
 *
 * 送信内容はまず DB に保存し、そのうえでメールを2通送る。
 *   1通目: クラブへの通知（宛先 CONTACT_TO）
 *   2通目: 問い合わせた方への受付確認（控え）
 * メールが飛ばなくても問い合わせは残るので、取りこぼしが起きない。
 *
 * 宛先は環境変数 CONTACT_TO、差出人は CONTACT_FROM で設定する。
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once 'config_load.php';
require_once 'db.php';
require_once 'courts_common.php';
require_once 'mailer.php';

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

/** メールの差出人名 */
const CLUB_NAME = '春日部硬式テニスクラブ';

/**
 * クラブ名を差出人名にしてメールを送る。実際の送信は mailer.php が行う。
 *
 * 差出人は2通とも設定ファイルの CONTACT_FROM で固定し、返信先だけ変える。
 * 送信者を問い合わせ者のアドレスにすると SPF で弾かれるため。
 */
function send_club_mail(string $to, string $subject, string $body, string $from, string $replyTo, array $extraHeaders = []): bool
{
    return send_utf8_mail($to, $subject, $body, $from, CLUB_NAME, $replyTo, $extraHeaders);
}

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
// 本文は改行を残す（メールに載るときに1行に潰れないように）
$message = clean_multiline_text($input['message'] ?? '', 2000);

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
$to = config_value('CONTACT_TO');
$from = config_value('CONTACT_FROM');
$sent = false;
$replySent = false;

if ($to !== '' && $from !== '') {
    // 受付内容。クラブへの通知と、問い合わせた方への控えの両方で使う。
    // 項目名は［］で囲む。受信側が等幅でない書体でも、どこが値か分かるように。
    $items = [
        '［用件］' . $topic,
        '［お名前］' . $name . ' 様',
        '［メールアドレス］' . $email,
        '［受付日時］' . now_jst(),
    ];
    if ($isVisit) {
        $items[] = '［テニス歴］' . $experience;
        $items[] = '［参加希望日］' . ($preferredDates !== '' ? $preferredDates : '未記入');
    }
    $items = array_merge($items, [
        '',
        '［お問い合わせ内容］',
        $message,
    ]);

    // ---- 1通目: クラブへの通知。返信先は問い合わせた方にする ----
    $body = implode("\n", array_merge([
        'ホームページのフォームから問い合わせがありました。',
        '',
    ], $items, [
        '',
        '------------------------------',
        'このメールはホームページのフォームから自動送信されています。',
        'そのまま返信すると、お問い合わせいただいた方（' . $email . '）に直接届きます。',
        '受付番号: ' . $id,
    ]));

    $sent = send_club_mail($to, '【HP】' . $topic . '（' . $name . ' 様）', $body, $from, $email);

    if ($sent) {
        try {
            $pdo->prepare('UPDATE inquiries SET `mail_sent` = 1 WHERE id = ?')->execute([$id]);
        } catch (Throwable $e) {
            // 通知は済んでいるので、フラグ更新の失敗は無視してよい
        }
    }

    // ---- 2通目: 問い合わせた方への受付確認。返信先はクラブにする ----
    // 送信できたか不安にならないよう、控えを返す。
    // クラブのアドレスは本文に書かない（Reply-To で返信は届く）。
    $replyBody = implode("\n", array_merge([
        $name . ' 様',
        '',
        'このたびは' . CLUB_NAME . 'へお問い合わせいただき、ありがとうございます。',
        '下記の内容で受け付けました。担当者から数日以内にご返信いたします。',
        '',
    ], $items, [
        '',
        '------------------------------',
        'このメールは送信内容の控えとして自動でお送りしています。',
        '内容の訂正や追加のご質問は、このメールにそのまま返信してください。',
        'しばらく経っても担当者から連絡が届かない場合は、お手数ですが',
        'ホームページのフォームから再度お送りください。',
        '',
        CLUB_NAME,
        '受付番号: ' . $id,
    ]));

    // Auto-Submitted は自動返信であることの標準的な表明（RFC 3834）。
    // 相手が不在通知を設定していても、返信の往復にならない。
    $replySent = send_club_mail(
        $email,
        '【' . CLUB_NAME . '】お問い合わせを受け付けました',
        $replyBody,
        $from,
        $to,
        ['Auto-Submitted: auto-replied']
    );
}

// メールが飛ばなくても内容は保存済みなので、利用者には成功として返す
send_json(['ok' => true, 'mail_sent' => $sent, 'reply_sent' => $replySent]);
