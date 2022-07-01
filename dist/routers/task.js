"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const errors_1 = require("../middleware/errors");
const Task_1 = __importDefault(require("../models/Task"));
const router = express_1.default.Router();
// Sends post request to create tasks
router.post('/api/tasks/create', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    const newTask = new Task_1.default(Object.assign(Object.assign({}, req.body), { owner: user._id }));
    try {
        yield newTask.save();
        res.status(201).send(newTask);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends get request to get all tasks
router.get('/api/tasks/find', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sort = {};
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
    const skip = typeof req.query.skip === "string" ? parseInt(req.query.skip) : 0;
    if (typeof req.query.sort === "string") {
        const query = req.query.sort.split(':');
        // @ts-ignore
        query[1] = query[1] === 'asc' ? 1 : -1;
        sort[query[0]] = query[1];
    }
    else {
        sort.title = 1;
    }
    try {
        // @ts-ignore
        const user = req.user;
        const tasks = yield Task_1.default.find({ owner: user._id }).limit(limit).skip(skip).sort(sort);
        res.send(tasks);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to get a specific task
router.get('/api/tasks/get', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query.id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "Invalid query for 'id'");
        // @ts-ignore
        const user = req.user;
        const task = yield Task_1.default.findOne({ _id, owner: user._id });
        if (!task)
            return (0, errors_1.errorJson)(res, 404, "Task does not exist");
        res.send(task);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends patch request to update tasks
router.patch('/api/tasks/update', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query.id;
    const updates = Object.keys(req.body);
    const allowedUpdate = ['title', 'description', 'completed', 'endDate'];
    const isValidOp = updates.every(task => allowedUpdate.includes(task));
    if (!isValidOp)
        return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate });
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "Invalid query for 'id'");
        // @ts-ignore
        const user = req.user;
        const task = yield Task_1.default.findOne({ _id, owner: user._id });
        if (!task)
            return (0, errors_1.errorJson)(res, 404, "Task not found");
        updates.forEach(upx => task[upx] = req.body[upx]);
        yield task.save();
        res.status(201).send(task);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends delete request to delete tasks
router.delete('/api/tasks/delete', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query.id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "Invalid query for 'id'");
        // @ts-ignore
        const user = req.user;
        const task = yield Task_1.default.findOneAndDelete({ _id, owner: user._id });
        if (!task)
            return (0, errors_1.errorJson)(res, 404, "Task not found");
        res.send({ message: "Task Deleted" });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
