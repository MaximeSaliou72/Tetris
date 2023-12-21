// authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import { pool } from "../database.js"; // Assurez-vous que le chemin est correct

const rawConfig = fs.readFileSync(new URL("../config.json", import.meta.url)); // Ajustez le chemin si nécessaire
const config = JSON.parse(rawConfig);

class AuthController {
  constructor() {
    this.pool = pool;
    this.config = config;
  }

  static generateToken(userId, userName) {
    try {
      return jwt.sign({ id: userId, username: userName }, config.jwt_secret, {
        expiresIn: "8h",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du token:", error);
      return null;
    }
  }

  static async tokenRenewalMiddleware(ctx, next) {
    const token = ctx.request.headers.authorization?.split(" ")[1];
    if (!token) {
      ctx.status = 401;
      ctx.body = { message: "Token manquant" };
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwt_secret, {
        ignoreExpiration: true,
      });

      const timeDiff = payload.exp * 1000 - Date.now(); // Différence en millisecondes
      if (timeDiff < 15 * 60 * 1000) {
        // Si moins de 15 minutes restantes
        ctx.set("X-Renewed-Token", AuthController.generateToken(payload.id));
      }

      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = { message: "Token invalide" };
    }
  }

  static async signup(ctx) {
    const { username, password, email } = ctx.request.body;

    // Vérifier si le nom d'utilisateur ou l'e-mail existe déjà
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE user_name = $1 OR user_email = $2",
      [username, email],
    );

    if (existingUser.rows.length) {
      const isUsernameTaken = existingUser.rows.some(
        (row) => row.user_name === username,
      );
      const isEmailTaken = existingUser.rows.some(
        (row) => row.user_email === email,
      );

      let errorMessage = "Erreur : ";
      if (isUsernameTaken) {
        errorMessage += "Nom d'utilisateur déjà utilisé. ";
      }
      if (isEmailTaken) {
        errorMessage += "E-mail déjà utilisé.";
      }

      ctx.status = 400;
      ctx.body = { message: errorMessage };
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      await pool.query(
        "INSERT INTO users (user_name, hashed_password, user_email) VALUES ($1, $2, $3)",
        [username, hashedPassword, email],
      );
      ctx.body = { message: "Inscription réussie" };
    } catch (error) {
      const serverError = new Error("Erreur lors de l'inscription");
      throw serverError;
    }
  }

  static async login(ctx) {
    const { email, password } = ctx.request.body;

    try {
      const userResult = await pool.query(
        "SELECT * FROM users WHERE user_email = $1",
        [email],
      );
      const user = userResult.rows[0];

      if (user && (await bcrypt.compare(password, user.hashed_password))) {
        const token = AuthController.generateToken(
          user.user_id,
          user.user_name,
        );
        ctx.body = { message: "Connexion réussie", token };
      } else {
        ctx.status = 401;
        ctx.body = { message: "Identifiants invalides" };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      ctx.status = 500;
      ctx.body = { message: "Erreur de serveur" };
    }
  }

  static async userinfo(ctx) {
    try {
      const userId = ctx.state.user.id; // l'ID de l'utilisateur est extrait du token JWT
      const userResult = await pool.query(
        "SELECT * FROM users WHERE user_id = $1",
        [userId],
      );
      const user = userResult.rows[0];
      if (user) {
        ctx.body = {
          id: user.user_id,
          username: user.user_name,
          email: user.user_email,
          password: user.hashed_password,
        };
      } else {
        ctx.status = 404;
        ctx.body = { message: "Utilisateur non trouvé" };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: "Erreur de serveur" };
    }
  }
}

export default AuthController;
