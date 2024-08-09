// config/auth.js
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const userModel = require('./database'); // Adjust the path as needed
const dotenv = require('dotenv');

dotenv.config();

// JWT Strategy
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
};

passport.use(new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
  try {
    const user = await userModel.findById(jwt_payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ googleId: profile.id });
        if (!user) {
          user = new userModel({
            googleId: profile.id,
            name: profile.displayName,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Custom Middleware
const checkAuthentication = (req, res, next) => {
  // Check JWT Authentication
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
      return next(); // User is authenticated with JWT
    } else {
      // Check Google Authentication
      // Google SSO authentication is not generally used directly in middleware.
      // It is typically used in specific routes.
      // If you need to authenticate with Google SSO, you should handle it in a route.
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
  })(req, res, next);
};

module.exports = checkAuthentication;
