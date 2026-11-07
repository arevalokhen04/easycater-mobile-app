import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easycater.app',
  appName: 'EasyCater',
  webDir: 'www',
  // The backend API is plain http (adb reverse -> localhost:4000). The default
  // androidScheme is https, and an https page calling http endpoints is blocked
  // as mixed content - so the WebView runs on http://localhost instead.
  server: {
    androidScheme: 'http',
  },
};

export default config;
