import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const pages = ['index', 'thanks', 'privacy', '404']

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, fileURLToPath(new URL(`./${page}.html`, import.meta.url))])
      )
    }
  }
})
