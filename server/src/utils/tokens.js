import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenExpires }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), tokenType: "refresh" },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenExpires }
  );
}

export function setRefreshCookie(res, token) {
  const isProd = env.nodeEnv === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}
