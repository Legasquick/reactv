import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/reactv/', // <--- ВОТ ЭТУ СТРОКУ ОБЯЗАТЕЛЬНО ДОБАВЬ
})git add .