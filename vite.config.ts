import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuração para expor variáveis de ambiente
  // As variáveis devem começar com VITE_ para serem expostas ao cliente
  envPrefix: 'VITE_',
})
