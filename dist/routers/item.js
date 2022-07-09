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
const util_1 = require("util");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    limits: { fileSize: 20000000 },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error('Please upload an image'));
        cb(null, true);
    }
});
const itemWithPics = (item) => {
    const picData = item.pictures.map(picInfo => {
        return {
            picID: picInfo._id,
            order: picInfo.order
        };
    });
    return Object.assign(Object.assign({}, item.toJSON()), { pics: picData });
};
// Sends post request to create items
router.post('/api/items/create', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, util_1.isArray)(req.body)) {
        try {
            const allItems = Item_1.default.insertMany(req.body);
            res.status(201).send(allItems);
        }
        catch (error) {
            return (0, errors_1.errorJson)(res, 400);
        }
    }
    else {
        try {
            const newItem = new Item_1.default(req.body);
            yield newItem.save();
            res.status(201).send(itemWithPics(newItem));
        }
        catch (error) {
            return (0, errors_1.errorJson)(res, 400);
        }
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
    // Section Setup
    const section = req.query.section ? req.query.section : "All";
    let sectionData = section === "All" ? {} : { section };
    // Filter Data
    const filter = typeof req.query.filter === "string" ? new RegExp(req.query.filter, 'i') : undefined;
    const filterData = filter ? Object.assign({ $or: [{ title: { $regex: filter } }, { description: { $regex: filter } }] }, sectionData) : {};
    sectionData = filter ? {} : sectionData;
    // @ts-ignore
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    // @ts-ignore
    const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
    try {
        const items = yield Item_1.default.find(Object.assign(Object.assign({}, sectionData), filterData)).limit(limit).skip(skip);
        // Retreive Picture data
        const exportData = items.map(item => itemWithPics(item));
        res.send(exportData);
    }
    catch (error) {
        console.log(error);
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to get a specific item
router.get('/api/items/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return res.status(404).send();
        res.send(itemWithPics(item));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 404);
    }
}));
// Sends patch request to update items
router.patch('/api/items/update', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const updates = Object.keys(req.body);
    const allowedUpdate = ['title', 'description', 'section', 'price'];
    const isValidOp = updates.every(item => allowedUpdate.includes(item));
    if (!isValidOp)
        return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate });
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        // @ts-ignore
        updates.forEach(up => item[up] = req.body[up]);
        yield item.save();
        res.status(201).send(itemWithPics(item));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends delete request to delete items
router.delete('/api/items/delete', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOneAndDelete({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        res.send(itemWithPics(item));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Pictures Requests
// Sends post request to upload a picture
router.post('/api/items/picture/upload', item_auth_1.default, upload.single('picture'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        if (!req.file)
            return (0, errors_1.errorJson)(res, 400, 'No File');
        if (item.pictures.length >= 10)
            return (0, errors_1.errorJson)(res, 403, 'Max number of pictures');
        const buffer = yield (0, sharp_1.default)(req.file.buffer).resize({ width: 800 }).png({ quality: 20 }).toBuffer();
        item.pictures = item.pictures.concat({ image: buffer, order: 10 });
        yield item.save();
        res.status(201).send(itemWithPics(item));
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to reorder pictures
router.get('/api/items/pictures/reorder', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return res.status(404).send();
        const newOrderList = req.body;
        item.pictures = item.pictures.map(pic => {
            const batch = newOrderList.find(se => { var _a; return se._id === ((_a = pic._id) === null || _a === void 0 ? void 0 : _a.toString()); });
            const order = (batch === null || batch === void 0 ? void 0 : batch.order) ? batch === null || batch === void 0 ? void 0 : batch.order : pic.order;
            return Object.assign(Object.assign({}, pic), { order });
        });
        yield item.save();
        const { pics } = itemWithPics(item);
        res.send(pics);
    }
    catch (error) {
        console.log(error);
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends delete request to delete the users profile avatar
router.delete('/api/items/pictures/remove', item_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const picID = req.query.picID;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        if (typeof picID !== "string")
            return (0, errors_1.errorJson)(res, 400, "No picID provided");
        item.pictures = item.pictures.filter(item => { var _a; return ((_a = item._id) === null || _a === void 0 ? void 0 : _a.toString()) !== picID; });
        yield item.save();
        res.send({ message: 'picture removed' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to render profile avatar
router.get('/api/items/pictures/view', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    const picID = req.query.picID;
    try {
        if (typeof _id !== "string")
            return (0, errors_1.errorJson)(res, 400, "No _id provided");
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return (0, errors_1.errorJson)(res, 404, "Product (Item) not found");
        if (typeof picID !== "string")
            return (0, errors_1.errorJson)(res, 400, "No picID provided");
        const batch = item.pictures.find(pic => { var _a; return ((_a = pic._id) === null || _a === void 0 ? void 0 : _a.toString()) === picID; });
        if (!batch)
            return (0, errors_1.errorJson)(res, 404, "Picture not found");
        res.set('Content-Type', 'image/png');
        res.send(batch.image);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
