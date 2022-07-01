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
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middleware/auth"));
const errors_1 = require("../middleware/errors");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    limits: { fileSize: 20000000 },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error('Please upload an image'));
        cb(null, true);
    }
});
// Sends post request to create new user
router.post('/api/users/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User_1.default(req.body);
    try {
        yield user.save();
        const token = yield user.generateAuthToken();
        const verifyUser = yield user.sendVerificationEmail();
        res.status(201).send({ user, token, verifyUser });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// sends get request to send verification mail to auth user
router.get('/api/users/verify', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    const verifyUser = yield user.sendVerificationEmail();
    return res.send(verifyUser);
}));
// Sends post request to log user in
router.post('/api/users/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    try {
        // @ts-ignore
        const user = yield User_1.default.findbyCredentials(userData.email, userData.password);
        const token = yield user.generateAuthToken();
        res.status(200).send({ user, token });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to log user out
router.post('/api/users/logout', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    // @ts-ignore
    const token = req.token;
    const all = req.query.all;
    try {
        if (all === "true") {
            user.tokens = [];
        }
        else {
            user.tokens = user.tokens.filter(item => item.token !== token);
        }
        yield user.save();
        res.status(200).send({ message: 'Logout Successful' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends get request to fetch auth user
router.get('/api/users/user', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    res.send(user);
}));
// sends get request to find a user
router.get('/api/users/find', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query.id;
    const email = req.query.email;
    try {
        let user;
        if (typeof _id === "string") {
            user = yield User_1.default.findById(_id);
            if (!user)
                return (0, errors_1.errorJson)(res, 404);
        }
        else if (typeof email === "string") {
            user = yield User_1.default.findOne({ email });
            if (!user)
                return (0, errors_1.errorJson)(res, 404);
        }
        else {
            return (0, errors_1.errorJson)(res, 400);
        }
        res.send(user.toPublicJSON());
    }
    catch (e) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends patch request to update users
router.patch('/api/users/update', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdate = ['name'];
    const isValidOp = updates.every(item => allowedUpdate.includes(item));
    if (!isValidOp)
        return res.status(400).send({ error: 'Invalid Updates', allowedUpdates: allowedUpdate });
    try {
        // @ts-ignore
        const user = req.user;
        // @ts-ignore
        updates.forEach(item => user[item] = req.body[item]);
        yield user.save();
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        res.status(201).send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends patch request to change password
router.post('/api/users/change-password', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        // @ts-ignore
        const _user = yield User_1.default.findbyCredentials(user.email, req.body.oldPassword);
        user.password = req.body.newPassword;
        yield user.save();
        res.status(201).send(user);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends delete request to delete users
router.delete('/api/users/delete', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        yield user.sendExitEmail();
        yield User_1.default.deleteOne({ _id: user._id });
        res.send({ message: 'user deleted' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends post request to create and upload the users profile avatar
router.post('/api/users/avatar/upload', auth_1.default, upload.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userF = req.user;
        // @ts-ignore
        const user = yield User_1.default.findById(userF._id);
        if (!req.file)
            throw new Error('No File');
        const bufferSmall = yield (0, sharp_1.default)(req.file.buffer).resize({ width: 100 }).png({ quality: 20 }).toBuffer();
        const buffer = yield (0, sharp_1.default)(req.file.buffer).resize({ width: 900 }).png({ quality: 20 }).toBuffer();
        user.avatar = buffer;
        user.avatarSmall = bufferSmall;
        yield user.save();
        res.send({ message: 'Image Saved' });
    }
    catch (error) {
        console.log(error);
        return (0, errors_1.errorJson)(res, 400);
    }
    // @ts-ignore
}), (error, req, res, next) => (0, errors_1.errorJson)(res, 500));
// Sends delete request to delete the users profile avatar
router.delete('/api/users/avatar/remove', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const user = req.user;
        user.avatar = undefined;
        user.avatarSmall = undefined;
        yield user.save();
        res.send({ message: 'avatar removed' });
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// Sends get request to render profile avatar
router.get('/api/users/avatar/view', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.query._id;
    try {
        const user = yield User_1.default.findById(_id);
        if (!user || !user.avatar)
            throw new Error("No User or Avatar");
        res.set('Content-Type', 'image/png');
        if (req.query.size === "small") {
            res.send(user.avatarSmall);
        }
        else {
            res.send(user.avatar);
        } // large
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
// sends get request to check user existence
router.get('/api/users/user/exists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ email: req.query.email });
        if (user === null) {
            return res.status(200).send({ message: 'user does not exist' });
        }
        res.send({ message: 'user exists' });
    }
    catch (error) {
        res.status(200).send({ message: 'user does not exist' });
    }
}));
exports.default = router;
