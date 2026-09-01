import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  appId: process.env.VITE_APP_ID || "cycle-of-chart",
  cookieSecret:
    process.env.JWT_SECRET ||
    process.env.COOKIE_SECRET ||
    "cycle_of_chart_secure_jwt_token_secret_key_2026_production",
  databaseUrl: process.env.DATABASE_URL || "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "",
  ownerOpenId: process.env.OWNER_OPEN_ID || "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "",
};
