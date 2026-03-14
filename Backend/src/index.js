import connectDB from "./database/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

connectDB()
.then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`🚀 Server running on ${PORT}`);
    });
});