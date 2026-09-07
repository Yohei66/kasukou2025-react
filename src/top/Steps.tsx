import { Box, Grid, Typography } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, tokens } from "./tokens";
import { steps } from "../dataset/topContent";

const Steps = () => (
  <Section>
    <SectionHead
      eyebrow="入会までの流れ"
      heading="まずは、見学だけでも。"
      description="いきなり入会を決める必要はありません。一度コートに来て、雰囲気を見てから決めていただけます。"
    />
    <Grid container spacing={2.5} sx={{ mt: 3.5 }}>
      {steps.map((s) => (
        <Grid key={s.no} size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              height: "100%",
              px: 3.25,
              py: 3.75,
              backgroundColor: tokens.surface,
              border: `1px solid ${tokens.line}`,
              borderRadius: "14px",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: fonts.data,
                fontWeight: 700,
                fontSize: ".85rem",
                letterSpacing: ".14em",
                color: tokens.green,
                display: "block",
              }}
            >
              {s.no}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1.5, fontSize: "1.12rem" }}>
              {s.title}
            </Typography>
            <Typography
              sx={{ mt: 1.25, color: tokens.muted, fontSize: ".93rem", lineHeight: 1.9 }}
            >
              {s.body}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Section>
);

export default Steps;
