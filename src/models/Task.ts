import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({

  owner: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

    ref: 'User'

  },

  title: {

    type: String,

    required: true,

    trim: true,

  },

  description: {

    type: String,

    trim: true,

  },

  completed: {

    type: Boolean,

    required: true,

    default: false

  },

  endDate: {

    type: Date

  }

}, { timestamps: true })

// Task Model
const Task = mongoose.model('Task', taskSchema)

export default Task
