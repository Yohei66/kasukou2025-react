import { Box, Button, Container, Typography } from "@mui/material";
import { Fragment } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import CourtLines from "./CourtLines";
import { fonts, layout, tokens } from "./tokens";
import { hero } from "../dataset/topContent";

const Hero = () => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      background: tokens.courtGradient,
      color: tokens.onCourtStrong,
    }}
  >
    {hero.photo ? (
      <>
        <Box
          component="img"
          src={hero.photo}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // スマホでは横幅の4割ほどしか映らない。中央を切り出すと空いたコートに
            // なってしまうので、人が大きく写っている右端に寄せる。
            // 横長に収まるデスクトップは中央のままでよい。
            objectPosition: { xs: "100% 50%", md: "center" },
          }}
        />
        {/* 写真の上でも見出しが読めるように、左を濃くした深緑のスクリム */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: {
              // 幅の狭いスマホでは、横グラデーションの「濃い側」だけで画面が
              // 埋まってしまい写真が沈む。縦方向に切り替えて、見出しの下から
              // 徐々に写真を出す。
              xs: "linear-gradient(180deg,rgba(6,48,31,.92) 0%,rgba(6,48,31,.84) 46%,rgba(8,60,40,.60) 100%)",
              md: "linear-gradient(100deg,rgba(6,48,31,.94) 0%,rgba(6,48,31,.82) 38%,rgba(8,60,40,.45) 100%)",
            },
          }}
        />
      </>
    ) : (
      <CourtLines
        sx={{
          position: "absolute",
          right: "-8%",
          top: "44%",
          transform: "translateY(-50%) rotate(-8deg)",
          width: "min(780px,78vw)",
          opacity: 0.2,
        }}
      />
    )}

    {/* 帯を WeekStrip に出したので、下の余白はヒーロー自身が持つ */}
    <Box
      sx={{ position: "relative", pt: { xs: 7, md: 9.5 }, pb: { xs: 7, md: 9.5 } }}
    >
      <Container
        sx={{
          maxWidth: `${layout.maxWidth}px !important`,
          px: 3,
          // 入場アニメーション。スクロール待ちにせず、マウント直後に再生する。
          // 直下の要素を少しずつ遅らせて、上から順に浮き上がって見せる。
          "@keyframes heroRise": {
            from: { opacity: 0, transform: "translateY(14px)" },
            to: { opacity: 1, transform: "none" },
          },
          "& > *": {
            opacity: 0,
            animation: "heroRise .6s ease forwards",
          },
          "& > *:nth-of-type(1)": { animationDelay: ".05s" },
          "& > *:nth-of-type(2)": { animationDelay: ".15s" },
          "& > *:nth-of-type(3)": { animationDelay: ".25s" },
          "& > *:nth-of-type(4)": { animationDelay: ".35s" },
          "@media (prefers-reduced-motion: reduce)": {
            "& > *": { opacity: 1, animation: "none" },
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: fonts.data,
            fontWeight: 600,
            fontSize: ".82rem",
            letterSpacing: ".16em",
            color: "#8FC9AA",
            display: "inline-block",
          }}
        >
          {hero.eyebrow}
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: "clamp(2.05rem,6.2vw,3.85rem)",
            lineHeight: 1.22,
            letterSpacing: ".01em",
            mt: 2.25,
            color: "#fff",
          }}
        >
          {hero.headingLines.map((line, i) => {
            // 末尾が「。」で終わる行だけ、句点をボールイエローで強調する
            const isLast = i === hero.headingLines.length - 1;
            const hasPeriod = isLast && line.endsWith("。");
            return (
              <Fragment key={line}>
                {i > 0 && <br />}
                {hasPeriod ? line.slice(0, -1) : line}
                {hasPeriod && (
                  <Box component="span" sx={{ color: tokens.ball }}>
                    。
                  </Box>
                )}
              </Fragment>
            );
          })}
        </Typography>

        <Typography
          sx={{
            mt: 2.75,
            maxWidth: "33em",
            color: tokens.onCourt,
            fontSize: "1.02rem",
            lineHeight: 2,
          }}
        >
          {hero.lead}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.75, mt: 4.25 }}>
          <Button
            component="a"
            href="#contact"
            endIcon={<ArrowForwardIcon />}
            sx={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: "1rem",
              px: 3.5,
              py: 1.75,
              borderRadius: 999,
              backgroundColor: tokens.ball,
              color: "#0A2A1C",
              transition: "transform .18s ease, background-color .18s ease",
              "&:hover": {
                backgroundColor: tokens.ballHover,
                color: "#0A2A1C",
                transform: "translateY(-2px)",
              },
            }}
          >
            見学・体験を申し込む
          </Button>
          <Button
            component={Link}
            to="/activity"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: "1rem",
              px: 3.5,
              py: 1.75,
              borderRadius: 999,
              border: "1.5px solid #4E7F67",
              color: "#DCEBE2",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,.08)",
                color: "#fff",
              },
            }}
          >
            活動内容を見る
          </Button>
        </Box>
      </Container>
    </Box>
  </Box>
);

export default Hero;
