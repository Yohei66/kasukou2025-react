import { Box, Container, Typography } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CourtLines from "./CourtLines";
import { fonts, layout, tokens } from "./tokens";
import { CONTACT_EMAIL } from "../dataset/topContent";

const ContactCta = () => (
  <Box
    component="section"
    id="contact"
    sx={{
      position: "relative",
      overflow: "hidden",
      backgroundColor: tokens.court,
      py: layout.sectionPy,
    }}
  >
    <CourtLines
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        width: "min(980px,150vw)",
        opacity: 0.12,
      }}
    />
    <Container
      sx={{
        maxWidth: `${layout.maxWidth}px !important`,
        px: 3,
        position: "relative",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2.25,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: fonts.data,
          fontWeight: 600,
          fontSize: ".82rem",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "#8FC9AA",
        }}
      >
        お問い合わせ
      </Typography>
      <Typography
        variant="h2"
        sx={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff" }}
      >
        コートで、お待ちしています。
      </Typography>
      <Typography sx={{ color: "#B9D3C5", maxWidth: "34em" }}>
        見学・体験のお申し込み、クラブへのご質問は、こちらのメールアドレスまでお気軽にどうぞ。
      </Typography>
      <Box
        component="a"
        href={`mailto:${CONTACT_EMAIL}`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1.5,
          mt: 0.75,
          fontFamily: fonts.data,
          fontSize: "clamp(1.1rem,3.2vw,1.55rem)",
          fontWeight: 600,
          letterSpacing: ".04em",
          color: tokens.ball,
          textDecoration: "none",
          borderBottom: "1.5px solid rgba(216,230,74,.45)",
          pb: "6px",
          wordBreak: "break-all",
          transition: "border-color .18s ease",
          "&:hover": { borderBottomColor: tokens.ball },
        }}
      >
        <MailOutlineIcon sx={{ fontSize: 22 }} />
        {CONTACT_EMAIL}
      </Box>
    </Container>
  </Box>
);

export default ContactCta;
