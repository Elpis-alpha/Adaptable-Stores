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
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const sendMail_1 = __importDefault(require("../mail/sendMail"));
const mailTypes_1 = require("../mail/mailTypes");
const siteName = process.env.SITE_NAME;
const host = process.env.HOST;
const jwtSecret = process.env.JWT_SECRET;
// Sets up user schema
const userSchemer = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 5,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    },
    avatarSmall: {
        type: Buffer
    },
    verify: {
        type: String,
        trim: true,
        default: (0, uuid_1.v4)()
    },
}, { timestamps: true });
// Create Virtual relationship with Item
userSchemer.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});
// Generate Authentication Token
userSchemer.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user.id.toString() }, jwtSecret, {});
        user.tokens.push({ token });
        yield user.save();
        return token;
    });
};
// Private profile
userSchemer.methods.toJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    returnUser.verify = returnUser.verify === "true";
    delete returnUser.password;
    delete returnUser.tokens;
    delete returnUser.avatar;
    delete returnUser.avatarSmall;
    return returnUser;
};
// Public profile
userSchemer.methods.toPublicJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    returnUser.verify = returnUser.verify === "true";
    delete returnUser.password;
    delete returnUser.tokens;
    delete returnUser.avatar;
    delete returnUser.avatarSmall;
    return returnUser;
};
// send verification mail
userSchemer.methods.sendVerificationEmail = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const mailBody = (0, mailTypes_1.welcomeMail)(siteName, `${host}/mail/welcome-mail/${user._id}/${user.verify}`);
        try {
            const mail = yield (0, sendMail_1.default)(user.email, `Welcome to ${siteName}`, mailBody);
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
// send verification mail
userSchemer.methods.sendExitEmail = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const mailBody = (0, mailTypes_1.exitMail)(siteName, `${host}/complain`);
        try {
            const mail = yield (0, sendMail_1.default)(user.email, `Goodbye ${user.name}`, mailBody);
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
// For login
userSchemer.statics.findbyCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email }, { avatar: 0, avatarSmall: 0 });
    if (!user)
        throw new Error('Unable to login');
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Unable to login');
    return user;
});
// Hash password
userSchemer.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified('password'))
            user.password = yield bcryptjs_1.default.hash(user.password, 8);
        next();
    });
});
// Create User Model
const User = mongoose_1.default.model('User', userSchemer);
exports.default = User;
