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
const Order_1 = __importDefault(require("../models/Order"));
const errors_1 = require("./errors");
const authOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const order = yield Order_1.default.find({ owner: req.user._id }).sort({ createdAt: -1 });
        if (!order)
            return (0, errors_1.errorJson)(res, 404);
        // @ts-ignore
        req.order = order;
        next();
    }
    catch (error) {
        console.log(error);
        return (0, errors_1.errorJson)(res, 404);
    }
});
exports.default = authOrder;
