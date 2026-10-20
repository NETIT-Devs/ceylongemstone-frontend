import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import SiteInquiryLauncher from './components/SiteInquiryLauncher.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <WhatsAppFloat />
      <SiteInquiryLauncher />
    </BrowserRouter>
  </StrictMode>,
)
