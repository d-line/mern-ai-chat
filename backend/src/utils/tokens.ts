import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";
import { NextFunction, Request, Response } from "express";

export const createToken = (
  id: string,
  email: string,
  expiresIn: string | number
) => {
  const payload = { id, email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return token;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[COOKIE_NAME];
  if (!token || token.trim() === "") {
    return res
      .status(401)
      .json({ message: "ERROR", cause: "Token Not Received" });
  }
  return new Promise<void>((resolve, reject) => {
    return jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
      if (err) {
        reject(err.message);
        return res
          .status(401)
          .json({ message: "ERROR", cause: "Token Invalid" });
      } else {
        resolve();
        res.locals.jwtData = success;
        return next();
      }
    });
  });
};

export const setAuthCookie = (res: Response, user) => {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    domain: "localhost",
    httpOnly: true,
    signed: true,
  });
  const token = createToken(user._id.toString(), user.email, "7d");
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  res.cookie(COOKIE_NAME, token, {
    path: "/",
    domain: "localhost",
    httpOnly: true,
    expires,
    signed: true,
  });
};
