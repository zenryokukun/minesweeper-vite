import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   build: {
//     outDir: "docs",
//   },
// })

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {

  // ビルド時のみに適用するオプション。GitHub-Page用
  // 開発サーバのBASE_URLは"/"、GitHub-pagesでは”minesweeper-vite”となるため、条件分岐が必要。
  // ビルド資産のhtmlファイルのパスを確認すれば、ビルド版のパス設定が確認できる。
  const buildOption = {};

  if (command === "build") {
    buildOption["base"] = "/minesweeper-vite";
  }

  return {
    plugins: [react()],
    build: {
      // ビルド資産のフォルダ名は、GitHub-pages用にdocsにする。
      outDir: "docs",
    },
    ...buildOption,
  }
})