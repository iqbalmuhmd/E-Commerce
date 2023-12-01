const User = require('../../model/userModel')

const loadProducts = async (req, res) => {
    try {
      res.render("admin/products");
    } catch (error) {
      console.log(error.message);
    }
  };

  const addProduct = async (req, res) => {
    try {
      res.render("admin/add-Products");
    } catch (error) {
      console.log(error.message);
    }
  };

  module.exports = {
    loadProducts,
    addProduct,
  }