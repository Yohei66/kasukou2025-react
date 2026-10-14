<?php
/**
 * メール送信。
 *
 * 送り方は2通りあり、設定によって切り替わる。
 *   SMTP_HOST / SMTP_USER / SMTP_PASSWORD がそろっている → SMTP 認証で送る（推奨）
 *   そろっていない                                        → PHP の mail()（sendmail 経由）
 *
 * 【なぜ SMTP を使うのか】
 *  レンタルサーバーの sendmail 経由だと、Exim がエンベロープ送信者（Return-Path）を
 *  サーバーのアカウント（例 account@s325.xrea.com）に固定する。信頼されていない
 *  ユーザーからの -f 指定は無視されるため、こちらでは変えられない。
 *  すると SPF は pass しても、照合されたドメインが From のドメインと一致しないので
 *  DMARC のアライメントが失敗し、Gmail では「◯◯.xrea.com 経由」と表示されて
 *  迷惑メールに振り分けられやすい。
 *
 *  SMTP 認証で送ると、認証したメールボックスがそのまま送信者になる。
 *  CONTACT_FROM を認証したアドレスと同じにしておけば From と一致し、
 *  SPF が差出人ドメインで pass する。
 *
 * 【文字コード】
 *  mb_send_mail() は使わない。mb_language('Japanese') のとき本文だけ ISO-2022-JP に
 *  変換され、こちらが付けた Content-Type（UTF-8）と食い違って日本語が消えるため。
 *  UTF-8 のまま Base64 にして、ヘッダも自分で組む。
 */

require_once __DIR__ . '/config_load.php';

/** メールの改行は CRLF（RFC 5322） */
const MAIL_EOL = "\r\n";

/** SMTP の応答を待つ秒数 */
const SMTP_TIMEOUT = 15;

/**
 * UTF-8 の日本語メールを1通送る。送れたら true。
 *
 * $extraHeaders には Auto-Submitted のような追加ヘッダを渡す。
 */
function send_utf8_mail(
    string $to,
    string $subject,
    string $body,
    string $from,
    string $fromName,
    string $replyTo,
    array $extraHeaders = []
): bool {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
        error_log('mail: 宛先または差出人のアドレスが不正');
        return false;
    }

    $subjectHeader = mb_encode_mimeheader($subject, 'UTF-8', 'B', MAIL_EOL);
    $bodyEncoded = rtrim(chunk_split(base64_encode(str_replace("\n", MAIL_EOL, $body)), 76, MAIL_EOL));

    // Date と Message-ID は PHP では付かず MTA 任せになる。欠けていたり
    // Message-ID が差出人と別ドメインだと迷惑メール判定されやすいので自分で付ける。
    $headers = array_merge([
        'From: ' . mb_encode_mimeheader($fromName, 'UTF-8', 'B', MAIL_EOL) . ' <' . $from . '>',
        'Reply-To: ' . $replyTo,
        'Date: ' . (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format(DateTime::RFC2822),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . mail_domain_of($from) . '>',
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ], $extraHeaders);

    $host = config_value('SMTP_HOST');
    $user = config_value('SMTP_USER');
    $password = config_value('SMTP_PASSWORD');

    if ($host === '' || $user === '' || $password === '') {
        // sendmail 経由。-f は上記のとおり無視されることが多いが、
        // 通る環境（自前サーバーなど）では効くので指定しておく。
        return @mail($to, $subjectHeader, $bodyEncoded, implode(MAIL_EOL, $headers), '-f' . $from);
    }

    // SMTP では To と Subject もこちらで組む（mail() が付けてくれる分）
    $data = implode(MAIL_EOL, array_merge([
        'To: ' . $to,
        'Subject: ' . $subjectHeader,
    ], $headers)) . MAIL_EOL . MAIL_EOL . $bodyEncoded;

    return smtp_send($host, (int)config_value('SMTP_PORT', '465'), $user, $password, $from, $to, $data);
}

/** メールアドレスの @ より後ろ */
function mail_domain_of(string $address): string
{
    return substr((string)strrchr($address, '@'), 1);
}

/**
 * SMTP 認証で1通送る。接続だけここで面倒を見て、やり取りは smtp_conversation() に任せる。
 */
function smtp_send(
    string $host,
    int $port,
    string $user,
    string $password,
    string $mailFrom,
    string $rcptTo,
    string $data
): bool {
    // 465 は最初から TLS。587 などは平文で始めて STARTTLS で切り替える。
    $implicitTls = $port === 465;
    $url = ($implicitTls ? 'ssl://' : 'tcp://') . $host . ':' . $port;

    $fp = @stream_socket_client($url, $errno, $errstr, SMTP_TIMEOUT, STREAM_CLIENT_CONNECT);
    if (!$fp) {
        error_log('smtp: ' . $url . ' に接続できない: ' . $errstr);
        return false;
    }
    stream_set_timeout($fp, SMTP_TIMEOUT);

    $sent = smtp_conversation($fp, $implicitTls, $user, $password, $mailFrom, $rcptTo, $data);

    @fwrite($fp, 'QUIT' . MAIL_EOL);
    fclose($fp);
    return $sent;
}

/**
 * 接続済みのソケットで SMTP のやり取りを行う。
 * どこで失敗しても error_log に理由が残る（パスワードは残さない）。
 */
function smtp_conversation(
    $fp,
    bool $implicitTls,
    string $user,
    string $password,
    string $mailFrom,
    string $rcptTo,
    string $data
): bool {
    $helo = 'EHLO ' . mail_domain_of($mailFrom);

    if (!smtp_cmd($fp, null, '220', '接続時の応答')) {
        return false;
    }
    if (!smtp_cmd($fp, $helo, '250', 'EHLO')) {
        return false;
    }

    if (!$implicitTls) {
        if (!smtp_cmd($fp, 'STARTTLS', '220', 'STARTTLS')) {
            return false;
        }
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            error_log('smtp: TLS への切り替えに失敗');
            return false;
        }
        // 暗号化後は EHLO をやり直す（TLS 前の応答は信用しない）
        if (!smtp_cmd($fp, $helo, '250', 'EHLO（TLS後）')) {
            return false;
        }
    }

    // AUTH LOGIN。ユーザー名とパスワードを Base64 で1つずつ送る。
    if (!smtp_cmd($fp, 'AUTH LOGIN', '334', 'AUTH LOGIN')) {
        return false;
    }
    if (!smtp_cmd($fp, base64_encode($user), '334', 'ユーザー名の送信')) {
        return false;
    }
    if (!smtp_cmd($fp, base64_encode($password), '235', 'パスワードの認証')) {
        return false;
    }

    if (!smtp_cmd($fp, 'MAIL FROM:<' . $mailFrom . '>', '250', 'MAIL FROM')) {
        return false;
    }
    if (!smtp_cmd($fp, 'RCPT TO:<' . $rcptTo . '>', '250', 'RCPT TO')) {
        return false;
    }
    if (!smtp_cmd($fp, 'DATA', '354', 'DATA')) {
        return false;
    }

    // 行頭の「.」は重ねる。本文の終わりを示す「.」と区別できなくなるため。
    fwrite($fp, preg_replace('/^\./m', '..', $data) . MAIL_EOL . '.' . MAIL_EOL);

    return smtp_cmd($fp, null, '250', '本文の送信');
}

/**
 * コマンドを送って応答コードを確かめる。$command が null なら送らずに読むだけ。
 *
 * $label はログに出す名前。認証のようにコマンド自体を残せない場面があるので、
 * コマンド文字列ではなくこちらを出す。
 */
function smtp_cmd($fp, ?string $command, string $expect, string $label): bool
{
    if ($command !== null) {
        fwrite($fp, $command . MAIL_EOL);
    }

    $reply = '';
    while (($line = fgets($fp, 1024)) !== false) {
        $reply .= $line;
        // 「250-」は続きがある、「250 」で終わり
        if (preg_match('/^\d{3} /', $line)) {
            break;
        }
    }

    if (strncmp($reply, $expect, 3) === 0) {
        return true;
    }

    error_log('smtp: ' . $label . ' で想定外の応答（' . $expect . ' を期待）: ' . trim($reply));
    return false;
}
