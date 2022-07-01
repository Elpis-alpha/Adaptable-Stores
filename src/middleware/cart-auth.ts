const Cart = require('../models/Cart')

const { errorJson } = require('./errors')

import { Response, Request, NextFunction } from 'express';

const authCart = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // @ts-ignore
    const cart = await Cart.find({ owner: req.user._id })

    if (!cart) return errorJson(res, 404)

    // @ts-ignore
    req.cart = cart

    next()

  } catch (error) {

    return errorJson(res, 404)

  }

}

module.exports = authCart