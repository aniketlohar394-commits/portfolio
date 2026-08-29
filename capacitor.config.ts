import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homemate.app',
  appName: 'HomeMate',
  webDir: 'public',
  server: {
    url: 'http://10.56.102.15:3000',
    cleartext: true,
    allowNavigation: [
      '10.56.102.15:3000',
      '10.0.2.2:3000',
      'localhost:3000',
      '*.homemate.app'
    ]
  }
};

export default config;
