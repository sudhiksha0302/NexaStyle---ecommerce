import { useEffect, useState } from "react";
import axios from "../lib/axios";

const OrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await axios.get("/orders/my-orders");
				setOrders(res.data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				Loading orders...
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8">
			<h1 className="text-4xl font-bold text-emerald-400 mb-8 text-center">
				My Orders
			</h1>

			{orders.length === 0 ? (
				<p className="text-center text-gray-300">No orders found</p>
			) : (
				<div className="space-y-6 max-w-4xl mx-auto">
					{orders.map((order) => (
						<div
							key={order._id}
							className="bg-gray-800 rounded-lg p-6 shadow-lg"
						>
							<h2 className="text-lg font-semibold text-white mb-2">
								Order ID: {order._id}
							</h2>

							<p className="text-emerald-400 mb-4">
								Total: ₹{order.totalAmount}
							</p>

							<div className="space-y-3">
								{order.products.map((item) => (
									<div
										key={item._id}
										className="flex items-center gap-4"
									>
										<img
											src={item.product.image}
											alt={item.product.name}
											className="w-16 h-16 object-cover rounded"
										/>

										<div>
											<p className="text-white">
												{item.product.name}
											</p>
											<p className="text-gray-400">
												Qty: {item.quantity}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrdersPage;