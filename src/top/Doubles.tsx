import { Box, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, tokens } from "./tokens";
import { doublesHighlights } from "../dataset/topContent";

/**
 * 会員どうしのダブルスゲーム。トップページの中心となるセクション。
 *
 * このクラブは「会員どうしのダブルス」が主役で、レッスンは有志によるおまけ。
 * 民間スクールと誤解されないよう、レッスン単独のセクションは置かず、
 * 末尾の小さな補足で触れるだけにしている（ジュニアと初心者向けの案内はトップでは出さない）。
 */
const Doubles = () => (
  <Section id="doubles">
    <SectionHead
      eyebrow="ダブルスゲーム"
      heading="活動の中心は、会員どうしのダブルスです。"
      description="週6日、立沼・大沼のどちらかのコートで、会員どうしのダブルスゲームをしています。都合のいい日に参加して、その日集まったメンバーでゲームを楽しんでいます。"
    />

    <Box
      component="ol"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        mt: 4,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
        gap: 2.5,
      }}
    >
      {doublesHighlights.map((h, i) => (
        <Box
          component="li"
          key={h.title}
          sx={{
            border: `1px solid ${tokens.line}`,
            borderRadius: "14px",
            backgroundColor: tokens.surface,
            px: 3,
            pt: 2.75,
            pb: 3,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: fonts.data,
              fontWeight: 700,
              fontSize: ".82rem",
              letterSpacing: ".12em",
              color: tokens.green,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </Typography>
          <Typography variant="h3" sx={{ fontSize: "1.12rem", mt: 1 }}>
            {h.title}
          </Typography>
          <Typography sx={{ mt: 1.25, color: tokens.muted, fontSize: ".94rem", lineHeight: 1.9 }}>
            {h.body}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* レッスンはあくまで補足。見出しを立てず、控えめな一文とリンクだけにする */}
    <Box
      sx={{
        mt: 3.5,
        pl: 2.25,
        borderLeft: `3px solid ${tokens.line}`,
      }}
    >
      <Typography sx={{ color: tokens.muted, fontSize: ".92rem", lineHeight: 1.9 }}>
        会員の有志による軽いレッスンを開催している日もあります。詳細は以下をご覧ください。
      </Typography>
      <Box
        component={Link}
        to="/activity"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          mt: 1,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: ".9rem",
          color: tokens.green,
          textDecoration: "none",
          borderBottom: "2px solid transparent",
          pb: "2px",
          transition: "border-color .18s ease",
          "&:hover": { borderBottomColor: tokens.green },
        }}
      >
        レッスンの詳細
        <ArrowForwardIcon sx={{ fontSize: 15 }} />
      </Box>
    </Box>
  </Section>
);

export default Doubles;
