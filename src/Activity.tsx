import { Box, Typography } from "@mui/material";
import Section from "./top/Section";
import SectionHead from "./top/SectionHead";
import WeeklySchedule from "./top/WeeklySchedule";
import { fonts, getCourtColor, tokens } from "./top/tokens";
import {
  belongings,
  doublesByCourt,
  doublesIntro,
  lessonGroups,
  lessons,
} from "./dataset/topContent";
import type { Lesson } from "./dataset/topContent";

/** コート名を識別色つきのチップで出す。緑＝立沼／青＝大沼 */
const CourtChip = ({ court }: { court: string }) => {
  const color = getCourtColor(court);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: ".82rem",
        px: 1.25,
        py: "2px",
        borderRadius: "6px",
        backgroundColor: color.pale,
        color: color.main,
        border: `1px solid ${color.main}33`,
      }}
    >
      {court}
    </Box>
  );
};

const DayTimeChip = ({ day, time }: { day: string; time: string }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "baseline",
      gap: 0.75,
      fontFamily: fonts.data,
      fontWeight: 600,
      fontSize: ".85rem",
      letterSpacing: ".04em",
      px: 1.25,
      py: "2px",
      borderRadius: "6px",
      backgroundColor: tokens.greenPale,
      color: tokens.greenDeep,
      border: `1px solid ${tokens.line}`,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    <Box component="span" sx={{ fontFamily: fonts.display }}>
      {day}
    </Box>
    {time}
  </Box>
);

/**
 * レッスン1件のカード。
 * 旧ページは6列の表だったが、長文の「内容」列があるためスマホで破綻していた。
 * カードなら列幅の制約がなく、どの画面幅でも同じ情報量を出せる。
 */
const LessonCard = ({ lesson }: { lesson: Lesson }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
      border: `1px solid ${tokens.line}`,
      borderRadius: "14px",
      backgroundColor: tokens.paper,
      px: 3,
      py: 2.75,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
      <Typography variant="h3" sx={{ fontSize: "1.15rem" }}>
        {lesson.name}
      </Typography>
      <Typography sx={{ fontSize: ".85rem", color: tokens.muted }}>
        {lesson.target}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <DayTimeChip day={lesson.day} time={lesson.time} />
      <CourtChip court={lesson.court} />
    </Box>

    <Typography sx={{ color: tokens.muted, fontSize: ".93rem", lineHeight: 1.9 }}>
      {lesson.description}
    </Typography>
  </Box>
);

const Activity = () => (
  <>
    {/* 導入。まず「無料」「週6日」という要点を先に出す */}
    <Section band>
      <SectionHead
        eyebrow="活動内容"
        heading="レッスンと、ダブルスゲーム。"
        description="当クラブの活動は、レベル別のレッスンと、会員どうしのダブルスゲームの2本立てです。月曜をのぞく週6日、春日部市の立沼コートと大沼コートで活動しています。"
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
          gap: 2.5,
          mt: 4,
        }}
      >
        {[
          {
            title: "レッスン料は無料です",
            body: "会費のほかにレッスン料はかかりません。7つのクラスから、レベルや参加できる曜日に合わせて選べます。",
          },
          {
            title: "コーチは会員が務めます",
            body: "会員の中から経験のある適任者がコーチを担当し、基本から丁寧に指導します。外部のスクールとは異なる、市民クラブならではの形です。",
          },
          {
            title: "レッスン中でもゲームに参加できます",
            body: "レッスンを受けている方も、ダブルスゲームに自由に参加できます。どちらか一方を選ぶ必要はありません。",
          },
        ].map((p) => (
          <Box
            key={p.title}
            sx={{
              border: `1px solid ${tokens.line}`,
              borderRadius: "14px",
              backgroundColor: tokens.paper,
              px: 3,
              py: 2.75,
            }}
          >
            <Typography variant="h3" sx={{ fontSize: "1.05rem" }}>
              {p.title}
            </Typography>
            <Typography
              sx={{ mt: 1, color: tokens.muted, fontSize: ".92rem", lineHeight: 1.9 }}
            >
              {p.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Section>

    {/* 週間スケジュール。「今日は何時からやっているか」を引くための表 */}
    <WeeklySchedule />

    {/* 各種レッスン */}
    <Section id="lessons">
      <SectionHead
        eyebrow="各種レッスン"
        heading="レベルと曜日で選べる、7つのクラス"
        description="自分のレベルや参加できる曜日・時間に合わせて、好きなコースに参加できます。どのクラスが合うか分からない場合は、見学のときにご相談ください。"
      />

      {lessonGroups.map((group) => {
        const items = lessons.filter((l) => l.group === group.key);
        if (items.length === 0) return null;
        return (
          <Box key={group.key} sx={{ mt: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.25rem",
                pb: 1.25,
                mb: 2.5,
                borderBottom: `2px solid ${tokens.green}`,
                display: "inline-block",
              }}
            >
              {group.title}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
                gap: 2.5,
              }}
            >
              {items.map((l) => (
                <LessonCard key={`${l.name}-${l.day}-${l.time}`} lesson={l} />
              ))}
            </Box>
            {group.key === "junior" && (
              <Typography sx={{ mt: 2, fontSize: ".9rem", color: tokens.muted }}>
                AとBのどちらに入るかは、お申し込みの時点で決めていただく必要はありません。
                当日の様子を見て、コーチがその場で振り分けます。
              </Typography>
            )}
          </Box>
        );
      })}
    </Section>

    {/* ダブルスゲーム */}
    <Section band id="doubles">
      <SectionHead
        eyebrow="ダブルスゲーム"
        heading="都合のつく日に、来て、打つ。"
        description={doublesIntro}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
          gap: 2.5,
          mt: 4,
        }}
      >
        {doublesByCourt.map((c) => {
          const color = getCourtColor(c.court);
          return (
            <Box
              key={c.court}
              sx={{
                border: `1px solid ${tokens.line}`,
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: tokens.paper,
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: color.pale,
                  borderBottom: `1px solid ${tokens.line}`,
                }}
              >
                <Typography
                  sx={{ fontFamily: fonts.display, fontWeight: 700, color: color.main }}
                >
                  {c.court}コート
                </Typography>
              </Box>
              <Box component="dl" sx={{ m: 0 }}>
                {c.slots.map((s, i) => (
                  <Box
                    key={s.day}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "4.5em 1fr",
                      gap: "4px 16px",
                      px: 2.5,
                      py: 1.75,
                      borderTop: i === 0 ? "none" : `1px solid ${tokens.line}`,
                    }}
                  >
                    <Box
                      component="dt"
                      sx={{
                        fontFamily: fonts.display,
                        fontWeight: 700,
                        color: tokens.ink,
                      }}
                    >
                      {s.day}
                    </Box>
                    <Box component="dd" sx={{ m: 0 }}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: fonts.data,
                          fontWeight: 600,
                          fontSize: "1rem",
                          fontVariantNumeric: "tabular-nums",
                          color: tokens.ink,
                        }}
                      >
                        {s.time}
                      </Box>
                      {s.note && (
                        <Typography
                          sx={{ fontSize: ".85rem", color: tokens.muted, mt: 0.25 }}
                        >
                          {s.note}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Typography sx={{ mt: 2.5, fontSize: ".9rem", color: tokens.muted }}>
        コートが確保できているかは日によって変わります。当日の状況はトップページの「本日のコート予約状況」でご確認ください。
      </Typography>
    </Section>

    {/* 持ち物・服装 */}
    <Section id="belongings">
      <SectionHead
        eyebrow="はじめて参加する方へ"
        heading="持ち物と服装"
        description="特別な用意は要りません。見学・体験のときは、次のものをお持ちください。"
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" },
          gap: 2.5,
          mt: 4,
        }}
      >
        {belongings.map((b) => (
          <Box
            key={b.title}
            sx={{
              border: `1px solid ${tokens.line}`,
              borderRadius: "14px",
              backgroundColor: tokens.surface,
              px: 2.75,
              py: 2.5,
            }}
          >
            <Typography variant="h3" sx={{ fontSize: "1rem" }}>
              {b.title}
            </Typography>
            <Typography
              sx={{ mt: 0.75, color: tokens.muted, fontSize: ".9rem", lineHeight: 1.85 }}
            >
              {b.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Section>
  </>
);

export default Activity;
