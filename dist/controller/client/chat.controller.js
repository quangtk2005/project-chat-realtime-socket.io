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
exports.index = void 0;
const mongodb_1 = require("mongodb");
const chat_model_1 = __importDefault(require("../../models/chat.model"));
const chat_socket_1 = __importDefault(require("../../sockets/client/chat.socket"));
const room_model_1 = __importDefault(require("../../models/room.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomChatId = req.params.roomChatId;
    if (!mongodb_1.ObjectId.isValid(roomChatId)) {
        return res.redirect("/");
    }
    const roomChatObjectId = new mongodb_1.ObjectId(roomChatId);
    const chats = yield chat_model_1.default.find({
        roomChatId: roomChatObjectId
    }).populate({
        path: "userId",
    });
    (0, chat_socket_1.default)(req, res);
    const rooms = yield room_model_1.default.findOne({
        _id: roomChatObjectId
    }).populate({
        path: "users.user_id",
    });
    res.render("client/pages/chat/index", {
        chats,
        rooms
    });
});
exports.index = index;
