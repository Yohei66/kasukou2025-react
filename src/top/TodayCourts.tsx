import { Box, Container, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fonts, getCourtColor, layout, tokens } from "./tokens";
import CancelDialog from "./CancelDialog";
import { SLOT_LABELS, isHeld } from "../courtCommon";
import type {
  CancelEntry,
  CourtRow,
  Location,
  SlotTarget,
  TodayResponse,
} from "../courtCommon";

const formatDate = (iso: string, dow: string) => {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const base = `${Number(m[1])}月${Number(m[2])}日`;
  return dow ? `${base}（${dow}）` : base;
};

type SlotCellProps = {
  value: string;
  cancel: CancelEntry | null;
  onClick: () => void;
};

/**
 * 1マス分。
 * 確保済みは色を塗り、未確保は沈めて × が悪目立ちしないようにする。
 * 確保済みか中止済みのマスだけ押せる（× を押しても何も起きない）。
 */
const SlotCell = ({ value, cancel, onClick }: SlotCellProps) => {
  const v = value.trim();
  const held = isHeld(v);
  const clickable = held || cancel !== null;

  return (
    <Box
      component="td"
      onClick={clickable ? onClick : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-label={
        clickable
          ? cancel
            ? "中止済み。内容を確認する"
            : "確保済み。中止を登録する"
          : undefined
      }
      onKeyDown={
        clickable
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        textAlign: "center",
        px: 0.5,
        py: 1,
        borderTop: `1px solid ${tokens.line}`,
        fontFamily: fonts.display,
        cursor: clickable ? "pointer" : "default",
        userSelect: "none",
        ...(cancel
          ? { backgroundColor: tokens.dangerPale }
          : held
            ? { backgroundColor: tokens.greenPale }
            : { opacity: 0.55 }),
        ...(clickable && {
          transition: "filter .15s ease",
          "&:hover": { filter: "brightness(0.96)" },
        }),
      }}
    >
      {cancel ? (
        <Box
          component="span"
          sx={{
            display: "inline-block",
            fontFamily: fonts.data,
            fontWeight: 700,
            fontSize: ".78rem",
            letterSpacing: ".06em",
            color: "#fff",
            backgroundColor: tokens.danger,
            borderRadius: "4px",
            px: 0.75,
            py: "1px",
          }}
        >
          中止
        </Box>
      ) : (
        <Box
          component="span"
          sx={{
            fontWeight: held ? 700 : 400,
            fontSize: held ? "1rem" : ".9rem",
            color: held ? tokens.greenDeep : tokens.muted,
          }}
        >
          {v || "–"}
        </Box>
      )}
    </Box>
  );
};

type LocationTableProps = {
  loc: Location;
  date: string;
  onSelect: (target: SlotTarget, entry: CancelEntry | null) => void;
};

const LocationTable = ({ loc, date, onSelect }: LocationTableProps) => {
  const color = getCourtColor(loc.label);
  return (
    <Box
      sx={{
        border: `1px solid ${tokens.line}`,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: tokens.paper,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          alignItems: "baseline",
          gap: 1.5,
          flexWrap: "wrap",
          borderBottom: `1px solid ${tokens.line}`,
          backgroundColor: color.pale,
        }}
      >
        <Typography
          component="span"
          sx={{ fontFamily: fonts.display, fontWeight: 700, color: color.main }}
        >
          {loc.label}コート
        </Typography>
        {loc.note && (
          <Typography component="span" sx={{ fontSize: ".82rem", color: tokens.muted }}>
            {loc.note}
          </Typography>
        )}
      </Box>

      {loc.found ? (
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  width: "18%",
                  px: 1,
                  py: 0.75,
                  fontFamily: fonts.data,
                  fontSize: ".78rem",
                  letterSpacing: ".06em",
                  color: tokens.muted,
                  fontWeight: 600,
                }}
              >
                面
              </Box>
              {SLOT_LABELS.map((s) => (
                <Box
                  key={s}
                  component="th"
                  sx={{
                    px: 0.5,
                    py: 0.75,
                    fontFamily: fonts.data,
                    fontSize: ".78rem",
                    letterSpacing: ".04em",
                    color: tokens.muted,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {loc.courts.map((c: CourtRow) => (
              <Box component="tr" key={c.name}>
                <Box
                  component="td"
                  sx={{
                    px: 1,
                    py: 1,
                    textAlign: "center",
                    borderTop: `1px solid ${tokens.line}`,
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    fontSize: ".9rem",
                    color: tokens.ink,
                  }}
                >
                  {c.name}面
                </Box>
                {c.slots.map((v, i) => {
                  const entry = c.cancels?.[i] ?? null;
                  return (
                    <SlotCell
                      key={`${c.name}-${SLOT_LABELS[i]}`}
                      value={v}
                      cancel={entry}
                      onClick={() =>
                        onSelect(
                          {
                            date,
                            locationKey: loc.key,
                            locationLabel: loc.label,
                            courtName: c.name,
                            slot: i,
                          },
                          entry
                        )
                      }
                    />
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Typography sx={{ px: 2, py: 2.5, color: tokens.muted, fontSize: ".92rem" }}>
          本日は予約なしです。
        </Typography>
      )}
    </Box>
  );
};

/**
 * 本日のコート予約状況。
 * 会員向けの実用機能だが、トップに置くことで「今日も動いているクラブ」であることが
 * 検討者にも伝わる。取得に失敗したときはブロックごと出さない。
 */
const TodayCourts = () => {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<{
    target: SlotTarget;
    entry: CancelEntry | null;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/courts_today.php");
      if (!res.ok) throw new Error("failed");
      const json = (await res.json()) as TodayResponse;
      if (!json.ok) throw new Error("not ok");
      setData(json);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // 読み込み中と失敗時は何も出さない（ランディングページに壊れた枠を見せない）
  if (failed || !data) return null;

  const hasAnyCourt = data.locations.some((l) => l.found);

  return (
    <Box
      component="section"
      id="today"
      sx={{
        py: { xs: 5, md: 7 },
        backgroundColor: tokens.surface,
        borderBottom: `1px solid ${tokens.line}`,
      }}
    >
      <Container sx={{ maxWidth: `${layout.maxWidth}px !important`, px: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px 16px",
            mb: 2.5,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: fonts.data,
              fontWeight: 600,
              fontSize: ".82rem",
              letterSpacing: ".16em",
              color: tokens.green,
            }}
          >
            会員の方へ
          </Typography>
          <Typography variant="h3" sx={{ fontSize: "1.25rem" }}>
            本日{formatDate(data.date, data.day_of_week)}のコート予約状況
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              ml: { xs: 0, md: "auto" },
              fontFamily: fonts.data,
              fontSize: ".8rem",
              color: tokens.muted,
              flexWrap: "wrap",
            }}
          >
            <span>〇 ： 確保済み</span>
            <span>D ： Dコート</span>
            <span>× ： 未確保</span>
          </Box>
        </Box>

        {hasAnyCourt && (
          <Typography sx={{ fontSize: ".88rem", color: tokens.muted, mb: 2, lineHeight: 1.8 }}>
            雨・熱中症アラートなどでコートをキャンセルした場合は、
            <strong>確保済みのマス</strong>を押してください。
            キャンセル済みのマスを押すと、登録した人を確認できます。
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          {data.locations.map((loc) => (
            <LocationTable
              key={loc.key}
              loc={loc}
              date={data.date}
              onSelect={(target, entry) => setSelected({ target, entry })}
            />
          ))}
        </Box>

        <Box
          component={Link}
          to="/court"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mt: 2.5,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: ".95rem",
            color: tokens.green,
            textDecoration: "none",
            borderBottom: "2px solid transparent",
            pb: "2px",
            "&:hover": { borderBottomColor: tokens.green },
          }}
        >
          今月のコート予約状況を見る
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Container>

      {selected && (
        <CancelDialog
          target={selected.target}
          entry={selected.entry}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            void load();
          }}
        />
      )}
    </Box>
  );
};

export default TodayCourts;
