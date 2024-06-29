import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors())       // cors ki setting bhi configure ki ja sakti hai (refer documentation)
app.use(cookieParser());
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))


// router
import userRouter from './routes/user.route.js'

app.use("/api/v1/users" ,userRouter)



export default app; 