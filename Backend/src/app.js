import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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
export { app }