import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadOnCloudinary, { deleteFromCloudinary } from '../utils/cloudinary.js'
import { Dress } from '../models/dress.models.js'
import { isValidObjectId } from "mongoose";

const addDress = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock } = req.body

    if ([name, description, category].some(field => field.trim() === "")) {
        throw new ApiError(400, "All the fields are required")
    }
    if (!price || !stock) throw new ApiError(400, "Price and stock are required")
    const dressImageLocalPath = req.file?.path
    if (!dressImageLocalPath) {
        throw new ApiError(400, "Dress Image is required")
    }

    const dressImage = await uploadOnCloudinary(dressImageLocalPath)

    if (!dressImage.url) {
        throw new ApiError(400, "Error while uploading Image")

    }

    const createdDress = await Dress.create({
        name,
        description,
        price,
        category,
        stock,
        image: {
            url: dressImage.url,
            public_id: dressImage.public_id
        },
    })

    const dressAdded = await Dress.findById(createdDress._id)
    if (!dressAdded) {
        throw new ApiError(500, "Failed to add the dress")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, dressAdded, "Dress added successfully"))





})

const updateDress = asyncHandler(async (req, res) => {
    const { dressId } = req.params;
    const { name, description, price, category, stock } = req.body;
    const dressImageLocalPath = req.file?.path;
    if (!isValidObjectId(dressId)) {
        throw new ApiError(400, "Invalid dress Id")
    }
    if ([name, description, category].some(field => field.trim() === "")) {
        throw new ApiError(400, "All the fields are required")
    }
    if (!price || !stock) throw new ApiError(400, "Price and stock are required")
    let imageUpdate = {}
    const isDressExist = await Dress.findById(dressId)
    if (!isDressExist) throw new ApiError(404, "Dress not found")
    if (dressImageLocalPath) {
        await deleteFromCloudinary(isDressExist.image.public_id)

        const newImage = await uploadOnCloudinary(dressImageLocalPath)
        if (!newImage.url) {
            throw new ApiError(400, "Error while uploading image")
        }

        imageUpdate = {
            url: newImage.url,
            public_id: newImage.public_id
        }
    }
    const updatedFields = {}
    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;
    if (price) updatedFields.price = price;
    if (category) updatedFields.category = category;
    if (stock) updatedFields.stock = stock;



    const updatedDress = await Dress.findByIdAndUpdate(
        dressId,
        {
            $set: {
                ...updatedFields,
                ...(imageUpdate.url && { image: imageUpdate })

            }
        }, { new: true }

    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedDress, "Dress updated successfully"))

})


const deleteDress = asyncHandler(async (req, res) => {
    const { dressId } = req.params;
    if (!isValidObjectId(dressId)) {
        throw new ApiError(400, "Invalid dress Id")
    }

    const isDressExist = await Dress.findById(dressId)
    if (!isDressExist) {
        throw new ApiError(404, "Dress not found")
    }

    await deleteFromCloudinary(isDressExist.image.public_id)
    await Dress.findByIdAndDelete(dressId)
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Dress deleted successfully"))

})



const getDressById = asyncHandler(async (req, res) => {
    const { dressId } = req.params;
    if (!isValidObjectId(dressId)) {
        throw new ApiError(400, "Invalid dress Id")
    }

    const dress = await Dress.findById(dressId)

    if (!dress) {
        throw new ApiError(404, "Dress not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, dress, "Dress fetched successfully"))
})


const getAllDresses = asyncHandler(async (req, res) => {
    const dresses = await Dress.find()

    return res
        .status(200)
        .json(new ApiResponse(200, dresses, "Dresses fetched successfully"))
})

export {
    addDress,
    deleteDress,
    updateDress,
    getDressById,
    getAllDresses
}