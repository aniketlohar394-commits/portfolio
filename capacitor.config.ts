import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homemate.app',
  appName: 'HomeMate',
  webDir: 'public',
  server: {
    url: 'https://portfolio1-alpha-pink-65.vercel.app',
    cleartext: true,
    allowNavigation: [
      'portfolio1-alpha-pink-65.vercel.app',
      '*.vercel.app'
    ]
  }
};

export default config;
