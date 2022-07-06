import express, { Router } from 'express'

import { MyCart, MyItem, MyUser } from '../models/_model_types'

import Item from '../models/Item'

import itemAuth from '../middleware/item-auth'

import { errorJson } from '../middleware/errors'
import { isArray } from 'util'


const router: Router = express.Router()


// Sends post request to create items
router.post('/api/items/create', itemAuth, async (req, res) => {

  if (isArray(req.body)) {

    try {

      const allItems = Item.insertMany(req.body)

      res.status(201).send(allItems)

    } catch (error) {

      return errorJson(res, 400)

    }

  } else {

    try {

      const newItem: MyItem = new Item(req.body)

      await newItem.save()

      res.status(201).send(newItem)

    } catch (error) {

      return errorJson(res, 400)

    }

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

  // Section Setup
  const section = req.query.section ? req.query.section : "All"

  let sectionData = section === "All" ? {} : { section }

  // Filter Data
  const filter = typeof req.query.filter === "string" ? new RegExp(req.query.filter, 'i') : undefined

  const filterData = filter ? { $or: [{ title: { $regex: filter } }, { description: { $regex: filter } }], ...sectionData } : {}

  sectionData = filter ? {} : sectionData


  // @ts-ignore
  const limit: any = req.query.limit ? parseInt(req.query.limit) : undefined

  // @ts-ignore
  const skip: any = req.query.skip ? parseInt(req.query.skip) : undefined

  try {

    const items: MyItem[] = await Item.find({ ...sectionData, ...filterData }).limit(limit).skip(skip)

    res.send(items)

  } catch (error) {

    console.log(error);

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

  const allowedUpdate = ['title', 'description', 'section', 'price']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    // @ts-ignore
    updates.forEach(up => item[up] = req.body[up])

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

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    res.send(item)

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
