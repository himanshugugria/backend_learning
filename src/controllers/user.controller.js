import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { stringify } from 'flatted';  // Import flatted

const registerUser = asyncHandler(async (req,res,next)=>{
    // res.status(200).json({
    //     message:"okk",
    // })

    // steps to be followed to register user

    // take input from frontend (we dont have frontend here so we can use postman)
    // validation
    // check for image,check for avatar
    // upload them to cloudinary (fir cloudinary hme ek url dega for those files)
    // create a user object - upload all these things to db
    // remove password and refersh tokens from response
    // check for user creation
    // return response

    const {username,email,fullName,password} = req.body
    // console.log("email:",email);

    // if (fullName === '') {
    //     throw new ApiError(400,"fullName is required")   // as hum ApiError me ek constructor call kar rahe hai
    // }

    // or instead of checking every field we can use
    if (
        [username,email,fullName,password].some((fields)=>
            fields?.trim()==="")
    ) {
       throw new ApiError(400,"all fields are required") 
    }

    const existedUser = await User.findOne({      // matlab user exist before
        $or: ({username},{email})
    })
    if (existedUser) {
        throw new ApiError(409,"user already exist")
    }
     
    const avatarlocalPath =req.files?.avatar[0]?.path;
    // const coverImagelocalPath =req.files?.coverImage[0]?.path;

    let coverImagelocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght >0){
        coverImagelocalPath= req.files.coverImage[0].path;
    }

    if(!avatarlocalPath){
        throw new ApiError(400,"avatar file is required lc")
    }

    // now we have the local file path so we can upload them on cloudinary
    const avatar =await uploadOnCloudinary(avatarlocalPath)
    const coverImage = await uploadOnCloudinary(coverImagelocalPath)


    if(!avatar){                              // we are only checking for avatar field as hmne avatar field ko hi required kiya tha user.model me 
        throw new ApiError(400,"avatar file is required")
    }


    // creating a user object and uploading on db
    const user =await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username,
    })

    // checking for created user
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"                     // ye aise likna is syntax here as // remove password and refersh tokens from response
    )
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    // Remove circular references (if any)
    const safeUser = JSON.parse(stringify(createdUser));

    // now return
    return res.status(201).json(
        new ApiResponse(200,safeUser,"user created successfully")
    )
})
export {registerUser}