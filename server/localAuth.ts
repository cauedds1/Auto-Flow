import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";

export function setupLocalAuth() {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req: any, email, password, done) => {
        try {
          const existingUser = await storage.getUserByEmail(email);
          
          if (existingUser) {
            return done(null, false, { message: "Email já cadastrado" });
          }

          const passwordHash = await bcrypt.hash(password, 10);
          const { firstName, lastName } = req.body;

          const newUser = await storage.createLocalUser({
            email,
            firstName,
            lastName,
            passwordHash,
            authProvider: "local",
          });

          return done(null, {
            claims: {
              id: newUser.id, // Use 'id' instead of 'sub' for consistency
              sub: newUser.id, // Keep 'sub' for compatibility
              email: newUser.email,
              first_name: newUser.firstName,
              last_name: newUser.lastName,
            },
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);

          if (!user) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }

          if (!user.passwordHash) {
            return done(null, false, {
              message: "Esta conta usa login social. Use o botão 'Continuar com Google'",
            });
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);

          if (!isValidPassword) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }

          return done(null, {
            claims: {
              id: user.id, // Use 'id' instead of 'sub' for consistency
              sub: user.id, // Keep 'sub' for compatibility
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
            },
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}
