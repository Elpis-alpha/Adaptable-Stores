import mongoose from 'mongoose'

import validator from 'validator'

import bcryptjs from 'bcryptjs'

import jsonwebtoken from 'jsonwebtoken'

import { v4 } from 'uuid'

import sendMail from '../mail/sendMail'

import { welcomeMail, exitMail } from '../mail/mailTypes'

const siteName: any = process.env.SITE_NAME

const host: any = process.env.HOST

const jwtSecret: any = process.env.JWT_SECRET

// Sets up user schema
const userSchemer = new mongoose.Schema({

  name: {

    type: String,

    required: true,

    trim: true,

  },

  email: {

    type: String,

    trim: true,

    unique: true,

    required: true,

    lowercase: true,

    validate(value: string) {

      if (!validator.isEmail(value)) {

        throw new Error('Email is invalid')

      }

    }

  },

  password: {

    type: String,

    trim: true,

    required: true,

    minlength: 5,

  },

  tokens: [

    {

      token: {

        type: String,

        required: true

      }

    }

  ],

  avatar: {

    type: Buffer

  },

  avatarSmall: {

    type: Buffer

  },

  verify: {

    type: String,

    trim: true,

    default: v4()

  },

}, { timestamps: true });


// Create Virtual relationship with Item
userSchemer.virtual('tasks', {

  ref: 'Task',

  localField: '_id',

  foreignField: 'owner'

})


// Generate Authentication Token
userSchemer.methods.generateAuthToken = async function (): Promise<string> {

  const user = this

  const token = jsonwebtoken.sign({ _id: user.id.toString() }, jwtSecret, {})

  user.tokens.push({ token })

  await user.save()

  return token

}


// Private profile
userSchemer.methods.toJSON = function (): JSON {

  const user = this

  const returnUser = user.toObject()

  returnUser.verify = returnUser.verify === "true"

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  delete returnUser.avatarSmall

  return returnUser

}


// Public profile
userSchemer.methods.toPublicJSON = function (): JSON {

  const user = this

  const returnUser = user.toObject()

  returnUser.verify = returnUser.verify === "true"

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  delete returnUser.avatarSmall

  return returnUser

}


// send verification mail
userSchemer.methods.sendVerificationEmail = async function (): Promise<Object> {

  const user = this

  const mailBody = welcomeMail(siteName, `${host}/mail/welcome-mail/${user._id}/${user.verify}`)

  try {

    const mail = await sendMail(user.email, `Welcome to ${siteName}`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// send verification mail
userSchemer.methods.sendExitEmail = async function (): Promise<Object> {

  const user = this

  const mailBody = exitMail(siteName, `${host}/complain`)

  try {

    const mail = await sendMail(user.email, `Goodbye ${user.name}`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// For login
userSchemer.statics.findbyCredentials = async (email, password) => {

  const user = await User.findOne({ email }, { avatar: 0, avatarSmall: 0 })

  if (!user) throw new Error('Unable to login')

  const isMatch = await bcryptjs.compare(password, user.password)

  if (!isMatch) throw new Error('Unable to login')

  return user

}


// Hash password
userSchemer.pre('save', async function (next) {

  const user = this

  if (user.isModified('password')) user.password = await bcryptjs.hash(user.password, 8)

  next()

})


// Create User Model
const User = mongoose.model('User', userSchemer)


export default User
