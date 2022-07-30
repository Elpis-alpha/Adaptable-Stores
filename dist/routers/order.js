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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
    var e_1, _a;
    try {
        // @ts-ignore
        const cart = req.cart;
        // @ts-ignore
        const user = req.user;
        const { source } = req.body;
        const receipt_email = user.email;
        let amount = 0;
        const orderItems = [];
        try {
            for (var _b = __asyncValues(cart.items), _c; _c = yield _b.next(), !_c.done;) {
                const item = _c.value;
                orderItems.push(Object.assign({}, item));
                amount += item.price;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (cart.items.length > 0) {
            if (!source)
                return (0, errors_1.errorJson)(res, 400, "Source not provided");
            const charge = yield stripe.charges.create({
                amount, currency: "usd",
                source, receipt_email
            });
            if (!charge)
                return (0, errors_1.errorJson)(res, 502, "Stripe Charge Creation Failed");
            if (charge) {
                console.log(charge);
                const order = yield Order_1.default.create({
                    owner: user._id, items: orderItems
                });
                cart.items = [];
                yield cart.save();
                return res.status(200).send(order);
            }
        }
        else {
            return (0, errors_1.errorJson)(res, 400, "Cart is Empty");
        }
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
exports.default = router;
