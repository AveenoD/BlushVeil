import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
const generateAccessTokenAndRefreshToken = async (userID) => {
    try {

        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefereshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token!")
    }
}
const Options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
}
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
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email,
        phoneNumber,
        password,
    });



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }


    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );



});

const loginUser = asyncHandler(async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    if (!(email || phoneNumber)) {
        throw new ApiError(400, "Phone number or email is required!")
    }

    const user = await User.findOne({
        $or: [{ phoneNumber }, { email }]
    }).select("+password")
    if (!user) {
        throw new ApiError(404, "User does not exist's!")
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
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken

                },
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {

            $unset: { refreshToken: 1 }

        },
        {
            new: true
        }

    )
    return res
        .status(200)
        .clearCookie("accessToken", Options)
        .clearCookie("refreshToken", Options)
        .json(new ApiResponse(200, {}, "User Logged Out!"))
})

const getUserProfile = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"))

});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "fullName and email are required!")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if ([oldPassword, newPassword].some(field => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(req.user?._id).select("+password")
    if(!user)
    {
        throw new ApiError(404, "User Not Found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invalid old password")

    }
      user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {},"Password changed successfully!"))
})

const updateUserAddress = asyncHandler(async(req, res) =>{
    const {street, city, state, pincode, country} = req.body

    const updatedFields = {}
    if(street) updatedFields["address.street"] = street
    if(city) updatedFields["address.city"] = city
    if(state) updatedFields["address.state"] = state
    if(pincode) updatedFields["address.pincode"] = pincode
    if(country) updatedFields["address.country"] = country

    if(Object.keys(updatedFields).length === 0){
        throw new ApiError(400, "No fields to update")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updatedFields },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Address updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    updateUserAddress
}


