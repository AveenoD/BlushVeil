import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    updateUserAddress,
    verifyEmail,
    resendVerificationEmail
} from '../controllers/user.controllers.js'

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/profile').get(verifyJWT, getUserProfile)
router.route('/update-profile').patch(verifyJWT, updateUserProfile)
router.route('/update-password').patch(verifyJWT, updatePassword)
router.route('/update-address').patch(verifyJWT, updateUserAddress)
router.route('/resend-verification').post(resendVerificationEmail)
router.route('/verify-email/:token').get(verifyEmail)

export default router;