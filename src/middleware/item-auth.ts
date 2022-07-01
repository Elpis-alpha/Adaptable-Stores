import { Response, Request, NextFunction } from 'express';

import { errorJson } from './errors';

const itemAuth = async (req: Request, res: Response, next: NextFunction) => {

  if (req.query.item_password !== process.env.ITEM_PASSWORD) return errorJson(res, 401)
  
  next()

}

export default itemAuth