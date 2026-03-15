import mongoose, { Schema } from "mongoose";



const orderSchema = new Schema({
    orderNumber: {
        type: String,

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
         required: true 
    },
    items: [{
        dress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dress',
        },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }


    }],
    totalAmount: {
        type: Number
    },
    deliveryAddress: {
        street: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        pincode: {
            type: String
        },
        country: {
            type: String
        }
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "dispatched", "out_for_delivery", "delivered", "cancelled"],
        default:"pending"
    },
    estimatedDelivery: {
        type: Date
    },
    dispatchedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    whatsappSent:{
        type: Boolean,
        default:false
    }

}, { timestamps: true })

orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments()
        this.orderNumber = `BV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
    }
})

export const Order = mongoose.model("Order", orderSchema);