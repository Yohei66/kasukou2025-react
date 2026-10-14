import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { fonts, tokens } from "./tokens";
import type { CancelEntry, SlotTarget } from "../courtCommon";
import { CANCEL_REASONS, SLOT_LABELS, reasonLabel } from "../courtCommon";

/** 名前は毎回入れ直さなくて済むよう、この端末に覚えておく */
const NAME_STORE_KEY = "kasukou_cancel_name";

const loadName = () => {
  try {
    return localStorage.getItem(NAME_STORE_KEY) ?? "";
  } catch {
    return "";
  }
};

const saveName = (name: string) => {
  try {
    localStorage.setItem(NAME_STORE_KEY, name);
  } catch {
    /* プライベートモード等で書けなくても支障はない */
  }
};

type Props = {
  target: SlotTarget;
  entry: CancelEntry | null;
  onClose: () => void;
  onDone: () => void;
};

const targetLabel = (t: SlotTarget) =>
  `${t.locationLabel}・${t.courtName}面・${SLOT_LABELS[t.slot]}`;

/**
 * 中止の登録／取消ダイアログ。
 * entry があれば「登録済みの内容を見て取り消す」画面、なければ「登録する」画面。
 */
const CancelDialog = ({ target, entry, onClose, onDone }: Props) => {
  const [reason, setReason] = useState("");
  const [name, setName] = useState(loadName);
  const [comment, setComment] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (action: "cancel" | "clear") => {
    if (action === "cancel") {
      if (!reason) return setMessage("理由を選んでください。");
      if (!name.trim()) return setMessage("名前を入力してください。");
    }
    if (!password) return setMessage("合言葉を入力してください。");

    setSending(true);
    setMessage("送信中…");
    try {
      const res = await fetch("/api/cancel.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          date: target.date,
          court_type: target.locationKey,
          court_name: target.courtName,
          slot: String(target.slot),
          reason,
          name: name.trim(),
          comment: comment.trim(),
          password,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        if (action === "cancel") saveName(name.trim());
        onDone();
        return;
      }
      setMessage(json.message ?? "失敗しました。もう一度お試しください。");
    } catch {
      setMessage("通信エラーが発生しました。");
    }
    setSending(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: fonts.display, fontWeight: 700, pb: 1 }}>
        {entry ? "キャンセル取消" : "キャンセル反映"}
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            fontFamily: fonts.data,
            fontWeight: 600,
            color: tokens.green,
            mb: 2,
            letterSpacing: ".04em",
          }}
        >
          {targetLabel(target)}
        </Typography>

        {entry ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "8px 16px",
              fontSize: ".92rem",
              mb: 2,
            }}
          >
            <Box sx={{ color: tokens.muted }}>理由</Box>
            <Box>{reasonLabel(entry.reason)}</Box>
            <Box sx={{ color: tokens.muted }}>キャンセル者</Box>
            <Box>{entry.name}</Box>
            {entry.comment && (
              <>
                <Box sx={{ color: tokens.muted }}>ひとこと</Box>
                <Box>{entry.comment}</Box>
              </>
            )}
            <Box sx={{ color: tokens.muted }}>登録時刻</Box>
            <Box sx={{ fontFamily: fonts.data }}>{entry.at}</Box>
          </Box>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: ".85rem",
                color: tokens.muted,
                backgroundColor: tokens.greenPale,
                borderRadius: "8px",
                px: 1.5,
                py: 1.25,
                mb: 2,
                lineHeight: 1.7,
              }}
            >
              体育館へ電話し、コート代還付が可能であることを確認したうえで、キャンセル手続きを行ってから登録してください。
            </Typography>

            <Typography sx={{ fontSize: ".85rem", color: tokens.muted, mb: 1 }}>
              理由
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
              {CANCEL_REASONS.map((r) => (
                <Button
                  key={r.key}
                  size="small"
                  onClick={() => setReason(r.key)}
                  sx={{
                    borderRadius: 999,
                    px: 1.75,
                    border: `1px solid ${reason === r.key ? tokens.green : tokens.line}`,
                    backgroundColor: reason === r.key ? tokens.greenPale : "transparent",
                    color: reason === r.key ? tokens.greenDeep : tokens.muted,
                    fontWeight: reason === r.key ? 700 : 400,
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </Box>

            <TextField
              label="キャンセルした人の名前"
              required
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 30 } }}
              placeholder="例）山田"
              sx={{ mb: 2 }}
            />
            <TextField
              label="ひとこと（任意）"
              fullWidth
              size="small"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              placeholder="例）14時から再開予定"
              sx={{ mb: 2 }}
            />
          </>
        )}

        <TextField
          label="合言葉"
          required
          type="password"
          fullWidth
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />

        {message && (
          <Typography sx={{ mt: 1.5, fontSize: ".85rem", color: tokens.danger }}>
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={sending} sx={{ color: tokens.muted }}>
          閉じる
        </Button>
        {entry ? (
          <Button
            onClick={() => void submit("clear")}
            disabled={sending}
            variant="contained"
            sx={{ backgroundColor: tokens.danger, "&:hover": { backgroundColor: tokens.dangerDeep } }}
          >
            キャンセルを取り消す
          </Button>
        ) : (
          <Button
            onClick={() => void submit("cancel")}
            disabled={sending}
            variant="contained"
            sx={{ backgroundColor: tokens.green }}
          >
            中止を登録
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CancelDialog;
