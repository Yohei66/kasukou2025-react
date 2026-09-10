import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ページを移動したら、必ず紙面の一番上から見せるためのもの。
 *
 * 画面の描画自体は差し替わっても、スクロール位置はブラウザがそのまま持ち越す。
 * そのため「行事予定表を下まで読んでから活動内容へ」のように
 * 移動元より移動先が長いページだと、途中から表示されてしまっていた
 * （移動先が短いページのときは端まで戻されるので、たまにしか起きないように見える）。
 *
 * 戻る・進むでも同じ位置には復元しない方針にしたので、
 * ブラウザ側の自動復元（scrollRestoration）も切って競合しないようにしている。
 */
const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // #見出し付きで来たときだけは、その位置に合わせる
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
    // key も見ることで、同じページのリンクをもう一度押したときも先頭に戻す
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToTop;
