const Category = require('../../model/categoryModel');
const Product = require('../../model/productModel')

const loadCategory = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/category", { category });
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const loadAddCategory = async (req, res) => {
  try {
    res.render("admin/add-category");
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const addCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName.trim();
    const offer = parseInt(req.body.offer, 10); // Parse offer as an integer

    // Define a regular expression for valid category names
    const validCategoryNameRegex = /^[a-zA-Z0-9_ ]+$/;

    if (categoryName === '' || !validCategoryNameRegex.test(categoryName)) {
      return res.render('admin/add-category', { error: 'Please enter a valid category name with alphanumeric characters, spaces, and underscores only' });
    } else if (isNaN(offer) || offer < 0 || offer > 100) {
      return res.render('admin/add-category', { error: 'Please enter a valid offer percentage between 0 and 100' });
    } else {
      const check = await Category.findOne({ category: { $regex: new RegExp(`^${categoryName}$`, "i") } });

      if (check) {
        res.render('admin/add-category', { error: 'Category already exists' });
      } else {
        const category = await Category.create({ category: categoryName, offer: offer });

        if (category) {
          return res.render('admin/add-category', { success: 'Category added Successfully' });
        } else {
          return res.render('admin/add-category', { error: 'Category creation failed' });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById(id);
    res.render('admin/editCategory', { categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditCategory = async (req, res) => {
  try {    
    const categoryName = req.body.categoryName.trim();
    const offer = parseInt(req.body.offer, 10);
    const id = req.body.id;
    const categoryData = await Category.findById(id)
    
    const validCategoryNameRegex = /^[a-zA-Z0-9_ ]+$/;

    if (categoryName === '' || !validCategoryNameRegex.test(categoryName)) {
      return res.render('admin/editCategory', { error: 'Please enter a valid category name with alphanumeric characters, spaces, and underscores only', categoryData });
    } else if (isNaN(offer) || offer < 0 || offer > 100) {
      return res.render('admin/editCategory', { error: 'Please enter a valid offer percentage between 0 and 100', categoryData });
    } else {
      const check = await Category.findOne({ category: { $regex: new RegExp(`^${categoryName}$`, "i"), $ne: categoryData.category } });

      if (check) {
        res.render('admin/editCategory', { error: 'Category already exists' , categoryData});
      } else {
        const category = await Category.updateOne({_id: id}, {category: categoryName, offer: offer});       
        if(category){
          return res.redirect('/admin/category')
        }   
      }
    }     
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.findByIdAndDelete({ _id: id });

    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCategory,
  loadAddCategory,
  addCategory,
  editCategory,
  postEditCategory,
  deleteCategory
};
