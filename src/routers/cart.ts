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

    if (qty <= 0) return errorJson(res, 400, "Quantity must be greater than zero")

    // @ts-ignore
    const item: MyItem = await Item.findById(_id) //.findOne({ _id })

    if (!item) return errorJson(res, 404, "Item not found")

    const uItem = cart.items.find(itemX => item._id.toString() === itemX.productID)

    if (uItem) {

      uItem.quantity = uItem.quantity + qty

      uItem.price = uItem.price + (item.price * qty)

    } else {

      cart.items.push({

        productID: _id,

        name: item.title,

        quantity: qty,

        price: item.price * qty

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

  try {

    // @ts-ignore
    const cart: MyCart = req.cart

    const { _id, qty } = req.body

    if (qty <= 0) return errorJson(res, 400, "Quantity must be greater than zero")
    

    // @ts-ignore
    const item: MyItem = await Item.findById({ _id })
    

    const uItem = cart.items.find(itemX => item._id.toString() === itemX.productID)

    if (uItem) {

      if (uItem.quantity <= qty) {
        
        cart.items = cart.items.filter(item => item.productID !== _id)
        
      } else {
        
        uItem.price = uItem.price - ((uItem.price / uItem.quantity) * qty)
        
        uItem.quantity = uItem.quantity - qty

      }

    }

    await cart.save()

    res.send(cart)

  } catch (error) {

    console.log(error);

    return errorJson(res, 500)

  }

})


export default router
