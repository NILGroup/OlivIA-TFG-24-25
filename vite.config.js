import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  base: "/OlivIA-TFG-24-25/",
  plugins: [
    // tailwindcss(),
    react(), tsconfigPaths()
  ],
})
