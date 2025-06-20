import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  IconButton,
  Button,
  ButtonGroup,
  useTheme,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Papa from "papaparse";
import { useEffect, useState } from "react";

type RowData = {
  日付: string;
  曜日: string;
  コート: string;
  "9-11": string;
  "11-13": string;
  "13-15": string;
  "15-17": string;
  備考: string;
};

function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return `${y}${String(m).padStart(2, "0")}`;
}

function getPrevMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1];
  return `${prev[0]}${String(prev[1]).padStart(2, "0")}`;
}

function getNextMonth(yyyymm: string) {
  const y = Number(yyyymm.slice(0, 4));
  const m = Number(yyyymm.slice(4, 6));
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${next[0]}${String(next[1]).padStart(2, "0")}`;
}

const COURT_TYPES = [
  { label: "大沼", value: "Onuma" },
  { label: "立沼", value: "Tatenuma" },
];

const Court = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [rows, setRows] = useState<RowData[]>([]);
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [courtType, setCourtType] = useState<"Onuma" | "Tatenuma">("Onuma");

  useEffect(() => {
    fetch(`/courts/${courtType}/${month}.csv`)
      .then((response) => {
        if (!response.ok) throw new Error("CSVが見つかりません");
        return response.text();
      })
      .then((csvText) => {
        Papa.parse<RowData>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }) => {
            setRows(data);
            const counts: Record<string, number> = {};
            data.forEach((r) => {
              counts[r["日付"]] = (counts[r["日付"]] || 0) + 1;
            });
            setRowCounts(counts);
          },
        });
      })
      .catch(() => {
        setRows([]);
        setRowCounts({});
      });
  }, [month, courtType]);

  const theme = useTheme();
  return (
    <>
      <Container
        sx={{
          position: "sticky",
          top: 58,
          zIndex: 100,
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container
          sx={{
            minHeight: "100%",
            display: "flex",
            justifyContent: "center",
            position: "sticky",

            backgroundColor: theme.palette.background.default,
          }}
        >
          <ButtonGroup variant="contained">
            {COURT_TYPES.map((ct) => (
              <Button
                key={ct.value}
                color={courtType === ct.value ? "primary" : "inherit"}
                onClick={() => setCourtType(ct.value as "Onuma" | "Tatenuma")}
              >
                {ct.label}
              </Button>
            ))}
          </ButtonGroup>
        </Container>
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            position: "sticky",
            top: 120, // ボタンの高さ分ずらす（必要に応じて調整）
            backgroundColor: theme.palette.background.default,
          }}
        >
          <IconButton onClick={() => setMonth(getPrevMonth(month))}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {month.slice(0, 4)}年{month.slice(4, 6)}月 コート利用状況
          </Typography>
          <IconButton onClick={() => setMonth(getNextMonth(month))}>
            <ArrowForwardIcon />
          </IconButton>
        </Container>
      </Container>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& > th, & > td": {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                },
              }}
            >
              <TableCell>日付</TableCell>
              <TableCell>曜日</TableCell>
              <TableCell>コート</TableCell>
              <TableCell>9-11</TableCell>
              <TableCell>11-13</TableCell>
              <TableCell>13-15</TableCell>
              <TableCell>15-17</TableCell>
              <TableCell>備考</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: theme.palette.background.default }}>
            {(() => {
              const renderIndex: Record<string, number> = {};
              return rows.map((row, idx) => {
                const date = row["日付"];
                const isFirstOfDate = (renderIndex[date] || 0) === 0;
                renderIndex[date] = (renderIndex[date] || 0) + 1;
                // 曜日色分岐
                let dayColor = undefined;
                if (row["曜日"] === "日") dayColor = "red";
                else if (row["曜日"] === "土") dayColor = "blue";
                return (
                  <TableRow key={idx}>
                    {isFirstOfDate && (
                      <TableCell rowSpan={rowCounts[date]}>
                        {row["日付"]}
                      </TableCell>
                    )}
                    <TableCell
                      sx={
                        dayColor ? { color: dayColor, fontWeight: "bold" } : {}
                      }
                    >
                      {row["曜日"]}
                    </TableCell>
                    <TableCell>{row["コート"]}</TableCell>
                    <TableCell>{row["9-11"]}</TableCell>
                    <TableCell>{row["11-13"]}</TableCell>
                    <TableCell>{row["13-15"]}</TableCell>
                    <TableCell>{row["15-17"]}</TableCell>
                    {isFirstOfDate && (
                      <TableCell rowSpan={rowCounts[date]}>
                        {row["備考"]}
                      </TableCell>
                    )}
                  </TableRow>
                );
              });
            })()}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Court;
