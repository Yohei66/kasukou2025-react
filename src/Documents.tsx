import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import {
  documentUrl,
  fetchDocuments,
  type ClubDocument,
} from "./dataset/content";

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

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!documents) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ width: "900px", maxWidth: "100%" }}>
      {documents.map((pdf) => (
        <Accordion key={pdf.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${pdf.id}-content`}
            id={`panel${pdf.id}-header`}
          >
            <Typography variant="subtitle1">{pdf.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* 簡易プレビュー：embed タグを使う例 */}
            <embed
              src={documentUrl(pdf)}
              type="application/pdf"
              width="100%"
              height="500px"
            />
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              href={documentUrl(pdf)}
              download={pdf.originalName}
            >
              ダウンロード
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
      {documents.length === 0 && (
        <Typography sx={{ color: "text.secondary" }}>
          ドキュメントはまだ登録されていません。
        </Typography>
      )}
    </Container>
  );
};

export default Documents;
