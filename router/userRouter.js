const express = require('express')
const userRouter = express()
const bodyParser = require("body-parser")

userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }))
userRouter.set('view engine', 'ejs')

userRouter.use(function (req, res, next) {
    req.header(
      "Cache-Control",
      "no-cache, privante, no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Expires', '0');
    next();
  });


const userAuth = require('../middleware/userAuth')
const loginSignUpController = require('../controller/user/login&signupController')
const mainController = require('../controller/user/mainController')
const profileController = require('../controller/user/profileController')
const imageUpload = require('../middleware/imageUpload')
const cartController = require('../controller/user/cart&checkoutController')
const checkoutController = require('../controller/user/cart&checkoutController')
const orderController = require('../controller/user/orderController')



// Home
userRouter.get('/', loginSignUpController.loadHome);
userRouter.get('/home', loginSignUpController.loadHome);

// Login
userRouter.get('/login', userAuth.isLogout, loginSignUpController.loadLogin);
userRouter.post('/login', userAuth.isLogout, loginSignUpController.verifyLogin);

// Register
userRouter.get('/register', userAuth.isLogout, loginSignUpController.loadRegister);
userRouter.post('/register', loginSignUpController.insertUser);

// OTP Verification
userRouter.get('/verifyOTP', userAuth.isLogout, loginSignUpController.loadOTPpage);
userRouter.post('/verifyOTP', loginSignUpController.verifyOTPSignup);

// Logout
userRouter.get('/logout', loginSignUpController.Logout);

// Shop
userRouter.get('/shop', mainController.loadShop);

// Product Detail
userRouter.get('/productDetail', mainController.loadproductDetail);

// Verify User
userRouter.get('/verifyUser', userAuth.isLogout, loginSignUpController.loadVerifyUser);
userRouter.post('/verifyUser', userAuth.isLogout, loginSignUpController.verifyUserEmail);

// Profile
userRouter.get('/profile', userAuth.isLogin, profileController.loadProfile);

// Edit Profile
userRouter.get('/edit-profile', userAuth.isLogin, profileController.loadEditProfile);
userRouter.post('/edit-profile', userAuth.isLogin, profileController.editProfile);

// Profile Photo
userRouter.patch('/profile/editPhoto', userAuth.isLogin, imageUpload.uploadProfileImage, imageUpload.resizeProfileImage, profileController.updateProfilePhoto);
userRouter.get('/profile/deletePhoto', userAuth.isLogin, profileController.deleteProfilePhoto);

// Verify Change Mail
userRouter.get('/verifyChangeMail', userAuth.isLogin, profileController.loadOTPChangeMail);
userRouter.post('/verifyChangeMail', userAuth.isLogin, profileController.verifyOTPChangeMail);

// Change Password
userRouter.get('/change-password', userAuth.isLogin, profileController.loadChangePass);
userRouter.post('/change-password', userAuth.isLogin, profileController.changePass);

// Add Address
userRouter.get('/add-address', userAuth.isLogin, profileController.loadAddAddress);
userRouter.post('/add-address', userAuth.isLogin, profileController.addAddress);

// Edit Address
userRouter.get('/edit-address', userAuth.isLogin, profileController.loadEditAddress);
userRouter.post('/edit-address', userAuth.isLogin, profileController.editAddress);

// Delete Address
userRouter.get('/delete-address', userAuth.isLogin, profileController.deleteAddress);

// Cart 
userRouter.get('/cart', userAuth.isLogin, cartController.loadCart);
userRouter.get('/addToCart', userAuth.isLogin, cartController.addToCart);
userRouter.post('/updateCartItem/:id', userAuth.isLogin, cartController.updateCartItem);
userRouter.get('/delete-cart', userAuth.isLogin, cartController.deleteCart);

// Checkout
userRouter.get('/checkout', userAuth.isLogin, checkoutController.loadCheckOut);
userRouter.get('/edit-address-co', userAuth.isLogin, checkoutController.loadEditAddressCO);
userRouter.post('/edit-address-co', userAuth.isLogin, checkoutController.editAddressCO);
userRouter.get('/add-address-co', userAuth.isLogin, checkoutController.loadAddAddressCO);
userRouter.post('/add-address-co', userAuth.isLogin, checkoutController.addAddressCO);

// Place Order
userRouter.post('/order-product', userAuth.isLogin, checkoutController.placeOrder);
userRouter.post('/saveRzpOrder', userAuth.isLogin, checkoutController.saveRzpOrder);

// Order Success and History
userRouter.get('/order-success', userAuth.isLogin, orderController.loadOrderSuccess);
userRouter.get('/orders', userAuth.isLogin, orderController.loadOrders);
userRouter.get('/order-history', userAuth.isLogin, orderController.loadOrdersHistory);
userRouter.post('/cancel-order', orderController.cancelProduct);
userRouter.post('/return-order', orderController.returnProduct);

// Wishlist
userRouter.get('/wishlist', userAuth.isLogin, mainController.loadWishlist);
userRouter.get('/addToWishlist', userAuth.isLogin, mainController.addToWishlist);
userRouter.get('/add-to-cart', userAuth.isLogin, mainController.addToCartWL);
userRouter.get('/delete-wishlist', userAuth.isLogin, mainController.deleteWishlist);

//Wallet
userRouter.get('/wallet', userAuth.isLogin, mainController.loadWallet)

//Coupon
userRouter.get('/coupon', userAuth.isLogin, checkoutController.getCoupons)
userRouter.post('/apply-coupon', userAuth.isLogin, checkoutController.applyCoupon)

//Referral
userRouter.post('/generateReferralCode', userAuth.isLogin, profileController.generateCode)

userRouter.post('/submitReview', userAuth.isLogin, orderController.submitReview)


module.exports = userRouter
