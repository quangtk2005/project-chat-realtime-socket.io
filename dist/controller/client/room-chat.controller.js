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
exports.createPost = exports.create = void 0;
const mongodb_1 = require("mongodb");
const room_model_1 = __importDefault(require("../../models/room.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const friendsList = res.locals.USER.friends_list;
        for (const friend of friendsList) {
            const infoFriend = yield user_model_1.default.findOne({
                _id: friend.user_id,
            }).select("_id name picture");
            friend.fullName = (infoFriend === null || infoFriend === void 0 ? void 0 : infoFriend.name) || "";
            friend.avatar = (infoFriend === null || infoFriend === void 0 ? void 0 : infoFriend.picture) || "";
            friend.userId = (infoFriend === null || infoFriend === void 0 ? void 0 : infoFriend._id) || "";
        }
        res.render("client/pages/rooms-chat/index", {
            friendsList,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Lỗi server",
        });
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, selectedFriends } = req.body;
        if (!title.trim() || selectedFriends.length === 0) {
            return res.json({
                success: false,
                message: "Vui lòng nhập tên phòng chat và chọn thành viên",
            });
        }
        if (selectedFriends.length < 2) {
            return res.json({
                success: false,
                message: "Vui lòng chọn ít nhất 2 thành viên",
            });
        }
        let dataRoomChat = {
            title: title,
            type_room: "group",
            users: [],
        };
        dataRoomChat.users.push({
            user_id: new mongodb_1.ObjectId(res.locals.USER._id),
            role: "superAdmin",
        });
        for (const friend of selectedFriends) {
            dataRoomChat.users.push({
                user_id: new mongodb_1.ObjectId(friend),
                role: "member",
            });
        }
        const roomChat = new room_model_1.default(dataRoomChat);
        yield roomChat.save();
        const populatedRoom = yield room_model_1.default.findById(roomChat._id).populate({
            path: "users.user_id",
            select: "name picture"
        });
        const groupData = {
            roomId: roomChat._id.toString(),
            title: title,
            type: "group",
            userIds: [res.locals.USER._id.toString(), ...selectedFriends]
        };
        global._io.emit("SERVER_ADD_GROUP", groupData);
        res.json({
            success: true,
            message: "Tạo phòng chat thành công",
            roomChat: roomChat._id,
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: "Lỗi server",
        });
    }
});
exports.createPost = createPost;
