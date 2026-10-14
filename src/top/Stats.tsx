import { Box, Typography } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, tokens } from "./tokens";
import { stats } from "../dataset/topContent";

const Stats = () => (
  <Section>
    <SectionHead eyebrow="数字で見る" heading="どんな人が、どれくらい集まっているか" />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" },
        gap: "1px",
        mt: 3.5,
        backgroundColor: tokens.line,
        border: `1px solid ${tokens.line}`,
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {stats.map((s) => (
        <Box key={s.label} sx={{ backgroundColor: tokens.surface, px: 2.75, pt: 3.25, pb: 3 }}>
          <Typography
            component="div"
            sx={{
              fontFamily: fonts.data,
              fontWeight: 700,
              fontSize: "2.55rem",
              lineHeight: 1.05,
              color: tokens.green,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {s.value}
            {s.unit && (
              <Box
                component="small"
                sx={{ fontSize: "1.05rem", fontWeight: 600, ml: "2px" }}
              >
                {s.unit}
              </Box>
            )}
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              fontSize: ".86rem",
              color: tokens.muted,
              letterSpacing: ".02em",
              lineHeight: 1.6,
            }}
          >
            {s.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Section>
);

export default Stats;
