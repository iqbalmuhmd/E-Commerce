const Category = require('../../model/categoryModel');

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

    if (categoryName === '') {
      return res.render('admin/add-category', { error: 'Please enter a Non-Empty Category name' });
    } else {
      const check = await Category.findOne({ category: { $regex: new RegExp(`^${categoryName}$`, "i") } });

      if (check) {
        res.render('admin/add-category', { error: 'Category already exists' });
      } else {
        const category = await Category.create({ category: categoryName });

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
    res.render('admin/editCategory', { category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditCategory = async (req, res) => {
  try {
    const categoryName = req.body.categoryName.trim();

    if (categoryName === '') {
      return res.render('admin/editCategory', { error: 'Please enter a Non-Empty Category name' });
    } else {
      const check = await Category.findOne({ category: { $regex: new RegExp(`^${categoryName}$`, "i") } });

      if (check) {
        res.render('admin/add-category', { error: 'Category already exists' });
      } else {
        await Category.updateOne({ _id: req.body.id }, { $set: { category: categoryName } });

        return res.redirect("/admin/category");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategory = async(req,res) =>{
  try {
    const id = req.query.id;
    await Category.findByIdAndDelete({ _id: id });

    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCategory,
  loadAddCategory,
  addCategory,
  editCategory,
  postEditCategory,
  deleteCategory
};
