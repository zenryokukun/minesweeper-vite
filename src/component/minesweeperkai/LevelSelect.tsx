import type { LevelKeyType } from "../../lib/mskai/level";
import { EASY, MEDIUM, HARD, EXTREME } from "../../lib/mskai/constants";
/************************************************
 * LevelSelect Component
 ************************************************/
interface SelectProp {
  currentLevel: LevelKeyType, // 現在のlevel値
  changeLevel: (i: LevelKeyType) => void, // level変更を行う関数
  getLevelStyle: (i: LevelKeyType) => string, // levelに応じたstyleを取得する関数
  wrapperStyle: string, // wrapperのstyle
}

export default function LevelSelect({
  currentLevel, changeLevel, getLevelStyle, wrapperStyle
}: SelectProp) {

  // level変更処理
  // 現在と同じlevelを選択した時は処理しない。
  const change = (lvl: LevelKeyType) => {
    if (lvl === currentLevel) return;
    changeLevel(lvl);
  }

  return (<div className={wrapperStyle}>
    <span onClick={() => change(EASY)} className={getLevelStyle(EASY)}>EASY</span>
    <span onClick={() => change(MEDIUM)} className={getLevelStyle(MEDIUM)}>MEDIUM</span>
    <span onClick={() => change(HARD)} className={getLevelStyle(HARD)}>HARD</span>
    <span onClick={() => change(EXTREME)} className={getLevelStyle(EXTREME)}>極</span>
  </div>);
}