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
const chalk_1 = __importDefault(require("chalk"));
const transporter_1 = __importDefault(require("./transporter"));
const emailName = process.env.EMAIL_NAME;
const emailAddress = process.env.EMAIL_ADDRESS;
const host = process.env.HOST;
const trans = (0, transporter_1.default)();
// @ts-ignore: Display a log message to identify the transporter status
trans.then(t => console.log('transporter' in t ? chalk_1.default.hex('#009e00')('Email Check Passed') : chalk_1.default.red('Email Check Failed')));
exports.default = (address, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    // Identify host if mail is sent to overseer
    if (address === emailAddress) {
        body = `<div style="white-space: pre-wrap;">${body}\n\n<small style=""> ~ From ${host}</small></div>`;
    }
    return yield new Promise(resolve => {
        trans.then((transport) => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-ignore
            const mail = yield transport.sendMail({
                from: `"${emailName}" <${emailAddress}>`,
                to: address, subject, html: body
            });
            resolve(mail);
        })).catch(e => {
            resolve({ error: 'Not Sent' });
        });
    });
});
