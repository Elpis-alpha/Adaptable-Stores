import { Response, Request, NextFunction } from 'express';

import { errorJson } from './errors';

import Cart from '../models/Cart';


const authCart = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // @ts-ignore
    const cart = await Cart.findOne({ owner: req.user._id })

    if (!cart) return errorJson(res, 404, "Cart not Available")

    // @ts-ignore
    req.cart = cart

    next()

  } catch (error) {

    return errorJson(res, 404)

  }

}

export default authCart