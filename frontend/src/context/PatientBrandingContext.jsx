import { createContext, useContext } from 'react';

const PatientBrandingContext = createContext({
  hospitalName: 'Your Hospital',
  assistantName: 'AI assistant',
  colors: { primary: '#0f172a', secondary: '#38bdf8' },
  appointmentWhatsApp: '',
});

export const PatientBrandingProvider = PatientBrandingContext.Provider;

export function usePatientBranding() {
  return useContext(PatientBrandingContext);
}

export default PatientBrandingContext;

