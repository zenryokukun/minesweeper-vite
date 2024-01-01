import { useEffect, useState, useReducer, useRef } from "react";
import Description from "./component/minesweeperkai/Description";
import LevelSelect from "./component/minesweeperkai/LevelSelect";
import GameBoard from "./component/minesweeperkai/GameBoard";
import Result from "./component/minesweeperkai/Result";
import { reducer, iniState, genAction } from "./lib/mskai/reducer"
import { EASY, MEDIUM, HARD, EXTREME, ACTION, PLAY } from "./lib/mskai/constants";
import { loadSprite } from "./lib/mskai/loader";
import type { Sprites } from "./lib/mskai/loader";
import type { LevelKeyType } from "./lib/mskai/level";
import type React from "react";

import style from "./styles/Mskai.module.css";

/**
 * levelに応じたclassNameを返す
 * style.board -> gridのcolumns数
 * styles.infoWrapper -> grindのcolumns数によって幅を変える　
 * @param level number
 * @returns string[]:[boardのスタイル、infoWrapperのスタイル]
 */
function getStyles(level: number) {
  let boardStyle = style.board;
  let infoStyle = style.infoWrapper;
  if (level === EASY) {
    boardStyle += " " + style.easyCols;
    infoStyle += " " + style.easyInfoWidth;
  } else if (level === MEDIUM) {
    boardStyle += " " + style.mediumCols;
    infoStyle += " " + style.mediumInfoWidth;
  } else if (level === HARD) {
    boardStyle += " " + style.hardCols;
    infoStyle += " " + style.hardInfoWidth;
  } else if (level === EXTREME) {
    boardStyle += " " + style.extremeCols;
    infoStyle += " " + style.extremeInfoWidth;
  }
  return [infoStyle, boardStyle];
}

export default function Page() {
  // game state管理。Gameオブジェクトをreducer関数で更新する。
  const [game, dispatch] = useReducer(reducer, iniState(EASY));
  // sprite handler。load後に描写出来るようにstate管理してる
  const [handler, setHandler] = useState<Sprites | null>(null);
  // 経過秒数state
  const [timer, setTimer] = useState(0);
  // 説明用Modalを制御するstate
  const [isModal, setModal] = useState(false);
  // setIntervalのidを管理するstate。レンダリングの都度別の値にならないように
  // useRefで管理する。
  const ref = useRef<number | null>(null);

  // level変更処理。LevelSelectクリック時、InfoSectionのニコニコクリック時に実行
  const changeLevel = (lvl: LevelKeyType) => {
    setTimer(0);        // timerを0にリセット
    removeTick();       // setIntervalを止める
    ref.current = null; // setIntervalのidを削除
    // gameをlvlで初期化
    dispatch(genAction(ACTION.INIT, { level: lvl }));
  };

  // 説明用modalを表示。
  const showModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModal(true)
  };
  // 説明用modalを非表示にする
  const closeModal = () => setModal(false);
  // 経過秒数を更新する関数
  const tick = () => setTimer(timer => timer += 1);
  // 経過秒数更新をクリアする館素
  const removeTick = () => {
    const tid = ref.current;
    if (tid !== null) {
      window.clearInterval(tid);
    }
  }
  // LevelSelectのstyle取得関数。選択中レベルはunderlineにするため。
  const getLevelStyle = (lvl: LevelKeyType) => {
    if (game.level === lvl) {
      return `${style.level} ${style.underline}`;
    }
    return style.level;
  };

  // spriteのロード処理。初回マウント時のみ実行。
  useEffect(() => {
    const sp = loadSprite("/minesweeper.png");
    sp.then(handler => setHandler(handler));
  }, []);

  // GameのgameState,isGroundSetが変更された時実行。
  // 負けた時、買ったときに、初クリックしてゲーム版が初期化された時に
  // 経過秒数をカウントする処理を設定したり、クリアしたりする。
  useEffect(() => {
    const tid = ref.current;
    if (game.isGroundSet && game.gameState === PLAY && tid === null) {
      // 初クリックされ、PLAY状態で、かつ経過秒数更新処理が設定されていない場合、設定する。
      ref.current = window.setInterval(() => tick(), 1000);
    } else if (!game.isGroundSet || game.gameState !== PLAY) {
      // まだ初クリックされていない、PLAY状態じゃない時は、経過秒数更新処理をクリアする、
      removeTick();
    }
    // unmount時に経過秒数更新処理が設定されていればクリアする。
    return () => {
      if (tid !== null) window.clearInterval(tid);
    };
  }, [game.gameState, game.isGroundSet]);

  // 難易度に応じたstyleを取得
  const [infoStyle, boardStyle] = getStyles(game.level);

  return (
    <>
      <div className={style.band}>Minesweeper極(KI-WA-MI)</div>
      <main className={style.container}>
        {/**spriteがまだロードされていない場合、loading...を表示する
         * ロードされていれば、GameBoardを表示する。
         */}
        {(!handler) ? <div className={style.loader}>loading....</div> :
          <>
            {isModal && <Description closeModal={closeModal} />}
            <LevelSelect
              currentLevel={game.level} changeLevel={changeLevel}
              getLevelStyle={getLevelStyle} wrapperStyle={style.levelWrapper}
            />
            <GameBoard
              game={game} handler={handler} timer={timer}
              dispatch={dispatch} changeLevel={changeLevel}
              wrapperStyle={style.boardWrapper}
              infoStyle={infoStyle} boardStyle={boardStyle}
            />
            <Result game={game} timer={timer} msgStyle={style.message}></Result>
            <a href="#" className={style.rule} onClick={showModal}>ルール説明</a>
          </>
        }
      </main>
      <div className={style.band}>Minesweeper極(KI-WA-MI)</div>
    </>
  );
}