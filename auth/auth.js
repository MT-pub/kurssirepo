const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const db = require('../db')
const bcrypt = require('bcrypt')
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const SALT_ROUNDS = 12

passport.use('signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      db.query('select * FROM käyttäjä where sähköposti=$1', [email],
        async (err, result) => {
          if (err) {
            done(err)
          }
          if (result.rows.length > 0) {
            console.log("Sähköposti jo rekisteröity")
            done("Sähköposti jo rekisteröity")
          }

          let passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
          let user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: password
          }
          db.query(
            "INSERT INTO käyttäjä (etunimi, sukunimi, sähköposti, salasana_hash) VALUES ($1,$2,$3,$4)",
            [req.body.firstName, req.body.lastName, email, passwordHash],
            (dberr, dbres) => {
              if (dberr) {
                done(dberr)
              }
              done(null, user)
            }
          )
        }
      )
    }
  )
)

passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      db.query('select * FROM käyttäjä where sähköposti=$1', [email],
        async (err, result) => {
          if (err) {
            done(err)
          }

          if (!result.rows.length === 1) {
            return done(null, false, { message: 'Väärä käyttäjä tai salasana' });
          }

          const validate = await bcrypt.compare(password, result.rows[0].salasana_hash)

          if (!validate) {
            return done(null, false, { message: 'Väärä käyttäjä tai salasana' });
          }

          let user = {
            id: result.rows[0].käyttäjäid,
            email: email,
            role: result.rows[0].rooli,
            password: password
          }
          return done(null, user, { message: 'Kirjauduttu sisään' });
        }
      )
    }
  )
)

passport.use(
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
)
