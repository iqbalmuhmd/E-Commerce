const mongoose = require('mongoose')

const categorySchema = {
    category: {
        type: String,
        required: true
    },
    offer: {
        type: Number
    }
}

module.exports = mongoose.model('Category', categorySchema)