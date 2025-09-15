import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
     
    updateAccountDetails,
    
    me,
    createNote,
    getNotes,
    deleteNote,
    updateNote

} from "../controllers/user.controller.js";


import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createUserAccount,getAllUsers } from "../controllers/admin.controller.js";

const router = Router()

router.route("/register").post(
    // upload.fields([
    //     {
    //         name: "avatar",
    //         maxCount: 1
    //     }
    // ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/me").post(verifyJWT,  me)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/notes").post(verifyJWT, createNote)
router.route("/notes").get(verifyJWT, getNotes)
router.route("/del-note/:id").delete(verifyJWT, deleteNote)
router.route("/notes/:id").put(verifyJWT, updateNote)













export default router