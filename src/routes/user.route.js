import { Router } from "express";
import { logOutUser, refershAccessToken, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutUser)   // verifyJWT (middleware) is used

router.route("/refresh-token").post(refershAccessToken)




export default router;