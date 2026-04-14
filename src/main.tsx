import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { TeacherProvider } from '@/contexts/TeacherContext'
import { UIProvider } from '@/contexts/UIContext'
import App from '@/App'
import '@/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TeacherProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </TeacherProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
