import { WIN, LOSE, PLAY } from "../../lib/mskai/constants";
import type { Game } from "../../lib/mskai/game";
/************************************************
 * Result Component
 ************************************************/
interface ResultProp {
  game: Game, // Gameオブジェクト
  timer: number,
  msgStyle: string, // style 
}
export default function Result({ game, timer, msgStyle }: ResultProp) {
  // gameStateに応じたメッセージを取得する関数
  const getMessage = () => {
    if (game.gameState === PLAY) return "PLAYING...";
    if (game.gameState === LOSE) return "地雷撤去に失敗...";
    if (game.gameState === WIN) return `おめでとう！${timer}秒で全ての地雷を撤去しました！`;
    return "";
  }
  return (
    <div className={msgStyle}>{getMessage()}</div>
  )
}