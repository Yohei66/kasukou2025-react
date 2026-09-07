import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** ずらして出したいときの遅延（ミリ秒） */
  delay?: number;
};

/**
 * 画面に入ったら1回だけ、ふわっと表示する薄いラッパー。
 * CSS の transform / opacity のみ（GPU処理・描画をブロックしない）。ライブラリ不使用。
 * IntersectionObserver が使えない環境や prefers-reduced-motion では、
 * 何もせず最初から表示された状態にする。
 */
const Reveal = ({ children, delay = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect(); // 一度出したら監視をやめる
        }
      },
      // 少し手前で発火させ、スクロールに追いつく
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(16px)",
        transition: "opacity .6s ease, transform .6s ease",
        transitionDelay: `${delay}ms`,
        "@media (prefers-reduced-motion: reduce)": {
          opacity: 1,
          transform: "none",
          transition: "none",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default Reveal;
