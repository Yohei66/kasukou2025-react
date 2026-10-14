import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useEffect, useState } from "react";
import SectionHead from "./top/SectionHead";
import { fonts, shape, tokens } from "./top/tokens";
import { fetchLinks, type ClubLink } from "./dataset/content";

/** URL からドメインだけを取り出す。不正な URL はそのまま返す */
const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/**
 * リンク1件のカード。
 * 旧ページは素の <a> の縦並びで、押す先が外部サイトであることも
 * 何のサイトかも分からなかったため、トップのカードと同じ枠に収めたうえで
 * ドメインと外部リンクアイコンを添えている。
 */
const LinkCard = ({ link }: { link: ClubLink }) => (
  <Box
    component="a"
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      px: 3,
      py: 2.5,
      border: `1px solid ${tokens.line}`,
      borderRadius: shape.card,
      backgroundColor: tokens.surface,
      textDecoration: "none",
      color: tokens.ink,
      transition: "border-color .15s ease, box-shadow .15s ease",
      "&:hover": {
        borderColor: tokens.green,
        boxShadow: shape.shadow,
      },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        sx={{
          display: "block",
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: "1.2rem",
          lineHeight: 1.5,
        }}
      >
        {link.title}
      </Typography>
      <Typography
        component="span"
        sx={{
          display: "block",
          mt: 0.25,
          fontFamily: fonts.data,
          fontSize: ".95rem",
          letterSpacing: ".02em",
          color: tokens.muted,
          overflowWrap: "anywhere",
        }}
      >
        {hostOf(link.url)}
      </Typography>
    </Box>
    <OpenInNewIcon
      sx={{ ml: "auto", flex: "none", fontSize: 18, color: tokens.muted }}
    />
  </Box>
);

const Links = () => {
  const [links, setLinks] = useState<ClubLink[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchLinks()
      .then((rows) => alive && setLinks(rows))
      .catch(() => alive && setError("リンクを読み込めませんでした。"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <SectionHead
        eyebrow="リンク"
        heading="関連するサイト"
        description="クラブの活動に関わる団体や、コート・大会情報のサイトです。いずれも別のタブで開きます。"
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!links && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {links && links.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </Box>
      )}

      {links?.length === 0 && (
        <Typography sx={{ color: tokens.muted }}>
          リンクはまだ登録されていません。
        </Typography>
      )}
    </>
  );
};

export default Links;
