import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchEvents, formatEventDate, type ClubEvent } from "./dataset/content";

const Schedule = () => {
  const theme = useTheme();
  const [events, setEvents] = useState<ClubEvent[] | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((rows) => {
        if (!alive) return;
        setEvents(rows);
        // 今年の予定がなければ、いちばん新しい年を開く
        const years = [...new Set(rows.map((e) => e.date.slice(0, 4)))];
        const thisYear = String(new Date().getFullYear());
        setYear(years.includes(thisYear) ? thisYear : (years.at(-1) ?? ""));
      })
      .catch(() => alive && setError("行事予定表を読み込めませんでした。"));
    return () => {
      alive = false;
    };
  }, []);

  const years = useMemo(
    () => [...new Set((events ?? []).map((e) => e.date.slice(0, 4)))],
    [events]
  );
  const shown = useMemo(
    () => (events ?? []).filter((e) => e.date.startsWith(year)),
    [events, year]
  );

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!events) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h6">行事予定表</Typography>
        {years.length > 1 && (
          <TextField
            select
            size="small"
            label="年"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}年
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      <Table component={Paper}>
        <TableHead
          sx={{
            backgroundColor: theme.palette.primary.main,
            "& .MuiTableCell-head": {
              color: "white",
            },
          }}
        >
          <TableRow>
            <TableCell>日付</TableCell>
            <TableCell>曜日</TableCell>
            <TableCell width={200}>行事</TableCell>
            <TableCell>場所</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.map((event) => (
            <TableRow key={event.id}>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {formatEventDate(event.date)}
              </TableCell>
              <TableCell
                sx={{
                  color:
                    event.dow === "日"
                      ? "#c0392b"
                      : event.dow === "土"
                        ? "#1565c0"
                        : undefined,
                }}
              >
                {event.dow}
              </TableCell>
              <TableCell width={200}>{event.title}</TableCell>
              <TableCell>{event.place}</TableCell>
            </TableRow>
          ))}
          {shown.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} sx={{ color: "text.secondary" }}>
                予定はまだ登録されていません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default Schedule;
