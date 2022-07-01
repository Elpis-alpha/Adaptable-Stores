import express, { Router } from 'express';

import multer from 'multer'

import sharp from 'sharp'

import User from '../models/User'

import auth from '../middleware/auth'

import { errorJson } from '../middleware/errors'

import { MyUser } from '../models/_model_types';


const router: Router = express.Router()

const upload = multer({

  limits: { fileSize: 20000000 },

  fileFilter(req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) cb(new Error('Please upload an image'))

    cb(null, true)

  }

})


// Sends post request to create new user
router.post('/api/users/create', async (req, res) => {

  const user: MyUser = new User(req.body)

  try {

    await user.save()

    const token = await user.generateAuthToken()

    const verifyUser = await user.sendVerificationEmail()

    res.status(201).send({ user, token, verifyUser })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// sends get request to send verification mail to auth user
router.get('/api/users/verify', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  const verifyUser = await user.sendVerificationEmail()

  return res.send(verifyUser)

})


// Sends post request to log user in
router.post('/api/users/login', async (req, res) => {

  const userData = req.body

  try {

    // @ts-ignore
    const user: MyUser = await User.findbyCredentials(userData.email, userData.password)

    const token = await user.generateAuthToken()

    res.status(200).send({ user, token })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log user out
router.post('/api/users/logout', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  // @ts-ignore
  const token: string = req.token

  const all = req.query.all

  try {

    if (all === "true") {

      user.tokens = []

    } else {

      user.tokens = user.tokens.filter(item => item.token !== token)

    }

    await user.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to fetch auth user
router.get('/api/users/user', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  res.send(user)

})


// sends get request to find a user
router.get('/api/users/find', async (req, res) => {

  const _id = req.query.id

  const email = req.query.email

  try {

    let user: any

    if (typeof _id === "string") {

      user = await User.findById(_id)

      if (!user) return errorJson(res, 404)

    } else if (typeof email === "string") {

      user = await User.findOne({ email })

      if (!user) return errorJson(res, 404)

    } else {

      return errorJson(res, 400)

    }

    res.send(user.toPublicJSON())

  } catch (e) {

    return errorJson(res, 500)

  }

})


// Sends patch request to update users
router.patch('/api/users/update', auth, async (req, res) => {

  const updates = Object.keys(req.body)

  const allowedUpdate = ['name']

  const isValidOp = updates.every(item => allowedUpdate.includes(item))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    // @ts-ignore
    const user: MyUser = req.user

    // @ts-ignore
    updates.forEach(item => user[item] = req.body[item])

    await user.save()

    // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

    res.status(201).send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends patch request to change password
router.post('/api/users/change-password', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    // @ts-ignore
    const _user = await User.findbyCredentials(user.email, req.body.oldPassword)

    user.password = req.body.newPassword

    await user.save()

    res.status(201).send(user)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends delete request to delete users
router.delete('/api/users/delete', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    await user.sendExitEmail()

    await User.deleteOne({ _id: user._id })

    res.send({ message: 'user deleted' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends post request to create and upload the users profile avatar
router.post('/api/users/avatar/upload', auth, upload.single('avatar'), async (req, res) => {

  try {

    // @ts-ignore
    const userF: MyUser = req.user

    // @ts-ignore
    const user: MyUser = await User.findById(userF._id)

    if (!req.file) throw new Error('No File')

    const bufferSmall = await sharp(req.file.buffer).resize({ width: 100 }).png({ quality: 20 }).toBuffer()

    const buffer = await sharp(req.file.buffer).resize({ width: 900 }).png({ quality: 20 }).toBuffer()

    user.avatar = buffer

    user.avatarSmall = bufferSmall

    await user.save()

    res.send({ message: 'Image Saved' })

  } catch (error) {

    console.log(error);
    

    return errorJson(res, 400)

  }

  // @ts-ignore
}, (error, req, res, next) => errorJson(res, 500))


// Sends delete request to delete the users profile avatar
router.delete('/api/users/avatar/remove', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    user.avatar = undefined

    user.avatarSmall = undefined

    await user.save()

    res.send({ message: 'avatar removed' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends get request to render profile avatar
router.get('/api/users/avatar/view', async (req, res) => {

  const _id = req.query._id

  try {

    const user = await User.findById(_id)

    if (!user || !user.avatar) throw new Error("No User or Avatar")

    res.set('Content-Type', 'image/png')

    if (req.query.size === "small") { res.send(user.avatarSmall) }

    else { res.send(user.avatar) } // large

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to check user existence
router.get('/api/users/user/exists', async (req, res) => {

  try {

    const user = await User.findOne({ email: req.query.email })

    if (user === null) { return res.status(200).send({ message: 'user does not exist' }) }

    res.send({ message: 'user exists' })

  } catch (error) {

    res.status(200).send({ message: 'user does not exist' })

  }

})


export default router
