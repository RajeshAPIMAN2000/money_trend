import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AuthModalProvider } from './context/AuthModalContext.jsx'
import { CibilCheckProvider } from './context/CibilCheckContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <CibilCheckProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </CibilCheckProvider>
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
