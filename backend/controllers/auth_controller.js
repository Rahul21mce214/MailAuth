
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user_model.js";
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordChangedEmail, sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";



export const signup = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        if(!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000);
        const user = new User ({
            name, 
            email, 
            password: hashedPassword,
            verificationToken,
            verificationTokenExpireAt: Date.now() + 24*60*60*1000,

            });
        await user.save();

        //jwt token
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, user.verificationToken);

        res.status(201).json({success : true, message: "user created", user:{...user._doc, password: undefined}});
        
        
    } catch (error) {
        res.status(500).json({success: false ,message: error.message});
    }
}
export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({verificationToken: code, verificationTokenExpireAt: {$gt: Date.now()}});
        if(!user) {
            return res.status(400).json({message: "Invalid verification code"});
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpireAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({success: true, message: "Email verified", user: {...user._doc, password: undefined}});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
export const login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({success: false, message: "All fields are required"});
    }
    const user = await User.findOne({email}).select("+password");
    if(!user) {
        return res.status(400).json({success: false, message: "Invalid credentials"});
    }
    if(!user.isVerified) {
        return res.status(400).json({success: false, message: "Please verify your email"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        return res.status(400).json({success: false, message: "Invalid credentials"});
    }
    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = Date.now();
    await user.save();

    return res.status(200).json({success: true, message: "Logged in", user: {...user._doc, password: undefined}});
}
export const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({success: true, message: "Logged out"});
}
export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    if(!email) {
        return res.status(400).json({success: false, message: "All fields are required"});
    }
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({success: false, message: "User not found"});
        }    
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = Date.now() + 1*60*60*1000;
        await user.save();
    
        await sendPasswordResetEmail(user.email, `http://localhost:5173/reset-password/${resetToken}`);
        res.status(200).json({success: true, message: "Password reset link sent to your email"});
    } catch (error) {
        console.log("Error during password reset: ", error);
        
        res.status(500).json({success: false, message: error.message});
        
    }
}
export const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    if(!password) {
        return res.status(400).json({success: false, message: "All fields are required"});
    }
    const user = await User.findOne({resetPasswordToken: token, resetPasswordExpireAt: {$gt: Date.now()}});
    if(!user) {
        return res.status(400).json({success: false, message: "Invalid or expired token"});
    }    

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpireAt = undefined;
    await user.save();

    await sendPasswordChangedEmail(user.email);
    res.status(200).json({success: true, message: "Password reset successfully"});
}
export const checkAuth = async (req, res) => {
    const user = await User.findById(req.userId).select("-password");
    if(!user) {
        return res.status(400).json({success: false, message: "User not found"});
    }
    res.status(200).json({success: true, user});
}