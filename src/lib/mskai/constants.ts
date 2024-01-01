// 地雷版の各マスのspriteの添え時に対応した定数
export const EMPTY = 0;     // 空白マス。隣接マスに地雷が無い&自分も地雷でない。
export const COVERED = 9;   // まだクリックしていないマス
export const FLAG = 10;     // 旗のマス（使ってないかも）
export const RED_BOMB = 11; // クリックした地雷は赤い地雷
export const NG_BOMB = 12;  // 地雷じゃないのに旗おいたとこ。負けた際に表示。
export const BOMB = 13;

// 地雷版の各マスの状態を3つに分類
export const NOT_OPEN = 0;  // まだ地面が見えていないマス
export const FLAGGED = 1;   // 旗を立ててあるマス
export const OPEN = 2;      // 既に開いて地面が見えているマス

// smiley faceのspriteの添え時に対応した定数;
export const SMILE = 0;
export const SMILE_PRESSED = 1;
export const SMILE_LOSE = 2;
export const SMILE_WIN = 4;

// gameの状態を3つに分類
export const PLAY = 0; // ゲーム中
export const LOSE = 1; // 負けた
export const WIN = 2;  // 勝った

// level値
export const EASY = 0;    // 簡単
export const MEDIUM = 1;  // 普通
export const HARD = 2;    // 難しい
export const EXTREME = 3; // 極

// reducerのAction一覧
export const ACTION = {
    INIT: 3,      // 初期表示
    CLICK: 0,     // 左クリック
    CONTEXT: 1,   // 右クリック
    DOUBLE: 2,    // ダブルクリック
    SMILE_DOWN: 4,// ニコニコにマウスダウン
    SMILE_UP: 5,  // ニコニコにマウスアップ
}
