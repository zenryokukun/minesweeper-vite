import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "docs",
  },
  // github-pagesに登録するために必要。
  // viteのドキュメントを参照：https://ja.vitejs.dev/guide/static-deploy.html
  // base: "/minesweeper-vite/",
})
