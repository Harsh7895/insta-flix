import bcryptjs from "bcryptjs";
import User from "../models/user.schema.js";
import { ErrorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const hashedPass = bcryptjs.hashSync(password, 10);
    const user = await User.findOne({ username });
    if (user) {
      return next(ErrorHandler(400, "This username is already exist!"));
    }
    await User.create({
      username: username.toLowerCase(),
      password: hashedPass,
    });
    res.status(200).json({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const validUser = await User.findOne({ username });
    if (!validUser) {
      return next(ErrorHandler(401, "Wrong Username or Password"));
    }

    const validPass = bcryptjs.compareSync(password, validUser.password);
    if (!validPass) {
      return next(ErrorHandler(401, "Wrong Username or Password"));
    }

    const { password: pass, ...rest } = validUser._doc;
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      success: true,
      message: "Logged In Successfully",
      rest,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId.id);
    if (!user) {
      return next(ErrorHandler(401, "Something went wrong!"));
    }

    res.removeHeader("Authorization");
    res
      .status(200)
      .json({ success: true, message: "User has been signed out" });
  } catch (error) {
    next(error);
  }
};
