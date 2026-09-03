import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {
  courtTypeLabel,
  postCancel,
  postUncancel,
  type CancelTarget,
  type Cancellation,
} from "./courtCancel";

type Props = {
  /** null のときダイアログは閉じている */
  target: CancelTarget | null;
  /** 既にキャンセル済みならその情報（渡されると「取り消し」モードになる） */
  cancelled?: Cancellation;
  onClose: () => void;
  /** 登録／取り消しが成功したときに呼ばれる（一覧の再読み込み用） */
  onDone: () => void;
};

const CancelDialog = ({ target, cancelled, onClose, onDone }: Props) => {
  const mode = cancelled ? "restore" : "cancel";
  const [password, setPassword] = useState("");
  const [canceller, setCanceller] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 対象が変わるたびに入力欄をリセットする
  useEffect(() => {
    setPassword("");
    setCanceller("");
    setReason("");
    setError("");
  }, [target]);

  const closeDialog = () => {
    if (submitting) return;
    onClose();
  };

  const submit = async () => {
    if (!target) return;
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }
    if (mode === "cancel" && !canceller) {
      setError("氏名を入力してください");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "cancel"
        ? await postCancel({ target, password, canceller, reason })
        : await postUncancel({ target, password });
    setSubmitting(false);

    if (result.success) {
      onDone();
      onClose();
    } else {
      setError(result.message ?? "処理に失敗しました");
    }
  };

  return (
    <Dialog open={target !== null} onClose={closeDialog} fullWidth maxWidth="xs">
      <DialogTitle>
        {mode === "cancel" ? "予約のキャンセル" : "キャンセルの取り消し"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        {target && (
          <Typography variant="body2" color="text.secondary">
            {courtTypeLabel(target.courtType)} / {target.dateLabel}
            {target.dayOfWeek && `（${target.dayOfWeek}）`} {target.court}コート{" "}
            {target.timeSlot}
          </Typography>
        )}
        {cancelled && (
          <Typography variant="body2" color="text.secondary">
            理由: {cancelled.reason || "（未記入）"} / キャンセル者:{" "}
            {cancelled.canceller} / {cancelled.cancelled_at}
          </Typography>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoFocus
        />
        {mode === "cancel" && (
          <>
            <TextField
              label="氏名"
              value={canceller}
              onChange={(e) => setCanceller(e.target.value)}
              fullWidth
            />
            <TextField
              label="理由（雨・熱中症アラート等）"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} disabled={submitting}>
          閉じる
        </Button>
        <Button
          onClick={submit}
          color={mode === "cancel" ? "error" : "primary"}
          variant="contained"
          disabled={submitting}
        >
          {mode === "cancel" ? "キャンセルを確定" : "取り消しを確定"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelDialog;
