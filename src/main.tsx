import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Toaster } from 'sonner'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <TRPCProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0f1e',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      />
      <App />
    </TRPCProvider>
  </HashRouter>,
)
