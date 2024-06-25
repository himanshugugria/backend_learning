

/*
Two important points about database connectivity: 
1. When connecting to databases, handling potential data-not-found scenarios is essential. Employ try/catch blocks or promises to manage errors or we can also use promises.
- key to remember : ( wrap in try-catch )
2. Database operations involve latency, and traditional synchronous code can lead to blocking, where the program waits for the database query to complete before moving on. So, we should async/await which allows for non-blocking execution, enabling the program to continue with other tasks while waiting for the database response. 
- key to remember :  ( always remember the database is in another continent, so use async await)
Used two approach to connect the database - 1. In Index File, 2. In Seprate DB file
*/



/*
import express from "express";
const app =express();

// using IIFE to connect mongoose to db
( async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("errror",(error)=>{
        console.log('ERRR',error)      // it is a better practice hi hum jagah errror k spelling alag alag rakhe so baad me debugging karna easy ho
        throw error
       })
       app.listen(process.env.PORT,()=>{
            console.log("app is listening on PORT:",`${process.env.PORT}`)
       })
    } catch (error) {
        console.log(error)
        throw error
    }
})()
*/

// require('dotenv').config({path:'./env'})      // ye hai official documentation me
import  connectDB  from "./db/index.js";
import dotenv from "dotenv"              // as ye documentation me abhi tak mention nhi hui hai to we can run this using experimental feature in package.json
import app from "./app.js";
dotenv.config({path:'./env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`app is running on PORT ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed",err)
})







