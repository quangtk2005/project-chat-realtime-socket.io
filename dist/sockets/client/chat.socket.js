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
exports.registerChatSocketHandlers = void 0;
const chat_model_1 = __importDefault(require("../../models/chat.model"));
const streamUpload_helper_1 = __importDefault(require("../../helpers/streamUpload.helper"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let isHandlerRegistered = false;
const registerChatSocketHandlers = () => {
    if (isHandlerRegistered) {
        return;
    }
    isHandlerRegistered = true;
    _io.on("connection", (socket) => {
        socket.on("CLIENT_SEND_MESSAGEE", (data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = ((_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId) || (data === null || data === void 0 ? void 0 : data.userId);
                const roomChatId = ((_b = socket.data) === null || _b === void 0 ? void 0 : _b.roomChatId) || (data === null || data === void 0 ? void 0 : data.roomChatId);
                const fullname = ((_c = socket.data) === null || _c === void 0 ? void 0 : _c.fullname) || (data === null || data === void 0 ? void 0 : data.fullname);
                if (!userId || !roomChatId) {
                    return callback({ message: "error", error: "Unauthorized" });
                }
                const { content, images, audio } = data;
                const linkImages = [];
                let linkAudio = null;
                if (images && images.length > 0) {
                    for (const imageArray of images) {
                        const buffer = Buffer.from(imageArray);
                        const result = yield (0, streamUpload_helper_1.default)(buffer);
                        linkImages.push(result.url);
                    }
                }
                if (audio && audio.length > 0) {
                    const buffer = Buffer.from(audio);
                    const result = yield (0, streamUpload_helper_1.default)(buffer);
                    linkAudio = result.url;
                }
                let chatData = {
                    userId: userId,
                    content: content,
                    roomChatId: roomChatId,
                };
                chatData["images"] = linkImages;
                if (linkAudio) {
                    chatData["audio"] = linkAudio;
                }
                const chat = new chat_model_1.default(chatData);
                yield chat.save();
                const user = yield user_model_1.default.findById(userId);
                const messageData = {
                    userId: userId,
                    roomChatId: roomChatId,
                    fullname: fullname,
                    picture: (user === null || user === void 0 ? void 0 : user.picture) || null,
                    images: linkImages,
                    audio: linkAudio,
                    content: content,
                    createdAt: chat.createdAt,
                };
                callback({ message: "success" });
                _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", messageData);
                socket.to(roomChatId).emit("SERVER_STOP_TYPING", {
                    userId: userId,
                    roomChatId: roomChatId,
                    fullname: fullname
                });
            }
            catch (error) {
                callback({ message: "error", error: error instanceof Error ? error.message : "Unknown error" });
            }
        }));
        socket.on("CLIENT_TYPING", (data) => {
            var _a, _b, _c;
            const userId = ((_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId) || (data === null || data === void 0 ? void 0 : data.userId);
            const roomChatId = ((_b = socket.data) === null || _b === void 0 ? void 0 : _b.roomChatId) || (data === null || data === void 0 ? void 0 : data.roomChatId);
            const fullname = ((_c = socket.data) === null || _c === void 0 ? void 0 : _c.fullname) || (data === null || data === void 0 ? void 0 : data.fullname);
            if (userId && roomChatId && fullname) {
                socket.to(roomChatId).emit("SERVER_TYPING", {
                    userId: userId,
                    roomChatId: roomChatId,
                    fullname: fullname
                });
            }
        });
        socket.on("CLIENT_STOP_TYPING", (data) => {
            var _a, _b, _c;
            const userId = ((_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId) || (data === null || data === void 0 ? void 0 : data.userId);
            const roomChatId = ((_b = socket.data) === null || _b === void 0 ? void 0 : _b.roomChatId) || (data === null || data === void 0 ? void 0 : data.roomChatId);
            const fullname = ((_c = socket.data) === null || _c === void 0 ? void 0 : _c.fullname) || (data === null || data === void 0 ? void 0 : data.fullname);
            if (userId && roomChatId && fullname) {
                socket.to(roomChatId).emit("SERVER_STOP_TYPING", {
                    userId: userId,
                    roomChatId: roomChatId,
                    fullname: fullname
                });
            }
        });
        socket.on("JOIN_ROOM", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { roomChatId, token } = data;
            if (!roomChatId || !token) {
                return;
            }
            try {
                jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = yield user_model_1.default.findOne({ token: token });
                if (user) {
                    socket.data.userId = user._id.toString();
                    socket.data.roomChatId = roomChatId;
                    socket.data.fullname = user.name;
                    socket.join(roomChatId);
                }
            }
            catch (error) {
            }
        }));
    });
};
exports.registerChatSocketHandlers = registerChatSocketHandlers;
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, exports.registerChatSocketHandlers)();
    if (res.locals.USER) {
        const roomChatId = req.params.roomChatId;
    }
});
