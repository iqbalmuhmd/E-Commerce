const Product = require("../../model/productModel");
const User = require("../../model/userModel");
const Category = require("../../model/categoryModel");
const mongoose = require("mongoose");

const loadShop = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    const { query, category } = req.query;
    let queryFilters = {};

    if (query) {
      queryFilters.productName = new RegExp(`${query}`, "i");
    }

    if (category) {
      const mongooseObjectId = new mongoose.Types.ObjectId(category);
      queryFilters.category = mongooseObjectId;
    }

    const products = await Product.find(queryFilters).populate("category");
    const categories = await Category.find();

    res.render("user/shop", {
      products,
      user,
      searchQuery: query,
      selectedCategory: category,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadproductDetail = async (req, res) => {
  try {    
    const user = await User.findById(req.session.user_id);
    const productIdToCheck = req.query.id;

    const check = await User.findOne({
      _id: user,
      cart: { $elemMatch: { product: productIdToCheck } },
    });

    const product = await Product.findById(productIdToCheck).populate({
      path: "rating.customer",
      model: "User",
    });

    if (check) {
      res.render("user/productDetail", {
        product,
        user,
        message: "already exist in a cart",
      });
    } else {
      res.render("user/productDetail", { product, user, message: "" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    const userData = await User.findById(req.session.user_id).populate(
      "wishlist.product"
    );
    res.render("user/wishlist", { userData, user });
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await Product.findById(productId);

    const obj = {
      product: productData,
    };

    const userData = await User.findById(req.session.user_id);

    userData.wishlist.push(obj);
    await userData.save();

    const referer = req.get("Referer");
    let redirectUrl;

    if (referer && referer.includes("/productDetail")) {
      redirectUrl = `/productDetail?id=${productData._id}`;
    } else if (referer && referer.includes("/shop")) {
      redirectUrl = "/shop";
    } else {
      redirectUrl = "/home";
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.log(error.message);
  }
};

const addToCartWL = async (req, res) => {
  try {
    const productId = req.query.wishlistId;
    const productData = await Product.findById(productId);

    const obj = {
      product: productData,
      quantity: 1,
      total: productData.price,
    };

    const userData = await User.findById(req.session.user_id);

    const totalCartAmt = userData.totalCartAmount + productData.price;

    await User.updateOne(
      { _id: req.session.user_id },
      { $set: { totalCartAmount: totalCartAmt } }
    );

    userData.cart.push(obj);
    await userData.save();

    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);

    const wishlistId = req.query.wishlistId;
    const productData = await Product.findById(wishlistId);

    const itemIndex = userData.wishlist.findIndex(
      (item) => item._id.toString() === wishlistId
    );

    userData.wishlist.splice(itemIndex, 1);
    await userData.save();

    const referer = req.get("Referer");
    let redirectUrl;

    if (referer && referer.includes("/home")) {
      redirectUrl = "/home";
    } else if (referer && referer.includes("/shop")) {
      redirectUrl = "/shop";
    } else if (referer && referer.includes("/wishlist")) {
      redirectUrl = "/wishlist";
    } else {
      redirectUrl = `/productDetail?id=${productData._id}`;
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.log(error.message);
  }
};

const loadWallet = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    user.wallet.transactions.sort((a, b) => b.timestamp - a.timestamp);

    res.render("user/wallet", { user });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadShop,
  loadproductDetail,
  loadWishlist,
  addToWishlist,
  addToCartWL,
  deleteWishlist,
  loadWallet,
};
