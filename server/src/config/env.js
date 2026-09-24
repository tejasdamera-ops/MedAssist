import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medassist",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  openAiApiKey: process.env.OPENAI_API_KEY || ""
};
