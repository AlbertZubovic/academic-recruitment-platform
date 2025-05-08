import { Router, Request, Response } from "express";
import { signUp, signIn } from "../controllers/authController";

const router = Router();

router.post("/signup", (req: Request, res: Response) => {
  signUp(req, res);
});

router.post("/signin", (req: Request, res: Response) => {
  signIn(req, res);
});

export default router;
