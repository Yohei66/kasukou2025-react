import { Box, Container, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import { fonts, layout, tokens } from "./tokens";
import { weekSchedule } from "../dataset/topContent";

/**
 * ヒーロー直下の「ふだんの一週間」の帯。
 *
 * もとは Hero の内側に置いていたが、スマホでは曜日が縦7段に積まれて
 * 帯だけで 500px 前後になり、inset:0 で敷いた背景写真がそのぶん縦に
 * 引き伸ばされて、横幅の中央2割ほどしか映らない状態になっていた。
 * 帯を写真の外に出すことで、ヒーローの縦横比を写真の比率に近づけている。
 *
 * ヒーローと地続きに見せたいので、深緑の帯という見た目はそのまま引き継ぐ。
 * 写真の上に半透明で乗せる必要がなくなったぶん、背景は不透明色にしている。
 */
const WeekStrip = () => (
  <Box
    component="section"
    sx={{
      backgroundColor: tokens.courtDeep,
      borderTop: "1px solid rgba(191,232,210,.28)",
    }}
  >
    <Container sx={{ maxWidth: `${layout.maxWidth}px !important`, px: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "8px 16px",
          pt: 2.25,
          pb: 1.75,
        }}
      >
        <Typography
          component="span"
          sx={{ fontFamily: fonts.display, fontWeight: 700, color: "#fff" }}
        >
          ふだんの一週間
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: ".85rem", color: tokens.onCourtLabel }}
        >
          ダブルスゲームが週6日。月曜以外は、どこかのコートで打てます
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(7,1fr)" },
          gap: { xs: 0.75, md: 1 },
          pb: 2.25,
        }}
      >
        {weekSchedule.map((d) => (
          <Box
            key={d.day}
            sx={{
              borderRadius: "10px",
              border: d.rest
                ? "1px dashed rgba(191,232,210,.14)"
                : "1px solid rgba(191,232,210,.18)",
              backgroundColor: d.rest ? "transparent" : "rgba(255,255,255,.07)",
              px: { xs: 1.75, md: 1.375 },
              py: { xs: 1.375, md: 1.5 },
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              alignItems: { xs: "center", md: "stretch" },
              gap: { xs: 1.75, md: 1.25 },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: "1.02rem",
                color: d.rest ? "#5E7C6C" : "#fff",
                textAlign: { xs: "left", md: "center" },
                width: { xs: "1.5em", md: "auto" },
                flex: "none",
              }}
            >
              {d.day}
            </Typography>

            {/* 訪問者の目につく帯なので、活動の種類は出さず時間だけを見せる */}
            <Typography
              component="span"
              sx={{
                fontFamily: fonts.data,
                fontWeight: d.rest ? 400 : 600,
                fontSize: ".86rem",
                letterSpacing: ".04em",
                color: d.rest ? "#5E7C6C" : "#DCEBE2",
                fontVariantNumeric: "tabular-nums",
                textAlign: { xs: "left", md: "center" },
                flex: { xs: 1, md: "none" },
              }}
            >
              {d.rest ? "休み" : d.time}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        component={Link}
        to="/activity"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.875,
          mb: 3.25,
          fontFamily: fonts.data,
          fontSize: ".85rem",
          letterSpacing: ".06em",
          color: tokens.onCourtLabel,
          textDecoration: "none",
          borderBottom: "1px solid rgba(157,195,175,.35)",
          pb: "3px",
          transition: "color .18s ease, border-color .18s ease",
          "&:hover": {
            color: tokens.ball,
            borderBottomColor: tokens.ball,
          },
        }}
      >
        コート別の活動時間を見る
        <ArrowForwardIcon sx={{ fontSize: 15 }} />
      </Box>
    </Container>
  </Box>
);

export default WeekStrip;
