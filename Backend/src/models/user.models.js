import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    fullName:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }, 

    password: {
        type: String,
        select: false,
        required: [true, "Password is required"]

    },

    phoneNumber:{
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, "Invalid phone number"] 
    },

    address:{
        street:{
            type: String
        },
        city:{
            type: String
        },
        state:{
            type: String
        },
        pincode:{
            type: String
        },
        country :{
            type: String
        }
    },

    role:{
        type :String,
        enum:["user", "admin"],
        default: "user"
    },

    profilePicture:{
        type: String
    },

    isVerified:{
        type: Boolean,
        default: false
    },

    // ADDED: Email verification fields (production-ready, 1-hour expiry)
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date
    },

    // ADDED: Google login support (as per existing incomplete Google flow)
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    refreshToken: {
        type: String
    },
},{ timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        // CHANGED: fixed invalid 'username' field (was causing JWT generation failure)
        // now uses existing 'email' field for correct token payload
        email: this.email,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefereshToken = function(){
    return jwt.sign({
        _id: this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User = mongoose.model("User", userSchema);