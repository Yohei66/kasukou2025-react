import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { layout, tokens } from "./tokens";

type Props = {
  children: ReactNode;
  /** true で白地＋上下罫線の帯にする（交互に敷いて区切りをつくる） */
  band?: boolean;
  id?: string;
};

const Section = ({ children, band, id }: Props) => (
  <Box
    component="section"
    id={id}
    sx={{
      py: layout.sectionPy,
      backgroundColor: band ? tokens.surface : tokens.paper,
      ...(band && {
        borderTop: `1px solid ${tokens.line}`,
        borderBottom: `1px solid ${tokens.line}`,
      }),
    }}
  >
    <Container sx={{ maxWidth: `${layout.maxWidth}px !important`, px: 3 }}>
      {children}
    </Container>
  </Box>
);

export default Section;
