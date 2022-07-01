import mongoose from 'mongoose'


const cartSchema = new mongoose.Schema({

  owner: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

    ref: 'User'

  },

  items: [

    {

      productID: {

        type: String

      },

      name: String,

      quantity: {

        type: Number,

        required: true,

        min: 1,

        default: 1

      },

    }

  ],

}, { timestamps: true })

// Cart Model
const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart
