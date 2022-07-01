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
const User_1 = __importDefault(require("../models/User"));
const errors_1 = require("../middleware/errors");
const sendMail_1 = __importDefault(require("../mail/sendMail"));
const adminEmail = process.env.EMAIL_ADDRESS;
const frontendLocation = process.env.FRONT_END_LOCATION;
const siteName = process.env.SITE_NAME;
const host = process.env.HOST;
const sitePackage = {
    adminEmail, frontendLocation, siteName, host,
    description: `The backend side of ${siteName}`,
    complainLink: `/complain`, title: siteName,
};
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('index', Object.assign({}, sitePackage));
}));
router.get('/complain', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('complain', Object.assign(Object.assign({}, sitePackage), { title: siteName + " | Complaint" }));
    }
    catch (e) {
        (0, errors_1.errorHtml)(res, 500);
    }
}));
router.post('/accept-complaint', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.content.trim() === "" || req.body.title.trim() === "")
            return (0, errors_1.errorHtml)(res, 400);
        const mail = yield (0, sendMail_1.default)(adminEmail, "A Complaint: " + req.body.title, req.body.content);
        // @ts-ignore
        if (mail.error)
            return (0, errors_1.errorHtml)(res, 503);
        res.render('accept-complaint', Object.assign(Object.assign({}, sitePackage), { title: siteName + " | Accepted" }));
    }
    catch (e) {
        (0, errors_1.errorHtml)(res, 500);
    }
}));
router.get('/mail/welcome-mail/:id/:verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    const verify = req.params.verify;
    try {
        const user = yield User_1.default.findById(_id);
        if (!user)
            return (0, errors_1.errorHtml)(res, 404);
        if (user.verify !== verify)
            return (0, errors_1.errorHtml)(res, 401);
        res.render('mail/welcome-mail', Object.assign(Object.assign({}, sitePackage), { user: user.toJSON(), userString: JSON.stringify(user.toJSON()), verifyLink: `/mail/verify-user/${_id}/${verify}`, deleteLink: `/mail/delete-user/${_id}/${verify}` }));
    }
    catch (e) {
        (0, errors_1.errorHtml)(res, 500);
    }
}));
router.get('/mail/verify-user/:id/:verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    const verify = req.params.verify;
    try {
        const user = yield User_1.default.findById(_id);
        if (!user)
            return (0, errors_1.errorHtml)(res, 404);
        if (user.verify !== verify)
            return (0, errors_1.errorHtml)(res, 401);
        if (user.verify === "true")
            return (0, errors_1.errorHtml)(res, 403);
        user.verify = "true";
        yield user.save();
        res.render('mail/verify-user', Object.assign(Object.assign({}, sitePackage), { user: user.toJSON(), userString: JSON.stringify(user.toJSON()), title: siteName + " | Verify Email" }));
    }
    catch (e) {
        (0, errors_1.errorHtml)(res, 500);
    }
}));
router.get('/mail/delete-user/:id/:verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    const verify = req.params.verify;
    try {
        const user = yield User_1.default.findById(_id);
        if (!user)
            return (0, errors_1.errorHtml)(res, 404);
        if (user.verify !== verify)
            return (0, errors_1.errorHtml)(res, 401);
        if (user.verify === "true")
            return (0, errors_1.errorHtml)(res, 403);
        yield User_1.default.deleteOne({ _id, verify });
        res.render('mail/delete-user', Object.assign(Object.assign({}, sitePackage), { title: siteName + " | Delete Account" }));
    }
    catch (e) {
        (0, errors_1.errorHtml)(res, 500);
    }
}));
exports.default = router;
