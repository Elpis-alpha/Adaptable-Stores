import express, { Router } from 'express';

import User from '../models/User';

import { errorHtml } from '../middleware/errors'

import sendMail from '../mail/sendMail';


const adminEmail: any = process.env.EMAIL_ADDRESS

const frontendLocation: any = process.env.FRONT_END_LOCATION

const siteName: any = process.env.SITE_NAME

const host: any = process.env.HOST

const sitePackage = {

  adminEmail, frontendLocation, siteName, host,

  description: `The backend side of ${siteName}`,

  complainLink: `/complain`, title: siteName,

}

const router: Router = express.Router()


router.get('/', async (req, res) => {

  res.render('index', {

    ...sitePackage

  })

})

router.get('/complain', async (req, res) => {

  try {

    res.render('complain', {

      ...sitePackage,

      title: siteName + " | Complaint"

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

router.post('/accept-complaint', async (req, res) => {

  try {

    if (req.body.content.trim() === "" || req.body.title.trim() === "") return errorHtml(res, 400)

    const mail = await sendMail(adminEmail, "A Complaint: " + req.body.title, req.body.content)

    // @ts-ignore
    if (mail.error) return errorHtml(res, 503)

    res.render('accept-complaint', {

      ...sitePackage,

      title: siteName + " | Accepted"

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

router.get('/mail/welcome-mail/:id/:verify', async (req, res) => {

  const _id = req.params.id

  const verify = req.params.verify

  try {

    const user = await User.findById(_id)

    if (!user) return errorHtml(res, 404)

    if (user.verify !== verify) return errorHtml(res, 401)

    res.render('mail/welcome-mail', {

      ...sitePackage,

      user: user.toJSON(),

      userString: JSON.stringify(user.toJSON()),

      verifyLink: `/mail/verify-user/${_id}/${verify}`,

      deleteLink: `/mail/delete-user/${_id}/${verify}`,

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

router.get('/mail/verify-user/:id/:verify', async (req, res) => {

  const _id = req.params.id

  const verify = req.params.verify

  try {

    const user = await User.findById(_id)

    if (!user) return errorHtml(res, 404)

    if (user.verify !== verify) return errorHtml(res, 401)

    if (user.verify === "true") return errorHtml(res, 403)

    user.verify = "true"

    await user.save()

    res.render('mail/verify-user', {

      ...sitePackage, user: user.toJSON(),

      userString: JSON.stringify(user.toJSON()),

      title: siteName + " | Verify Email",

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

router.get('/mail/delete-user/:id/:verify', async (req, res) => {

  const _id = req.params.id

  const verify = req.params.verify

  try {

    const user = await User.findById(_id)

    if (!user) return errorHtml(res, 404)

    if (user.verify !== verify) return errorHtml(res, 401)

    if (user.verify === "true") return errorHtml(res, 403)

    await User.deleteOne({ _id, verify })

    res.render('mail/delete-user', {

      ...sitePackage,

      title: siteName + " | Delete Account",

    })

  } catch (e) {

    errorHtml(res, 500)

  }

})

export default router