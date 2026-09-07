import { Box, Typography } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, getCourtColor, tokens } from "./tokens";
import { holidaySchedule, weeklySchedule } from "../dataset/topContent";
import type { DayActivityDetail, DayColumn } from "../dataset/topContent";

const KIND_LABEL: Record<DayActivityDetail["kind"], string> = {
  lesson: "レッスン",
  doubles: "ダブルス",
};

const KIND_COLOR: Record<DayActivityDetail["kind"], string> = {
  lesson: "#2E8B62",
  doubles: "#8A7A12",
};

const KIND_BG: Record<DayActivityDetail["kind"], string> = {
  lesson: "#E4F3EA",
  doubles: "#F5F2D8",
};

const ActivityLine = ({ item }: { item: DayActivityDetail }) => (
  <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
    <Box
      component="span"
      sx={{
        flex: "none",
        fontFamily: fonts.data,
        fontWeight: 600,
        fontSize: ".76rem",
        letterSpacing: ".04em",
        px: 0.875,
        py: "1px",
        borderRadius: "4px",
        backgroundColor: KIND_BG[item.kind],
        color: KIND_COLOR[item.kind],
      }}
    >
      {KIND_LABEL[item.kind]}
    </Box>
    <Box
      component="span"
      sx={{
        fontFamily: fonts.data,
        fontWeight: 600,
        fontSize: ".95rem",
        fontVariantNumeric: "tabular-nums",
        color: tokens.ink,
      }}
    >
      {item.time}
    </Box>
    {item.detail && (
      <Box component="span" sx={{ fontSize: ".82rem", color: tokens.muted }}>
        {item.detail}
      </Box>
    )}
  </Box>
);

/**
 * 曜日 × コートの週間スケジュール。
 * クラス別のカードは「自分に合うクラスは？」に答えるが、
 * 「何曜日は何時からか」には答えられないため、曜日軸の表を別に用意している。
 *
 * 本日をハイライトする案もあったが、あくまで通常の予定であって
 * その日にコートが確保できているとは限らない。当日の確実な情報は
 * トップページの「本日のコート予約状況」（実データ）に委ねる。
 */
const WeeklySchedule = () => {
  return (
    <Section band id="schedule">
      <SectionHead
        eyebrow="週間スケジュール"
        heading="いつ、どこで、何をしているか"
        description="月曜をのぞく週6日、立沼・大沼のいずれかで活動しています。下記は通常の予定です。コートが確保できているかは日によって変わるため、当日の状況はトップページの「本日のコート予約状況」でご確認ください。"
      />

      <Box sx={{ mt: 4, border: `1px solid ${tokens.line}`, borderRadius: "14px", overflow: "hidden" }}>
        {/* 見出し行。狭い画面では各セルにコート名を出すので隠す */}
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "5.5em 1fr 1fr",
            backgroundColor: tokens.greenPale,
            borderBottom: `1px solid ${tokens.line}`,
          }}
        >
          {["曜日", "立沼コート", "大沼コート"].map((h) => (
            <Box
              key={h}
              sx={{
                px: 2,
                py: 1.25,
                fontFamily: fonts.data,
                fontSize: ".8rem",
                letterSpacing: ".1em",
                color: tokens.muted,
                fontWeight: 600,
              }}
            >
              {h}
            </Box>
          ))}
        </Box>

        {[...weeklySchedule, holidaySchedule].map((row, rowIndex) => {
          const isHoliday = row.day === "祝日";
          const isRest = row.columns.every((c) => c.items.length === 0);
          return (
            <Box
              key={row.day}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "5.5em 1fr 1fr" },
                // 祝日は曜日ではないので、二重線で区切って別枠だと分かるようにする
                borderTop: isHoliday
                  ? `3px double ${tokens.line}`
                  : rowIndex === 0
                    ? "none"
                    : `1px solid ${tokens.line}`,
                backgroundColor: isRest ? tokens.greenPale : tokens.surface,
              }}
            >
              {/* 曜日 */}
              <Box
                sx={{
                  px: 2,
                  py: { xs: 1.25, md: 2 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: { xs: `1px solid ${tokens.line}`, md: "none" },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    fontSize: isHoliday ? ".95rem" : "1.05rem",
                    color: isRest ? tokens.muted : isHoliday ? "#C0392B" : tokens.ink,
                  }}
                >
                  {row.day}
                </Typography>
              </Box>

              {isRest ? (
                <Box
                  sx={{
                    gridColumn: { xs: "auto", md: "span 2" },
                    px: 2,
                    py: 2,
                    color: tokens.muted,
                    fontSize: ".92rem",
                  }}
                >
                  お休みです（祝日をのぞく）
                </Box>
              ) : (
                row.columns.map((col: DayColumn) => {
                  const color = getCourtColor(col.court);
                  return (
                    <Box
                      key={col.court}
                      sx={{
                        px: 2,
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        borderLeft: { xs: "none", md: `1px solid ${tokens.line}` },
                        borderBottom: { xs: `1px solid ${tokens.line}`, md: "none" },
                        "&:last-of-type": { borderBottom: "none" },
                      }}
                    >
                      {/* 狭い画面には見出し行がないので、セル内にコート名を出す */}
                      <Box
                        component="span"
                        sx={{
                          display: { xs: "inline-block", md: "none" },
                          alignSelf: "flex-start",
                          fontFamily: fonts.display,
                          fontWeight: 700,
                          fontSize: ".78rem",
                          px: 1,
                          py: "1px",
                          borderRadius: "4px",
                          backgroundColor: color.pale,
                          color: color.main,
                        }}
                      >
                        {col.court}
                      </Box>

                      {col.items.length > 0 ? (
                        col.items.map((item) => (
                          <ActivityLine key={`${item.kind}-${item.time}`} item={item} />
                        ))
                      ) : (
                        <Box component="span" sx={{ color: tokens.muted, fontSize: ".9rem" }}>
                          —
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ mt: 2, fontSize: ".9rem", color: tokens.muted, lineHeight: 1.9 }}>
        祝日は曜日にかかわらず、土曜と同じ時間でダブルスゲームを行います（レッスンはありません）。
        <strong>月曜が祝日の場合も、朝から活動します。</strong>
      </Typography>
    </Section>
  );
};

export default WeeklySchedule;
