import { Request, Response, NextFunction } from "express";

export const authorizeTutor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.isTutor) {
    res.status(403).json({ message: "Access restricted to tutors only" });
    return;
  }
  next();
};
