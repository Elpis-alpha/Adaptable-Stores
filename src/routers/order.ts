import express, { Router } from 'express'

import Stripe from 'stripe'

import auth from '../middleware/auth'

import orderAuth from '../middleware/order-auth'

import cartAuth from '../middleware/cart-auth'

import Order from '../models/Order'

import { errorJson } from '../middleware/errors'

import { MyCart, MyUser } from '../models/_model_types'


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


// Sends post request to add item to order with stripe
router.post('/api/order/add-stripe', auth, cartAuth, async (req, res) => {

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    // @ts-ignore
    const user: MyUser = req.user

    const { source } = req.body

    const receipt_email = user.email

    let amount = 0

    const orderItems = []

    for await (const item of cart.items) {

      orderItems.push({ ...item })

      amount += item.price * 100

    }

    if (cart.items.length > 0) {

      if (!source) return errorJson(res, 400, "Source not provided")

      const charge = await stripe.charges.create({

        amount, currency: "usd",

        source: source.id, receipt_email

      })

      if (!charge) return errorJson(res, 502, "Stripe Charge Creation Failed")

      if (charge) {

        const order = await Order.create({

          owner: user._id, items: orderItems, 
          
          data: {

            gateway: "stripe",
    
            info: { source, charge }
    
          }

        })

        cart.items = []

        await cart.save()

        return res.status(200).send({ order, cart })

      }

    } else {

      return errorJson(res, 400, "Cart is Empty")

    }

  } catch (error) {

    console.log(error);

    return errorJson(res, 500)

  }

})


// Sends post request to add item to order with stripe
router.post('/api/order/add-paypal', auth, cartAuth, async (req, res) => {

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    // @ts-ignore
    const user: MyUser = req.user

    const { data } = req.body

    const orderItems = []

    for await (const item of cart.items) {

      orderItems.push({ ...item })

    }

    const order = await Order.create({

      owner: user._id, items: orderItems, data

    })

    cart.items = []

    await cart.save()

    return res.status(200).send({ order, cart })

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
