import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Kiyaku from "./pdfs/kiyaku20240601.pdf"; // クラブ規約のPDFファイルをインポート
import Nyuukai from "./pdfs/nyuukaitodoke202503.pdf"; // 入部届けのPDFファイルをインポート
import Seiyaku from "./pdfs/seiyakusho2021.pdf"; // ジュニア誓約書のPDFファイルをインポート
import Kyuubu from "./pdfs/kyuubutodoke202503.pdf"; // 休退復部届けのPDFファイルをインポート
import Manner from "./pdfs/tennis_manner.pdf"; // クラブ細部マナー事項のPDFファイルをインポート
const pdfList = [
  { id: 1, title: "クラブ規約", url: Kiyaku },
  { id: 2, title: "入部届け", url: Nyuukai },
  { id: 3, title: "ジュニア誓約書", url: Seiyaku },
  { id: 4, title: "休退復部届け", url: Kyuubu },
  {
    id: 5,
    title: "クラブ運営のアンケート結果",
    url: "src/pdfs/2015_questionnaire.pdf",
  },
  { id: 6, title: "クラブ細部マナー事項", url: Manner },
];
const Documents = () => {
  return (
    <Container sx={{ width: "900px" }}>
      {pdfList.map((pdf) => (
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
              src={pdf.url}
              type="application/pdf"
              width="100%"
              height="500px"
            />
            <Button variant="outlined" sx={{ mt: 2 }} href={pdf.url} download>
              ダウンロード
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
      {/* 選択ダウンロード機能 */}
      {/* 一括ダウンロード機能 */}
    </Container>
  );
};

export default Documents;
