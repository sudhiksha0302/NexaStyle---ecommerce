import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { razorpay } from "../lib/razorpay.js";
import crypto from "crypto";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({
				error: "Invalid or empty products array",
			});
		}

		let totalAmount = 0;

		products.forEach((product) => {
			totalAmount += product.price * (product.quantity || 1);
		});

		let coupon = null;

		if (couponCode) {
			coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
			});

			if (coupon) {
				totalAmount -= Math.round(
					(totalAmount * coupon.discountPercentage) / 100
				);
			}
		}

		const options = {
			amount: totalAmount * 100,
			currency: "INR",
			receipt: `receipt_${Date.now()}`,
		};

		const order = await razorpay.orders.create(options);

		res.status(200).json({
			orderId: order.id,
			amount: order.amount,
			currency: order.currency,
			key: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error) {
		console.error("Payment error:", error);
		res.status(500).json({
			message: "Payment creation failed",
		});
	}
};

export const verifyPayment = async (req, res) => {
	try {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			products,
		} = req.body;

		const body = razorpay_order_id + "|" + razorpay_payment_id;

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(body.toString())
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return res.status(400).json({
				success: false,
				message: "Payment verification failed",
			});
		}

		const newOrder = new Order({
			user: req.user._id,
			products: products.map((product) => ({
				product: product._id,
				quantity: product.quantity,
				price: product.price,
			})),
			totalAmount: products.reduce(
				(total, product) =>
					total + product.price * product.quantity,
				0
			),
			paymentId: razorpay_payment_id,
		});

		await newOrder.save();

		res.status(200).json({
			success: true,
			message: "Payment verified and order placed",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Verification failed",
		});
	}
};