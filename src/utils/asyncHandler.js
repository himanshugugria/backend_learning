// this is a wrapper type of function (will later see its usage)

// const asyncHandler =(fun)=> async (req,res,next)=>{
//     try {
//         await fun(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//         })
//     }
// }


const asyncHandler =(requestHandler)=>{
    return (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}

export  {asyncHandler}