const fs = require('fs');
const path = require('path');
const Product = require('../../model/productModel');
const Category = require('../../model/categoryModel');

const loadProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category').exec();
    res.render("admin/products", { products });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/add-Product", { category });
  } catch (error) {
    console.log(error.message);
  }
};

const addProductPost = async (req, res) => {
  console.log(req.body);
  try {
    const { productName, category, quantity, description, price } = req.body;
    const imagesWithPath = req.body.images.map(img => '/products/' + img);
    const newProduct = new Product({
      productName: productName,
      description: description,
      quantity: quantity,
      price: price,
      category: category,
      images: imagesWithPath
    });
    await newProduct.save();
    res.redirect("/admin/products/add-product");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete({ _id: req.query.id });
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categories = await Category.find();
    const product = await Product.findOne({ _id: id }).populate("category");
    res.render("admin/editProduct", { product, categories });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    await Product.updateOne(
      { _id: req.body.id },
      {
        $set: {
          productName: req.body.productName,
          category: req.body.category,
          price: req.body.price,
          description: req.body.description,
          quantity: req.body.quantity,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log.error(error.message);
  }
};

const destroyProductImage = async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;
  try {
    await Product.findByIdAndUpdate(
      id,
      { $pull: { images: image } },
      { new: true }
    );

    fs.unlink(path.join(__dirname, "../public", image), (err) => {
      if (err) console.log(err);
    });

    res.redirect(`/admin/products/edit-product?id=${id}`);
  } catch (error) {
    console.log(error);
  }
};

const updateProductImages = async (req, res) => {
  console.log("halo");
  const { id } = req.params;
  const { images } = req.body;
  let imagesWithPath;
  if (images.length) {
    imagesWithPath = images.map((image) => "/products/" + image);
  }
  try {
    await Product.findByIdAndUpdate(
      id,
      { $push: { images: imagesWithPath } },
      { new: true }
    );
    res.redirect(`/admin/products/edit-product?id=${id}`);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProducts,
  loadAddProduct,
  addProductPost,
  deleteProduct,
  loadEditProduct,
  editProduct,
  destroyProductImage,
  updateProductImages
};
