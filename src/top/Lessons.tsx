import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import Section from "./Section";
import SectionHead from "./SectionHead";
import { fonts, getCourtColor, tokens } from "./tokens";
import { lessons } from "../dataset/topContent";

const headCells = ["クラス", "対象・内容", "曜日・時間", "コート"];

const Lessons = () => (
  <Section id="lessons">
    <SectionHead
      eyebrow="レッスン"
      heading="レベルと曜日別で7つのクラスがあります"
      description="レッスン料は無料です。自分のレベルや参加できる曜日・時間に合わせて、好きなコースに参加できます。"
    />

    <Box
      sx={{
        mt: 3.5,
        overflowX: "auto",
        border: `1px solid ${tokens.line}`,
        borderRadius: "14px",
        backgroundColor: tokens.surface,
      }}
    >
      <Table sx={{ minWidth: 660 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: tokens.green }}>
            {headCells.map((c) => (
              <TableCell
                key={c}
                sx={{
                  color: "#fff",
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: ".88rem",
                  letterSpacing: ".04em",
                  whiteSpace: "nowrap",
                  borderBottom: "none",
                }}
              >
                {c}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {lessons.map((l) => (
            <TableRow key={`${l.name}-${l.day}-${l.time}`}>
              <TableCell
                sx={{
                  color: tokens.ink,
                  fontWeight: 700,
                  fontFamily: fonts.display,
                  whiteSpace: "nowrap",
                  verticalAlign: "top",
                  borderColor: tokens.line,
                }}
              >
                {l.name}
              </TableCell>
              <TableCell
                sx={{
                  color: tokens.muted,
                  verticalAlign: "top",
                  lineHeight: 1.7,
                  borderColor: tokens.line,
                }}
              >
                {l.target}／{l.summary}
              </TableCell>
              <TableCell sx={{ verticalAlign: "top", borderColor: tokens.line }}>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    fontFamily: fonts.data,
                    fontWeight: 600,
                    fontSize: ".82rem",
                    letterSpacing: ".06em",
                    px: 1.5,
                    py: "2px",
                    borderRadius: 999,
                    backgroundColor: tokens.greenPale,
                    color: tokens.greenDeep,
                    border: `1px solid ${tokens.line}`,
                  }}
                >
                  {l.day}
                </Box>
                <Box
                  sx={{
                    fontFamily: fonts.data,
                    fontVariantNumeric: "tabular-nums",
                    color: tokens.ink,
                    fontWeight: 600,
                    fontSize: "1rem",
                    mt: 0.5,
                  }}
                >
                  {l.time}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  verticalAlign: "top",
                  whiteSpace: "nowrap",
                  borderColor: tokens.line,
                }}
              >
                {/* 立沼／大沼は字面が似ているため、色で見分けられるようにしている */}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    fontSize: ".88rem",
                    px: 1.5,
                    py: "3px",
                    borderRadius: "6px",
                    backgroundColor: getCourtColor(l.court).pale,
                    color: getCourtColor(l.court).main,
                    border: `1px solid ${getCourtColor(l.court).main}33`,
                  }}
                >
                  {l.court}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>

    <Typography sx={{ mt: 2.75, color: tokens.muted, fontSize: ".92rem" }}>
      このほか、会員同士のダブルスゲームを週6日おこなっています。レッスンを受けている方も自由に参加できます。{" "}
      <Box
        component={Link}
        to="/activity"
        sx={{
          color: tokens.green,
          fontWeight: 700,
          textDecoration: "none",
          whiteSpace: "nowrap",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        活動内容を詳しく見る →
      </Box>
    </Typography>
  </Section>
);

export default Lessons;
