import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Radio,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHead from "./top/SectionHead";
import { fonts, layout, tokens } from "./top/tokens";
import { steps } from "./dataset/topContent";

const TOPICS = [
  {
    key: "visit",
    label: "見学・体験を申し込みたい",
    hint: "実際にコートへ来て、雰囲気を見ていただけます",
  },
  {
    key: "question",
    label: "クラブについて質問したい",
    hint: "会費・レッスン・持ち物など、何でもどうぞ",
  },
  {
    key: "other",
    label: "その他",
    hint: "上のどちらにも当てはまらない場合",
  },
];

const EXPERIENCES = [
  { key: "none", label: "テニスは未経験" },
  { key: "blank", label: "学生時代以来のブランクあり" },
  { key: "some", label: "数年の経験あり" },
  { key: "active", label: "現在もプレーしている" },
];

const DATE_LABELS = ["第1希望", "第2希望", "第3希望"];

/** 過去の日付を選べないようにするための今日（ローカル時刻） */
const todayIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const Contact = () => {
  const [topic, setTopic] = useState("visit");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("none");
  const [dates, setDates] = useState<string[]>(["", "", ""]);
  const [message, setMessage] = useState("");
  // ハニーポット。人には見せず、埋まっていればボットとして扱われる
  const [website, setWebsite] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");

  const isVisit = topic === "visit";

  const setDateAt = (index: number, value: string) =>
    setDates((prev) => prev.map((d, i) => (i === index ? value : d)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFailure("");
    setSending(true);
    try {
      const res = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name,
          email,
          experience,
          preferred_dates: dates.filter(Boolean),
          message,
          website,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setSent(true);
        return;
      }
      if (json.errors) setErrors(json.errors);
      setFailure(
        json.message ?? "送信できませんでした。入力内容をご確認ください。"
      );
    } catch {
      setFailure("通信エラーが発生しました。時間をおいてお試しください。");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Box sx={{ py: layout.sectionPy, backgroundColor: tokens.paper }}>
        <Container sx={{ maxWidth: "640px !important", px: 3, textAlign: "center" }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 56, color: tokens.green }} />
          <Typography variant="h2" sx={{ fontSize: "1.7rem", mt: 2 }}>
            お問い合わせを受け付けました。
          </Typography>
          <Typography sx={{ mt: 2.5, color: tokens.muted, lineHeight: 2 }}>
            担当者から数日以内にご返信します。
            <br />
            しばらく経っても返信が届かない場合は、お手数ですが再度お送りください。
          </Typography>
          <Button
            component={Link}
            to="/"
            sx={{
              mt: 4,
              fontFamily: fonts.display,
              fontWeight: 700,
              borderRadius: 999,
              px: 3.5,
              py: 1.25,
              backgroundColor: tokens.green,
              color: "#fff",
              "&:hover": { backgroundColor: tokens.greenDeep, color: "#fff" },
            }}
          >
            トップページへ戻る
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: layout.sectionPy, backgroundColor: tokens.paper }}>
      <Container sx={{ maxWidth: `${layout.maxWidth}px !important`, px: 3 }}>
        <SectionHead
          eyebrow="お問い合わせ"
          heading="見学のお申し込み・ご質問"
          description="見学のお申し込みでも、ちょっとした質問でも構いません。いただいた内容は、ご返信のためだけに使用します。"
        />

        {/* 見学までの流れ。申し込み以外の用件のときは出さない */}
        <Box
          sx={{
            display: isVisit ? "grid" : "none",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
            gap: 2,
            mt: 4,
            mb: 6,
          }}
        >
          {steps.map((s) => (
            <Box
              key={s.no}
              sx={{
                border: `1px solid ${tokens.line}`,
                borderRadius: "12px",
                px: 2.5,
                py: 2,
                backgroundColor: tokens.surface,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: fonts.data,
                  fontWeight: 700,
                  fontSize: ".78rem",
                  letterSpacing: ".14em",
                  color: tokens.green,
                }}
              >
                {s.no}
              </Typography>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, mt: 0.5 }}>
                {s.title}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          component="form"
          onSubmit={submit}
          noValidate
          sx={{
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            backgroundColor: tokens.surface,
            border: `1px solid ${tokens.line}`,
            borderRadius: "14px",
            p: { xs: 2.5, md: 4 },
          }}
        >
          {failure && <Alert severity="error">{failure}</Alert>}

          <Box>
            <Typography sx={{ fontSize: ".92rem", color: tokens.muted, mb: 1.25 }}>
              ご用件
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {TOPICS.map((t) => {
                const selected = topic === t.key;
                return (
                  <Box
                    key={t.key}
                    component="label"
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: `1.5px solid ${selected ? tokens.green : tokens.line}`,
                      backgroundColor: selected ? tokens.greenPale : "transparent",
                    }}
                  >
                    <Radio
                      size="small"
                      checked={selected}
                      onChange={() => setTopic(t.key)}
                      value={t.key}
                      name="topic"
                      sx={{ p: 0, mt: "2px", color: tokens.line, "&.Mui-checked": { color: tokens.green } }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: fonts.display,
                          fontWeight: 700,
                          fontSize: ".98rem",
                          color: selected ? tokens.greenDeep : tokens.ink,
                        }}
                      >
                        {t.label}
                      </Typography>
                      <Typography sx={{ fontSize: ".84rem", color: tokens.muted, mt: 0.25 }}>
                        {t.hint}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <TextField
            label="お名前"
            required
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{ htmlInput: { maxLength: 60 } }}
          />

          <TextField
            label="メールアドレス"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email ?? "ご返信先です。お間違いのないようご確認ください。"}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />

          {/* テニス歴と希望日は、見学・体験のときだけ聞く */}
          {isVisit && (
            <>
              <TextField
                label="テニス歴"
                select
                fullWidth
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                {EXPERIENCES.map((x) => (
                  <MenuItem key={x.key} value={x.key}>
                    {x.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box>
                <Typography sx={{ fontSize: ".92rem", color: tokens.muted, mb: 0.5 }}>
                  見学の希望日
                </Typography>
                <Typography sx={{ fontSize: ".84rem", color: tokens.muted, mb: 1.5 }}>
                  第3希望までご記入いただけます。決まっていなければ空欄で構いません。
                  月曜以外はどこかのコートで活動しています。
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
                    gap: 1.5,
                  }}
                >
                  {DATE_LABELS.map((label, i) => (
                    <TextField
                      key={label}
                      label={label}
                      type="date"
                      size="small"
                      value={dates[i]}
                      onChange={(e) => setDateAt(i, e.target.value)}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { min: todayIso() },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          <TextField
            label={isVisit ? "ご質問・ご要望（任意の補足）" : "お問い合わせ内容"}
            required
            fullWidth
            multiline
            minRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={Boolean(errors.message)}
            helperText={
              errors.message ?? "見学希望日など、ご質問があればお書きください。"
            }
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />

          {/* ボット除け。人には見えないので、埋まっていれば自動送信と判断する */}
          <Box
            aria-hidden="true"
            sx={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
          >
            <label>
              ウェブサイト
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </Box>

          <Button
            type="submit"
            disabled={sending}
            sx={{
              alignSelf: "flex-start",
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 999,
              px: 4,
              py: 1.5,
              backgroundColor: tokens.green,
              color: "#fff",
              "&:hover": { backgroundColor: tokens.greenDeep, color: "#fff" },
              "&.Mui-disabled": { backgroundColor: tokens.line, color: "#fff" },
            }}
          >
            {sending ? "送信中…" : "この内容で送信する"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
