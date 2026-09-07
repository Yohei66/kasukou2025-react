import { Box, Grid, Typography } from "@mui/material";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { tokens } from "./tokens";
import { points } from "../dataset/topContent";
import type { PointIcon } from "../dataset/topContent";

const icons: Record<PointIcon, typeof SportsTennisIcon> = {
  tennis: SportsTennisIcon,
  payment: PaymentsOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
};

const Points = () => (
  <Section band>
    <SectionHead
      eyebrow="はじめての方へ"
      heading={
        <>
          「うまくないと入れない」
          <br />
          クラブではありません。
        </>
      }
    />
    <Grid container spacing={2.5} sx={{ mt: 3.5 }}>
      {points.map((p) => {
        const Icon = icons[p.icon];
        return (
          <Grid key={p.title} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                height: "100%",
                backgroundColor: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: "14px",
                px: 3.25,
                pt: 3.75,
                pb: 4,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                boxShadow:
                  "0 1px 2px rgba(18,33,27,.05),0 8px 24px -12px rgba(18,33,27,.18)",
              }}
            >
              <Icon sx={{ fontSize: 36, color: tokens.green }} />
              <Typography variant="h3" sx={{ fontSize: "1.16rem" }}>
                {p.title}
              </Typography>
              <Typography
                sx={{ color: tokens.muted, fontSize: ".94rem", lineHeight: 1.9 }}
              >
                {p.body}
              </Typography>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  </Section>
);

export default Points;
