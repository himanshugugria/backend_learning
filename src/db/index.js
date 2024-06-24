import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        // If your username or password contains special characters, they need to be URL-encoded.
        const ConnectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST : ${ConnectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error!",error)
        process.exit(1);
    }
}

export default connectDB
