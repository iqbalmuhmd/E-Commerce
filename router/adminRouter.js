const express = require('express')
const adminRouter = express()
const bodyParser = require("body-parser")

adminRouter.use(bodyParser.json())
adminRouter.use(bodyParser.urlencoded({ extended: true }))
adminRouter.set('view engine', 'ejs')

adminRouter.use(function (req, res, next) {
    req.header(
      "Cache-Control",
      "no-cache, privante, no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Expires', '0');
    next();
  });


const adminAuth = require('../middleware/adminAuth')
const mainController = require('../controller/admin/mainController')
const dashboardController = require('../controller/admin/dashboardController')
const adminController = require('../controller/admin/login&signupController')
const userController = require('../controller/admin/userController')
const productController = require('../controller/admin/productsController')
const categoryController = require('../controller/admin/categoryController')
const imageUpload = require('../middleware/imageUpload')
const orderController = require('../controller/admin/orderController')
const couponController = require('../controller/admin/couponController')
const referralController = require('../controller/admin/referralController')




// Login
adminRouter.get('/login', adminAuth.adminLogout, adminController.loadLogin);
adminRouter.post('/login', adminAuth.adminLogout, adminController.verifyLogin);


// Dashboard
adminRouter.get('/dashboard', adminAuth.adminLogin, mainController.loadDashboard)


// Users
adminRouter.get('/users', adminAuth.adminLogin, userController.getUser);
adminRouter.get('/usersBlock', adminAuth.adminLogin, userController.usersBlock);


// Categories
adminRouter.get('/category', adminAuth.adminLogin, categoryController.loadCategory);
adminRouter.get('/category/add-category', adminAuth.adminLogin, categoryController.loadAddCategory);
adminRouter.post('/category/add-category', adminAuth.adminLogin, categoryController.addCategory);
adminRouter.get('/category/edit-category', adminAuth.adminLogin, categoryController.editCategory);
adminRouter.post('/category/edit-category', adminAuth.adminLogin, categoryController.postEditCategory);
adminRouter.get('/category/delete-category', adminAuth.adminLogin, categoryController.deleteCategory);


// Products
adminRouter.get('/products', adminAuth.adminLogin, productController.loadProducts);
adminRouter.get('/products/add-product', adminAuth.adminLogin, productController.loadAddProduct);
adminRouter.post('/products/add-product', adminAuth.adminLogin, imageUpload.uploadProductImages, imageUpload.resizeProductImages, productController.addProductPost);
adminRouter.get('/products/block-product', adminAuth.adminLogin, productController.blockProduct);
adminRouter.get('/products/edit-product', adminAuth.adminLogin, productController.loadEditProduct);
adminRouter.post("/products/:id/img/delete", adminAuth.adminLogin, productController.destroyProductImage);
adminRouter.post('/products/:id/img/add', adminAuth.adminLogin, imageUpload.uploadProductImages, imageUpload.resizeProductImages, productController.updateProductImages);
adminRouter.post('/products/edit-product', adminAuth.adminLogin, productController.editProduct);

//Orders
adminRouter.get('/orders', adminAuth.adminLogin, orderController.loadOrders)
adminRouter.get('/order/action-update', adminAuth.adminLogin, orderController.updateActionOrder);
adminRouter.get('/order/return-action-update', orderController.updateActionReturn)

// Coupon
adminRouter.get('/coupon', adminAuth.adminLogin, couponController.loadCoupon);
adminRouter.get('/new-coupon', adminAuth.adminLogin, couponController.getAddNewCoupon);
adminRouter.post('/new-coupon', adminAuth.adminLogin, couponController.addNewCoupon);
adminRouter.patch('/coupons/action/:id', adminAuth.adminLogin, couponController.couponAction);

//SalesReport
adminRouter.get('/sales-report', mainController.loadSalesReport)
adminRouter.post('/sales-report', mainController.loadSalesReport)

//Referral
adminRouter.get('/referral', adminAuth.adminLogin, referralController.loadReferral)
adminRouter.post('/addReferral', adminAuth.adminLogin, referralController.addReferral)


module.exports = adminRouter