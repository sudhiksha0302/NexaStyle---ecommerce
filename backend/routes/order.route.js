import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/my-orders", protectRoute, getUserOrders);

export default router;