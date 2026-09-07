import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Link,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchLinks, type ClubLink } from "./dataset/content";

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
      <Typography variant="h6">リンク</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!links && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      <Container sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {links?.map((link) => (
          <Link key={link.id} href={link.url} target="_blank" rel="noopener">
            {link.title}
          </Link>
        ))}
        {links?.length === 0 && (
          <Typography sx={{ color: "text.secondary" }}>
            リンクはまだ登録されていません。
          </Typography>
        )}
      </Container>
    </>
  );
};

export default Links;
