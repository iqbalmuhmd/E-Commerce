const express = require('express')
const adminRouter = express()
const bodyParser = require("body-parser")
const session = require('express-session')
const adminAuth = require('../middleware/adminAuth')
const adminController = require('../controller/admin/login&signupController')
const mainController = require('../controller/admin/mainController')
const userController = require('../controller/admin/userController')
const productController = require('../controller/admin/productsController')
const categoryController = require('../controller/admin/categoryController')

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

adminRouter.use(bodyParser.json())
adminRouter.use(bodyParser.urlencoded({ extended: true }))

adminRouter.use(session({
    secret: 'thisismysecret',
    resave: false, 
    saveUninitialized: false
}))



adminRouter.get('/', adminAuth.isLogout, adminController.loadLogin)
adminRouter.post('/dashboard', adminController.verifyLogin)
adminRouter.get('/dashboard', mainController.loadDashboard)
adminRouter.get('/users', userController.getUser)
adminRouter.get('/usersBlock', userController.usersBlock)
adminRouter.get('/products', productController.loadProducts)
adminRouter.get('/products/add-product', productController.addProduct)
adminRouter.get('/category', categoryController.loadCategory)
adminRouter.get('/category/add-category', categoryController.loadAddCategory)
adminRouter.post('/category/add-category', categoryController.addCategory)
adminRouter.get('/category/edit-category', categoryController.editCategory)
adminRouter.post('/category/edit-category', categoryController.postEditCategory)



module.exports = adminRouter