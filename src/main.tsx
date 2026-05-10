import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { Toaster } from 'sonner'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

// Set dark class before render to prevent flash
const isDark = localStorage.getItem("theme") === "dark" ||
  (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
if (isDark) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <TRPCProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        }}
      />
      <App />
    </TRPCProvider>
  </HashRouter>,
)
