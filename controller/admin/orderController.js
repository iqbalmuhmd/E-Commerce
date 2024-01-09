const Order = require('../../model/orderModel');
const User = require('../../model/userModel');
const Coupon = require('../../model/couponModel');

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

        const order = await Order.findById(orderId);
        const userData = await User.findById(order.user);

        if (req.query.status === "Delivered") {
            const foundCoupon = await Coupon.findOne({
                isActive: true, minimumPurchaseAmount: { $lte: order.totalAmount }
            }).sort({ minimumPurchaseAmount: -1 });

            if (foundCoupon) {
                const couponExists = userData.earnedCoupons.some((coupon) => coupon.coupon.equals(foundCoupon._id));
                if (!couponExists) {
                    userData.earnedCoupons.push({ coupon: foundCoupon._id });
                }
            }

            await userData.save();
        }

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
