import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({

  title: {

    type: String,

    required: true,

    trim: true,

  },

  category: { // Clothes, Books, Shoes, Cosmetics

    type: String,

    required: true,

    enum: {

      values: ["Cloth", "Book", "Shoe", "Cosmetic"],

      message: `{VALUE} is not supported`

    },

    trim: true,

  },

  description: {

    type: String,

    trim: true,

    required: true,

  },

  price: {

    required: true,

    type: Number,

    min: 1

  },

  pictures: [

    {

      image: {

        type: Buffer

      }

    }

  ],

}, { timestamps: true })



// Private profile
itemSchema.methods.toJSON = function () {

  const item = this

  const returnItem = item.toObject()

  delete returnItem.pictures

  return returnItem

}


// Item Model
const Item = mongoose.model('Item', itemSchema)

export default Item
