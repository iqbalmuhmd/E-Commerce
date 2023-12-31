const mongoose = require('mongoose');
const User = require('../../model/userModel');
const Address = require('../../model/addressModel');
const Product = require('../../model/productModel');
const Order = require('../../model/orderModel');
const razorpay = require('../../controller/utils/razorpayConfig')

const loadCart = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);
        const userData = await User.findById(req.session.user_id).populate('cart.product');
        res.render('user/cart', { user, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const productData = await Product.findById(productId);

        const obj = {
            product: productData,
            quantity: 1,
            total: productData.price
        };

        const userData = await User.findById(req.session.user_id);

        const totalCartAmt = userData.totalCartAmount + productData.price;

        await User.updateOne({ _id: req.session.user_id }, { $set: { totalCartAmount: totalCartAmt } });

        userData.cart.push(obj);
        await userData.save();
       
        const referer = req.get('Referer');
let redirectUrl;

if (referer && referer.includes('/productDetail')) {
    redirectUrl = `/productDetail?id=${productData._id}`;
} else if (referer && referer.includes('/shop')) {
    redirectUrl = '/shop';
} else if (referer && referer.includes('/wishlist')) {
    redirectUrl = '/wishlist'; 
} else {
    redirectUrl = '/home';
}

        res.redirect(redirectUrl);
    } catch (error) {
        console.log(error.message);
    }
};

const updateCartItem = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id);
        const cartItem = currentUser.cart.find(item => item.product.equals(new mongoose.Types.ObjectId(req.params.id)));

        if (cartItem) {
            const product = await Product.findById(cartItem.product);

            let grandTotal;

            if (req.body.type === 'decrement') {
                if (cartItem.quantity !== 1) {
                    cartItem.quantity--;
                }
            } else if (req.body.type === 'increment') {
                if (cartItem.quantity + 1 <= product.quantity) {
                    cartItem.quantity++;
                } else {
                    return res.status(200).json({ message: 'Stock limit exceeded' });
                }
            }

            let insufficientStock = false;
            if (product.quantity < cartItem.quantity) {
                insufficientStock = true;
            }

            await currentUser.populate('cart.product');

            for (const item of currentUser.cart) {
                const currentProduct = await Product.findById(item.product);
                item.total = item.quantity * currentProduct.price;
            }

            grandTotal = currentUser.cart.reduce((total, element) => {
                return total + element.quantity * element.product.price;
            }, 0);

            currentUser.totalCartAmount = grandTotal;

            await currentUser.save();

            return res.status(200).json({
                message: 'Success',
                quantity: cartItem.quantity,
                totalPrice: product.price * cartItem.quantity,
                grandTotal,
                insufficientStock
            });
        } else {
            return res.status(404).json({ message: "Product not found in the user's cart." });
        }
    } catch (error) {
        console.error(error);
        res.render('error/internalError', { error });
    }
};

const deleteCart = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id);

        const cartId = req.query.cartId;

        const itemIndex = userData.cart.findIndex(item => item._id.toString() === cartId);

        userData.totalCartAmount -= userData.cart[itemIndex].total;

        userData.cart.splice(itemIndex, 1);
        await userData.save();

        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
    }
};

const loadCheckOut = async (req, res) => {
    try {
        const userId = await User.findById(req.session.user_id);
        const user = await User.findById(userId).populate('cart.product');
        const userAddress = await Address.find({ userId: req.session.user_id });
        res.render('user/checkout', { user, userAddress });
    } catch (error) {
        console.log(error.message);
    }
};

const loadEditAddressCO = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findById(req.session.user_id);

        const editAddress = await Address.findById(id);

        if (editAddress) {
            res.render('user/editAddressCheckout', { user, editAddress });
        } else {
            res.redirect('/checkout');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const editAddressCO = async (req, res) => {
    try {
        const { name, phone, country, state, district, city, pincode, address } = req.body;
        const user = req.session.user_id;

        if (user) {
            const addressId = req.body.id;
            const editAddress = await Address.findById(addressId);
            if (editAddress) {
                await Address.updateOne({ _id: addressId }, { $set: { name, phone, country, state, district, city, pincode, address } });
            }
        }

        res.redirect('/checkout');
    } catch (error) {
        console.log(error.message);
    }
};

const loadAddAddressCO = async (req, res) => {
    try {
        const userAddress = await Address.find({ userid: req.session.user_id });
        const user = await User.findById(req.session.user_id);
        if (userAddress.length < 3) {
            res.render('user/addAddressCheckout', { user });
        } else {
            res.redirect('/checkout');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const addAddressCO = async (req, res) => {
    try {
        const { name, phone, country, state, district, city, pincode, address } = req.body;
        const user = await User.findById(req.session.user_id);

        // Validate phone (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.render('user/addAddress', { user, error: 'Phone number should be 10 digits.' });
        }
        const check = await Address.find({ userId: req.session.user_id });

        if (check.length > 0) {
            const addAddress = new Address({
                userId: req.session.user_id, name, phone, country, state, district, city, pincode, address
            });
            addAddress.save();
        } else {
            const addAddress = new Address({
                userId: req.session.user_id, name, phone, country, state, district, city, pincode, address, default: true
            });
            addAddress.save();
        }

        res.redirect('/checkout');
    } catch (error) {
        console.log(error.message);
    }
};

const placeOrder = async (req, res) => {
    try {
        const selectedAddressId = req.body.address;
        const selectedPaymentMethod = req.body.paymentMethod;

        const userId = req.session.user_id;
        const user = await User.findById(userId).populate('cart.product');
        const selectedAddress = await Address.findById(selectedAddressId);

        const products = user.cart.map((cartItem) => {
            return {
                product: cartItem.product,
                quantity: cartItem.quantity,
                total: cartItem.quantity * cartItem.product.price
            };
        });

        const orderId = Math.floor(100000 + Math.random() * 900000);

        const order = new Order({
            user: userId,
            products: products,
            totalAmount: user.totalCartAmount,
            paymentMethod: selectedPaymentMethod,
            deliveryAddress: {
                _id: selectedAddress._id,
                userId: userId,
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                country: selectedAddress.country,
                state: selectedAddress.state,
                district: selectedAddress.district,
                city: selectedAddress.city,
                pincode: selectedAddress.pincode,
                address: selectedAddress.address
            },
            orderId: orderId,
        });
        if(selectedPaymentMethod === 'COD'){
            await order.save();
        } else if(selectedPaymentMethod === 'Razorpay') {
            const razorpayOrder = await razorpay.orders.create({
                amount: user.totalCartAmount * 100, 
                currency: 'INR', 
                receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Date.now()}`, // Provide a unique receipt ID
            });

            order.razorpayOrderId = razorpayOrder.id;

            return res.render("user/razorpay", {                
                order: razorpayOrder,
                key_id: process.env.RAZORPAY_ID_KEY,
                user: user
            });
        }

        // Stock Update
        for (const item of user.cart) {
            const foundProduct = await Product.findById(item.product._id);
            foundProduct.quantity -= item.quantity;
            await foundProduct.save();
        }

        user.totalCartAmount = 0;
        user.cart = [];
        await user.save();

        res.redirect('/order-success');
    } catch (error) {
        console.error(error.message);
    }
};

const saveRzpOrder = async (req, res) => {
    try {
        const { transactionId, orderId, signature } = req.body;

        const amount = parseInt(req.body.amount / 100);
        const currentUser = await User.findById(req.session.user_id).populate('cart.product');

        const deliveryAddress = await Address.findOne({ userId: req.session.user_id });

        if (transactionId && orderId && signature) {
            const orderedProducts = currentUser.cart.map((item) => {
                return {
                    product: item.product,
                    quantity: item.quantity,
                    total: item.total,
                }
            });

            // Include orderId from the Razorpay response
            let newOrder = new Order({
                user: req.session.user_id,
                products: orderedProducts,
                totalAmount: amount,
                paymentMethod: 'Razorpay',
                deliveryAddress: deliveryAddress,
                orderId: orderId, 
            });

            await newOrder.save();

            // Stock Update
            for (const cartItem of currentUser.cart) {
                const productToUpdate = await Product.findById(cartItem.product._id);
                productToUpdate.quantity -= cartItem.quantity;
                await productToUpdate.save();
            }

            currentUser.cart = [];
            currentUser.totalCartAmount = 0;

            await currentUser.save();

            return res.status(200).json({
                message: "order placed successfully",
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


module.exports = {
    loadCart,
    addToCart,
    updateCartItem,
    deleteCart,
    loadCheckOut,
    loadEditAddressCO,
    editAddressCO,
    loadAddAddressCO,
    addAddressCO,
    placeOrder,
    saveRzpOrder
};
