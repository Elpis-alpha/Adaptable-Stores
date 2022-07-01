"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
// Task Model
const Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
