/************************************************
 * Tile Component
 ************************************************/

interface TileProp {
  src: string,   // imgタグのsrcに入れるurl
  index: number, // ゲーム版上のindex 
  leftClick: (i: number) => void,
  rightClick: (e: React.MouseEvent<HTMLImageElement>, i: number) => void,
  doubleClick: (e: React.MouseEvent<HTMLImageElement>, i: number) => void,
}

export default function Tile(
  { src, index, leftClick, rightClick, doubleClick }: TileProp
) {
  return (
    <img
      style={{ margin: 0, padding: 0, userSelect: "none" }} src={src}
      onClick={() => leftClick(index)}
      onContextMenu={(e) => rightClick(e, index)}
      onDoubleClick={(e) => doubleClick(e, index)}
    >
    </img>
  );
}
