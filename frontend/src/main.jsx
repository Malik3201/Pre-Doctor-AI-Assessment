import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';
import { HospitalBrandingProvider } from './context/HospitalBrandingContext.jsx';
import BrandingHeadEffect from './components/shared/BrandingHeadEffect.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <HospitalBrandingProvider>
          <BrandingHeadEffect />
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
        </HospitalBrandingProvider>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
);
