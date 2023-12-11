const Product = require('../../model/productModel');
const User = require('../../model/userModel')

const loadShop = async(req,res) =>{
    try {
        const products = await Product.find();
        const user = await User.findById(req.session.user_id);
        res.render('user/shop',{ products, user })
    } catch (error) {
        console.log(error.message);
    }
}

const loadproductDetail = async(req,res) =>{
    try {
        const product = await Product.findById(req.query.id)
        const user = await User.findById(req.session.user_id);
        res.render('user/productDetail', { product, user })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadShop,
    loadproductDetail
}