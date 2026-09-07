import { Box, Button, Container, Typography } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Link } from "react-router-dom";
import CourtLines from "./CourtLines";
import { fonts, layout, tokens } from "./tokens";

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
        見学・体験のお申し込み、クラブへのご質問は、お問い合わせフォームからお気軽にどうぞ。
        数日以内に担当者からご返信します。
      </Typography>
      {/* 迷惑メール収集を避けるため、メールアドレスはページに出さずフォームへ誘導する */}
      <Button
        component={Link}
        to="/contact"
        startIcon={<MailOutlineIcon />}
        sx={{
          mt: 1,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: "1rem",
          px: 4,
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
    </Container>
  </Box>
);

export default ContactCta;
