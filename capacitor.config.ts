import type { CapacitorConfig } from '@capacitor/cli';
<<<<<<< HEAD

const config: CapacitorConfig = {
  appId: 'com.example.fitnesstracker',
  appName: 'Fitness Tracker',
  webDir: 'dist'
};

export default config;
=======
import { config } from 'dotenv';

// Load environment variables
config();

const isProduction = process.env.NODE_ENV === 'production';

const capacitorConfig: CapacitorConfig = {
  appId: 'com.olnbd.fitnesstracker',
  appName: 'Fitness Tracker',
  webDir: 'dist',
  android: {
    buildOptions: isProduction ? {
      // Production keystore from environment variables
      keystorePath: process.env.KEYSTORE_PATH,
      keystoreAlias: process.env.KEYSTORE_ALIAS,
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD
    } : {
      // Development keystore (default location)
      keystorePath: 'app/debug.keystore',
      keystoreAlias: 'androiddebugkey',
      keystorePassword: 'android',
      keystoreAliasPassword: 'android'
    }
  }
};

export default capacitorConfig;
>>>>>>> 8eb212013a2b3467f5b307b8afb116c39294d8e8
