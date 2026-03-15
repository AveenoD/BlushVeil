import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { User } from '../models/user.models.js'
import { Order } from '../models/order.models.js'


const placeOrder = asyncHandler(async (req, res) => {
    const { items, totalAmount } = req.body

    // Validation
    if (!items || items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }


    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(404, "User not found")

    const { street, city, state, pincode, country } = user.address || {}
    if (!street || !city || !state || !pincode) {
        throw new ApiError(400, "Please add delivery address first")
    }


    const order = await Order.create({
        user: req.user._id,
        items,
        totalAmount,
        deliveryAddress: {
            street,
            city,
            state,
            pincode,
            country
        },
        whatsappSent: true
    })

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"))
})

const getUserOrders = asyncHandler(async (req, res) => {
    
    const userOrders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('items.dress', 'name image')


    return res
        .status(200)
        .json(
            new ApiResponse(200, userOrders, "User orders fetched successfully")
        )
})

const getAllOrders = asyncHandler(async(req, res) =>{
    const allOrders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'fullName email phoneNumber')

    return res 
    .status(200)
    .json(
        new ApiResponse(200, allOrders, "Orders fetched successfully")
    )
})

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, estimatedDelivery } = req.body;


    if (!isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid Order Id")
    }

    
    const order = await Order.findById(orderId)
    if (!order) throw new ApiError(404, "Order not found")

    
    const updateFields = { status }

    
    if (status === 'dispatched') {
        updateFields.dispatchedAt = Date.now()
        if (estimatedDelivery) {
            updateFields.estimatedDelivery = estimatedDelivery
        }
    }

    if (status === 'delivered') {
        updateFields.deliveredAt = Date.now()
    }

    
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: updateFields },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order status updated"))
})


export {
    placeOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
}