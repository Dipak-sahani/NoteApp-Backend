import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createUserAccount,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    upgradePlan


 } from "../controllers/admin.controller.js";

const router = Router()

router.route("/register-user").post(verifyJWT, createUserAccount)
router.route("/all-user").get(verifyJWT, getAllUsers)
router.route("/tenants/:slug/upgrade").post(verifyJWT, upgradePlan)









export default router