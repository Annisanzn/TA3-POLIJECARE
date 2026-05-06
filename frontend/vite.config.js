import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    strictPort: true, // Gagal jika port 5173 sudah dipakai, daripada pindah ke port lain
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Hapus console.log dan console.error di production build
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
