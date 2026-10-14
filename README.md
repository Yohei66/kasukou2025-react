# kasukou2025-react

React (Vite) + PHP + MariaDB の開発環境です。Docker Compose で一括起動します。

## 起動方法

### 1. 前提
- Docker Desktop がインストール済みで、**起動している**こと
  （`docker info` がエラーになる場合は Docker Desktop を先に立ち上げてください）

### 2. 起動コマンド
プロジェクトルート（このREADMEがある場所）で以下を実行します。

```bash
# 既存コンテナを停止・削除（初回は不要）
docker compose down

# 各種サーバーを起動（バックグラウンド）
docker compose up -d

# React 開発サーバーのログを確認（Ctrl+C で抜けてもコンテナは動き続けます）
docker compose logs -f node
```

`node` コンテナ内で `npm install && npm run dev` が自動実行されます。
ログに以下が出れば起動完了です。

```
VITE v6.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 3. アクセス先

| URL | 内容 |
| --- | --- |
| http://localhost:3000 | Webサイト本体（React / Vite 開発サーバー） |
| http://localhost:9000 | PHP APIサーバー（Reactからは `/api/*` 経由でプロキシされます） |
| localhost:3309 | MariaDB（既定 user: `devuser` / pass: `devpass` / db: `devdb`。変更は[設定](#設定環境依存の値)を参照） |

ブラウザで **http://localhost:3000** を開いてください。

### 4. DBテーブルの初期化（初回のみ）
`courts` / `cancellations` / `inquiries` / `events` / `documents` / `links` テーブルを作成します。

`migrate.php` は管理者専用です（DBを書き換えるので、URLを知っているだけでは実行できません）。
先にログインしてセッションのクッキーを取り、それを付けて実行します。

```bash
# 1. ログイン（ユーザー名・パスワードは .env の ADMIN_USER / ADMIN_PASSWORD）
curl -c cookie.txt -X POST http://localhost:9000/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"kasukou-dev"}'

# 2. テーブル作成
curl -b cookie.txt http://localhost:9000/migrate.php
```

`{"success":true,"message":"マイグレーション完了"}` が返れば成功です。
`{"success":false,...,"message":"ログインが必要です"}` が返る場合は、1 のパスワードが
`.env` の値と合っているか確認してください（`.env` が無いときの既定値は `kasukou-dev`）。

ログインの照合は設定値だけで行い DB を見ないので、**テーブルが1つも無い状態でもログインできます**。

`events` / `documents` / `links` は管理画面から編集する内容です。
`documents` と `links` は、テーブルが空のときだけ初期値（従来ページにベタ書きしていた内容）が入ります。
何度実行しても既存データは消えません。

### 5. 停止

```bash
docker compose down
```

DBのデータは `db_data` ボリュームに残ります。完全に消す場合は `docker compose down -v` を実行してください。

## 構成

| サービス | コンテナ名 | ポート | 役割 |
| --- | --- | --- | --- |
| node | dev-node | 3000 | React (Vite) 開発サーバー |
| php | dev-php | 9000 | PHP 8.2 ビルトインサーバー（`api/` 配下） |
| db | dev-db | 3309 → 3306 | MariaDB 10.5 |
| nginx | dev-nginx | 8080 | 通常は無効（`docker-compose.override.yml` で `scale: 0`） |

Vite の `server.proxy` 設定により、フロントの `/api/xxx.php` へのリクエストは
`http://dev-php:9000/xxx.php` に転送されます（`vite.config.ts` 参照）。

## 設定（環境依存の値）

DBの接続先やパスワードなど、環境ごとに変わる値の扱いです。

### 仕組み

**設定の渡し方は環境によって2通りありますが、プログラム側は違いを意識しません。**
すべて `config_value()` 経由で読むので、呼び出し側は値がどこから来たかを知る必要がありません。

```php
$host = config_value('DB_HOST', 'db');   // api/db.php
```

`api/config_load.php` が、次の順に値を探します。**先に見つかったものが勝ちます。**

| 優先 | 探す場所 | 使う環境 |
| --- | --- | --- |
| 1 | `api/../../config.php`（公開ディレクトリの外） | 試験・本番サーバー（推奨） |
| 2 | `api/config.php` | 試験・本番サーバー（1が置けない場合） |
| 3 | 環境変数 `getenv()` | ローカル開発（`.env` → docker-compose 経由） |
| 4 | ソースに書かれた既定値 | 上記がすべて無いとき |

### なぜ2通りあるのか

レンタルサーバーには**環境変数を設定する手段が無いことが多い**ためです。
環境変数だけに寄せると本番にデプロイできないので、設定ファイルの経路も用意しています。

逆に「`.env` に統一する」のは、この構成では避けています。素の PHP は `.env` を読めず
（`composer` の追加が必要）、さらに**公開ディレクトリ内の `.env` は静的ファイルとして
配信されるとパスワードが平文で漏れます**（`/.env` を狙う巡回ボットが実在します）。
`config.php` なら同じ状況でも PHP として実行され、画面には何も出ません。

### 設定できる値（全9項目）

| キー | 内容 | ローカル | サーバー |
| --- | --- | :---: | :---: |
| `DB_HOST` | DBのホスト名 | ✅ | ✅ |
| `DB_NAME` | DB名 | ✅ | ✅ |
| `DB_USER` | DBのユーザー名 | ✅ | ✅ |
| `DB_PASSWORD` | DBのパスワード | ✅ | ✅ |
| `DB_ROOT_PASSWORD` | MariaDB の root パスワード（コンテナ作成用） | ✅ | — |
| `ADMIN_USER` | 管理画面のログインID | ✅ | ✅ |
| `ADMIN_PASSWORD` | 管理画面のパスワード | ✅ | ✅ |
| `CANCEL_PASSWORD` | コート中止連絡の合言葉 | ✅ | ✅ |
| `CONTACT_TO` | 問い合わせの通知先アドレス | ✅ | ✅ |
| `CONTACT_FROM` | 問い合わせメールの差出人 | ✅ | ✅ |
| `SMTP_HOST` | SMTP サーバーのホスト名 | — | ✅ |
| `SMTP_PORT` | SMTP のポート（既定 465） | — | ✅ |
| `SMTP_USER` | SMTP 認証に使うメールアドレス | — | ✅ |
| `SMTP_PASSWORD` | そのメールボックスのパスワード | — | ✅ |

`CONTACT_TO` と `CONTACT_FROM` は**両方そろって初めてメールを送ります**。
どちらかが空のあいだは、問い合わせはDBに保存されるだけです。

### メールの送り方（SMTP 認証を使う理由）

`SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` がそろっていれば SMTP 認証で送り、
空ならサーバーの sendmail 経由で送ります。**サーバーでは SMTP 認証を使ってください。**

sendmail 経由だと、Exim がエンベロープ送信者をサーバーのアカウント
（例 `account@s325.xrea.com`）に固定します。信頼されていないユーザーからの
`-f` 指定は無視されるため、こちらでは変えられません。すると SPF は pass しても
照合されたドメインが `From` のドメインと一致せず、DMARC のアライメントが失敗して
Gmail では「◯◯.xrea.com 経由」と表示され、迷惑メールに振り分けられます。

SMTP 認証で送ると、認証したメールボックスがそのまま送信者になります。
レンタルサーバーの管理画面「メール設定」でメールボックスを作り、
`SMTP_USER` と `CONTACT_FROM` を**同じアドレス**にすれば `From` と一致します。

### ローカル開発の設定

プロジェクトルートの `.env` に書きます。docker-compose が読み取り、`db` と `php` の
両コンテナに環境変数として渡します。

```bash
cp .env.example .env      # 初回のみ。中身を必要に応じて書き換える
docker compose down
docker compose up -d      # 再起動で反映
```

`.env` が無くても `docker-compose.yml` の既定値（`${DB_USER:-devuser}` の右側）で起動できます。

> **DBの値を変えたときは `docker compose down -v` が必要です。**
> MariaDB はデータが残っていると、ユーザー名やパスワードの変更を反映しません。
> `-v` はDBの中身も消えるので、`migrate.php` の再実行が必要になります。

### サーバー（試験・本番）の設定

`api/config.php.example` をコピーし、実際の値を書いて**サーバーにだけ**置きます。

```
public_html/api/    ← プログラム
config.php          ← ここが安全（public_html と同じ階層＝ブラウザから見えない）
```

上の階層に置けないサーバーでは `public_html/api/config.php` でも動きます。

記入済みのファイルは、このリポジトリでは **`deploy/config.php`** に置く運用です。
`deploy/config.php` と `deploy/.htpasswd` は `.gitignore` 済みです
（`deploy/` 全体ではなく、パスワードを含むファイルだけを除外しています）。

> ⚠️ **`api/config.php` に置いたままにしないでください。**
> 設定ファイルは環境変数より優先されるため、ローカル開発でもサーバー用の値が
> 読まれてしまい、`SQLSTATE[HY000] [2002] No such file or directory` で
> 行事予定表・ドキュメント・リンクが表示できなくなります。
> `api.zip` にも混入し、パスワードを持ち回ることになります。

### デプロイ時の注意

`api.zip` に `config.php` は**含めません**。そのため**サーバー上の `config.php` が唯一の正本**です。

- **上書き展開** → サーバーの `config.php` はそのまま残ります（問題なし）
- **`api/` を削除してから展開** → `config.php` が消えてDBに接続できなくなります

削除してから展開する手順の場合は、展開後に `deploy/config.php` を手動で置き直してください。

> ⚠️ **`api.zip` を作るときは `config.php` を除外してください。**
> `zip` にそのまま固めると混入します。除外して固める例:
>
> ```bash
> zip -r api.zip api -x "api/config.php"
> ```

### サーバーのDBテーブル初期化（サーバーごとに初回のみ）

`config.php` を置いただけではテーブルはできません。初期化しないと、
コート予約状況のアップロードで次のエラーになります。

```
SQLSTATE[42S02]: Base table or view not found: 1146 Table '<DB名>.courts' doesn't exist
```

`migrate.php` は管理者専用なので、**管理者ページにログインしてから**、
同じブラウザで次を開きます。

```
1. https://<サイトのURL>/#/login       ← config.php の ADMIN_USER / ADMIN_PASSWORD でログイン
2. https://<サイトのURL>/api/migrate.php
```

`{"success":true,"message":"マイグレーション完了"}` が出れば完了です。
`{"success":false,...,"message":"ログインが必要です"}` が出る場合は 1 のログインが
できていません（別のブラウザ・シークレットウィンドウだとセッションが共有されません）。

ログインの照合は `config.php` の値だけで行い DB を見ないので、
**テーブルが1つも無い状態でもログインできます**。

何度実行しても既存データは消えません（`CREATE TABLE IF NOT EXISTS` と、
テーブルが空のときだけ入る初期データ）。

### 試験用サーバーを検索に載せない（試験用のみ）

試験用サーバーは**本番と同じ `<title>` と説明文**を出すため、検索エンジンに載ると
本番と重複したページとして並んでしまいます。

一方で、関係者に URL を送って見てもらうため、**認証はかけません**。
「誰でも見られるが、検索には出ない」を成立させる方法は1つだけです。

| やること | 理由 |
| --- | --- |
| `X-Robots-Tag: noindex` を全応答に付ける（`.htaccess`） | 検索結果から確実に外れる。すでに載っていても消える |
| `robots.txt` で**クロールを禁止しない** | 禁止すると上の noindex を読み取れず、かえって URL だけが載ることがある |

> ⚠️ **`robots.txt` に `Disallow: /` を書いてはいけません。**
> 「クロールを止める」と「検索に載せない」は別物です。クロールを止めると
> 検索エンジンはページを取得できず、`noindex` の指示も読めません。その結果、
> 外部リンクから URL だけを拾って「説明のない検索結果」として載ることがあります。
> **巡回は許可し、`noindex` で断る** のが正解です。

`deploy/` のファイルを、**サイト直下**（`index.html` と同じ階層）へアップロードします。

```
サイト直下/
├─ index.html
├─ .htaccess     ← deploy/.htaccess
├─ robots.txt    ← deploy/robots.txt
└─ api/
```

トップは HashRouter（`/#/court` など）で `#` 以降はサーバーに送られないため、
全ルートが同じ `index.html` です。`.htaccess` の1行で全ページを覆えます。

設定後は次で確認できます。

```bash
curl -I http://<サイトのURL>/ | grep -i x-robots-tag
# → X-Robots-Tag: noindex, nofollow, noarchive
```

> ⚠️ **`.htaccess` と `robots.txt` を本番サーバーに置かないこと。**
> 本番が検索に出なくなります。

**完全に見せたくなくなったら**、`deploy/.htaccess` 末尾の Basic 認証の4行を有効にし、
`deploy/.htpasswd` もアップロードします。`AuthUserFile` はサーバー上の絶対パスで
書く必要があり、調べ方は次の `path.php` をサイト直下に置いて開くのが確実です
（`@unlink` により1回開くと自分で消えます）。

```php
<?php echo __DIR__; @unlink(__FILE__);
```

### ファイルの一覧

| ファイル | Git | 役割 |
| --- | :---: | --- |
| `.env.example` | ✅ | ローカル設定の記入例 |
| `.env` | ❌ | ローカルの実際の値 |
| `api/config.php.example` | ✅ | サーバー設定の記入例 |
| `deploy/config.php` | ❌ | サーバー用の記入済みファイル（アップロード元） |
| `api/config.php` | ❌ | **置かないこと**（サーバー上にのみ存在させる） |
| `deploy/.htaccess` | ✅ | 試験用サーバーのアクセス制限（パスは要書き換え） |
| `deploy/.htpasswd` | ❌ | Basic認証のパスワード（試験用サーバーにのみ置く） |
| `deploy/robots.txt` | ✅ | 試験用サーバーのクロール禁止 |
| `api.zip` / `dist.zip` | ❌ | 配布用。`config.php` を混入させないこと |

## Docker を使わない場合

ローカルに Node.js があれば React 単体でも起動できます（PHP API は別途必要）。

```bash
npm install
npm run dev
```

## その他のコマンド

```bash
npm run build    # Lint + 型チェック + 本番ビルド
npm run lint     # ESLint（--fix 付き）
npm run preview  # ビルド結果をローカルで確認
npm run deploy   # GitHub Pages へデプロイ
```

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `failed to connect to the docker API` | Docker Desktop が起動していません。起動後に再実行してください |
| ポートが使用中エラー | 3000 / 9000 / 3309 を使っている他プロセスを停止してください |
| 依存関係を更新したのに反映されない | `docker compose down` 後に再度 `docker compose up -d`（`node_modules` はボリューム管理のため、必要なら `docker compose down -v`） |
| 行事予定表・ドキュメント・リンクが表示されない<br>（`SQLSTATE[HY000] [2002] No such file or directory`） | `api/config.php` が残っています。設定ファイルは環境変数より優先されるため、サーバー用の値でDBに接続しようとして失敗します。`deploy/` に移動してください（[設定](#設定環境依存の値)参照）。原因の切り分けは `curl http://localhost:9000/events_list.php` が早いです |
| `.env` を書き換えたのにDBのユーザー名／パスワードが変わらない | MariaDB はデータが残っていると変更を反映しません。`docker compose down -v` で作り直し、`migrate.php` を再実行してください |
| `Table '<DB名>.courts' doesn't exist`（`42S02`） | テーブルの初期化がまだです。ローカルは[4. DBテーブルの初期化](#4-dbテーブルの初期化初回のみ)、サーバーは[サーバーのDBテーブル初期化](#サーバーのdbテーブル初期化サーバーごとに初回のみ)を実行してください |
| 正しいパスワードなのに管理者ログインが `401` になる | `config.php` が読まれていません。値が空だと誰も通さない作りです。置き場所は `api/` の**中**か、`api/` の**2つ上**の2か所だけを見ます（`api/` の1つ上＝サイト直下では読まれません）。`migrate.php` を開いて `ログインが必要です` ではなく `401` が続く場合もこれを疑ってください |
| `migrate.php` が `{"success":false,...,"message":"ログインが必要です"}` を返す | `migrate.php` は管理者専用です。先に管理者ページへログインし、**同じブラウザ**で開いてください（`curl` の場合は `-c` / `-b` でクッキーを引き回す） |

# Notion

https://www.notion.so/210be2fea8a380dd9fd4cc8bb127904b?v=210be2fea8a381f5aee3000c988ea8b4&source=copy_link

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
