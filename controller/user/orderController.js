const User = require("../../model/userModel");
const Order = require("../../model/orderModel");

const loadOrderSuccess = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const order = await Order.findOne({ user: userId }).sort({ orderDate: -1 });
        res.render("user/orderSuccess", { userId, orderData: order });
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrders = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);
        const orders = await Order.find({ user: req.session.user_id }).populate('products.product');

        res.render('user/orders', { user, orders });
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrdersHistory = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);
        const order = await Order.findById(req.query.orderId).populate('products.product');

        res.render('user/orderHistory', { user, order });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadOrderSuccess,
    loadOrders,
    loadOrdersHistory
};
