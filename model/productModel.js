const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  images: [String],
  additionalInfo: {
    type: String,
  },
  rating: [
    {
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rate: {
        type: Number,
      },
      review: {
        type: String,
      },
    }
  ],
  offer: {
    type: Number,
    default: 0
  },
  offerPrice: {
    type: Number
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
