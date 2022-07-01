const Order = require('../models/Order')

const { errorJson } = require('./errors')

import { Response, Request, NextFunction } from 'express';

const authOrder = async (req: Request, res: Response, next: NextFunction) => {

  try {

    // @ts-ignore
    const order = await Order.find({ owner: req.user._id }).sort({ createdAt: -1 })
    
    if (!order) return errorJson(res, 404)
    
    // @ts-ignore
    req.order = order

    next()

  } catch (error) {

    return errorJson(res, 404)

  }

}

export default authOrder