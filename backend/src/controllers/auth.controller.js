import { sendWelcomeEmail } from "../emails/emailHandler.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(404).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //checking if the email is valid or not
    const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    //hash the password if the user doesn't exists
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      const savedUser = await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          process.env.CLIENT_URL
        );
      } catch (error) {
        console.log("Failed to send welcome email", error);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);

    res.status(400).json({ message: "Internal Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    //never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader(profilePic);

    await User.findById(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
  } catch (error) {
    console.log("Error in update profile: ", error);
    res.status(500).json({message:"Internal server error"});
  }
};
