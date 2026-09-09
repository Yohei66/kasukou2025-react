import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useEffect, useState } from "react";
import SectionHead from "./top/SectionHead";
import { fonts, shape, tokens } from "./top/tokens";
import {
  documentUrl,
  fetchDocuments,
  type ClubDocument,
} from "./dataset/content";

/** カード内の操作ボタン。緑ピル（主）と枠線（副）の2種類だけ */
const actionSx = (primary: boolean) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  minHeight: 48,
  px: 2.5,
  py: 1,
  borderRadius: 999,
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: "1.05rem",
  textDecoration: "none",
  cursor: "pointer",
  border: `1px solid ${primary ? tokens.green : tokens.line}`,
  backgroundColor: primary ? tokens.green : "transparent",
  color: primary ? "#fff" : tokens.ink,
  transition: "background-color .15s ease, border-color .15s ease",
  "&:hover": {
    backgroundColor: primary ? tokens.greenDeep : tokens.greenPale,
    borderColor: primary ? tokens.greenDeep : tokens.green,
  },
});

/**
 * ドキュメント1件のカード。
 *
 * 旧ページは Accordion に <embed> を直に置いていたが、
 * ・開かなくても全件のPDFが読み込まれる
 * ・iOS Safari は embed/object の PDF を描画しない
 * の2点があったため、プレビューは開いたときだけマウントし、
 * 狭い画面ではブラウザ標準のビューア（別タブ）に委ねている。
 */
const DocumentCard = ({ doc }: { doc: ClubDocument }) => {
  const [open, setOpen] = useState(false);
  const url = documentUrl(doc);

  return (
    <Box
      sx={{
        border: `1px solid ${tokens.line}`,
        borderRadius: shape.card,
        backgroundColor: tokens.surface,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          px: 3,
          py: 2.75,
          flexWrap: "wrap",
        }}
      >
        <PictureAsPdfOutlinedIcon
          sx={{ fontSize: 28, color: tokens.green, flex: "none", mt: 0.25 }}
        />
        <Box sx={{ minWidth: 0, flex: "1 1 16em" }}>
          <Typography variant="h3" sx={{ fontSize: "1.2rem", lineHeight: 1.5 }}>
            {doc.title}
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              fontFamily: fonts.data,
              fontSize: ".95rem",
              letterSpacing: ".02em",
              color: tokens.muted,
              overflowWrap: "anywhere",
            }}
          >
            PDF ／ {doc.originalName}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            ml: { xs: 0, sm: "auto" },
          }}
        >
          {/* 広い画面はその場でプレビュー */}
          <Box
            component="button"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            sx={{
              ...actionSx(false),
              display: { xs: "none", md: "inline-flex" },
              lineHeight: 1,
            }}
          >
            プレビュー
            <ExpandMoreIcon
              sx={{
                fontSize: 18,
                transition: "transform .2s ease",
                transform: open ? "rotate(180deg)" : "none",
              }}
            />
          </Box>

          {/* 狭い画面はブラウザ標準の PDF ビューアに任せる */}
          <Box
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ...actionSx(false),
              display: { xs: "inline-flex", md: "none" },
            }}
          >
            開く
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Box>

          <Box
            component="a"
            href={url}
            download={doc.originalName}
            sx={actionSx(true)}
          >
            <DownloadIcon sx={{ fontSize: 18 }} />
            ダウンロード
          </Box>
        </Box>
      </Box>

      {/* 開いたときだけ読み込む */}
      {open && (
        <Box
          component="iframe"
          src={url}
          title={`${doc.title}のプレビュー`}
          sx={{
            display: { xs: "none", md: "block" },
            width: "100%",
            height: 560,
            border: 0,
            borderTop: `1px solid ${tokens.line}`,
            backgroundColor: tokens.paper,
          }}
        />
      )}
    </Box>
  );
};

const Documents = () => {
  const [documents, setDocuments] = useState<ClubDocument[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchDocuments()
      .then((rows) => alive && setDocuments(rows))
      .catch(() => alive && setError("ドキュメントを読み込めませんでした。"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <SectionHead
        eyebrow="ドキュメント"
        heading="会則・各種届出"
        description="クラブの会則や入会・退会の届出用紙です。印刷してご記入のうえ、役員までお渡しください。"
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!documents && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {documents && documents.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </Box>
      )}

      {documents?.length === 0 && (
        <Typography sx={{ color: tokens.muted }}>
          ドキュメントはまだ登録されていません。
        </Typography>
      )}
    </>
  );
};

export default Documents;
