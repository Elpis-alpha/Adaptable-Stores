"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
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
// Order Model
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
