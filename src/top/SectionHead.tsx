import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { fonts, tokens } from "./tokens";

type Props = {
  eyebrow: string;
  heading: ReactNode;
  description?: string;
};

/** 各セクション共通の見出し（ラベル＋大見出し＋説明文） */
const SectionHead = ({ eyebrow, heading, description }: Props) => (
  <Box sx={{ maxWidth: "44em" }}>
    <Typography
      component="span"
      sx={{
        fontFamily: fonts.data,
        fontWeight: 600,
        fontSize: ".82rem",
        letterSpacing: ".16em",
        textTransform: "uppercase",
        color: tokens.green,
        display: "inline-block",
      }}
    >
      {eyebrow}
    </Typography>
    <Typography
      variant="h2"
      sx={{
        fontSize: "clamp(1.55rem,3.6vw,2.25rem)",
        mt: 1.5,
        letterSpacing: ".01em",
        lineHeight: 1.3,
        textWrap: "balance",
      }}
    >
      {heading}
    </Typography>
    {description && (
      <Typography sx={{ mt: 2, color: tokens.muted }}>{description}</Typography>
    )}
  </Box>
);

export default SectionHead;
