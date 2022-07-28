import express, { Router } from 'express'

import { MyItem } from '../models/_model_types'

import Item from '../models/Item'

import itemAuth from '../middleware/item-auth'

import { errorJson } from '../middleware/errors'

import { isArray } from 'util'

import multer from 'multer'
import sharp from 'sharp'


const router: Router = express.Router()

const upload = multer({

  limits: { fileSize: 20000000 },

  fileFilter(req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) cb(new Error('Please upload an image'))

    cb(null, true)

  }

})

const itemWithPics = (item: MyItem) => {

  const picData = item.pictures.map(picInfo => {

    return {

      picID: picInfo._id,

      order: picInfo.order

    }

  })

  return { ...item.toJSON(), pics: picData }

}



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

      res.status(201).send(itemWithPics(newItem))

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

    const items: MyItem[] = await Item.find({ ...sectionData, ...filterData }).limit(limit).skip(skip).sort(sort)

    // Retreive Picture data
    const exportData = items.map(item => itemWithPics(item))

    res.send(exportData)

  } catch (error) {

    console.log(error);

    return errorJson(res, 500)

  }

})


// Sends get request to get a specific item
router.get('/api/items/get', async (req, res) => {

  const _id = req.query._id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return res.status(404).send()

    res.send(itemWithPics(item))

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

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    // @ts-ignore
    updates.forEach(up => item[up] = req.body[up])

    await item.save()

    res.status(201).send(itemWithPics(item))

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends delete request to delete items
router.delete('/api/items/delete', itemAuth, async (req, res) => {

  const _id = req.query._id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOneAndDelete({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    res.send(itemWithPics(item))

  } catch (error) {

    return errorJson(res, 500)

  }

})



// Pictures Requests


// Sends post request to upload a picture
router.post('/api/items/picture/upload', itemAuth, upload.single('picture'), async (req, res) => {

  const _id = req.query._id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    if (!req.file) return errorJson(res, 400, 'No File')

    if (item.pictures.length >= 10) return errorJson(res, 403, 'Max number of pictures')

    const buffer = await sharp(req.file.buffer).resize({ width: 800 }).png({ quality: 20 }).toBuffer()

    item.pictures = item.pictures.concat({ image: buffer, order: 10 })

    await item.save()

    res.status(201).send(itemWithPics(item))

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends get request to reorder pictures
router.get('/api/items/pictures/reorder', itemAuth, async (req, res) => {

  const _id = req.query._id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return res.status(404).send()

    const newOrderList: { _id: string, order: number }[] = req.body

    item.pictures = item.pictures.map(pic => {

      const batch = newOrderList.find(se => se._id === pic._id?.toString())

      const order = batch?.order ? batch?.order : pic.order

      return { ...pic, order }

    })

    await item.save()

    const { pics } = itemWithPics(item)

    res.send(pics)

  } catch (error) {

    console.log(error);

    return errorJson(res, 500)

  }

})


// Sends delete request to delete the users profile avatar
router.delete('/api/items/pictures/remove', itemAuth, async (req, res) => {

  const _id = req.query._id

  const picID = req.query.picID

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")

    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    if (typeof picID !== "string") return errorJson(res, 400, "No picID provided")

    item.pictures = item.pictures.filter(item => item._id?.toString() !== picID)

    await item.save()

    res.send({ message: 'picture removed' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends get request to render profile avatar
router.get('/api/items/pictures/view', async (req, res) => {

  const _id = req.query._id

  const picID = req.query.picID

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "No _id provided")
    
    const item: (MyItem | null) = await Item.findOne({ _id })

    if (!item) return errorJson(res, 404, "Product (Item) not found")

    if (typeof picID !== "string") return errorJson(res, 400, "No picID provided")

    const batch = item.pictures.find(pic => pic._id?.toString() === picID)

    if (!batch) return errorJson(res, 404, "Picture not found")

    res.set('Content-Type', 'image/png')

    res.send(batch.image)

  } catch (error) {

    return errorJson(res, 500)

  }

})

export default router
