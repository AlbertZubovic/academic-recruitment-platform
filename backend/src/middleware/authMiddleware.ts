import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authenticate: RequestHandler = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("[AUTH] No token found in cookies.");
    res.status(401).json({ message: "Missing token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("[AUTH] Token decoded:", decoded);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
