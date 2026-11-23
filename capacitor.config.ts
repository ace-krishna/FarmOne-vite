import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sudoashish.farmone',
  appName: 'FarmOne',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
