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

// 実体は lessons / doubles から組み立てる（このファイル下部を参照）

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
// トップページ（要約）と活動内容ページ（詳細）の両方がこの配列を参照する。
// クラスの増減はここだけ直せば両方に反映される。
export type LessonGroupKey = "sunday" | "weekday" | "junior";

export type Lesson = {
  group: LessonGroupKey;
  name: string;
  /** 誰が対象か（一般男女／主に女性／小学生など） */
  target: string;
  /** トップページ用の短い説明 */
  summary: string;
  /** 活動内容ページ用の詳しい説明 */
  description: string;
  day: string;
  time: string;
  court: string;
};

export const lessonGroups: { key: LessonGroupKey; title: string }[] = [
  { key: "sunday", title: "日曜一般レッスン" },
  { key: "weekday", title: "平日一般レッスン" },
  { key: "junior", title: "ジュニアレッスン" },
];

export const lessons: Lesson[] = [
  {
    group: "sunday",
    name: "初・中級",
    target: "一般男女",
    summary: "初めての人、やさしいラリーができる程度の人",
    description:
      "初めての人、やさしいラリーができる程度の人を対象に、テニスの基本を練習します。",
    day: "日",
    time: "10:30–13:00",
    court: "立沼",
  },
  {
    group: "sunday",
    name: "中級",
    target: "一般男女",
    summary: "ゲームのフォーメーションまで",
    description:
      "基本的なテニス技術のレベルアップを図るとともに、ゲームに必要なフォーメーションなどを練習します。",
    day: "日",
    time: "9:00–10:30",
    court: "大沼",
  },
  {
    group: "weekday",
    name: "初級",
    target: "主に女性",
    summary: "テニスの基本を練習します",
    description:
      "初めての人、やさしいラリーができる程度の人を対象に、テニスの基本を練習します。",
    day: "火",
    time: "10:00–12:00",
    court: "立沼",
  },
  {
    group: "weekday",
    name: "中級",
    target: "主に女性",
    summary: "基本技術のレベルアップ",
    description:
      "基本的なテニス技術のレベルアップを図るとともに、ゲームに必要なフォーメーションなどを練習します。",
    day: "水",
    time: "9:30–11:30",
    court: "立沼",
  },
  {
    group: "weekday",
    name: "実戦クラス",
    target: "女性",
    summary: "セオリーと状況判断で実戦力を養う",
    description:
      "ゲームにおけるセオリーや、各種状況に応じた対処法などを主体とした練習で、実戦力を養います。",
    day: "金",
    time: "13:00–15:00",
    court: "大沼",
  },
  {
    group: "junior",
    name: "ジュニアA",
    target: "小学2年生以上（コーチが承認した1年生を含む）",
    summary: "ボールに慣れ、基本フォームを習得",
    description:
      "ボールに慣れることから始め、基本フォームの習得を目指します。あわせて運動能力の向上や、やり遂げる強い意志力を養います。",
    day: "日",
    time: "9:00–10:30",
    court: "立沼",
  },
  {
    group: "junior",
    name: "ジュニアB",
    target: "小学2年生以上（コーチが承認した1年生を含む）",
    summary: "基本の充実とゲームの実戦",
    description:
      "基本フォームの充実や、ゲームの基本を練習します。ゲームも取り入れ、実戦力も養います。",
    day: "日",
    time: "9:00–10:30",
    court: "立沼",
  },
];

// ---- ダブルスゲーム ----
// 曜日ごとに1件として持つ。ここから「週間スケジュール（曜日軸）」と
// 「コート別の一覧」の両方を組み立てるので、書く場所はこの配列だけ。
export type Weekday = "日" | "月" | "火" | "水" | "木" | "金" | "土";

/** 祝日は曜日に関係なく土曜と同じ扱いになるため、別の区分として持つ */
export type ScheduleDay = Weekday | "祝";

export const WEEKDAYS: Weekday[] = ["日", "月", "火", "水", "木", "金", "土"];

const SCHEDULE_DAY_ORDER: ScheduleDay[] = [...WEEKDAYS, "祝"];

export type DoublesEntry = {
  day: ScheduleDay;
  court: string;
  time: string;
  note?: string;
};

export const doubles: DoublesEntry[] = [
  { day: "日", court: "立沼", time: "12:00–17:00", note: "午前はレッスン" },
  { day: "日", court: "大沼", time: "10:30–17:00", note: "午前はレッスン／12:00–13:00は初級者優先" },
  { day: "火", court: "立沼", time: "12:00–17:00" },
  { day: "水", court: "立沼", time: "9:00–13:00", note: "1面はレッスンに使用" },
  { day: "木", court: "大沼", time: "9:00–13:00" },
  { day: "金", court: "大沼", time: "9:00–13:00" },
  { day: "土", court: "立沼", time: "9:00–17:00" },
  { day: "土", court: "大沼", time: "9:00–17:00", note: "12:00–13:00は初級者優先" },
  // 祝日は曜日にかかわらず土曜と同じ扱い。月曜が祝日の場合も朝から実施する。
  // 祝日はレッスンを行わず、ダブルスゲームのみ。
  { day: "祝", court: "立沼", time: "9:00–17:00" },
  { day: "祝", court: "大沼", time: "9:00–17:00", note: "12:00–13:00は初級者優先" },
];

/** コート別に並べ替えたダブルスの一覧 */
export const doublesByCourt = ["立沼", "大沼"].map((court) => ({
  court,
  slots: doubles
    .filter((d) => d.court === court)
    .sort(
      (a, b) =>
        SCHEDULE_DAY_ORDER.indexOf(a.day) - SCHEDULE_DAY_ORDER.indexOf(b.day)
    ),
}));

// ---- 週間スケジュール（曜日軸） ----
// 「今日は何時からやっているか」を引くための表。lessons と doubles から組み立てる。
export type DayActivityDetail = {
  kind: "lesson" | "doubles";
  time: string;
  /** レッスンならクラス名、ダブルスなら備考 */
  detail: string;
};

export type DayColumn = { court: string; items: DayActivityDetail[] };

const columnsFor = (day: ScheduleDay): DayColumn[] =>
  ["立沼", "大沼"].map((court) => {
    const items: DayActivityDetail[] = [];

    // 同じ時間帯のレッスンはクラス名をまとめて1行にする
    const dayLessons = lessons.filter((l) => l.day === day && l.court === court);
    const byTime = new Map<string, string[]>();
    dayLessons.forEach((l) => {
      byTime.set(l.time, [...(byTime.get(l.time) ?? []), l.name]);
    });
    [...byTime.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([time, names]) =>
        items.push({ kind: "lesson", time, detail: names.join("・") })
      );

    doubles
      .filter((d) => d.day === day && d.court === court)
      .forEach((d) =>
        items.push({ kind: "doubles", time: d.time, detail: d.note ?? "" })
      );

    return { court, items };
  });

export const weeklySchedule: { day: Weekday; columns: DayColumn[] }[] =
  WEEKDAYS.map((day) => ({ day, columns: columnsFor(day) }));

/**
 * 祝日の行。曜日とは別枠で表の末尾に出す。
 * 月曜が祝日の場合も朝から活動するため、「月曜＝休み」だけでは誤りになる。
 */
export const holidaySchedule = { day: "祝日" as const, columns: columnsFor("祝") };

// ---- ふだんの一週間（トップページのヒーロー下） ----
// 曜日ごとに「ダブルスは何時から何時まで」「レッスンは何時から何時まで」を
// lessons / doubles の実データから割り出す。手書きしないので食い違いが起きない。
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 複数の時間帯をまとめて「最も早い開始–最も遅い終了」にする */
const spanOf = (times: string[]): string | null => {
  if (times.length === 0) return null;
  const ranges = times.map((t) => t.split("–"));
  const start = ranges
    .map((r) => r[0])
    .sort((a, b) => toMinutes(a) - toMinutes(b))[0];
  const end = ranges
    .map((r) => r[1])
    .sort((a, b) => toMinutes(b) - toMinutes(a))[0];
  return `${start}–${end}`;
};

export const weekSchedule: DaySchedule[] = WEEKDAYS.map((day) => {
  const activities: DayActivity[] = [];
  const doublesSpan = spanOf(doubles.filter((d) => d.day === day).map((d) => d.time));
  const lessonSpan = spanOf(lessons.filter((l) => l.day === day).map((l) => l.time));
  // ダブルスを先に置き、週の土台であることが見た目に出るようにする
  if (doublesSpan) activities.push({ kind: "doubles", time: doublesSpan });
  if (lessonSpan) activities.push({ kind: "lesson", time: lessonSpan });
  return activities.length > 0 ? { day, activities } : { day, rest: true, activities: [] };
});

export const doublesIntro =
  "親睦を主な目的として、会員どうしのダブルスゲームを楽しんでいます。老若男女、在勤の方から退職された方、初心者からベテランまで在籍しているため、全員でコートの確保に努め、それぞれの都合に合わせていつでもテニスが楽しめるようにしています。レッスンを受けている方も自由に参加できます。";

// ---- 持ち物・服装 ----
// TODO: クラブの実情に合わせて内容をご確認ください
export const belongings = [
  {
    title: "服装",
    body: "動きやすい服装でお越しください。ジャージやスポーツウェアで十分です。",
  },
  {
    title: "靴",
    body: "運動靴をご用意ください。テニスシューズがあれば理想ですが、はじめは普通の運動靴でも構いません。",
  },
  {
    title: "ラケット",
    body: "見学・体験のあいだは貸し出しできます。入会後にご自身のものを揃えてください。",
  },
  {
    title: "その他",
    body: "飲み物とタオルをお持ちください。夏場は帽子もあると安心です。",
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


