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
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCallback, useEffect, useState } from "react";
import CancelDialog from "./CancelDialog";
import {
  cancelKey,
  COURT_TYPES,
  fetchCancellations,
  fetchCourtRows,
  getCurrentMonth,
  getNextMonth,
  getPrevMonth,
  isUsableSlot,
  TIME_SLOTS,
  type CancelTarget,
  type Cancellation,
  type CourtType,
  type RowData,
  type TimeSlot,
} from "./courtCancel";

const Court = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [rows, setRows] = useState<RowData[]>([]);
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [courtType, setCourtType] = useState<CourtType>("Onuma");
  // キャンセル情報（key: cancelKey()）
  const [cancellations, setCancellations] = useState<
    Record<string, Cancellation>
  >({});
  // キャンセル／取り消しダイアログの対象枠
  const [target, setTarget] = useState<CancelTarget | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchCourtRows(courtType, month).then((data) => {
      if (ignore) return;
      setRows(data);
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        counts[r["日付"]] = (counts[r["日付"]] || 0) + 1;
      });
      setRowCounts(counts);
    });
    return () => {
      ignore = true;
    };
  }, [month, courtType]);

  const loadCancellations = useCallback(() => {
    fetchCancellations({ courtType, month }).then(setCancellations);
  }, [courtType, month]);

  useEffect(() => {
    loadCancellations();
  }, [loadCancellations]);

  const openDialog = (row: RowData, slot: TimeSlot) => {
    setTarget({
      courtType,
      month,
      dateLabel: row["日付"],
      dayOfWeek: row["曜日"],
      court: row["コート"],
      timeSlot: slot,
    });
  };

  const targetCancellation = target
    ? cancellations[
        cancelKey(
          target.courtType,
          target.dateLabel,
          target.court,
          target.timeSlot
        )
      ]
    : undefined;

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
                onClick={() => setCourtType(ct.value)}
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

      <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
        雨天・熱中症アラート等で中止する場合は、該当する時間帯のマスを押してください。
      </Typography>

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
              {TIME_SLOTS.map((slot) => (
                <TableCell key={slot}>{slot}</TableCell>
              ))}
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
                    {TIME_SLOTS.map((slot) => {
                      const cancelled =
                        cancellations[
                          cancelKey(courtType, date, row["コート"], slot)
                        ];
                      const usable = isUsableSlot(row[slot]);

                      // 大会等でクラブが使えない枠はキャンセル対象外
                      if (!usable) {
                        return (
                          <TableCell key={slot} sx={{ color: "text.disabled" }}>
                            {row[slot]}
                          </TableCell>
                        );
                      }

                      if (cancelled) {
                        return (
                          <TableCell
                            key={slot}
                            onClick={() => openDialog(row, slot)}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: theme.palette.action.selected,
                            }}
                          >
                            <Tooltip
                              title={`理由: ${cancelled.reason || "（未記入）"} / キャンセル者: ${cancelled.canceller} / ${cancelled.cancelled_at}　押すと取り消せます`}
                            >
                              <Chip label="中止" color="error" size="small" />
                            </Tooltip>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={slot}
                          onClick={() => openDialog(row, slot)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: theme.palette.action.selected,
                            },
                          }}
                        >
                          <Tooltip title="押すとこの枠をキャンセルできます">
                            <span>{row[slot]}</span>
                          </Tooltip>
                        </TableCell>
                      );
                    })}
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

      <CancelDialog
        target={target}
        cancelled={targetCancellation}
        onClose={() => setTarget(null)}
        onDone={loadCancellations}
      />
    </>
  );
};

export default Court;
