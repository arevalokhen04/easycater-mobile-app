import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Separate app from the customer mobile-app - own icon, own install.
  appId: 'com.easycater.admin',
  appName: 'EasyCater Admin',
  webDir: 'www',
  // The backend API is plain http (adb reverse -> localhost:4000). The default
  // https scheme would block those calls as mixed content.
  server: {
    androidScheme: 'http',
  },
};

export default config;
