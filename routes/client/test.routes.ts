import { Router, Request, Response } from "express";

const router = Router();

router.get("/arcjet", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Request thành công",
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });
});

export default router;

