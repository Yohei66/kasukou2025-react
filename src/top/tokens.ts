// トップページのデザイントークン
// MUI テーマの primary(#0e995a) を基準に、コートの深緑とボールの蛍光イエローを加えた配色

export const tokens = {
  court: "#06301F", // コートの深緑（ヒーロー／お問い合わせの背景）
  courtGradient: "linear-gradient(155deg,#06301F 0%,#0A4A31 55%,#083C28 100%)",
  green: "#0E995A", // クラブのブランドカラー
  greenDeep: "#0B7745",
  greenPale: "#EAF3ED",
  ball: "#D8E64A", // テニスボールの蛍光イエロー（主要 CTA のみに使用）
  ballHover: "#E4F065",
  ink: "#12211B", // 緑みを帯びた黒
  muted: "#5B6B62",
  paper: "#FAFBF8",
  surface: "#FFFFFF",
  line: "#DCE4DD",
  onCourt: "#C4DACE", // 深緑背景の上の本文
  onCourtDim: "#8FAF9E",
  onCourtLabel: "#9DC3AF",
  onCourtStrong: "#EAF2EC",
  courtLine: "#BFE8D2", // コートのライン
  lessonDot: "#7FD6A8",

  /**
   * 注意を引く赤。サイト内の赤はこの1色だけに絞る。
   * 中止バッジ（白抜き）と日曜の曜日文字（白地）の両方で使う。
   * 白地で 5.0:1、白抜きで 5.0:1 と、どちらの向きでも WCAG AA を満たす。
   */
  danger: "#C0392B",
  dangerDeep: "#A93226", // 中止ボタンのホバー
  dangerPale: "#FBE9E7", // 中止セルの背景
  /** 土曜。日曜の赤と対になる青（白地で 6.4:1） */
  saturday: "#1565C0",
} as const;

/**
 * コート別の識別色。
 * 「立沼」「大沼」は字面が似ていて見分けにくいため、レッスン表とアクセス欄で
 * 同じ色を使い、読み手が対応を覚えられるようにしている。
 * 立沼はクラブのブランドグリーン、大沼は屋外ハードコートの青。
 */
export const courtColors: Record<string, { main: string; pale: string }> = {
  立沼: { main: "#0B7745", pale: "#E4F3EA" },
  大沼: { main: "#1F6F92", pale: "#E5EFF5" },
};

/** 「立沼」「立沼コート」どちらの表記でも識別色を引ける */
export const getCourtColor = (name: string) =>
  Object.entries(courtColors).find(([key]) => name.includes(key))?.[1] ?? {
    main: tokens.muted,
    pale: tokens.greenPale,
  };

/** 曜日1文字から色を引く。平日は undefined（既定の文字色のまま） */
export const getDayColor = (dow: string): string | undefined =>
  dow === "日" ? tokens.danger : dow === "土" ? tokens.saturday : undefined;

export const fonts = {
  display:
    '"Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif',
  body: '"Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif',
  data: '"Barlow Semi Condensed","Zen Kaku Gothic New",sans-serif',
} as const;

// セクション共通の余白と最大幅
export const layout = {
  maxWidth: 1120,
  sectionPy: { xs: 7, md: 12 },
} as const;

/** カード・パネルの形。トップの各セクションが使っている値をここに集約 */
export const shape = {
  card: "14px", // カード（Points / Access / レッスン）
  panel: "12px", // 表を包むパネル（TodayCourts）
  chip: "6px", // ラベルチップ
  /** カードの影。2段重ねで、輪郭を出しつつ浮かせすぎない */
  shadow: "0 1px 2px rgba(18,33,27,.05),0 8px 24px -12px rgba(18,33,27,.18)",
} as const;
