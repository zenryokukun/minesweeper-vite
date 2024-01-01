/**
 * 難易度に応じた行列数・地雷数を保持した定数をエクスポートするモジュール
 */
import { EASY, MEDIUM, HARD, EXTREME } from "./constants";

// level値の一覧をtypeにする
export type LevelKeyType = typeof EASY | typeof MEDIUM | typeof HARD | typeof EXTREME;

// levelオブジェクトの型定義
export interface LevelInterface {
    cols: number, rows: number, bombs: number, level: LevelKeyType,
}

// LEVELSの型として内部利用
interface KeyLevelMap {
    [key: string]: LevelInterface
}

//　選択可能なlevel情報を保持したオブジェクト
export const LEVELS: KeyLevelMap = {
    [EASY]: { cols: 8, rows: 8, bombs: 8, level: EASY },
    [MEDIUM]: { cols: 16, rows: 16, bombs: 45, level: MEDIUM },
    [HARD]: { cols: 30, rows: 16, bombs: 90, level: HARD },
    [EXTREME]: { cols: 48, rows: 68, bombs: 777, level: EXTREME },
}