import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const userWatchHistory = new mongoose.Schema({
    videoWatched:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }
})

const userSchema = new mongoose.Schema({

    watchHistory:[userWatchHistory],

    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true,'password is required !'],
    },
    avatar:{
        type:String,  // cloudinary url
    },
    coverImage:{
        type:String,     // cloudinary url
    },
    refreshToken:{
        type:String,
    },
},{timestamps:true})



/*pre-hooks (or middleware) are functions that run before certain operations are executed. These hooks are useful for performing actions such as validation, sanitization, logging, or modifying documents before saving them to the database*/

userSchema.pre("save", async function (next) {
    if (! this.isModified("password")) return next();

    this.password =await bcrypt.hash(this.password , 10)
    next()
});


// .methods se hum coustom hook/methods generate kar sakte hai
userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log(password);
    // console.log(this.password);
    // console.log(bcrypt.compare(password, this.password))
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            fullName: this.fullName,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema)