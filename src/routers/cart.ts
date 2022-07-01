import express, { Router } from 'express'

import auth from '../middleware/auth'

import cartAuth from '../middleware/cart-auth'

import Item from '../models/Item'

import { errorJson } from '../middleware/errors'

import { MyCart, MyItem } from '../models/_model_types'


const router: Router = express.Router()


// Sends get request to get a cart
router.get('/api/cart/get', auth, cartAuth, async (req, res) => {

  // @ts-ignore
  res.send(req.cart)

})


// Sends post request to add item to cart
router.post('/api/cart/add', auth, cartAuth, async (req, res) => {

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    const { _id, qty } = req.body

    // @ts-ignore
    const item: MyItem = await Item.findOne({ _id })

    if (!item) return res.status(404).send()

    const uItem = cart.items.find(itemX => item._id === itemX.productID)

    if (uItem) {

      uItem.quantity = uItem.quantity + qty

    } else {

      cart.items.push({

        productID: _id,

        name: item.title,

        quantity: qty

      })

    }

    await cart.save()

    res.status(200).send(cart)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends delete request to remove item from cart
router.delete('/api/cart/remove', auth, cartAuth, async (req, res) => {

  const _id = req.query._id

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    cart.items = cart.items.filter(item => item.productID !== _id)

    await cart.save()

    res.send(cart)

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
