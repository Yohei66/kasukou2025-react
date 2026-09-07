import { tokens } from "./tokens";

type Props = {
  /** SVG を包む要素のスタイル（位置・サイズ・不透明度） */
  sx?: React.CSSProperties;
};

/**
 * 真上から見たテニスコートの線画。
 * viewBox はダブルスコートの実寸(23.77m × 10.97m)をミリ単位に置き換えたもの。
 */
const CourtLines = ({ sx }: Props) => (
  <svg
    viewBox="-40 -40 2457 1177"
    stroke={tokens.courtLine}
    strokeWidth={3}
    fill="none"
    aria-hidden="true"
    style={{ pointerEvents: "none", ...sx }}
  >
    {/* ダブルスのサイドライン／ベースライン */}
    <rect x="0" y="0" width="2377" height="1097" vectorEffect="non-scaling-stroke" />
    {/* シングルスのサイドライン */}
    <line x1="0" y1="137" x2="2377" y2="137" vectorEffect="non-scaling-stroke" />
    <line x1="0" y1="960" x2="2377" y2="960" vectorEffect="non-scaling-stroke" />
    {/* ネット */}
    <line
      x1="1188.5"
      y1="-40"
      x2="1188.5"
      y2="1137"
      strokeWidth={5}
      vectorEffect="non-scaling-stroke"
    />
    {/* サービスライン（ネットから 6.40m） */}
    <line x1="548.5" y1="137" x2="548.5" y2="960" vectorEffect="non-scaling-stroke" />
    <line x1="1828.5" y1="137" x2="1828.5" y2="960" vectorEffect="non-scaling-stroke" />
    {/* センターサービスライン */}
    <line x1="548.5" y1="548.5" x2="1828.5" y2="548.5" vectorEffect="non-scaling-stroke" />
    {/* センターマーク */}
    <line x1="0" y1="518" x2="0" y2="579" vectorEffect="non-scaling-stroke" />
    <line x1="2377" y1="518" x2="2377" y2="579" vectorEffect="non-scaling-stroke" />
  </svg>
);

export default CourtLines;
