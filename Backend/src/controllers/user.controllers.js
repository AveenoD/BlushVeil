import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/mailer.js"; 
import crypto from "crypto";                                  
import mongoose, { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken"
const generateAccessTokenAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefereshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens!")
    }
}

const Options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
}

// ✅ UPDATED — registerUser now sends verification email
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, phoneNumber } = req.body;

    if ([fullName, email, password, phoneNumber].some((field) =>
        field?.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (existedUser) {
    // New token generation and email resend for unverified users
    if (!existedUser.isVerified) {
        const newToken = crypto.randomBytes(32).toString('hex')
        const newExpiry = new Date(Date.now() + 60 * 60 * 1000)
        
        existedUser.emailVerificationToken = newToken
        existedUser.emailVerificationExpires = newExpiry
        await existedUser.save({ validateBeforeSave: false })

        try {
            await sendVerificationEmail(existedUser.email, newToken)
        } catch (err) {
            console.error("Email failed:", err.message)
        }

        throw new ApiError(400, "Account not verified. A new verification email has been sent.")
    }
    
    throw new ApiError(409, "User with email or phone number already exists")
}

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    const user = await User.create({
        fullName,
        email,
        phoneNumber,
        password,
        emailVerificationToken: verificationToken,     // ✅
        emailVerificationExpires: verificationExpires  // ✅
    });

    // ✅ Send verification email
    try {
        await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
        // Rollback user if email fails
        
        // await User.findByIdAndDelete(user._id)
        throw new ApiError(500, "Failed to send verification email. Please try again.")
    }

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify your account.")
    );
});

// ✅ NEW — verifyEmail controller
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params
    
    if (!token) {
        throw new ApiError(400, "Verification token is required")
    }

    // Find user with matching token and select hidden fields
    const user = await User.findOne({
        emailVerificationToken: token
    }).select("+emailVerificationToken +emailVerificationExpires")
    
    if (!user) {
        throw new ApiError(400, "Invalid verification token")
    }

    // Check expiry
    if (user.emailVerificationExpires < new Date()) {
        throw new ApiError(400, "Verification token has expired. Please register again.")
    }

    // Mark as verified and clear token fields
    user.isVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully! You can now login."))
})

// ✅ UPDATED — loginUser now blocks unverified users
const loginUser = asyncHandler(async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    if (!(email || phoneNumber)) {
        throw new ApiError(400, "Phone number or email is required!")
    }

    const user = await User.findOne({
        $or: [{ phoneNumber }, { email }]
    }).select("+password")

    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }

    // ✅ Block unverified users
    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in. Check your inbox.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password!");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, Options)
        .cookie("refreshToken", refreshToken, Options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { returnDocument: 'after' }
    )
    return res
        .status(200)
        .clearCookie("accessToken", Options)
        .clearCookie("refreshToken", Options)
        .json(new ApiResponse(200, {}, "User Logged Out!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401, "Invalid refresh token")
        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used")

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, Options)
            .cookie("refreshToken", newRefreshToken, Options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const getUserProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully"))
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) throw new ApiError(400, "fullName and email are required!")
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { returnDocument: 'after' }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if ([oldPassword, newPassword].some(field => field.trim() === "")) throw new ApiError(400, "All fields are required");
    const user = await User.findById(req.user?._id).select("+password")
    if (!user) throw new ApiError(404, "User Not Found")
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password")
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully!"))
})

const updateUserAddress = asyncHandler(async (req, res) => {
    const { street, city, state, pincode, country } = req.body
    const updatedFields = {}
    if (street) updatedFields["address.street"] = street
    if (city) updatedFields["address.city"] = city
    if (state) updatedFields["address.state"] = state
    if (pincode) updatedFields["address.pincode"] = pincode
    if (country) updatedFields["address.country"] = country
    if (Object.keys(updatedFields).length === 0) throw new ApiError(400, "No fields to update")
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updatedFields },
        { returnDocument: 'after' }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Address updated successfully"))
})

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body
    
    if (!email) throw new ApiError(400, "Email is required")

    const user = await User.findOne({ email })
    if (!user) throw new ApiError(404, "User not found")
    if (user.isVerified) throw new ApiError(400, "Email already verified")

    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiry = new Date(Date.now() + 60 * 60 * 1000)

    user.emailVerificationToken = newToken
    user.emailVerificationExpires = newExpiry
    await user.save({ validateBeforeSave: false })

    try {
        await sendVerificationEmail(email, newToken)
    } catch (err) {
        throw new ApiError(500, "Failed to send email. Try again.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Verification email sent! Check your inbox."))
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })

    
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If an account with that email exists, a reset link has been sent.")
        )
    }

    
    const rawToken = crypto.randomBytes(32).toString('hex')

   
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex')

    
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    
    try {
        await sendResetPasswordEmail(email, rawToken)
    } catch (err) {
        // Rollback token if email fails
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save({ validateBeforeSave: false })
        throw new ApiError(500, "Failed to send reset email. Please try again.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "If an account with that email exists, a reset link has been sent."))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    if (!password) throw new ApiError(400, "Password is required")

    // Hash incoming token to compare with DB
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() } // not expired
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token")
    }

    // Set new password — pre save hook will hash it
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully! You can now login."))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    updateUserAddress,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
}