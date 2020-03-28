import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import createWelcomeBoard from "./createWelcomeBoard";

const configurePassport = db => {
  const users = db.collection("users");
  const boards = db.collection("boards");

  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });
  passport.deserializeUser((id, cb) => {
    users.findOne({ _id: id }).then(user => {
      cb(null, user);
    });
  });



  passport.use(
    new LocalStrategy(
      (username, password, done) => {
        users.findOne({ _id: username }, function (err, user) {
          if (err) { return done(err); }
          if (user) {
            if (user.password !== password) {
              return done(null, false) //{ message: 'Incorrect password.' });
            }
            done(null, user);
          } else {
            const newUser = {
              _id: username,
              username: username,
              name: username,
              password: password,
              imageUrl: "https://avatars1.githubusercontent.com/u/10613915?s=460&u=373058c1b2cc2a9ef31027a01589fbd30ff207e4&v=4",
            };
            users.insertOne(newUser).then(() => {
              boards
                .insertOne(createWelcomeBoard(newUser._id))
                .then(() => done(null, newUser));
            });
          }
          return done(null, user);
        });
      }
    ));


  /*
   passport.use(
     new TwitterStrategy(
       {
         consumerKey: process.env.TWITTER_API_KEY,
         consumerSecret: process.env.TWITTER_API_SECRET,
         callbackURL: `${process.env.ROOT_URL}/auth/twitter/callback`
       },
       (token, tokenSecret, profile, cb) => {
         users.findOne({ _id: profile.id }).then(user => {
           if (user) {
             cb(null, user);
           } else {
             const newUser = {
               _id: profile.id,
               name: profile.displayName,
               imageUrl: profile._json.profile_image_url
             };
             users.insertOne(newUser).then(() => {
               boards
                 .insertOne(createWelcomeBoard(profile.id))
                 .then(() => cb(null, newUser));
             });
           }
         });
       }
     )
   );
   passport.use(
     new GoogleStrategy(
       {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: `${process.env.ROOT_URL}/auth/google/callback`
       },
       (accessToken, refreshToken, profile, cb) => {
         users.findOne({ _id: profile.id }).then(user => {
           if (user) {
             cb(null, user);
           } else {
             const newUser = {
               _id: profile.id,
               name: profile.displayName,
               imageUrl: profile._json.image.url
             };
             users.insertOne(newUser).then(() => {
               boards
                 .insertOne(createWelcomeBoard(profile.id))
                 .then(() => cb(null, newUser));
             });
           }
         });
       }
     )
   );*/
};

export default configurePassport;
