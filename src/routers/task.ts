import express, { Router } from 'express';

import auth from '../middleware/auth'

import { errorJson } from '../middleware/errors';

import Task from '../models/Task';

import { MyTask, MyUser } from '../models/_model_types';


const router: Router = express.Router()


// Sends post request to create tasks
router.post('/api/tasks/create', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  const newTask: MyTask = new Task({

    ...req.body,

    owner: user._id

  })

  try {

    await newTask.save()

    res.status(201).send(newTask)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends get request to get all tasks
router.get('/api/tasks/find', auth, async (req, res) => {

  const sort: any = {}

  const limit: number = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10

  const skip: number = typeof req.query.skip === "string" ? parseInt(req.query.skip) : 0

  if (typeof req.query.sort === "string") {

    const query = req.query.sort.split(':')

    // @ts-ignore
    query[1] = query[1] === 'asc' ? 1 : -1

    sort[query[0]] = query[1]

  } else {

    sort.title = 1

  }


  try {

    // @ts-ignore
    const user: MyUser = req.user

    const tasks = await Task.find({ owner: user._id }).limit(limit).skip(skip).sort(sort)

    res.send(tasks)

  } catch (error) {

    return errorJson(res, 500)


  }

})


// Sends get request to get a specific task
router.get('/api/tasks/get', auth, async (req, res) => {

  const _id = req.query.id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "Invalid query for 'id'")

    // @ts-ignore
    const user: MyUser = req.user

    const task = await Task.findOne({ _id, owner: user._id })

    if (!task) return errorJson(res, 404, "Task does not exist")

    res.send(task)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends patch request to update tasks
router.patch('/api/tasks/update', auth, async (req, res) => {

  const _id = req.query.id

  const updates = Object.keys(req.body)

  const allowedUpdate = ['title', 'description', 'completed', 'endDate']

  const isValidOp = updates.every(task => allowedUpdate.includes(task))

  if (!isValidOp) return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate })

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "Invalid query for 'id'")

    // @ts-ignore
    const user: MyUser = req.user

    const task = await Task.findOne({ _id, owner: user._id })

    if (!task) return errorJson(res, 404, "Task not found")

    updates.forEach(upx => task[upx] = req.body[upx])

    await task.save()

    res.status(201).send(task)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends delete request to delete tasks
router.delete('/api/tasks/delete', auth, async (req, res) => {

  const _id = req.query.id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "Invalid query for 'id'")

    // @ts-ignore
    const user: MyUser = req.user

    const task = await Task.findOneAndDelete({ _id, owner: user._id })

    if (!task) return errorJson(res, 404, "Task not found")

    res.send({ message: "Task Deleted" })

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
