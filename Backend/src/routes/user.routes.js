import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    updateUserAddress,
    // ADDED: import for new verifyEmail controller
    verifyEmail
} from '../controllers/user.controllers.js'
const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/profile').get(verifyJWT, getUserProfile)
router.route('/update-profile').patch(verifyJWT, updateUserProfile)
router.route('/update-password').patch(verifyJWT,updatePassword)
router.route('/update-address').patch(verifyJWT,updateUserAddress)

// ADDED: new route for email verification (token-based, GET)
router.route('/verify-email/:token').get(verifyEmail)

export default router;