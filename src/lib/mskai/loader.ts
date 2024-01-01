
/**
 * Spriteシートを画像単位に分割し、それぞれのurlを管理するオブジェクトを生成するモジュール
 */

// 地雷版のSprite情報:[x,y,width,height]
const TILE_SP = [
  [0, 23, 16, 16], // EMPTY
  [16, 23, 16, 16], // 1
  [32, 23, 16, 16], // 2
  [48, 23, 16, 16], // 3
  [64, 23, 16, 16], // 4
  [80, 23, 16, 16], // 5
  [96, 23, 16, 16], // 6
  [112, 23, 16, 16],// 7
  [128, 23, 16, 16],// 8
  [0, 39, 16, 16],  // COVERED
  [16, 39, 16, 16], // FLAG
  [32, 39, 16, 16], // REDBOMB
  [48, 39, 16, 16], // NG_BOMB
  [64, 39, 16, 16]  // BOMB
];

// smiley faceのSprite情報:[x,y,width,height]
const SMILE_SP = [
  [0, 55, 27, 26],  // smile
  [27, 55, 26, 26], // smile presssed
  [52, 55, 26, 26], // ?
  [78, 55, 26, 26], // lost
  [104, 55, 26, 26] // win
]

// 数字のSprite情報:[x,y,width,height]
const NUMS_SP = [
  [0, 0, 13, 23],
  [13, 0, 13, 23],
  [26, 0, 13, 23],
  [39, 0, 13, 23],
  [52, 0, 13, 23],
  [65, 0, 13, 23],
  [78, 0, 13, 23],
  [91, 0, 13, 23],
  [104, 0, 13, 23],
  [117, 0, 13, 23],
  [130, 0, 13, 23]
];

// 各Spriteの大きさ:[width,height]
const TILE_SIZE = [25, 25];
const SMILE_SIZE = [40, 40];
const NUMS_SIZE = [20, 36];

// urlをキーと紐づけて保持するオブジェクト用の型
interface SpriteInfo {
  [key: string]: { url: string }
}

// 最終的にexportする、ゲーム版、ニコニコ、経過秒数のspriteを制御するオブジェクトの型
export interface Sprites {
  layer: SpriteHandler,
  smile: SpriteHandler,
  number: SpriteHandler,
}

// sprite制御クラス
class SpriteHandler {

  sprite: SpriteInfo;

  constructor() {
    this.sprite = {};
  }

  /**
   * keyでval(画像url)を紐づける
   * @param key 画像urlを紐づけるキー
   * @param val 画像url
   */
  addInfo(key: string, val: string) {
    this.sprite[key] = { url: val };
  }

  /**
   * indexに対応するspriteのurlを返す
   * @param index 
   * @returns indexに対応する画像url
   */
  getUrl(index: number) {
    return this.sprite[index.toString()].url;
  }
}

/**
 * spHandlerを初期化。spPosを走査し、要素分以下を繰り返す：  
 * - [x,y,w,h]でspritesheetを切取り、spPosの大きさのcanvasに描写する
 * - canvas.toDataURL()で画像化し、urlを取得
 * - spHandlerのaddInfoを使って、走査のindexをキーにurlをマッピング
 * @param img   imgタグ
 * @param spPos 切り取る位置情報[x,y,w,h]の一覧を保持した2次元配列
 * @param spSize 切り取った画像の大きさ[w,h]
 * @returns SpriteHandler
 */
function newHandler(img: HTMLImageElement, spPos: number[][], spSize: number[]) {
  const spHandler = new SpriteHandler();
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  const [sw, sh] = spSize;
  cvs.width = sw;
  cvs.height = sh;

  // spPosが保持している[x,y,w,h]の分画像urlを生成し、iをキーにspHandlerにマッピング
  spPos.forEach((data, i) => {
    const [dx, dy, w, h] = data;
    ctx!.drawImage(img, dx, dy, w, h, 0, 0, sw, sh);
    const url = cvs.toDataURL();
    spHandler.addInfo(i.toString(), url);
  });
  return spHandler;
}

/**
 * パスからspritesheet読み取る。
 * ゲーム版、数字、ニコニコごとにspriteを分割し、それぞれspriteHandlerを初期化
 * ３つのspriteHandlerを保持した、Spritesに解決するpromiseを返す
 * @param imgPath Minesweeperのspritesheetのパス
 * @returns Spritesに解決するPromise
 */
export function loadSprite(imgPath: string): Promise<Sprites> {
  const prom = new Promise((res: (spHandler: Sprites) => void, rej) => {
    const img = new Image();
    img.addEventListener("load", () => {
      // ゲーム版、ニコニコ、数字ごとにspriteHandlerを取得
      const layerSp = newHandler(img, TILE_SP, TILE_SIZE);
      const smileSp = newHandler(img, SMILE_SP, SMILE_SIZE);
      const numSp = newHandler(img, NUMS_SP, NUMS_SIZE);
      // 3つのspHandlerを保持したSpritesで解決する
      const handler: Sprites = {
        layer: layerSp,
        smile: smileSp,
        number: numSp,
      };
      res(handler);
    });
    img.src = imgPath;

  });
  return prom;
}
