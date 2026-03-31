import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose"; // Added mongoose import
import { User } from '../models/user.models.js'
import { Order } from '../models/order.models.js'
import { Dress } from '../models/dress.models.js'

const placeOrder = asyncHandler(async (req, res) => {
    const { items: clientItems } = req.body; // Renamed to avoid conflict, client-provided items

    if (!clientItems || clientItems.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const { street, city, state, pincode, country } = user.address || {};
    if (!street || !city || !state || !pincode) {
        throw new ApiError(400, "Please add delivery address first");
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        let calculatedTotalAmount = 0;
        const orderItems = [];

        // Step 1: Validate items, check stock, and calculate total amount on server-side
        for (const item of clientItems) {
            if (!item.quantity || item.quantity <= 0) {
                throw new ApiError(400, "Invalid quantity");
            }

            const dress = await Dress.findById(item.dress).session(session);
            if (!dress) {
                throw new ApiError(404, "Product not found");
            }

            if (dress.stock < item.quantity) {
                throw new ApiError(400, `${dress.name} is out of stock`);
            }

            // Calculate total amount based on actual dress price from DB
            calculatedTotalAmount += dress.price * item.quantity;

            // Prepare items for order creation, ensuring all necessary fields are present
            orderItems.push({
                dress: dress._id,
                name: dress.name,
                image: dress.image?.url, // Assuming image url is available on dress object
                price: dress.price,
                size: item.size, // Client-provided size
                color: item.color || 'N/A', // Client-provided color
                quantity: item.quantity,
            });
        }

        // Step 2: Deduct stock (within the transaction)
        for (const item of clientItems) {
            await Dress.findByIdAndUpdate(
                item.dress,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // Step 3: Create order AFTER everything is valid (within the transaction)
        const order = await Order.create([
            {
                user: req.user._id,
                items: orderItems, // Use server-validated items
                totalAmount: calculatedTotalAmount, // Use server-calculated total
                deliveryAddress: {
                    street,
                    city,
                    state,
                    pincode,
                    country
                },
                whatsappSent: true
            }
        ], { session });

        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(new ApiResponse(201, order[0], "Order placed successfully")); // order[0] because create with array returns array

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error; // Re-throw the error for asyncHandler to catch
    }
});

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

const getAllOrders = asyncHandler(async (req, res) => {
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