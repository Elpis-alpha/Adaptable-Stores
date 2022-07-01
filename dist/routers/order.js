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
const stripe_1 = __importDefault(require("stripe"));
const auth_1 = __importDefault(require("../middleware/auth"));
const order_auth_1 = __importDefault(require("../middleware/order-auth"));
const cart_auth_1 = __importDefault(require("../middleware/cart-auth"));
const Item_1 = __importDefault(require("../models/Item"));
const Order_1 = __importDefault(require("../models/Order"));
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
const stripeKey = process.env.STRIPE_API_KEY;
const stripe = new stripe_1.default(stripeKey, {
    apiVersion: "2020-08-27"
});
// Sends get request to get a order
router.get('/api/order/get', auth_1.default, order_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    res.send(req.order);
}));
// Sends post request to add item to order
router.post('/api/order/add', auth_1.default, cart_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const cart = req.cart;
        // @ts-ignore
        const user = req.user;
        const { source } = req.body;
        const email = user.email;
        let amount = 0;
        const orderItems = [];
        for (const item of cart.items) {
            const product = yield Item_1.default.findOne({ _id: item.productID });
            if (!product)
                return (0, errors_1.errorJson)(res, 404);
            orderItems.push({
                productID: product._id,
                name: product.title,
                quantity: item.quantity,
                price: product.price
            });
            amount += (product.price * item.quantity);
        }
        console.log(amount);
        if (cart.items.length > 0) {
            const charge = yield stripe.charges.create({
                amount, currency: "usd",
                source, receipt_email: email
            });
            if (!charge)
                throw new Error('bats-payment');
            if (charge) {
                const order = yield Order_1.default.create({
                    owner: user._id, items: orderItems
                });
                cart.items = [];
                yield cart.save();
                return res.status(200).send(order);
            }
        }
        else {
            return (0, errors_1.errorJson)(res, 500);
        }
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
