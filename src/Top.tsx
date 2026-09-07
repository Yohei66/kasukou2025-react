import Hero from "./top/Hero";
import TodayCourts from "./top/TodayCourts";
import Points from "./top/Points";
import Stats from "./top/Stats";
import ForYou from "./top/ForYou";
import Lessons from "./top/Lessons";
import Gallery from "./top/Gallery";
import Steps from "./top/Steps";
import Access from "./top/Access";
import ContactCta from "./top/ContactCta";

/**
 * トップページ。
 * 「知る → 惹かれる → 安心する → 動く」の順にセクションを並べている。
 * 文言・数値・スケジュールは src/dataset/topContent.ts に集約。
 */
const Top = () => (
  <>
    <Hero />
    {/* 会員向けの実用ブロック。ヒーロー直後に置いてスクロールなしで届くようにしている */}
    <TodayCourts />
    <Points />
    <Stats />
    <ForYou />
    <Lessons />
    <Gallery />
    <Steps />
    <Access />
    <ContactCta />
  </>
);

export default Top;
