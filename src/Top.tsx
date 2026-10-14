import Hero from "./top/Hero";
import WeekStrip from "./top/WeekStrip";
import TodayCourts from "./top/TodayCourts";
import Doubles from "./top/Doubles";
import Points from "./top/Points";
import Stats from "./top/Stats";
import ForYou from "./top/ForYou";
import Gallery from "./top/Gallery";
import Steps from "./top/Steps";
import Access from "./top/Access";
import ContactCta from "./top/ContactCta";
import Reveal from "./top/Reveal";

/**
 * トップページ。
 * 「知る → 惹かれる → 安心する → 動く」の順にセクションを並べている。
 * 主役は会員どうしのダブルスゲーム。レッスンは Doubles の末尾で軽く触れるだけにして、
 * 民間のテニススクールと誤解されないようにしている。
 * 文言・数値・スケジュールは src/dataset/topContent.ts に集約。
 *
 * ヒーローと本日のコート状況は最初の画面に入るので、そのまま表示する
 * （ヒーローは自前の入場アニメーションを持つ）。
 * それより下のセクションは、スクロールで画面に入ったときに Reveal でふわっと出す。
 */
const Top = () => (
  <>
    <Hero />
    {/* ヒーローの背景写真が縦に伸びすぎないよう、写真の外に出した「ふだんの一週間」 */}
    <WeekStrip />
    {/* 会員向けの実用ブロック。ヒーロー直後に置いてスクロールなしで届くようにしている */}
    <TodayCourts />
    <Reveal>
      <Doubles />
    </Reveal>
    <Reveal>
      <Points />
    </Reveal>
    <Reveal>
      <Stats />
    </Reveal>
    <Reveal>
      <ForYou />
    </Reveal>
    <Reveal>
      <Gallery />
    </Reveal>
    <Reveal>
      <Steps />
    </Reveal>
    <Reveal>
      <Access />
    </Reveal>
    <Reveal>
      <ContactCta />
    </Reveal>
  </>
);

export default Top;
