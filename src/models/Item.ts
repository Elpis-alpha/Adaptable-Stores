import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({

  title: {

    type: String,

    required: true,

    trim: true,

    unique: true,

  },

  section: { // Clothes, Shoes, Cosmetics

    type: String,

    required: true,

    enum: {

      values: ["Cloth", "Shoe", "Cosmetic"],

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

    min: 0

  },

  pictures: [

    {

      image: {

        type: Buffer,

        required: true

      },

      order: {

        type: Number,

        required: true,

        default: 10

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
