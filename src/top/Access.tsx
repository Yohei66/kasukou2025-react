import { Box, Grid, Typography } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, getCourtColor, tokens } from "./tokens";
import { courts } from "../dataset/topContent";

const Access = () => (
  <Section band>
    <SectionHead eyebrow="アクセス" heading="活動しているコート" />
    <Grid container spacing={2.5} sx={{ mt: 3.5 }}>
      {courts.map((c) => (
        <Grid key={c.name} size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: "100%",
              border: `1px solid ${tokens.line}`,
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: tokens.paper,
            }}
          >
            {c.mapUrl ? (
              <Box
                component="iframe"
                src={c.mapUrl}
                title={`${c.name}の地図`}
                loading="lazy"
                sx={{ width: "100%", height: 168, border: 0, display: "block" }}
              />
            ) : (
              <Box
                sx={{
                  height: 168,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.data,
                  letterSpacing: ".1em",
                  color: tokens.muted,
                  fontSize: ".82rem",
                  backgroundColor: tokens.greenPale,
                  backgroundImage: `repeating-linear-gradient(90deg,transparent 0 39px,${tokens.line} 39px 40px),repeating-linear-gradient(0deg,transparent 0 39px,${tokens.line} 39px 40px)`,
                }}
              >
                MAP（Googleマップ埋め込み）
              </Box>
            )}
            <Box sx={{ px: 3, pt: 2.75, pb: 3 }}>
              {/* レッスン表のコート名チップと同じ色。緑＝立沼／青＝大沼 */}
              <Typography
                variant="h3"
                sx={{ fontSize: "1.1rem", color: getCourtColor(c.name).main }}
              >
                {c.name}
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  mt: 1.75,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 18px",
                  fontSize: ".9rem",
                  lineHeight: 1.7,
                }}
              >
                <Box
                  component="dt"
                  sx={{
                    color: tokens.muted,
                    fontFamily: fonts.data,
                    letterSpacing: ".06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  主な活動
                </Box>
                <Box component="dd" sx={{ m: 0 }}>
                  {c.activities}
                </Box>
                <Box
                  component="dt"
                  sx={{
                    color: tokens.muted,
                    fontFamily: fonts.data,
                    letterSpacing: ".06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  利用時間
                </Box>
                <Box component="dd" sx={{ m: 0 }}>
                  <Box
                    component="span"
                    sx={{
                      fontFamily: fonts.data,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {c.hours}
                  </Box>
                  （曜日により異なります）
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Section>
);

export default Access;
