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
exports.accept = exports.request = exports.notFriend = exports.registerGoogleCallback = exports.register = exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const users_socket_1 = __importDefault(require("../../sockets/client/users.socket"));
dotenv_1.default.config();
const login = (req, res) => {
    res.render("client/pages/account/login");
};
exports.login = login;
const register = (req, res) => {
    res.render("client/pages/account/register");
};
exports.register = register;
const registerGoogleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.query;
        const { data } = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
            client_id: process.env.CLIENT_ID_GOOGLE,
            client_secret: process.env.CLIENT_SECRET_GOOGLE,
            code,
            redirect_uri: res.locals.REDIRECT_URI_GOOGLE_REGISTER_CALLBACK,
            grant_type: "authorization_code",
        });
        const { access_token, id_token } = data;
        const { data: profile } = yield axios_1.default.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const check_user = yield user_model_1.default.findOne({ email: profile.email });
        if (check_user) {
            const token = yield jsonwebtoken_1.default.sign({
                id: check_user.id,
            }, process.env.JWT_SECRET, { expiresIn: "2 days" });
            yield user_model_1.default.updateOne({ _id: check_user._id }, { token: token });
            res.cookie("tokenUser", token, {
                maxAge: 2 * 24 * 60 * 60 * 1000,
            });
            res.redirect("/");
        }
        else {
            profile._id = new mongodb_1.ObjectId();
            const token = yield jsonwebtoken_1.default.sign({
                id: profile._id,
            }, process.env.JWT_SECRET, { expiresIn: "2 days" });
            profile.token = token;
            const newUser = new user_model_1.default(profile);
            yield newUser.save();
            res.cookie("tokenUser", token, {
                maxAge: 2 * 24 * 60 * 60 * 1000,
            });
            res.redirect("/");
        }
    }
    catch (error) {
        console.log(error);
        // res.redirect("/");
    }
});
exports.registerGoogleCallback = registerGoogleCallback;
const notFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.default)(req, res);
    const userId = res.locals.USER._id;
    const requestFriends = res.locals.USER.request_friends;
    const acceptFriends = res.locals.USER.accept_friends;
    const friendsList = res.locals.USER.friends_list.map((friend) => friend.user_id);
    const users = yield user_model_1.default.find({
        _id: { $ne: userId },
        $and: [
            { _id: { $ne: userId } },
            { _id: { $nin: requestFriends } },
            { _id: { $nin: acceptFriends } },
            { _id: { $nin: friendsList } },
        ],
    }).select("-token");
    res.render("client/pages/account/not-friend", {
        users
    });
});
exports.notFriend = notFriend;
const request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.default)(req, res);
    const requestFriends = res.locals.USER.request_friends;
    const users = yield user_model_1.default.find({
        _id: { $in: requestFriends },
    }).select("-token");
    res.render("client/pages/account/request", {
        users
    });
});
exports.request = request;
const accept = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, users_socket_1.default)(req, res);
    const acceptFriends = res.locals.USER.accept_friends;
    const users = yield user_model_1.default.find({
        _id: { $in: acceptFriends },
    }).select("-token");
    res.render("client/pages/account/accept", {
        users
    });
});
exports.accept = accept;
