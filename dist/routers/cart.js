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
const cart_auth_1 = __importDefault(require("../middleware/cart-auth"));
const Item_1 = __importDefault(require("../models/Item"));
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
// Sends get request to get a cart
router.get('/api/cart/get', auth_1.default, cart_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    res.send(req.cart);
}));
// Sends post request to add item to cart
router.post('/api/cart/add', auth_1.default, cart_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const cart = req.cart;
        const { _id, qty } = req.body;
        // @ts-ignore
        const item = yield Item_1.default.findOne({ _id });
        if (!item)
            return res.status(404).send();
        const uItem = cart.items.find(itemX => item._id.toString() === itemX.productID);
        if (uItem) {
            uItem.quantity = uItem.quantity + qty;
        }
        else {
            cart.items.push({
                productID: _id,
                name: item.title,
                quantity: qty
            });
        }
        yield cart.save();
        res.status(200).send(cart);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends delete request to remove item from cart
router.delete('/api/cart/remove', auth_1.default, cart_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const cart = req.cart;
        const { _id, qty } = req.body;
        // @ts-ignore
        const item = yield Item_1.default.findOne({ _id });
        const uItem = cart.items.find(itemX => item._id.toString() === itemX.productID);
        if (uItem) {
            if (uItem.quantity <= qty) {
                cart.items = cart.items.filter(item => item.productID !== _id);
            }
            else {
                uItem.quantity = uItem.quantity - qty;
            }
        }
        yield cart.save();
        res.send(cart);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
