import type { Game } from "../../lib/mskai/game";
import type { Sprites } from "../../lib/mskai/loader";
import type { Action } from "../../lib/mskai/reducer";
import type { LevelKeyType } from "../../lib/mskai/level";
import { getGroundSpriteIndex, getSmileSpriteIndex, getTimerSpriteIndices, getRemainsSpriteIndices } from "../../lib/mskai/game";
import { genAction } from "../../lib/mskai/reducer"
import { ACTION } from "../../lib/mskai/constants";
import Tile from "./Tile";


/************************************************
 * GameBoard Component
 ************************************************/

// InfoPropとMinesPropのマージ版
interface GameBoardProp {
  game: Game,       // Gameオブジェクト。useReducerのstate
  handler: Sprites, // spritesheet制御オブジェクト
  timer: number,    // 経過時間
  dispatch: (value: Action) => void,        // Gameオブジェクトのstateを更新。useReducerのdispatch。 
  changeLevel: (lvl: LevelKeyType) => void, // Level変更処理
  wrapperStyle: string,                     // style 固定だけど１つだけなのでpropsとして受け取る
  infoStyle: string,                        // style levelによって変動
  boardStyle: string,                       // style levelによって変動

}

export default function GameBoard({
  game, handler, timer, dispatch, changeLevel, wrapperStyle, infoStyle, boardStyle
}: GameBoardProp) {
  return (
    <div className={wrapperStyle}>
      <InfoSection
        game={game} handler={handler} timer={timer}
        dispatch={dispatch} changeLevel={changeLevel}
        infoStyle={infoStyle}
      />
      <MinesSection
        game={game} handler={handler}
        dispatch={dispatch}
        boardStyle={boardStyle}
      />
    </div>
  );
}

interface InfoProp {
  game: Game,
  handler: Sprites,
  timer: number,
  dispatch: (value: Action) => void,
  changeLevel: (lvl: LevelKeyType) => void,
  infoStyle: string,
}

function InfoSection({
  game, handler, timer, dispatch, changeLevel, infoStyle
}: InfoProp) {

  const smilePressed = () => dispatch(genAction(ACTION.SMILE_DOWN, {}));
  const smileReleased = () => changeLevel(game.level);
  return (
    <div className={infoStyle}>
      <div>
        {getRemainsSpriteIndices(game).map((spIndex, i) => {
          const url = handler.number.getUrl(spIndex);
          return (<img key={i} src={url} />);
        })}
      </div>
      <div>
        {(() => {
          const spIndex = getSmileSpriteIndex(game);
          const url = handler.smile.getUrl(spIndex);
          return <img src={url} onMouseDown={smilePressed} onMouseUp={smileReleased} />
        })()}
      </div>
      <div>
        {getTimerSpriteIndices(timer).map((spIndex, i) => {
          const url = handler.number.getUrl(spIndex);
          return (<img key={i} src={url} />);
        })}
      </div>
    </div>
  );
}



interface MinesProp {
  game: Game,
  handler: Sprites,
  boardStyle: string,
  dispatch: (value: Action) => void,
}
function MinesSection({ game, handler, boardStyle, dispatch }: MinesProp) {

  const leftClick = (i: number) => dispatch(genAction(ACTION.CLICK, { i: i }));

  const rightClick = (e: React.MouseEvent<HTMLImageElement>, i: number) => {
    e.preventDefault();
    dispatch(genAction(ACTION.CONTEXT, { i: i }))
  };

  const doubleClick = (e: React.MouseEvent<HTMLImageElement>, i: number) => {
    e.preventDefault();
    dispatch(genAction(ACTION.DOUBLE, { i: i }));
  }

  return (
    <div className={boardStyle}>
      {game.tiles.map((arr, i) => {
        const spIndex = getGroundSpriteIndex(game, i);
        const url = handler.layer.getUrl(spIndex);
        return (
          <Tile key={i} index={i} src={url}
            leftClick={leftClick} rightClick={rightClick} doubleClick={doubleClick}
          />
        );
      })}
    </div>
  )
}
