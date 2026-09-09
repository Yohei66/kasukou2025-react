import { Box } from "@mui/material";
import { fonts, tokens } from "./tokens";

export type SegmentedOption = { label: string; value: string };

type Props = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** スクリーンリーダー向けに、何を切り替える操作なのかを伝える */
  label: string;
};

/**
 * 少数の選択肢を横並びで切り替えるタブ。
 * 選択中を「薄い緑地＋濃い緑文字」で示すのは、ヘッダーのナビと同じ表現。
 * ButtonGroup の塗り分けだと非選択のグレーが強く出すぎるため、こちらを使う。
 */
const Segmented = ({ options, value, onChange, label }: Props) => (
  <Box
    role="group"
    aria-label={label}
    sx={{
      display: "inline-flex",
      gap: 0.5,
      p: "3px",
      border: `1px solid ${tokens.line}`,
      borderRadius: 999,
      backgroundColor: tokens.surface,
    }}
  >
    {options.map((o) => {
      const selected = o.value === value;
      return (
        <Box
          key={o.value}
          component="button"
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(o.value)}
          sx={{
            minHeight: 48,
            px: 2.5,
            py: 1,
            border: 0,
            borderRadius: 999,
            cursor: "pointer",
            fontFamily: fonts.display,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: selected ? tokens.greenDeep : tokens.muted,
            backgroundColor: selected ? tokens.greenPale : "transparent",
            transition: "background-color .15s ease, color .15s ease",
            "&:hover": {
              backgroundColor: tokens.greenPale,
              color: tokens.greenDeep,
            },
          }}
        >
          {o.label}
        </Box>
      );
    })}
  </Box>
);

export default Segmented;
