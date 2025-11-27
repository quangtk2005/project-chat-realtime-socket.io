"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.roomFriendsAccess = exports.isAccess = exports.requireLogin = exports.checkLogin = exports.runAllRouters = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const room_model_1 = __importDefault(require("../../models/room.model"));
const moment_1 = __importDefault(require("moment"));
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const runAllRouters = (req, res, next) => {
    const domain = process.env.PROTOCOL + "://" + req.headers.host;
    const REDIRECT_URI_GOOGLE_REGISTER_CALLBACK = domain + "/account/register/google/callback";
    res.locals.REDIRECT_URI_GOOGLE_REGISTER_CALLBACK = REDIRECT_URI_GOOGLE_REGISTER_CALLBACK;
    next();
};
exports.runAllRouters = runAllRouters;
const checkLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies.tokenUser) {
        const user = yield user_model_1.default.findOne({ token: req.cookies.tokenUser });
        try {
            const decoded = jsonwebtoken_1.default.verify(req.cookies.tokenUser, process.env.JWT_SECRET);
            res.locals.USER = user;
        }
        catch (error) {
            res.clearCookie('tokenUser');
        }
    }
    // else next()
    next();
});
exports.checkLogin = checkLogin;
const requireLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.cookies.tokenUser) {
            const user = yield user_model_1.default.findOne({ token: req.cookies.tokenUser }).populate("accept_friends").populate("request_friends").select("-token");
            if (!user) {
                res.clearCookie('tokenUser');
                res.redirect("/account/login");
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(req.cookies.tokenUser, process.env.JWT_SECRET);
                res.locals.moment = moment_1.default;
                res.locals.USER = user;
                next();
            }
            catch (error) {
                res.clearCookie('tokenUser');
                res.redirect("/account/login");
            }
        }
        else
            res.redirect("/account/login");
    }
    catch (error) {
        res.redirect("/account/login");
    }
});
exports.requireLogin = requireLogin;
const isAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomChatId = req.params.roomChatId;
        if (!mongodb_1.ObjectId.isValid(roomChatId)) {
            return res.redirect("/");
        }
        const userId = new mongodb_1.ObjectId(res.locals.USER._id);
        const roomChatObjectId = new mongodb_1.ObjectId(roomChatId);
        const roomChat = yield room_model_1.default.findOne({
            _id: roomChatObjectId,
            users: { $elemMatch: { user_id: userId } }
        });
        if (roomChat) {
            next();
        }
        else {
            res.redirect("/");
        }
    }
    catch (error) {
        res.redirect("/");
    }
});
exports.isAccess = isAccess;
const roomFriendsAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roomFriends = yield room_model_1.default.find({
        type_room: "friend",
        users: { $elemMatch: { user_id: res.locals.USER._id } }
    }).populate({
        path: "users.user_id",
    });
    const Chat = (yield Promise.resolve().then(() => __importStar(require("../../models/chat.model")))).default;
    for (const room of roomFriends) {
        const lastChat = yield Chat.findOne({
            roomChatId: room._id
        }).sort({ createdAt: -1 }).populate({
            path: "userId",
            select: "name picture"
        });
        room.lastChat = lastChat;
    }
    res.locals.ROOM_FRIENDS = roomFriends;
    const roomGroups = yield room_model_1.default.find({
        type_room: "group",
        users: { $elemMatch: { user_id: res.locals.USER._id } }
    }).populate({
        path: "users.user_id",
    });
    for (const room of roomGroups) {
        const lastChat = yield Chat.findOne({
            roomChatId: room._id
        }).sort({ createdAt: -1 }).populate({
            path: "userId",
            select: "name picture"
        });
        room.lastChat = lastChat;
    }
    res.locals.ROOM_GROUPS = roomGroups;
    next();
});
exports.roomFriendsAccess = roomFriendsAccess;
