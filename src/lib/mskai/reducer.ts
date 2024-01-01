import { RED_BOMB, NG_BOMB } from "./constants";
import { LEVELS } from "./level";
import type { LevelKeyType } from "./level";
import { OPEN, NOT_OPEN, FLAGGED } from "./constants";
import { SMILE_LOSE, SMILE_WIN, SMILE_PRESSED } from "./constants";
import { EMPTY, BOMB } from "./constants";
import { WIN, LOSE, PLAY } from "./constants";
import { NewGame } from "./game"
import type { Game, GroundType, TileType, SmileType, GameType } from "./game";
import { ACTION } from "./constants";

// Actionのtype以外の情報をpayloadの名前で保持させる。
// そのpayloadの型
interface Payload {
	i?: number,           // クリックしたtileのindex
	level?: LevelKeyType, // level値
}

// reducerが受け取るActionの型
export interface Action {
	type: number,
	payload: Payload,
}

/**
 * パラメタからActionを生成する関数
 * @param type ACTIONのtype
 * @param payload Actionにつけるpayload
 * @returns Action
 */
export function genAction(type: number, payload: Payload): Action {
	return {
		type: type,
		payload,
	}
}

/**
 * 二次元配列(x,y)のindex一次元のindexにして返す
 * @param x 
 * @param y 
 * @param game 
 * @returns 1次元に換算したindex
 */
function flatten(x: number, y: number, game: Game): number {
	return y * game.cols + x;
}

/**
 * 1次元のindexを二次元配列のx,yのindexにして返す
 * @param i 1次元index
 * @param game 
 * @returns [x,y]
 */
function twoDim(i: number, game: Game): [number, number] {
	const { cols } = game;
	const x = i % cols;
	const y = Math.floor(i / cols);
	return [x, y];
}

/**
 *  gameのtilesとgroundのshallow copyを返す
 * @param game 
 * @returns tiles,groundのshallow copy
 */
function copy(game: Game): [TileType[], GroundType[]] {
	const tiles = [...game.tiles];
	const ground = [...game.ground];
	return [tiles, ground];
}

/**
 * 2次元換算したx,yのindexがゲーム版からはみ出ていないかチェックする関数
 * @param x 列のindex
 * @param y 行のindex
 * @param game 
 * @returns boolean
 */
function isIn(x: number, y: number, game: Game) {
	const { cols, rows } = game;
	return x >= 0 && x < cols && y >= 0 && y < rows;
}

/**
 * 受けた撮ったlevel値に応じたGameオブジェクトを返す関数
 * useReducerのiniStatetとかに使う
 * @param lvl level値
 * @returns Game
 */
export function iniState(lvl: LevelKeyType): Game {
	return NewGame(LEVELS[lvl]);
}

/**
 * useReducerのreducerとして使う。dispatchで呼び出される。
 * Actionに応じて処理をする。Gameに変更があれば、変更を加えた新しいGameを返す
 * @param state Game
 * @param action Action
 * @returns Game
 */
export function reducer(state: Game, action: Action): Game {
	// payload部分。undefinedの可能性あり。
	const { i, level } = action.payload;
	// Gameのプロパティで変更の可能性のあるものをここで抜き出しておく
	// tilesとgroundは配列なので、Reactが変更を把握できるようcopyを取得
	let [tiles, ground] = copy(state);
	let { smileState, gameState, remains } = state;

	// Actionに応じて処理
	switch (action.type) {
		case ACTION.INIT:
			//　初期化処理。levelに応じたGameを返す
			if (level === undefined) break;
			return NewGame(LEVELS[level]);

		case ACTION.CLICK:
			// 左クリック
			if (i === undefined) break;
			// 開いていないtileでなければ、処理なし
			if (tiles[i] !== NOT_OPEN) break;
			// groundが初期化されていなければ、セット
			if (!state.isGroundSet) {
				ground = genGround(i, state);
			}
			// tileを開く
			openTile(i, tiles, ground, state);
			// 勝ち負け判定し、smileStateとgameStateを受け取る
			[smileState, gameState] = calcState(i, tiles, ground, state);
			// reactが変更を把握できるよう、spread構文を使う
			// 変更があるものは、stateと同じプロパティ名で被せて上書き
			return {
				...state,
				tiles,
				ground,
				isGroundSet: true,
				// 1105追記...smileState,gameStateはキー名不要だった。
				// shorthand記法で、変数名：値として設定してくれるため。
				// (tilesやgroundは、tiles:tiles,ground:groundとして処理されてる)
				// 忘れたらmdnでobject initializerを検索：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
				// あっても害はないけど、tiles,groundは省略しているので。
				smileState: smileState,
				gameState: gameState,
			};


		case ACTION.CONTEXT:
			// 右クリック処理
			// PLAY状態でなければ、処理しない
			if (state.gameState !== PLAY) break;
			if (i === undefined) break;
			if (tiles[i] === FLAGGED) {
				// 旗が立っていれば降ろす
				tiles[i] = NOT_OPEN;
				remains++; // 地雷残数を増やす
			} else if (tiles[i] === NOT_OPEN) {
				// 旗が立っていなければ立てる
				tiles[i] = FLAGGED;
				remains--; // 地雷残数を減らす
			}
			// 勝ち負け判定し、smileStateとgameStateを受け取る
			[smileState, gameState] = calcState(i, tiles, ground, state);
			// reactが変更を把握できるよう、spread構文を使う
			// 変更があるものは、stateと同じプロパティ名で被せて上書き
			return {
				...state,
				tiles, ground,
				remains: remains,
				smileState: smileState,
				gameState: gameState,
			};

		case ACTION.DOUBLE:
			// ダブルクリック
			if (i === undefined) break;
			// 開いていないtileなら、処理しない
			if (tiles[i] !== OPEN) break;
			// groundが数字でなければ、処理しない
			if (!isNumber(i, ground)) break;
			doubleClick(i, tiles, ground, state);
			// 勝ち負け判定し、smileStateとgameStateを受け取る
			[smileState, gameState] = calcState(i, tiles, ground, state);
			// reactが変更を把握できるよう、spread構文を使う
			// 変更があるものは、stateと同じプロパティ名で被せて上書き
			return {
				...state,
				tiles, ground,
				remains: remains,
				smileState: smileState,
				gameState: gameState,
			};

		case ACTION.SMILE_DOWN:
			// ニコニコにマウスダウン
			return { ...state, smileState: SMILE_PRESSED };

		case ACTION.SMILE_UP:
			// ニコニコにマウスアップ
			return NewGame(LEVELS[state.level]);

		default:
			return state;
	}
	return state;
}

/**
 * iに応じたgroundが数字（１～８）かチェックする
 * @param i 1次元のindex
 * @param ground 
 * @returns 
 */
function isNumber(i: number, ground: GroundType[]) {
	const v = ground[i];
	return v >= 1 && v <= 8;
}

/**
 * ダブルクリックした時の処理。iの周囲の空いていないtileを全て開く
 * パラメタのtiles,groundはreducerでコピーされたもの。
 * openTile等の処理で、game.tiles,game.groundとは一致しない場合があるので留意。
 * @param i  1次元のindex
 * @param tiles コピーされたtiles。
 * @param ground コピーされたground
 * @param game Gameオブジェクト
 */
function doubleClick(
	i: number, tiles: TileType[], ground: GroundType[], game: Game
) {
	const [x, y] = twoDim(i, game);
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			if (r === 0 && c === 0) continue;
			const nx = x + c;
			const ny = y + r;
			const ni = flatten(nx, ny, game);
			if (!isIn(nx, ny, game)) continue;
			if (tiles[ni] === NOT_OPEN) {
				openTile(ni, tiles, ground, game);
			}
		}
	}
}

/**
 * 勝ち負け判定をし、結果に応じたsmileState,gameStateを返す
 * @param i 1次元配列
 * @param tiles tilesのコピー
 * @param ground groundのコピー
 * @param game Game オブジェクト
 * @returns [smileState,gameState]
 */
function calcState(
	i: number, tiles: TileType[], ground: GroundType[], game: Game
): [SmileType, GameType] {
	const isWin = checkWin(tiles, ground, game);
	const isLose = checkLose(i, tiles, ground, game);
	let { smileState, gameState } = game;
	if (isWin) {
		smileState = SMILE_WIN;
		gameState = WIN;
	} else if (isLose) {
		smileState = SMILE_LOSE;
		gameState = LOSE;
	}
	return [smileState, gameState];
}

/**
 * 勝ち判定をする
 * @param tiles tilesのコピー
 * @param ground groundのコピー
 * @param game Gameオブジェクト
 * @returns boolean
 */
function checkWin(tiles: TileType[], ground: GroundType[], game: Game) {
	let mi = game.cols * game.rows;
	let cnt = 0;
	for (let i = 0; i < mi; i++) {
		const ti = tiles[i];
		const gr = ground[i];
		// 開けていないtileがある場合はNG;
		if (ti === NOT_OPEN) return false;
		if (ti === FLAGGED) {
			if (gr === BOMB) {
				cnt++;
			} else {
				// bombじゃない場所にflagがたっていたらNG
				return false;
			}
		}
	}
	return cnt === game.bombs;
}

/**
 * 負け判定をする
 * @param clickedIndex クリックしたtileのindex
 * @param tiles tilesのコピー
 * @param ground groundのコピー
 * @param game Gameオブジェクト
 * @returns boolean
 */
function checkLose(clickedIndex: number, tiles: TileType[], ground: GroundType[], game: Game) {
	const mi = game.rows * game.cols;
	for (let i = 0; i < mi; i++) {
		const ti = tiles[i];
		const gi = ground[i];
		if (ti === OPEN && gi === BOMB) {
			lose(clickedIndex, tiles, ground, game);
			return true;
		}
	}
	return false;
}

/**
 * 負けた時の処理。クリックしたマスを赤地雷にする。
 * 間違えた旗にバッテン地雷にする。
 * 撤去出来なかった地雷を表示する。
 * @param index 1次元index
 * @param tiles tilesのコピー
 * @param ground groundのコピー
 * @param game Gameオブジェクト
 */
function lose(index: number, tiles: TileType[], ground: GroundType[], game: Game) {
	if (ground[index] === BOMB) {
		ground[index] = RED_BOMB;
	}
	const mi = game.rows * game.cols;
	for (let i = 0; i < mi; i++) {
		const ti = tiles[i];
		const gi = ground[i];
		if (ti === NOT_OPEN && gi === BOMB) {
			tiles[i] = OPEN;
		} else if (ti === FLAGGED && gi !== BOMB) {
			tiles[i] = OPEN;
			ground[i] = NG_BOMB;
		}
	}
}

/**
 * iに対応したtileを開く。空白マスなら隣接のtileも開く
 * @param i 開くtileのindex
 * @param tiles tilesのコピー
 * @param ground groundのコピー
 * @param game Gameオブジェクト
 */
function openTile(i: number, tiles: TileType[], ground: GroundType[], game: Game) {
	const [x, y] = twoDim(i, game);
	// 開いていない&&旗が立っていないマスなら
	if (tiles[i] === NOT_OPEN) {
		// そのマスを開く
		tiles[i] = OPEN;
		// 空白マスなら
		if (ground[i] === EMPTY) {
			// 隣接マスを走査
			for (let r = -1; r <= 1; r++) {
				for (let c = -1; c <= 1; c++) {
					// この場合は自分自身（隣接マスでない）のでスキップ
					if (r === 0 && c === 0) continue;
					// 隣接マスの添え時を計算
					const nx = x + c;
					const ny = y + r;
					// 枠外ならスキップ
					if (!isIn(nx, ny, game)) continue;

					// 隣接マスは再帰呼び出しして開く
					const nextIndex = flatten(nx, ny, game);
					openTile(nextIndex, tiles, ground, game);
				}
			}
		}
		// 地雷をクリックしたら負け処理
		// if (board.isBomb(x, y)) {
		//     lose(x, y, board);
		//     return;
		// }
		// 最後に勝利判定処理
		// if (checkWin(board)) {
		//     win(board)
		// }
	}
}

/**
 * groundを生成する。初回クリック時に呼ぶ。
 * @param i クリックしたindex
 * @param game Gameオブジェクト
 * @returns 
 */
function genGround(i: number, game: Game) {
	const { rows, cols, bombs } = game;
	const [cx, cy] = twoDim(i, game);
	const ground = [...game.ground];
	const maxlen = rows * cols;

	// bombをセットする候補の添え字を格納。１次元配列として扱う。
	// まずは全ての添え字を候補としてセット。
	const bIndices = [];
	for (let i = 0; i < maxlen; i++) {
		bIndices.push(i);
	}

	// クリックしたマスが空白にするために、
	// clickされたマスとその隣接マスを候補から除外
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			const nx = cx + c;
			const ny = cy + r;
			if (!isIn(nx, ny, game)) {
				continue;
			}
			// ２二次元配列の行列のindexを１次元のindexに変換の上候補から除外
			const delVal = ny * cols + nx;
			const delIndex = bIndices.indexOf(delVal);
			bIndices.splice(delIndex, 1);
		}
	}

	// 地雷数分ランダムに候補を抽出
	// bIndicesには候補となる1次元添え字が入っているので、
	// 0 <= rnd <biIndices.lengthの範囲でランダムに地雷数分抽出
	for (let i = 0; i < bombs; i++) {
		// 地雷の数だけ、候補配列の長さの範囲で乱数生成
		// 乱数なのでfloat
		const rval = Math.random() * bIndices.length;
		// 添え字として扱えるように小数点切り捨て
		const rIndex = Math.floor(rval);

		// 乱数を添え字にして、候補の添え字を取得
		const bombIndex = bIndices[rIndex];

		// 1次元配列を二次元は利悦に変換
		const bx = bombIndex % cols;
		const by = Math.floor(bombIndex / cols);

		// 抽出した位置に地雷設置
		const findex = flatten(bx, by, game);
		ground[findex] = BOMB;

		// 選ばれた要素がまた選ばれないように候補から落とす。
		bIndices.splice(rIndex, 1);
	}

	// bombの隣接マスに数字をセット
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			// bombマスでない場合、スキップして次の走査へ。
			const findex = flatten(c, r, game);
			if (ground[findex] !== BOMB) continue;

			// bombマスの場合、隣接マスのbomb数を1増やす
			for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					// bombマスの場合は処理しないのでスキップ
					if (dr === 0 && dc === 0) {
						continue;
					}
					// 隣接マスの添え字を計算
					const nr = r + dr;
					const nc = c + dc;
					// 枠からはみ出る場合はスキップ
					if (!isIn(nc, nr, game)) {
						continue;
					}
					// bombマスでなければ数を増やす
					const findex = flatten(nc, nr, game);
					if (ground[findex] !== BOMB) {
						ground[findex] += 1;
					}
				}
			}
		}
	}
	return ground;
}
