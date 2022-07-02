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
const errors_1 = require("./errors");
const Cart_1 = __importDefault(require("../models/Cart"));
const authCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const cart = yield Cart_1.default.findOne({ owner: req.user._id });
        if (!cart)
            return (0, errors_1.errorJson)(res, 404, "Cart not Available");
        // @ts-ignore
        req.cart = cart;
        next();
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 404);
    }
});
exports.default = authCart;
