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
const chalk_1 = __importDefault(require("chalk"));
const connectionString = process.env.MONGODB_URL;
// Connect Mongo Database
const setDatabase = (connectionString) => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        console.log(chalk_1.default.yellow('Connecting to Database...'));
        try {
            yield mongoose_1.default.connect(connectionString);
            console.log(chalk_1.default.hex('#009e00')(`Database Connected Succesfully`));
            break;
        }
        catch (error) {
            console.log(chalk_1.default.hex('#ea7b4b')(`Database Connection Failed. Attempting reconnection in 5s...`));
            yield new Promise(resolve => setTimeout(resolve, 5000));
            continue;
        }
    }
});
setDatabase(connectionString);
