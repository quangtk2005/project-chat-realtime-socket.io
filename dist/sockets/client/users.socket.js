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
const user_model_1 = __importDefault(require("../../models/user.model"));
const mongodb_1 = require("mongodb");
const room_model_1 = __importDefault(require("../../models/room.model"));
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIdA = res.locals.USER._id;
    const roomChatId = req.params.roomChatId;
    _io.once("connection", (socket) => {
        // Khi A gửi yêu cầu cho B
        socket.on("CLIENT_ADD_FRIEND", (userIdB, callback) => __awaiter(void 0, void 0, void 0, function* () {
            // Thêm id của A vào acceptFriends của B
            var _a;
            const existUserAInB = yield user_model_1.default.findOne({
                _id: userIdB,
                accept_friends: userIdA
            });
            if (!existUserAInB && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdB
                }, {
                    $push: {
                        accept_friends: userIdA
                    }
                });
            }
            // Thêm id của B vào requestFriends của A 
            const existUserBInA = yield user_model_1.default.findOne({
                _id: userIdA,
                request_friends: userIdB
            });
            if (!existUserBInA && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdA
                }, {
                    $push: {
                        request_friends: userIdB
                    }
                });
                const updatedUserA = yield user_model_1.default.findOne({ _id: userIdA });
                const updatedUserB = yield user_model_1.default.findOne({ _id: userIdB });
                const requestLength = ((_a = updatedUserA === null || updatedUserA === void 0 ? void 0 : updatedUserA.request_friends) === null || _a === void 0 ? void 0 : _a.length) || 0;
                callback({ status: true, messages: "Gửi thành công!", request_length: requestLength });
                socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
                    length: updatedUserB === null || updatedUserB === void 0 ? void 0 : updatedUserB.accept_friends.length,
                    userId: userIdB
                });
                const userA = yield user_model_1.default.findById(userIdA).select("name picture");
                _io.to(userIdB.toString()).emit("SERVER_FRIEND_REQUEST", {
                    userId: userIdA.toString(),
                    userName: (userA === null || userA === void 0 ? void 0 : userA.name) || "",
                    userPicture: (userA === null || userA === void 0 ? void 0 : userA.picture) || "/client/assets/img/profiles/avatar-01.jpg"
                });
            }
        }));
        socket.on("CLIENT_CANCEL_FRIEND", (userIdB) => __awaiter(void 0, void 0, void 0, function* () {
            // Xóa id của A trong acceptFriends của B
            const existUserAInB = yield user_model_1.default.findOne({
                _id: userIdB,
                accept_friends: userIdA
            });
            if (existUserAInB && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdB
                }, {
                    $pull: {
                        accept_friends: userIdA
                    }
                });
            }
            // Xóa id của B trong requestFriends của A 
            const existUserBInA = yield user_model_1.default.findOne({
                _id: userIdA,
                request_friends: userIdB
            });
            if (existUserBInA && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdA
                }, {
                    $pull: {
                        request_friends: userIdB
                    }
                });
            }
        }));
        socket.on("CLIENT_REJECT_FRIEND", (userIdB) => __awaiter(void 0, void 0, void 0, function* () {
            // Xóa id của B trong acceptFriends của A
            const existUserBInA = yield user_model_1.default.findOne({
                _id: userIdA,
                accept_friends: userIdB
            });
            if (existUserBInA && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdA
                }, {
                    $pull: {
                        accept_friends: userIdB
                    }
                });
            }
            // Xóa id của A trong requestFriends của B
            const existUserAInB = yield user_model_1.default.findOne({
                _id: userIdB,
                request_friends: userIdA
            });
            if (existUserAInB && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: userIdB
                }, {
                    $pull: {
                        request_friends: userIdA
                    }
                });
            }
        }));
        socket.on("CLIENT_ACCEPT_FRIEND", (userIdB) => __awaiter(void 0, void 0, void 0, function* () {
            const roomChat = new room_model_1.default({
                type_room: "friend",
                users: [
                    {
                        user_id: new mongodb_1.ObjectId(userIdA),
                        role: "superAdmin"
                    },
                    {
                        user_id: new mongodb_1.ObjectId(userIdB),
                        role: "superAdmin"
                    }
                ]
            });
            yield roomChat.save();
            // Thêm {userId, roomChatId} của B vào friendsList của A
            // Xóa id của B trong acceptFriends của A
            const existUserBInA = yield user_model_1.default.findOne({
                _id: new mongodb_1.ObjectId(userIdA),
                accept_friends: new mongodb_1.ObjectId(userIdB)
            });
            if (existUserBInA && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: new mongodb_1.ObjectId(userIdA)
                }, {
                    $push: {
                        friends_list: {
                            user_id: new mongodb_1.ObjectId(userIdB),
                            room_chat_id: roomChat.id
                        }
                    },
                    $pull: {
                        accept_friends: new mongodb_1.ObjectId(userIdB)
                    }
                });
            }
            // Thêm {userId, roomChatId} của A vào friendsList của B
            // Xóa id của A trong requestFriends của B
            const existUserAInB = yield user_model_1.default.findOne({
                _id: new mongodb_1.ObjectId(userIdB),
                request_friends: new mongodb_1.ObjectId(userIdA)
            });
            if (existUserAInB && userIdB != userIdA) {
                yield user_model_1.default.updateOne({
                    _id: new mongodb_1.ObjectId(userIdB)
                }, {
                    $push: {
                        friends_list: {
                            user_id: new mongodb_1.ObjectId(userIdA),
                            room_chat_id: roomChat.id
                        }
                    },
                    $pull: {
                        request_friends: new mongodb_1.ObjectId(userIdA)
                    }
                });
            }
            const userA = yield user_model_1.default.findById(userIdA).select("name picture");
            const userB = yield user_model_1.default.findById(userIdB).select("name picture");
            const friendDataA = {
                roomId: roomChat._id.toString(),
                friendId: userIdB.toString(),
                friendName: (userB === null || userB === void 0 ? void 0 : userB.name) || "",
                friendAvatar: (userB === null || userB === void 0 ? void 0 : userB.picture) || "/client/assets/img/profiles/avatar-01.jpg",
                type: "friend",
                userId: userIdA.toString()
            };
            const friendDataB = {
                roomId: roomChat._id.toString(),
                friendId: userIdA.toString(),
                friendName: (userA === null || userA === void 0 ? void 0 : userA.name) || "",
                friendAvatar: (userA === null || userA === void 0 ? void 0 : userA.picture) || "/client/assets/img/profiles/avatar-01.jpg",
                type: "friend",
                userId: userIdB.toString()
            };
            _io.emit("SERVER_ADD_FRIEND", friendDataA);
            _io.emit("SERVER_ADD_FRIEND", friendDataB);
        }));
    });
});
