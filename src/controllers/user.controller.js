import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { stringify } from 'flatted';  // Import flatted
import jwt from 'jsonwebtoken'

const registerUser = asyncHandler(async (req,res)=>{
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
        $or: [{username},{email}]
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
        coverImage: coverImage ? coverImage.url : undefined,
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


// 
const generateAccessandRefreshToken = async(userId)=>{
    try {
        const user =await User.findById(userId);
        // console.log(user);
        const accessToken = user.generateAccessToken();      // from user.model.js
        // console.log(accessToken);
        const refreshToken = user.generateRefreshToken();

        user.refreshToken =refreshToken;       // refreshToken (from user.model)
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"error generating access and refresh token!")
    }
}

const loginUser = asyncHandler(async (req,res)=>{

    // steps -->
    // take input from req.body
    // check for user
    // check for correct password
    // access and refresh token
    // send cookies

    const {username,email,password} = req.body;
    // console.log(email);
    // console.log(username);
    console.log(password);

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    // check if user exist
    const user =await User.findOne({
        $or : [{username}, {email}]  
    })
    if(!user){
        throw new ApiError(400,"user not found!")
    }

    // now check for correct password
    const validPassword = await  user.isPasswordCorrect(password);
    console.log('Valid Password:', validPassword);
    if(!validPassword){
        throw new ApiError(401,"password is incorrect!!");
    }

    // access and refresh token
    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const safeUser = JSON.parse(stringify(loggedInUser));     // circular reference remove karne k liye


    const options={
        httpOnly: true,     // that means only server can modify it and frontend can't
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
         new ApiResponse(
            200,
            {
                user:safeUser,accessToken,refreshToken
            },
            "user logged-in successfully"
        )
    )

})

const logOutUser =asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.body._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
    )
    const options={
        httpOnly: true,
        secure: true,
    }

    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"logged out successfully")
    )
})


// now writing the function for refreshing the access token
// ab ye hoga wtih the help of refresh token as jo user hai(frontend) vo backend ko ek refresh token
// bejega jo agar refresh token (database wala) ussse match hua toh we can give the user another access token insted ki user baar baar login kare

const refershAccessToken = asyncHandler(async (req,res)=>{
    // now agar user(frontend) ko refresh token chahiye toh vo cookies me se access kar sakta hai
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken  // .body se bhi access kar sakte hai if mobile user hua toh
    if(!incomingRefreshToken){
        throw new ApiError(401,"unautorized request")
    }
    const decodedToken =jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
        )
    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }

    if(incomingRefreshToken !== user.refreshToken){     // comparing the incoming refreshtoken (user se) to the one saved in db
        throw new ApiError(401,"refresh token not matched!")
    }

    const {accessToken,newrefreshToken}=generateAccessandRefreshToken(user?._id)
    
    const options={
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "access token refreshed"
        )
    )
})
export {registerUser,loginUser,logOutUser,refershAccessToken}