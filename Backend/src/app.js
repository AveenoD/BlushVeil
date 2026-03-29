import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/ApiError.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173']

app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400
}))

app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))

//routes and imports
import userRouter from './routes/user.routes.js'
app.use("/api/v1/users", userRouter)


import dressRouter from './routes/dress.routes.js'
app.use("/api/v1/dresses", dressRouter)

import orderRouter from './routes/order.routes.js'
app.use('/api/v1/orders', orderRouter)


app.use((err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development'

    // ✅ Handle known ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            ...(isDev && { stack: err.stack })
        })
    }

    // ✅ Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages,
            ...(isDev && { stack: err.stack })
        })
    }

    // ✅ Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            errors: [],
            ...(isDev && { stack: err.stack })
        })
    }

    // ✅ Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            errors: [],
            ...(isDev && { stack: err.stack })
        })
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            errors: [],
            ...(isDev && { stack: err.stack })
        })
    }

    // ✅ Fallback — Unknown errors
    return res.status(500).json({
        success: false,
        message: isDev ? err.message : 'Internal Server Error',
        errors: [],
        ...(isDev && { stack: err.stack })
    })
})
export { app }