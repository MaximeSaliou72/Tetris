// authRoutes.js
import Router from "koa-router";
import AuthController from "../controllers/authController.js"; // Assurez-vous que le chemin est correct

const router = new Router();

router.post("/signup", AuthController.signup);

router.post("/login", AuthController.login);

router.get(
  "/userinfo",
  AuthController.tokenRenewalMiddleware,
  AuthController.userinfo,
);

export default router;
