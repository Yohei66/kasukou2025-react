import { Box, Button, Container, Typography } from "@mui/material";
import { Fragment } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import CourtLines from "./CourtLines";
import { fonts, layout, tokens } from "./tokens";
import { hero, weekSchedule } from "../dataset/topContent";
import type { ActivityKind } from "../dataset/topContent";

const kindLabel: Record<ActivityKind, string> = {
  doubles: "ダブルス",
  lesson: "レッスン",
};

const kindColor: Record<ActivityKind, string> = {
  doubles: tokens.ball,
  lesson: tokens.lessonDot,
};

const Dot = ({ kind }: { kind: ActivityKind }) => (
  <Box
    component="i"
    sx={{
      width: 8,
      height: 8,
      borderRadius: "2px",
      flex: "none",
      display: "inline-block",
      backgroundColor: kindColor[kind],
    }}
  />
);

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
          }}
        />
        {/* 写真の上でも見出しが読めるように、左を濃くした深緑のスクリム */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg,rgba(6,48,31,.94) 0%,rgba(6,48,31,.82) 38%,rgba(8,60,40,.45) 100%)",
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

    <Box sx={{ position: "relative", pt: { xs: 7, md: 9.5 } }}>
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

      {/* ふだんの一週間 */}
      <Box
        sx={{
          position: "relative",
          mt: 7.25,
          borderTop: "1px solid rgba(191,232,210,.28)",
          // 写真の上では濃いめに敷いて時刻の可読性を保つ
          backgroundColor: hero.photo ? "rgba(3,26,17,.78)" : "rgba(3,26,17,.42)",
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
              ダブルスゲームが週6日。レッスンはそのうち4日開催しています
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                ml: { xs: 0, md: "auto" },
                fontFamily: fonts.data,
                fontSize: ".8rem",
                letterSpacing: ".06em",
                color: tokens.onCourtLabel,
              }}
            >
              {(["doubles", "lesson"] as ActivityKind[]).map((kind) => (
                <Box
                  key={kind}
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
                >
                  <Dot kind={kind} />
                  {kindLabel[kind]}
                </Box>
              ))}
            </Box>
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

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "column" },
                    flexWrap: "wrap",
                    alignItems: { xs: "baseline", md: "stretch" },
                    gap: { xs: "4px 18px", md: 1.125 },
                    flex: { xs: 1, md: "none" },
                  }}
                >
                  {d.rest ? (
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: fonts.data,
                        fontSize: ".8rem",
                        letterSpacing: ".06em",
                        color: "#5E7C6C",
                        textAlign: { xs: "left", md: "center" },
                        width: "100%",
                      }}
                    >
                      休み
                    </Typography>
                  ) : (
                    d.activities.map((a) => (
                      <Box
                        key={a.kind}
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "row", md: "column" },
                          alignItems: { xs: "baseline", md: "stretch" },
                          gap: { xs: 1, md: 0.25 },
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.625,
                            fontFamily: fonts.data,
                            fontWeight: 600,
                            fontSize: ".8rem",
                            letterSpacing: ".04em",
                            color: "#DCEBE2",
                          }}
                        >
                          <Dot kind={a.kind} />
                          {kindLabel[a.kind]}
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            fontFamily: fonts.data,
                            fontSize: ".76rem",
                            color: tokens.onCourtDim,
                            fontVariantNumeric: "tabular-nums",
                            pl: { xs: 0, md: "13px" },
                          }}
                        >
                          {a.time}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
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
    </Box>
  </Box>
);

export default Hero;
