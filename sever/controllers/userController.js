import cloudinary from "../library/cloudinary.js"
import { generateToken } from "../library/utils.js"
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"


//Signup a new user
export const signup = async(req, res)=>{
    const { fullName, email, password, bio } = req.body

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success : false, message: "Missing details"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.json({success : false, message: "Account already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassswrod = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            fullName, email, password : hashedPassswrod, bio
        })

        const token = generateToken(newUser._id)

        res.json({success : true, userData : newUser, token, message : "Account created successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
        console.log(error.message)
    }
}

//Controller to login a user

export const login = async(req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({email})
        
        const isPasswordCorrect = await bcrypt.compare(password, userData.password)
        if(!isPasswordCorrect){
            res.json({success : false, message: "Invalid credentials"})
        }
        const token = generateToken(userData._id)

        res.json({success : true, userData, token, message : "Logged in successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
        console.log(error.message)
    }
}

//Controller to check if use is authenticated

export const checkAuth = async(req, res) =>{
    res.json({success : true, user : req.user})
}

//Controller to update user profile details

export const updateProfile = async(req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body

        const userId = req.user._id
        let updatedUser

        if(!profilePic){
          updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new : true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic : upload.secure_url, bio, fullName}, {new : true})
        }
        res.json({success : true, user : updatedUser})
    } catch (error) {
        console.log(error.message)
        res.json({success : false, message : error.message})

    }
}