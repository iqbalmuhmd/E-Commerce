const User = require("../../model/userModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");


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
        const orders = await Order.find({ user: req.session.user_id })
            .populate('products.product')
            .sort({ orderDate: -1 }); 
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

const cancelProduct = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const reason = `Main Reason: ${req.body.cancelReason}, Optional Reason: ${req.body.cancelComment}`;
        const cancel = await Order.findByIdAndUpdate(orderId, {
            $set: {
                isCancelled: true,
                orderCancelReason: reason,
                status: 'Cancelled'
            }
        });

        cancel.products.forEach(async (pro) => {
            const proUpdateQuantity = await Product.findById(pro.product);
            proUpdateQuantity.quantity += pro.quantity;
            proUpdateQuantity.save();
        });

        if (cancel.paymentMethod === 'Razorpay' || cancel.paymentMethod === 'wallet') {
            const user = await User.findById(req.session.user_id);

            const walletTransaction = {
                amount: cancel.totalAmount,
                description: `Refund for Order #${cancel.orderId}`,
                type: 'Credit',
            };

            // Update user's wallet balance and add the transaction
            user.wallet.balance += cancel.totalAmount;
            user.wallet.transactions.push(walletTransaction);

            await user.save();
        }

        return res.redirect('/orders');
    } catch (error) {
        console.log(error.message);
    }
};

const returnProduct = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const returnPro = await Order.findByIdAndUpdate(orderId, { $set: { isReturn: true } });

        returnPro.products.forEach(async (pro) => {
            const proUpdateQuantity = await Product.findById(pro.product);
            proUpdateQuantity.quantity += pro.quantity;
            proUpdateQuantity.save();
        });
        
            const user = await User.findById(req.session.user_id);

            const walletTransaction = {
                amount: returnPro.totalAmount,
                description: `Refund for Order #${returnPro.orderId}`,
                type: 'Credit',
            };

            // Update user's wallet balance and add the transaction
            user.wallet.balance += returnPro.totalAmount;
            user.wallet.transactions.push(walletTransaction);

            await user.save();
                
        return res.redirect('/orders');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadOrderSuccess,
    loadOrders,
    loadOrdersHistory,
    cancelProduct,
    returnProduct
};
