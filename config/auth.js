const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth2');
const userModel = require('./database'); // Adjust the path as needed
const dotenv = require('dotenv');

dotenv.config();

// JWT Strategy
const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Bearer header
    secretOrKey: process.env.SECRET_KEY // Replace with your actual secret key
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
      callbackURL: "https://authentication-dineshwar.vercel.app/auth/google/callback",
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
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });

    if (user) {
      req.user = user;
      return next(); // User is authenticated with JWT
    } else {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
  })(req, res, next);
};

module.exports = checkAuthentication;
