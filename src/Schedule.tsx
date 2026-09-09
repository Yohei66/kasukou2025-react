import {
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import SectionHead from "./top/SectionHead";
import Segmented from "./top/Segmented";
import { fonts, getCourtColor, getDayColor, shape, tokens } from "./top/tokens";
import {
  fetchEvents,
  formatEventDate,
  type ClubEvent,
} from "./dataset/content";

/** 表のヘッダ行。塗りつぶしの緑＋白文字はコントラストが足りないので薄い緑地にする */
const headCellSx = {
  backgroundColor: tokens.greenPale,
  borderBottom: `2px solid ${tokens.line}`,
  fontFamily: fonts.display,
  fontSize: "1.05rem",
  fontWeight: 700,
  color: tokens.ink,
  whiteSpace: "nowrap" as const,
  py: 1.75,
};

/** 本文セル。会員に高齢の方が多いため 1.05rem を下限にする */
const bodyCellSx = {
  fontSize: "1.05rem",
  py: 1.75,
};

/**
 * 場所の表示。
 * 「立沼」「大沼」は字面が似ているので、サイト共通の識別色チップで出す。
 * 公民館など、コート以外の場所はそのまま文字で出す。
 */
const PlaceCell = ({ place }: { place: string }) => {
  if (!/立沼|大沼/.test(place)) {
    return <>{place}</>;
  }
  const color = getCourtColor(place);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: "1rem",
        px: 1.5,
        py: "4px",
        borderRadius: shape.chip,
        backgroundColor: color.pale,
        color: color.main,
        border: `1px solid ${color.main}33`,
        whiteSpace: "nowrap",
      }}
    >
      {place}
    </Box>
  );
};

/** 今日（ローカル時刻）の YYYY-MM-DD */
const todayIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const Schedule = () => {
  const [events, setEvents] = useState<ClubEvent[] | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((rows) => {
        if (!alive) return;
        setEvents(rows);
        // 今年の予定がなければ、いちばん新しい年を開く
        const years = [...new Set(rows.map((e) => e.date.slice(0, 4)))];
        const thisYear = String(new Date().getFullYear());
        setYear(years.includes(thisYear) ? thisYear : (years.at(-1) ?? ""));
      })
      .catch(() => alive && setError("行事予定表を読み込めませんでした。"));
    return () => {
      alive = false;
    };
  }, []);

  const years = useMemo(
    () => [...new Set((events ?? []).map((e) => e.date.slice(0, 4)))],
    [events]
  );
  const shown = useMemo(
    () => (events ?? []).filter((e) => e.date.startsWith(year)),
    [events, year]
  );
  const today = todayIso();

  return (
    <>
      <SectionHead
        eyebrow="行事予定表"
        heading="今年の行事"
        description="大会・親睦会・コート整備などの年間予定です。日程は天候や施設の都合で変わることがあります。"
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!events && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {events && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {years.length > 1 && (
            <Segmented
              label="表示する年"
              value={year}
              onChange={setYear}
              options={years.map((y) => ({ label: `${y}年`, value: y }))}
            />
          )}

          <Box
            sx={{
              border: `1px solid ${tokens.line}`,
              borderRadius: shape.panel,
              overflow: "hidden",
              backgroundColor: tokens.surface,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>日付</TableCell>
                    <TableCell sx={{ ...headCellSx, width: 240 }}>
                      行事
                    </TableCell>
                    <TableCell sx={headCellSx}>場所</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shown.map((event) => {
                    // 済んだ予定は沈めて、これからの予定を目で拾いやすくする
                    const past = event.date < today;
                    const dayColor = getDayColor(event.dow);
                    return (
                      <TableRow
                        key={event.id}
                        sx={{ opacity: past ? 0.55 : 1 }}
                      >
                        {/* 曜日は日付と1列にまとめる。列が減るぶん文字を大きく取れる */}
                        <TableCell
                          sx={{
                            ...bodyCellSx,
                            whiteSpace: "nowrap",
                            fontFamily: fonts.display,
                            fontWeight: 700,
                            color: dayColor ?? tokens.ink,
                          }}
                        >
                          {formatEventDate(event.date)}（{event.dow}）
                        </TableCell>
                        <TableCell
                          sx={{
                            ...bodyCellSx,
                            width: 240,
                            fontFamily: fonts.display,
                            fontWeight: 700,
                          }}
                        >
                          {event.title}
                        </TableCell>
                        <TableCell sx={bodyCellSx}>
                          <PlaceCell place={event.place} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {shown.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={bodyCellSx}>
                        予定はまだ登録されていません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography sx={{ fontSize: "1rem", color: tokens.muted }}>
            日付が薄くなっている行は、すでに終わった予定です。
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Schedule;
