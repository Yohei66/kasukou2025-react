import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import CancelDialog from "./CancelDialog";
import {
  cancelKey,
  COURT_TYPES,
  courtTypeLabel,
  fetchCancellations,
  fetchCourtRows,
  getCurrentMonth,
  getTodayLabel,
  isUsableSlot,
  TIME_SLOTS,
  type CancelTarget,
  type Cancellation,
  type CourtType,
  type RowData,
  type TimeSlot,
} from "./courtCancel";

/** 本日分の1行（どのコート場の行かを保持する） */
type TodayRow = { courtType: CourtType; row: RowData };

const TodayCourts = () => {
  const theme = useTheme();
  const month = getCurrentMonth();
  const todayLabel = getTodayLabel();

  const [todayRows, setTodayRows] = useState<TodayRow[]>([]);
  const [cancellations, setCancellations] = useState<
    Record<string, Cancellation>
  >({});
  const [target, setTarget] = useState<CancelTarget | null>(null);

  // 両コート場のCSVから本日の行だけを取り出す
  useEffect(() => {
    let ignore = false;
    Promise.all(
      COURT_TYPES.map((ct) =>
        fetchCourtRows(ct.value, month).then((rows) =>
          rows
            .filter((row) => row["日付"] === todayLabel)
            .map((row) => ({ courtType: ct.value, row }))
        )
      )
    ).then((results) => {
      if (!ignore) setTodayRows(results.flat());
    });
    return () => {
      ignore = true;
    };
  }, [month, todayLabel]);

  const loadCancellations = useCallback(() => {
    fetchCancellations({ month, dateLabel: todayLabel }).then(setCancellations);
  }, [month, todayLabel]);

  useEffect(() => {
    loadCancellations();
  }, [loadCancellations]);

  const openDialog = (entry: TodayRow, slot: TimeSlot) => {
    setTarget({
      courtType: entry.courtType,
      month,
      dateLabel: entry.row["日付"],
      dayOfWeek: entry.row["曜日"],
      court: entry.row["コート"],
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

  const dayOfWeek = todayRows[0]?.row["曜日"] ?? "";

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          本日（{todayLabel}
          {dayOfWeek && `　${dayOfWeek}`}）のコート
        </Typography>

        {todayRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            本日の予約はありません。
            <Link
              to="/court"
              style={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                marginLeft: 4,
              }}
            >
              コート予約表を見る
            </Link>
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              雨天・熱中症アラート等で中止する場合は、該当する時間帯のマスを押してください。
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      "& > th": {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <TableCell>コート</TableCell>
                    {TIME_SLOTS.map((slot) => (
                      <TableCell key={slot}>{slot}</TableCell>
                    ))}
                    <TableCell>備考</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayRows.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {courtTypeLabel(entry.courtType)} {entry.row["コート"]}
                      </TableCell>
                      {TIME_SLOTS.map((slot) => {
                        const cancelled =
                          cancellations[
                            cancelKey(
                              entry.courtType,
                              entry.row["日付"],
                              entry.row["コート"],
                              slot
                            )
                          ];

                        // 大会等でクラブが使えない枠はキャンセル対象外
                        if (!isUsableSlot(entry.row[slot])) {
                          return (
                            <TableCell
                              key={slot}
                              sx={{ color: "text.disabled" }}
                            >
                              {entry.row[slot]}
                            </TableCell>
                          );
                        }

                        if (cancelled) {
                          return (
                            <TableCell
                              key={slot}
                              onClick={() => openDialog(entry, slot)}
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
                            onClick={() => openDialog(entry, slot)}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: theme.palette.action.selected,
                              },
                            }}
                          >
                            <Tooltip title="押すとこの枠をキャンセルできます">
                              <span>{entry.row[slot]}</span>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                      <TableCell>{entry.row["備考"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>

      <CancelDialog
        target={target}
        cancelled={targetCancellation}
        onClose={() => setTarget(null)}
        onDone={loadCancellations}
      />
    </Card>
  );
};

export default TodayCourts;
