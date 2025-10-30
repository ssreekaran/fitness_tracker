import type { CapacitorConfig } from "@capacitor/cli";
import { config } from "dotenv";

// Load environment variables
config();

const isProduction = process.env.NODE_ENV === "production";

const capacitorConfig: CapacitorConfig = {
  appId: "com.olnbd.fitnesstracker",
  appName: "Fitness Tracker",
  webDir: "dist",
  server: {
    // For mobile builds, use the production Firebase hosting URL
    url: "https://fitness-tracker-clean.web.app",
    cleartext: true,
  },
  android: {
    buildOptions: isProduction
      ? {
          // Production keystore from environment variables
          keystorePath: process.env.KEYSTORE_PATH,
          keystoreAlias: process.env.KEYSTORE_ALIAS,
          keystorePassword: process.env.KEYSTORE_PASSWORD,
          keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD,
        }
      : {
          // Development keystore (default location)
          keystorePath: "app/debug.keystore",
          keystoreAlias: "androiddebugkey",
          keystorePassword: "android",
          keystoreAliasPassword: "android",
        },
  },
};

export default capacitorConfig;
