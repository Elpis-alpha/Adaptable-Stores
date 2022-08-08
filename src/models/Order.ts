import mongoose from 'mongoose'

import { checkoutMail } from '../mail/mailTypes'
import sendMail from '../mail/sendMail'
import User from './User'

const siteName: any = process.env.SITE_NAME

const host: any = process.env.HOST


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



orderSchema.methods.sendCheckoutMail = async function () {

  const order = this

  const mailBody = checkoutMail(siteName, `${host}/complain`, order.items, order?.data?.gateway === 'stripe', order?.data?.info?.charge?.receipt_url)

  try {

    const user = await User.findOne({ _id: order.owner })

    const mail = await sendMail(user.email, `Checkout Notice`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// Order Model
const Order = mongoose.model('Order', orderSchema)

export default Order
