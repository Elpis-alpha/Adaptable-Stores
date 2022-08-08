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
const mongoose_1 = __importDefault(require("mongoose"));
const mailTypes_1 = require("../mail/mailTypes");
const sendMail_1 = __importDefault(require("../mail/sendMail"));
const User_1 = __importDefault(require("./User"));
const siteName = process.env.SITE_NAME;
const host = process.env.HOST;
const orderSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            productID: {
                type: String
            },
            name: String,
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            price: Number
        }
    ],
    data: {
        type: Object,
        required: true,
    }
}, { timestamps: true });
orderSchema.methods.sendCheckoutMail = function () {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const order = this;
        const mailBody = (0, mailTypes_1.checkoutMail)(siteName, `${host}/complain`, order.items, ((_a = order === null || order === void 0 ? void 0 : order.data) === null || _a === void 0 ? void 0 : _a.gateway) === 'stripe', (_d = (_c = (_b = order === null || order === void 0 ? void 0 : order.data) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.charge) === null || _d === void 0 ? void 0 : _d.receipt_url);
        try {
            const user = yield User_1.default.findOne({ _id: order.owner });
            const mail = yield (0, sendMail_1.default)(user.email, `Checkout Notice`, mailBody);
            // @ts-ignore
            if (mail.error)
                return { error: 'Server Error' };
            return { message: 'email sent' };
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// Order Model
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
