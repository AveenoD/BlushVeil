import mongoose, { Schema } from "mongoose";

const dressSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
    },
    category: {
        type: String,
        enum: ["Casual", "Formal", "Party", "Nighty", "Undergarment"],
        required: true,
        default: "Casual"
    },
    image: {
        url: String,
        public_id: String,

    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    sizes: {
        type: [String],
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
        default: ["S", "M", "L", "XL"]
    },
    colors: {
        type: [String],
        default: []
    },



}, { timestamps: true });

export const Dress = mongoose.model("Dress", dressSchema);