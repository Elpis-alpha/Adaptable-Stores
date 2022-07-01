import express, { Router } from 'express'

import Stripe from 'stripe'

import auth from '../middleware/auth'

import orderAuth from '../middleware/order-auth'

import cartAuth from '../middleware/cart-auth'

import Item from '../models/Item'

import Order from '../models/Order'

import { errorJson } from '../middleware/errors'

import { MyCart, MyItem, MyUser } from '../models/_model_types'


const router: Router = express.Router()

const stripeKey: any = process.env.STRIPE_API_KEY

const stripe = new Stripe(stripeKey, {

  apiVersion: "2020-08-27"

})

// Sends get request to get a order
router.get('/api/order/get', auth, orderAuth, async (req, res) => {

  // @ts-ignore
  res.send(req.order)

})


// Sends post request to add item to order
router.post('/api/order/add', auth, cartAuth, async (req, res) => {

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    // @ts-ignore
    const user: MyUser = req.user

    const { source } = req.body

    const email = user.email

    let amount = 0

    const orderItems = []

    for (const item of cart.items) {

      const product: (MyItem | null) = await Item.findOne({ _id: item.productID })

      if (!product) return errorJson(res, 404)

      orderItems.push({

        productID: product._id,

        name: product.title,

        quantity: item.quantity,

        price: product.price

      })

      amount += (product.price * item.quantity)

    }

    console.log(amount);

    if (cart.items.length > 0) {

      const charge = await stripe.charges.create({

        amount, currency: "usd",

        source, receipt_email: email

      })

      if (!charge) throw new Error('bats-payment')

      if (charge) {

        const order = await Order.create({

          owner: user._id, items: orderItems

        })

        cart.items = []

        await cart.save()

        return res.status(200).send(order)

      }

    } else {

      return errorJson(res, 500)

    }

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
