import express, { Router } from 'express'

import { MyCart, MyItem, MyUser } from '../models/_model_types'

import Item from '../models/Item'

import itemAuth from '../middleware/item-auth'

import { errorJson } from '../middleware/errors'


const router: Router = express.Router()


// Sends post request to create items
router.post('/api/items/create', itemAuth, async (req, res) => {

  const newItem: MyItem = new Item(req.body)

  try {

    await newItem.save()

    res.status(201).send(newItem)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends get request to get all items
router.get('/api/items/get-all', async (req, res) => {

  const sort = {}

  if (req.query.sortBy) {

    // @ts-ignore
    const query = req.query.sortBy.split(':')

    query[1] = query[1] === 'asc' ? 1 : -1

    // @ts-ignore
    sort[query[0]] = query[1]

  }

  try {

    await Item.find({}, {

      // @ts-ignore
      limit: parseInt(req.query.limit),

      // @ts-ignore
      skip: parseInt(req.query.skip),

      sort

    })

    // @ts-ignore
    res.send(req.user.items)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends get request to get a specific item
router.get('/api/items/get', async (req, res) => {

  const _id = req.query._id

  try {

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return res.status(404).send()

    res.send(item)

  } catch (error) {

    return errorJson(res, 404)

  }

})


// Sends patch request to update items
router.patch('/api/items/update', itemAuth, async (req, res) => {

  const _id = req.query._id

  const updates = Object.keys(req.body)

  const allowedUpdate = ['title', 'description', 'category', 'price']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    // @ts-ignore
    const user: MyUser = req.user

    const item: (MyItem | null) = await Item.findOne({ _id, owner: user._id })

    if (!item) return errorJson(res, 404)
    
    // @ts-ignore
    updates.forEach(item => item[item] = req.body[item])
    
    await item.save()

    res.status(201).send(item)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends delete request to delete items
router.delete('/api/items/delete', itemAuth, async (req, res) => {

  const _id = req.query._id

  try {

    const item: (MyItem | null) = await Item.findOneAndDelete({ _id })

    if (!item) return errorJson(res, 404)

    res.send(item)

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
