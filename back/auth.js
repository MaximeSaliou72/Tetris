// Importations ES modules
import Router from "koa-router";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import { pool } from "./database.js";

// Importation de la configuration
const rawConfig = fs.readFileSync(new URL("./config.json", import.meta.url));
const config = JSON.parse(rawConfig);

const router = new Router();

// Routes d'inscription et de connexion
router.post("/signup", async (ctx) => {
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

  const hashedPassword = await bcrypt.hash(password, 10);

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
});

router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email],
    );
    const user = userResult.rows[0];

    if (user && (await bcrypt.compare(password, user.hashed_password))) {
      // Utiliser config.jwt_secret pour le JWT
      const token = jwt.sign({ id: user.user_id }, config.jwt_secret, {
        expiresIn: "2h",
      });
      ctx.body = { message: "Connexion réussie", token };
    } else {
      ctx.status = 401;
      ctx.body = { message: "Identifiants invalides" };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: "Erreur de serveur" };
  }
});

// Route pour récupérer les informations de l'utilisateur
router.get("/userinfo", async (ctx) => {
  try {
    const userId = ctx.state.user.id; // l'ID de l'utilisateur est extrait du token JWT
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId],
    );
    const user = userResult.rows[0];

    if (user) {
      ctx.body = {
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
});

export default router;
