const mongoose = require('mongoose')
const User = require('../../model/userModel')
const Address = require('../../model/addressModel')
const Product = require('../../model/productModel')
const session = require('express-session')


const loadCart = async(req,res) => {
    try {
        const user = await User.findById(req.session.user_id)
        const userData = await User.findById(req.session.user_id).populate('cart.product');
        res.render('user/cart', { user , userData })
    } catch (error) {
        console.log(error.message);
    }
}


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

        // Check the Referer header to determine the redirect URL
const referer = req.get('Referer');
let redirectUrl;

if (referer && referer.includes('/productDetail')) {
  redirectUrl = `/productDetail?id=${productData._id}`;
} else if (referer && referer.includes('/shop')) {
  redirectUrl = '/shop';
} else {
  redirectUrl = '/home'; // Replace '/home' with the actual home page URL
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

            if (req.body.type === "decrement") {
                if (cartItem.quantity !== 1) {
                    cartItem.quantity--;
                }
            } else if (req.body.type === "increment") {
                if ((cartItem.quantity + 1) <= product.quantity) {
                    cartItem.quantity++;
                } else {
                    return res.status(200).json({ message: "Stock limit exceeded" });
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
                return total + (element.quantity * element.product.price);
            }, 0);

            currentUser.totalCartAmount = grandTotal;

            await currentUser.save();

            return res.status(200).json({
                message: "Success",
                quantity: cartItem.quantity,
                totalPrice: product.price * cartItem.quantity,
                grandTotal,
                insufficientStock,
            });
        } else {
            return res.status(404).json({ message: "Product not found in the user's cart." });
        }
    } catch (error) {
        console.error(error); 
        res.render("error/internalError", { error });
    }
};


const deleteCart = async (req, res) => {

    try {

        const userData = await User.findById(req.session.user_id)

        const cartId = req.query.cartId

        const itemIndex = userData.cart.findIndex(item => item._id.toString() === cartId);

        userData.totalCartAmount -= userData.cart[itemIndex].total

        userData.cart.splice(itemIndex, 1);
        await userData.save();

        res.redirect("/cart")

    } catch (error) {
        console.log(error.message);
    }

}
  



module.exports = {
    loadCart,
    addToCart,
    updateCartItem,
    deleteCart
}