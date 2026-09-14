import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khmerdramatranslator.app',
  appName: 'Khmer Drama Translator',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#070312',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: '#070312',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070312',
      overlaysWebView: false,
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
