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
const Item_1 = __importDefault(require("../models/Item"));
const item_auth_1 = __importDefault(require("../middleware/item-auth"));
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
// Sends post request to create items
router.post('/api/items/create', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newItem = new Item_1.default(req.body);
    try {
        yield newItem.save();
        res.status(201).send(newItem);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends get request to get all items
router.get('/api/items/get-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sort = {};
    if (req.query.sortBy) {
        // @ts-ignore
        const query = req.query.sortBy.split(':');
        query[1] = query[1] === 'asc' ? 1 : -1;
        // @ts-ignore
        sort[query[0]] = query[1];
    }
    // @ts-ignore
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    // @ts-ignore
    const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
    try {
        const items = yield Item_1.default.find({}).limit(limit).skip(skip);
        // @ts-ignore
        res.send(items);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to get a specific item
router.get('/api/items/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return res.status(404).send();
        res.send(item);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 404);
    }
}));
// Sends patch request to update items
router.patch('/api/items/update', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const updates = Object.keys(req.body);
    const allowedUpdate = ['title', 'description', 'category', 'price'];
    const isValidOp = updates.every(item => allowedUpdate.includes(item));
    if (!isValidOp)
        return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate });
    try {
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        // @ts-ignore
        updates.forEach(up => item[up] = req.body[up]);
        yield item.save();
        res.status(201).send(item);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends delete request to delete items
router.delete('/api/items/delete', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        const item = yield Item_1.default.findOneAndDelete({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        res.send(item);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
