import { Box, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, tokens } from "./tokens";
import { lessonGroups, lessons } from "../dataset/topContent";

/**
 * レッスンの要約。
 *
 * クラスごとの曜日・時間・コートの一覧は活動内容ページが持っている。
 * ここに同じ表を置くと、ヒーロー下の「ふだんの一週間」と合わせて
 * 似た内容が3か所に並び、とくにスマホで縦に伸びるため、
 * トップでは「7クラスある・レッスン料は無料」だけを伝えて詳細は送る。
 */

// 系統ごとのクラス数と実施曜日はレッスン定義から数える。
// クラスを増減しても topContent.ts を直すだけで追従する。
const groups = lessonGroups
  .map((g) => {
    const items = lessons.filter((l) => l.group === g.key);
    return {
      key: g.key,
      title: g.title,
      count: items.length,
      days: [...new Set(items.map((l) => l.day))].join("・"),
    };
  })
  .filter((g) => g.count > 0);

const Lessons = () => (
  <Section id="lessons">
    <SectionHead
      eyebrow="レッスン"
      heading={`レベル別に${lessons.length}クラス。レッスン料は無料です。`}
      description="自分のレベルや参加できる曜日・時間に合わせて、好きなクラスに参加できます。どのクラスが合うか分からない場合は、見学のときにご相談ください。"
    />

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
        gap: 2.5,
        mt: 4,
      }}
    >
      {groups.map((g) => (
        <Box
          key={g.key}
          sx={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px 12px",
            border: `1px solid ${tokens.line}`,
            borderRadius: "14px",
            backgroundColor: tokens.surface,
            px: 3,
            py: 2.5,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: tokens.ink,
            }}
          >
            {g.title}
          </Typography>
          <Box
            component="span"
            sx={{
              fontFamily: fonts.data,
              fontWeight: 600,
              fontSize: ".82rem",
              letterSpacing: ".06em",
              fontVariantNumeric: "tabular-nums",
              px: 1.5,
              py: "2px",
              borderRadius: 999,
              backgroundColor: tokens.greenPale,
              color: tokens.greenDeep,
              border: `1px solid ${tokens.line}`,
              whiteSpace: "nowrap",
            }}
          >
            {g.days}曜 ／ {g.count}クラス
          </Box>
        </Box>
      ))}
    </Box>

    <Typography sx={{ mt: 3, color: tokens.muted, fontSize: ".92rem", lineHeight: 1.9 }}>
      このほか、会員同士のダブルスゲームを週6日おこなっています。レッスンを受けている方も自由に参加できます。
    </Typography>

    <Box
      component={Link}
      to="/activity"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        mt: 2.5,
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: ".98rem",
        color: tokens.green,
        textDecoration: "none",
        borderBottom: "2px solid transparent",
        pb: "2px",
        transition: "border-color .18s ease",
        "&:hover": { borderBottomColor: tokens.green },
      }}
    >
      クラスの一覧と時間を見る
      <ArrowForwardIcon sx={{ fontSize: 16 }} />
    </Box>
  </Section>
);

export default Lessons;
