"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const itemSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    section: {
        type: String,
        required: true,
        enum: {
            values: ["Cloth", "Shoe", "Cosmetic"],
            message: `{VALUE} is not supported`
        },
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    price: {
        required: true,
        type: Number,
        min: 0
    },
    pictures: [
        {
            image: {
                type: Buffer,
                required: true
            },
            order: {
                type: Number,
                required: true,
                default: 10
            }
        }
    ],
}, { timestamps: true });
// Private profile
itemSchema.methods.toJSON = function () {
    const item = this;
    const returnItem = item.toObject();
    delete returnItem.pictures;
    return returnItem;
};
// Item Model
const Item = mongoose_1.default.model('Item', itemSchema);
exports.default = Item;
