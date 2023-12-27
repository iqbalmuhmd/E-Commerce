const Order = require('../../model/orderModel');

const loadOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate([{ path: 'products.product' }, { path: 'user' }])
            .sort({ orderDate: -1 });

        res.render("admin/orders", { orders });
    } catch (error) {
        console.log(error.message);
    }
};

const updateActionOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const action = req.query.status;

        await Order.findByIdAndUpdate(orderId, { $set: { status: action } });

        res.redirect("/admin/orders");
    } catch (error) {
        console.log(error.message);
    }
};

const updateActionReturn = async (req, res) => {
    try {
        const orderId = req.query.id;
        const action = req.query.status;

        await Order.findByIdAndUpdate(orderId, { $set: { returnRequested: action } });

        res.redirect("/admin/orders");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadOrders,
    updateActionOrder,
    updateActionReturn
};
