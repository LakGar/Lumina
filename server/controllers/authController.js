import User from "../model/userSchema.js";
import { generateToken } from "../utils/jwt.js";
import { oauthConfig, generateAppleSecret } from "../config/oauth.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AppleStrategy } from "passport-apple";

// Configure Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: oauthConfig.google.clientID,
      clientSecret: oauthConfig.google.clientSecret,
      callbackURL: oauthConfig.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            signupType: "google",
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: oauthConfig.apple.clientID,
      teamID: oauthConfig.apple.teamID,
      keyID: oauthConfig.apple.keyID,
      privateKey: oauthConfig.apple.privateKey,
      callbackURL: oauthConfig.apple.callbackURL,
      scope: oauthConfig.apple.scope,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = await User.create({
            firstName: profile.name?.givenName || "User",
            lastName: profile.name?.familyName || "",
            email: profile.email,
            signupType: "apple",
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export const googleAuth = passport.authenticate("google", {
  scope: oauthConfig.google.scope,
});

export const googleCallback = passport.authenticate(
  "google",
  {
    failureRedirect: "/login",
    session: false,
  },
  async (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export const appleAuth = passport.authenticate("apple", {
  scope: oauthConfig.apple.scope,
});

export const appleCallback = passport.authenticate(
  "apple",
  {
    failureRedirect: "/login",
    session: false,
  },
  async (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export const emailSignup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      signupType: "email",
      isVerified: false,
    });

    // TODO: Send verification email

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
