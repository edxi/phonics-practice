import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xijiatech.phonics',
  appName: '自然拼读',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
