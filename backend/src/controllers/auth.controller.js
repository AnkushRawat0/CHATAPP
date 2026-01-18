import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be a tleast 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profile: newUser.profile,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.log("error in signup controller", err);
    res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profile: user.profile,
    });
  } catch (err) {
    console.log("error in login controller", err);
    return res.status(500).json({ message: "server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully " });
  } catch (err) {
    console.log("error in logout controller", err);
    return res.status(500).json({ message: "server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const userId = req.user._id;

    if (!profile) {
      return res.status(400).json({ message: "Profile URL is required " });
    }

    const uploadResponse = await cloudinary.uploader.upload(profile);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profile: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updateUser);
  } catch (error) {
    console.log("error in updateProfile controller", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const checkAuth =(req ,res) =>{
    try{
        res.status(200).json(req.user) ;
    }catch(err){
        console.log("error in checkAuth controller" , err) ;
        return res.status(500).json({ message : "server error"}) ;
    }
}
