import jwt from "jsonwebtoken";
import { ErrorHandler } from "./error.js";

export const verifyUser = async (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (!token) {
    return next(ErrorHandler(403, "Not authorized"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return next(ErrorHandler(404, "Invalid User"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(ErrorHandler(403, "Forbidden"));
  }
};
