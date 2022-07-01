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
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
const googleapis_1 = require("googleapis");
const CLIENT_ID = process.env.OVERSEER_CLIENT_ID;
const CLIENT_SECRET = process.env.OVERSEER_CLIENT_SECRET;
const REDIRECT_URI = process.env.OVERSEER_REDIRECT_URI;
const REFRESH_TOKEN = process.env.OVERSEER_REFRESH_TOKEN;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const createTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = yield oauth2Client.getAccessToken();
        const transporter = (0, nodemailer_1.createTransport)({
            // @ts-ignore
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: EMAIL_ADDRESS,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refresh_token: REFRESH_TOKEN,
                accessToken: accessToken.token
            },
        });
        return transporter;
    }
    catch (error) {
        return error;
    }
});
exports.default = createTransporter;
