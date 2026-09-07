// トップページに載せる文言・数値・スケジュール
// 内容の修正はこのファイルだけで完結します

// 【画像を使うとき その1】写真を src/assets/topPicture/ に置き、ここでコメントを外して読み込む
import heroPhoto from "../assets/topPicture/hero.jpg";

// TODO: クラブの実際のアドレスに差し替えてください
export const CONTACT_EMAIL = "kasukabe-tennis@example.com";

export const hero: {
  eyebrow: string;
  headingLines: string[];
  lead: string;
  photo?: string;
} = {
  eyebrow: "埼玉県春日部市・硬式テニス",
  headingLines: ["春日部で", "テニスするなら"],
  lead: "春日部市の市民テニスクラブです。月曜をのぞく週6日、立沼・大沼コートで活動しています。ジュニアから70代まで約100人が所属し、レッスン料は無料。会費は月1,000円です。",
  // 【画像を使うとき その2】先頭で読み込んだ heroPhoto をここに渡す。
  // この行を消すと、コートの線画の背景に戻ります。
  // 撮影仕様: 横位置 16:9 以上 / 幅2000px以上 / 画面左半分に人物を置かない（見出しが乗るため）
  photo: heroPhoto,
};

// ---- ふだんの一週間 ----
export type ActivityKind = "doubles" | "lesson";

export type DayActivity = {
  kind: ActivityKind;
  time: string;
};

export type DaySchedule = {
  day: string;
  rest?: boolean;
  activities: DayActivity[];
};

// ダブルスゲームが週6日、レッスンはそのうち4日に重ねて実施
// コート別の内訳は活動内容ページに委ねている
export const weekSchedule: DaySchedule[] = [
  {
    day: "日",
    activities: [
      { kind: "doubles", time: "10:30–17:00" },
      { kind: "lesson", time: "9:00–13:00" },
    ],
  },
  { day: "月", rest: true, activities: [] },
  {
    day: "火",
    activities: [
      { kind: "doubles", time: "12:00–17:00" },
      { kind: "lesson", time: "10:00–12:00" },
    ],
  },
  {
    day: "水",
    activities: [
      { kind: "doubles", time: "9:00–13:00" },
      { kind: "lesson", time: "9:30–11:30" },
    ],
  },
  { day: "木", activities: [{ kind: "doubles", time: "9:00–13:00" }] },
  {
    day: "金",
    activities: [
      { kind: "doubles", time: "9:00–13:00" },
      { kind: "lesson", time: "13:00–15:00" },
    ],
  },
  { day: "土", activities: [{ kind: "doubles", time: "9:00–17:00" }] },
];

// ---- はじめての方へ ----
export type PointIcon = "tennis" | "payment" | "calendar";

export const points: { icon: PointIcon; title: string; body: string }[] = [
  {
    icon: "tennis",
    title: "初心者から始められます",
    body: "会員の中の適任者がコーチを務め、基本から丁寧に指導します。レッスン料は無料。ラケットの握り方から始めた会員も大勢います。",
  },
  {
    icon: "payment",
    title: "会費は月1,000円だけ",
    body: "6か月ごとにまとめてお支払いいただきます。レッスン料やコート代の追加負担はありません。市民クラブならではの続けやすさが魅力です。",
  },
  {
    icon: "calendar",
    title: "来られる日だけで大丈夫",
    body: "月曜以外はどこかのコートで活動しています。参加は自由なので、仕事や家庭の予定に合わせて、来られる日だけ来ていただくで大丈夫です。",
  },
];

// ---- 数字で見る ----
// TODO: 在籍会員数は memberData.ts の合計(152)と食い違っています。正しい値に統一してください
export const stats: { value: string; unit?: string; label: string }[] = [
  { value: "100", unit: "名", label: "在籍会員数" },
  { value: "10–70", unit: "代", label: "会員の年齢層" },
  { value: "7", unit: "クラス", label: "レベル別レッスン" },
  { value: "6", unit: "日 / 週", label: "活動日数（月曜以外）" },
];

// ---- こんな方に ----
export const checklist = [
  "学生のとき以来、久しぶりにテニスを再開したい",
  "一緒に打つ相手がいなくて、練習の機会がない",
  "スクールに通うほどではないが、きちんと教わりたい",
  "平日の午前中に、体を動かす習慣をつくりたい",
  "子ども（小学2年生以上）にテニスを習わせたい",
];

// ---- レッスン ----
export type Lesson = {
  name: string;
  target: string;
  day: string;
  time: string;
  court: string;
};

export const lessons: Lesson[] = [
  {
    name: "初・中級",
    target: "一般男女／初めての人、やさしいラリーができる程度の人",
    day: "日",
    time: "10:30–13:00",
    court: "立沼",
  },
  {
    name: "中級",
    target: "一般男女／ゲームのフォーメーションまで",
    day: "日",
    time: "9:00–10:30",
    court: "大沼",
  },
  {
    name: "初級",
    target: "主に女性／テニスの基本を練習します",
    day: "火",
    time: "10:00–12:00",
    court: "立沼",
  },
  {
    name: "中級",
    target: "主に女性／基本技術のレベルアップ",
    day: "水",
    time: "9:30–11:30",
    court: "立沼",
  },
  {
    name: "実戦クラス",
    target: "女性／セオリーと状況判断で実戦力を養う",
    day: "金",
    time: "13:00–15:00",
    court: "大沼",
  },
  {
    name: "ジュニアA",
    target: "小学2年生以上／ボールに慣れ、基本フォームを習得",
    day: "日",
    time: "9:00–10:30",
    court: "立沼",
  },
  {
    name: "ジュニアB",
    target: "小学2年生以上／基本の充実とゲームの実戦",
    day: "日",
    time: "9:00–10:30",
    court: "立沼",
  },
];

// ---- クラブの様子（写真枠） ----
// 撮影した写真は src/assets/topPicture/ に置き、src プロパティに import したものを渡してください
export type PhotoSlotData = {
  name: string;
  spec: string;
  ratio: string;
  src?: string;
};

export const photoSlots: PhotoSlotData[] = [
  { name: "写真② レッスン風景", spec: "横位置 16:10 ／ コーチと受講者", ratio: "16 / 10" },
  { name: "写真③ ダブルスのゲーム", spec: "横位置 16:10 ／ 4人が入る画角", ratio: "16 / 10" },
  { name: "写真④ コート脇での休憩", spec: "横位置 16:10 ／ 雰囲気重視", ratio: "16 / 10" },
];

export const foryouPhoto: PhotoSlotData = {
  name: "写真① ラリーをする会員",
  spec: "縦位置 4:5 ／ 顔が見える距離で",
  ratio: "4 / 5",
};

// ---- 入会までの流れ ----
export const steps = [
  {
    no: "STEP 1",
    title: "メールで連絡する",
    body: "お名前、テニス歴、参加できそうな曜日をお知らせください。数日以内に担当者からご返信します。",
  },
  {
    no: "STEP 2",
    title: "見学・体験する",
    body: "ご希望の日に、立沼または大沼コートへお越しください。ラケットの貸し出しもできます。動きやすい服装と運動靴だけご用意を。",
  },
  {
    no: "STEP 3",
    title: "入会手続きをする",
    body: "入会届をご記入いただき、会費をお支払いいただければ完了です。次の活動日から参加できます。",
  },
];

// ---- アクセス ----
export type Court = {
  name: string;
  activities: string;
  hours: string;
  /**
   * 地図の埋め込み用 URL。未設定のあいだはプレースホルダーが表示されます。
   * 必ず https://www.google.com/maps/embed?... の形にすること。
   * 取得方法: Googleマップ →「共有」→「地図を埋め込む」→ iframe の src= の中身。
   *
   * 使えない URL:
   *  - アドレスバーの URL（/maps/place/...）… X-Frame-Options でブロックされる
   *  - /maps?q=...&output=embed … 301 リダイレクトし、その応答が SAMEORIGIN のためブロックされる
   */
  mapUrl?: string;
};

export const courts: Court[] = [
  {
    name: "立沼コート",
    activities: "日曜レッスン、ジュニア、平日レッスン（火・水）、ダブルス",
    hours: "9:00–17:00",
    // 立沼テニス場（座標指定。「地図を埋め込む」で取り直すと店名ピンつきになります）
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12917.248144816267!2d139.749039!3d35.96379600000001!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018bfc4b94f692d%3A0x43dc1e96d01cc4!2z56uL5rK844OG44OL44K55aC0!5e0!3m2!1sja!2sjp!4v1788741217704!5m2!1sja!2sjp",
  },
  {
    name: "大沼コート",
    activities: "日曜中級レッスン、実戦クラス（金）、ダブルス（木・金・土日）",
    hours: "9:00–17:00",
    // 大沼テニスコート（「地図を埋め込む」から取得）
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3229.31186794526!2d139.74646357545802!3d35.96380011440057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018bfeea8475429%3A0xa71f16a20c7fc400!2z5aSn5rK844OG44OL44K544Kz44O844OI!5e0!3m2!1sja!2sjp!4v1788740781041!5m2!1sja!2sjp"
  },
];


