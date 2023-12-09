const Product = require('../../model/productModel');

const loadShop = async(req,res) =>{
    try {
        const products = await Product.find();
        console.log(products);

        res.render('user/shop',{ products, user: req.session.user_id })
    } catch (error) {
        console.log(error.message);
    }
}

const loadproductDetail = async(req,res) =>{
    try {
        const product = await Product.findById(req.query.id)
        console.log(product);
        res.render('user/productDetail', { product, user: req.session.user_id })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadShop,
    loadproductDetail
}