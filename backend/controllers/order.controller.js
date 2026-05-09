import Order from "../models/order.model.js";

export const getUserOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.populate("products.product", "name image category")
			.sort({ createdAt: -1 });

		res.status(200).json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({
			message: "Failed to fetch orders",
		});
	}
};