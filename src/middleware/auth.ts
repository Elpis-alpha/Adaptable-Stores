import jsonwebtoken from 'jsonwebtoken'

import User from '../models/User'

import { Response, Request, NextFunction } from 'express';


const jwtSecret: any = process.env.JWT_SECRET


const auth = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) throw new Error('Invalid Token')

    const decoded = jsonwebtoken.verify(token, jwtSecret)

    if (typeof decoded === "string") throw new Error("Invalid Token")

    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }, { avatar: 0, avatarSmall: 0 })

    if (!user) throw new Error('Invalid Token')

    // @ts-ignore
    req.token = token
    
    // @ts-ignore
    req.user = user

    next()

  } catch (error) {

    res.status(401).send({ error: 'Not Authenticated' })

  }

}

export default auth