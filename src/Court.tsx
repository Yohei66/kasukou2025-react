import {
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import SectionHead from "./top/SectionHead";
import { fonts, getCourtColor, getDayColor, shape, tokens } from "./top/tokens";
import { SLOT_LABELS, cancelSummary, isHeld } from "./courtCommon";
import type { CancelEntry, CancelMap, SlotKey } from "./courtCommon";

type RowData = {
  id: number;
  日付: string;
  曜日: string;
  コート: string;
  "9-11": string;
  "11-13": string;
  "13-15": string;
  "15-17": string;
  備考: string;
};

function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return `${y}${String(m).padStart(2, "0")}`;
}

function getPrevMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1];
  return `${prev[0]}${String(prev[1]).padStart(2, "0")}`;
}

function getNextMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${next[0]}${String(next[1]).padStart(2, "0")}`;
}

/** "202609" を「2026年9月」にする */
const formatMonth = (yyyymm: string) =>
  `${yyyymm.slice(0, 4)}年${Number(yyyymm.slice(4, 6))}月`;

/** date_str（YYYY-MM-DD）を「7日」の形にする。旧形式の値はそのまま返す */
function formatDay(dateStr: string) {
  const m = /^\d{4}-\d{2}-(\d{2})$/.exec(dateStr);
  return m ? `${Number(m[1])}日` : dateStr;
}

/** "202609" を cancel.php が受け取る "2026-09" にする */
function toApiMonth(yyyymm: string) {
  return `${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}`;
}

const COURT_TYPES = [
  { label: "大沼", value: "Onuma" },
  { label: "立沼", value: "Tatenuma" },
];

/** プルダウンに出す月。今月の3か月先から24か月前まで */
const MONTHS_AHEAD = 3;
const MONTHS_BACK = 24;

/** 固定ヘッダー（AppBar）の高さ。追従させるものはこの下に積む */
const HEADER_H = { xs: 56, sm: 64 };

/** 会員に高齢の方が多いため、押すものは高さ 48px を確保する（指で押せる下限は 44px） */
const CONTROL_H = 48;

/**
 * 列幅。table-layout:fixed と組み合わせて、画面幅に必ず収まるようにする。
 * スマホでは備考を列から外し、内容があるときだけ日付ごとに1行足す。
 */
const COL_W = {
  date: { xs: "28%", md: "14%" },
  court: { xs: "10%", md: "8%" },
  slot: { xs: "15.5%", md: "12%" },
  memo: { md: "30%" },
};

const headFont = { xs: ".75rem", sm: ".92rem", md: "1.05rem" };
const bodyFont = { xs: ".82rem", sm: ".95rem", md: "1.05rem" };
const cellPy = { xs: 0.75, sm: 1.25, md: 1.75 };
const cellPx = { xs: 0.25, sm: 1, md: 2 };

const bodyCellSx = {
  fontSize: bodyFont,
  py: cellPy,
  px: cellPx,
};

/** 月を前後に動かすボタン。広い画面では言葉も添える */
const StepButton = ({
  dir,
  label,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
}) => (
  <Box
    component="button"
    type="button"
    aria-label={label}
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.75,
      minHeight: CONTROL_H,
      minWidth: CONTROL_H,
      px: { xs: 0, sm: 2 },
      border: `2px solid ${tokens.line}`,
      borderRadius: shape.chip,
      backgroundColor: tokens.surface,
      cursor: "pointer",
      fontFamily: fonts.display,
      fontSize: ".95rem",
      fontWeight: 700,
      color: tokens.ink,
      whiteSpace: "nowrap",
      transition: "background-color .15s ease, border-color .15s ease",
      "&:hover": {
        backgroundColor: tokens.greenPale,
        borderColor: tokens.green,
      },
    }}
  >
    {dir === "prev" && <ArrowBackIosNewIcon sx={{ fontSize: 15 }} />}
    {/* 狭い画面は矢印だけ（旧サイトと同じ形）。広い画面は言葉も出す */}
    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
      {label}
    </Box>
    {dir === "next" && <ArrowForwardIosIcon sx={{ fontSize: 15 }} />}
  </Box>
);

/** 凡例の1項目。文字だけでなく実物と同じ見た目の見本を並べる */
const LegendItem = ({
  sample,
  text,
}: {
  sample: React.ReactNode;
  text: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    {sample}
    <Typography component="span" sx={{ fontSize: ".95rem", color: tokens.ink }}>
      {text}
    </Typography>
  </Box>
);

const legendBoxSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 38,
  height: 32,
  borderRadius: "6px",
  border: `1px solid ${tokens.line}`,
  fontFamily: fonts.display,
  fontSize: "1.05rem",
  fontWeight: 700,
};

/**
 * 1マス分の表示。
 * トップの「本日のコート予約状況」と同じ塗り分け
 * （確保済み＝薄い緑地に濃い緑の太字／未確保＝白地／中止＝赤バッジ）。
 * 字が小さくなるスマホでも、マスの地の色だけで 〇×の並びを追えるようにしている。
 */
const SlotCell = ({
  value,
  cancel,
}: {
  value: string;
  cancel: CancelEntry | undefined;
}) => {
  const v = (value ?? "").trim();
  const held = isHeld(v);

  return (
    <TableCell
      align="center"
      sx={{
        ...bodyCellSx,
        backgroundColor: cancel
          ? tokens.dangerPale
          : held
            ? tokens.greenPale
            : "transparent",
      }}
    >
      {cancel ? (
        <Tooltip title={cancelSummary(cancel)} enterTouchDelay={0}>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: { xs: ".7rem", sm: ".85rem", md: "1rem" },
              color: "#fff",
              backgroundColor: tokens.danger,
              borderRadius: "4px",
              px: { xs: 0.5, md: 1.25 },
              py: "3px",
              cursor: "help",
            }}
          >
            中止
          </Box>
        </Tooltip>
      ) : (
        <Box
          component="span"
          sx={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: held
              ? { xs: "1.05rem", sm: "1.25rem", md: "1.5rem" }
              : { xs: ".9rem", sm: "1.05rem", md: "1.15rem" },
            lineHeight: 1,
            color: held ? tokens.greenDeep : tokens.muted,
          }}
        >
          {v || "×"}
        </Box>
      )}
    </TableCell>
  );
};

const Court = () => {
  const theme = useTheme();
  // 備考は横幅を食うので、狭い画面では列から外して日付ごとの行に回す
  const showMemoColumn = useMediaQuery(theme.breakpoints.up("md"));

  const [month, setMonth] = useState(getCurrentMonth());
  const [rows, setRows] = useState<RowData[] | null>(null);
  const [error, setError] = useState("");
  const [courtType, setCourtType] = useState<"Onuma" | "Tatenuma">("Onuma");
  // 中止連絡。日付 → 場所 → 面 → 時間帯 の順に引ける
  const [cancels, setCancels] = useState<CancelMap>({});

  /**
   * 操作列の実際の高さ。表の見出し行をそのすぐ下に貼り付けるために測る。
   * 画面幅で 1行になったり 2行になったりするので、決め打ちにはできない。
   */
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    setBarH(el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    setRows(null);
    setError("");
    fetch(`/api/courts_list.php?court_type=${courtType}&year_month=${month}`)
      .then((res) => {
        if (!res.ok) throw new Error("データが見つかりません");
        return res.json() as Promise<RowData[]>;
      })
      .then((data) => {
        if (!alive) return;
        setRows(data);
      })
      .catch(() => {
        if (!alive) return;
        // 「読み込めなかった」と「その月は予約ゼロ」を区別して伝える
        setRows([]);
        setError("この月の利用状況を読み込めませんでした。");
      });
    return () => {
      alive = false;
    };
  }, [month, courtType]);

  // 中止連絡は月単位でまとめて取得する。失敗しても予約状況の表示は続ける
  useEffect(() => {
    fetch(`/api/cancel.php?month=${toApiMonth(month)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((json) => setCancels(json?.ok ? (json.cancellations ?? {}) : {}))
      .catch(() => setCancels({}));
  }, [month]);

  /** 同じ日付の面をまとめる。日付と備考はグループの先頭行にだけ出す */
  const groups = useMemo(() => {
    const map = new Map<string, RowData[]>();
    (rows ?? []).forEach((r) => {
      const list = map.get(r["日付"]);
      if (list) list.push(r);
      else map.set(r["日付"], [r]);
    });
    return [...map.entries()];
  }, [rows]);

  /** 新しい月が上。矢印で範囲外まで進んだ場合も、今見ている月は必ず選択肢に残す */
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    let m = getCurrentMonth();
    for (let i = 0; i < MONTHS_AHEAD; i += 1) m = getNextMonth(m);
    for (let i = 0; i < MONTHS_AHEAD + MONTHS_BACK + 1; i += 1) {
      set.add(m);
      m = getPrevMonth(m);
    }
    set.add(month);
    return [...set].sort().reverse();
  }, [month]);

  const courtLabel =
    COURT_TYPES.find((c) => c.value === courtType)?.label ?? "";

  /** 表の見出し行。操作列の真下に貼り付ける */
  const headCellSx = {
    position: "sticky" as const,
    top: { xs: HEADER_H.xs + barH, sm: HEADER_H.sm + barH },
    zIndex: 2,
    backgroundColor: tokens.greenPale,
    borderBottom: `2px solid ${tokens.line}`,
    fontFamily: fonts.display,
    fontSize: headFont,
    fontWeight: 700,
    color: tokens.ink,
    whiteSpace: "nowrap" as const,
    py: cellPy,
    px: cellPx,
  };

  return (
    <>
      <SectionHead
        eyebrow="コート予約"
        heading="月別のコート利用状況"
        description="クラブが確保しているコートの一覧です。当日の中止連絡は、トップページの「本日のコート予約状況」から登録できます。"
      />

      {/*
        コートと月は続けて操作するので隣り合わせに置き、そのまま画面上部に貼り付ける。
        スクロール中もどのコートの何月を見ているかが常に見えている状態を保つ。
      */}
      <Box
        ref={barRef}
        sx={{
          position: "sticky",
          top: HEADER_H,
          zIndex: 20,
          // スマホでは表と同じだけ外側へ広げ、行が横から覗かないようにする
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
          py: 1.25,
          backgroundColor: tokens.paper,
          borderBottom: `1px solid ${tokens.line}`,
          // コートと月は別の行に分ける（横一列だとどこで区切れるのか読み取りにくい）
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {COURT_TYPES.map((ct) => {
            const selected = ct.value === courtType;
            const color = getCourtColor(ct.label);
            return (
              <Box
                key={ct.value}
                component="button"
                type="button"
                aria-pressed={selected}
                onClick={() => setCourtType(ct.value as "Onuma" | "Tatenuma")}
                sx={{
                  minHeight: CONTROL_H,
                  minWidth: "5em",
                  px: 2,
                  cursor: "pointer",
                  borderRadius: shape.chip,
                  // 選択中は太い枠と色地で、離れて見ても分かるようにする
                  border: `2px solid ${selected ? color.main : tokens.line}`,
                  backgroundColor: selected ? color.pale : tokens.surface,
                  color: selected ? color.main : tokens.muted,
                  fontFamily: fonts.display,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  transition: "background-color .15s ease",
                  "&:hover": {
                    backgroundColor: color.pale,
                    borderColor: color.main,
                  },
                }}
              >
                {ct.label}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StepButton
            dir="prev"
            label="前の月"
            onClick={() => setMonth(getPrevMonth(month))}
          />
          <Box
            component="select"
            aria-label="月を選ぶ"
            value={month}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setMonth(e.target.value)
            }
            sx={{
              minHeight: CONTROL_H,
              px: 1.5,
              border: `2px solid ${tokens.green}`,
              borderRadius: shape.chip,
              backgroundColor: tokens.surface,
              color: tokens.ink,
              fontFamily: fonts.display,
              fontSize: "1.05rem",
              fontWeight: 700,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </Box>
          <StepButton
            dir="next"
            label="次の月"
            onClick={() => setMonth(getNextMonth(month))}
          />
        </Box>
      </Box>

      {/* 凡例。文字の説明だけでなく、表と同じ見た目の見本を並べる */}
      <Box
        sx={{
          display: "flex",
          gap: "12px 24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <LegendItem
          sample={
            <Box
              sx={{
                ...legendBoxSx,
                backgroundColor: tokens.greenPale,
                color: tokens.greenDeep,
              }}
            >
              〇
            </Box>
          }
          text="確保済み"
        />
        <LegendItem
          sample={
            <Box
              sx={{
                ...legendBoxSx,
                backgroundColor: tokens.greenPale,
                color: tokens.greenDeep,
              }}
            >
              D
            </Box>
          }
          text="Dコート"
        />
        <LegendItem
          sample={<Box sx={{ ...legendBoxSx, color: tokens.muted }}>×</Box>}
          text="未確保"
        />
        <LegendItem
          sample={
            <Box
              sx={{
                ...legendBoxSx,
                backgroundColor: tokens.dangerPale,
                border: `1px solid ${tokens.danger}55`,
                color: tokens.danger,
                fontSize: "1rem",
              }}
            >
              中止
            </Box>
          }
          text="当日中止"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ fontSize: "1rem" }}>
          {error}
        </Alert>
      )}

      {!rows && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {rows && rows.length > 0 && (
        <Box
          sx={{
            // スマホでは左右の余白ぶん外側へ広げ、表に使える幅を稼ぐ
            mx: { xs: -2, sm: 0 },
            border: `1px solid ${tokens.line}`,
            borderLeftWidth: { xs: 0, sm: 1 },
            borderRightWidth: { xs: 0, sm: 1 },
            backgroundColor: tokens.surface,
            // overflow:hidden を付けると見出し行の追従が効かなくなるので使わない
          }}
        >
          {/* 列幅を固定して、どの画面幅でも横スクロールなしで収める */}
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headCellSx, width: COL_W.date }}>
                  日付
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ ...headCellSx, width: COL_W.court }}
                >
                  面
                </TableCell>
                {SLOT_LABELS.map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{ ...headCellSx, width: COL_W.slot }}
                  >
                    {/* 狭い画面は「9-11」、広い画面は「9〜11時」 */}
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", md: "inline" } }}
                    >
                      {label.replace("-", "〜")}時
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", md: "none" } }}
                    >
                      {label}
                    </Box>
                  </TableCell>
                ))}
                {showMemoColumn && (
                  <TableCell sx={{ ...headCellSx, width: COL_W.memo }}>
                    備考
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map(([date, courts]) => {
                const dayColor = getDayColor(courts[0]["曜日"]);
                const memo = courts[0]["備考"];
                return (
                  <Fragment key={date}>
                    {courts.map((row, i) => (
                      <TableRow key={`${date}-${row["コート"]}`}>
                        {/* 日付と曜日は1列にまとめる。曜日が面の数だけ繰り返されるのを避ける */}
                        {i === 0 && (
                          <TableCell
                            rowSpan={courts.length}
                            sx={{
                              ...bodyCellSx,
                              whiteSpace: "nowrap",
                              fontFamily: fonts.display,
                              fontWeight: 700,
                              color: dayColor ?? tokens.ink,
                              verticalAlign: "top",
                            }}
                          >
                            {formatDay(date)}（{row["曜日"]}）
                          </TableCell>
                        )}
                        <TableCell
                          align="center"
                          sx={{
                            ...bodyCellSx,
                            whiteSpace: "nowrap",
                            fontFamily: fonts.display,
                            fontWeight: 700,
                          }}
                        >
                          {row["コート"]}
                        </TableCell>
                        {SLOT_LABELS.map((label, slot) => (
                          <SlotCell
                            key={label}
                            value={row[label as SlotKey]}
                            cancel={
                              cancels[date]?.[courtType]?.[row["コート"]]?.[
                                `slot${slot}`
                              ]
                            }
                          />
                        ))}
                        {showMemoColumn && i === 0 && (
                          <TableCell
                            rowSpan={courts.length}
                            sx={{
                              ...bodyCellSx,
                              color: tokens.muted,
                              verticalAlign: "top",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {memo}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* 狭い画面では、備考があるときだけ日付ごとに1行足す */}
                    {!showMemoColumn && memo && (
                      <TableRow>
                        <TableCell
                          colSpan={2 + SLOT_LABELS.length}
                          sx={{
                            ...bodyCellSx,
                            px: 2,
                            fontSize: { xs: ".78rem", sm: ".9rem" },
                            color: tokens.muted,
                            backgroundColor: tokens.paper,
                            overflowWrap: "anywhere",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, mr: 0.75 }}
                          >
                            備考
                          </Box>
                          {memo}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {rows && rows.length === 0 && !error && (
        <Typography sx={{ fontSize: "1.05rem", color: tokens.muted }}>
          {formatMonth(month)}の{courtLabel}
          コートは、まだ予約が登録されていません。
        </Typography>
      )}
    </>
  );
};

export default Court;
