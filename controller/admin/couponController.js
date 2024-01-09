const Coupon = require('../../model/couponModel')

const loadCoupon = async (req, res) => {
    try {
        let foundCoupons;

        if (req.query.search) {
            foundCoupons = await Coupon.find({
                isActive: req.body.searchQuery === "1" ? true : false
            });
            return res.status(200).json({
                couponDatas: foundCoupons,
            });
        } else {
            foundCoupons = await Coupon.find();
            res.render('admin/coupon', {
                activePage: "coupon",
                foundCoupons,
                filtered: req.query.search ? true : false,
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const getAddNewCoupon = async(req, res) => {
    try {
        res.render('admin/newCoupon', { error: '' })
    } catch (error) {
        console.log(error.message);
    }
}

function genarateCouponCode() {
    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = '';
    while(!codeRegex.test(code)) {
        code = Math.random().toString(36).substring(7)
    }
    return Coupon.findOne({ code }).then(existingCoupon => {
        if(existingCoupon){
            return genarateCouponCode
        }
        return code
    })
}

const addNewCoupon = async(req, res) => {
    try {
        const { description, discountType, discountAmount, minimumPurchaseAmount, usageLimit } = req.body
        if (!description || !discountType || !discountAmount || !minimumPurchaseAmount || !usageLimit) {
            res.render('admin/newCoupon', {                
                error: "All fields are required",
            });
        }else{
            if(discountType === "percentage" && discountAmount>100){
                return res.render('admin/newCoupon', {                    
                    error: "Discount percentage is greater than 100",
                });
            }
            if (description.length < 4 || description.length > 100) {
                return res.render('admin/newCoupon', {                    
                    error: "Description must be between 4 and 100 characters",
                });
            } else {
                const uniqueCode = await genarateCouponCode();
                const newCoupon = new Coupon({
                    code: uniqueCode,
                    discountType,
                    description,
                    discountAmount,
                    minimumPurchaseAmount,
                    usageLimit,
                });

                await newCoupon.save();

                res.redirect("/admin/coupon");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const couponAction = async (req, res, next) => {
    try {
        const state = req.body.state === "";
        const couponId = req.params.id;
        await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: state } });
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadCoupon,
    getAddNewCoupon,
    addNewCoupon,
    couponAction
}