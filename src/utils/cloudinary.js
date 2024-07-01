import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// so we are doing that we are uploading the file locally and then to the cloudinary (using multer)

const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto",
        })
        // console.log("file has been uploaded on cloudinary" , response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) // removes the locally saved file as the upload operation got failed
        return null;
    }
}


export {uploadOnCloudinary}