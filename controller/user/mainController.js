const Product = require('../../model/productModel');
const User = require('../../model/userModel')

const loadShop = async(req,res) =>{
    try {
        const products = await Product.find({blocked: false});
        const user = await User.findById(req.session.user_id);
        res.render('user/shop',{ products, user })
    } catch (error) {
        console.log(error.message);
    }
}

const loadproductDetail = async(req,res) =>{
    try {
        
        const user = await User.findById(req.session.user_id);
        const productIdToCheck = req.query.id;

        const check = await User.findOne({
            _id: user,
            cart: { $elemMatch: {product: productIdToCheck} }
        })

        const product = await Product.findById(productIdToCheck)

        if(check){
            res.render('user/productDetail', { product, user, message: 'already exist in a cart' })
        }else{
            res.render('user/productDetail', { product, user, message: '' })
        }

        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadShop,
    loadproductDetail
}