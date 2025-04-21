import dotenv from "dotenv";
dotenv.config();

export const oauthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    scope: ["profile", "email"],
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: `${process.env.API_URL}/auth/apple/callback`,
    scope: ["name", "email"],
  },
};

export const generateAppleSecret = () => {
  const jwt = require("jsonwebtoken");
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: oauthConfig.apple.teamID,
      iat: now,
      exp: now + 15777000, // 6 months
      aud: "https://appleid.apple.com",
      sub: oauthConfig.apple.clientID,
    },
    oauthConfig.apple.privateKey,
    {
      algorithm: "ES256",
      keyid: oauthConfig.apple.keyID,
    }
  );
};
