import mongoose from 'mongoose'


const orderSchema = new mongoose.Schema({

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

      price: Number

    }

  ],

  data: {

    type: Object,

    required: true,

  }

}, { timestamps: true })

// Order Model
const Order = mongoose.model('Order', orderSchema)

export default Order
