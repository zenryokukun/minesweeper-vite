/**
 * Minesweeperの説明書をモーダルで表示するコンポーネント
 */

import style from "./Description.module.css";

interface DescProp {
  closeModal: () => void,
}
/**description */
export default function Description({ closeModal }: DescProp) {

  // GitHub-pagesと開発サーバでBASE_URLが異なるため、追加
  const descriptionImagePath = import.meta.env.BASE_URL + "double-click.png";

  return (
    <div className={style.modal}>
      <div onClick={closeModal} className={style.close}>X CLOSE</div>
      <div className={style.wrapper}>
        <section>
          <h1 className={style.headline}>マインスイーパーとは</h1>
          <p>1980年代に作成された、１人用コンピュータゲームです。地雷原から全ての地雷を撤去するのが目的です。
            Windows3.1～7までは標準で付属していたため、知名度が高いゲームです。
            残念ながらWindows8からはダウンロード形式になりました。
          </p>
        </section>
        <section>
          <h2 className={style.subHeadline}>ルール</h2>
          <ul>
            <li>
              マスをクリックすると開きます。
            </li>
            <li>
              地雷が隠れているマスをクリックすると負けです。
            </li>
            <li>
              地雷が隠れているマスには旗を立てて印をつけます。
            </li>
            <li>
              全ての地雷マスに旗を立て、それ以外のマスを全て開くと勝ちです。
            </li>
            <li>
              数字のマスは、隣接マスに埋まっている爆弾の数を示しています。
            </li>
            <li>
              左上の数字は、埋まっている爆弾の残数です。旗を立てると、1減ります。間違えていても減ります。
            </li>
            <li>
              右上の数字は経過秒数です。
            </li>
          </ul>
        </section>
        <section>
          <h2 className={style.subHeadline}>操作</h2>
          <ul>
            <li>
              左クリックでマスを開きます。
            </li>
            <li>
              右クリックで旗を立てます。
            </li>
            <li>
              数字マスをダブルクリックすると、隣接マスを全て開きます。旗が立っているマスは除外されます。
              時短に利用してください。
            </li>
            <div className={style.imgWrapper}>
              <img className={style.descImg} src={descriptionImagePath} alt="double-click-explanation" />
            </div>
            <li>ニコニコボタンを押すと、同じレベルで再プレイできます</li>
            <li>上部のEASY MEDIUM HARDを押すと、レベル変更できます</li>
          </ul>
        </section>
      </div>
    </div >
  );
}