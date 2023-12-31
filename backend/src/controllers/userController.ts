import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { setAuthCookie } from "../utils/tokens.js";

export const getAllUsers = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const users = await User.find();
    return res.status(200).json({ message: "OK", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ message: "ERROR", cause: "User already exists" });
    }
    const hashedPassword = await hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    setAuthCookie(res, user);
    return res.status(201).json({
      message: "OK",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ message: "ERROR", cause: "User does not exist" });
    }
    const isPasswordCorrect = await compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res
        .status(403)
        .json({ message: "ERROR", cause: "Incorrect password" });
    }
    setAuthCookie(res, existingUser);
    return res.status(200).json({
      message: "OK",
      id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error });
  }
};

export const userVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({
          message: "ERROR",
          cause: "User not registered OR Token malfunctioned",
        });
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res
        .status(401)
        .json({ message: "ERROR", cause: "Permissions didn't match" });
    }
    return res
      .status(200)
      .json({
        message: "OK",
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
