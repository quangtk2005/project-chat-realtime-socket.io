"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    id: String,
    email: String,
    verified_email: Boolean,
    name: String,
    given_name: String,
    picture: String,
    token: String,
    accept_friends: [mongoose_1.default.SchemaTypes.ObjectId], // Danh sách người đã gửi lời mời kết bạn cho mình
    request_friends: [mongoose_1.default.SchemaTypes.ObjectId], // Danh sách người mà mình đã gửi lời mời kết bạn
    friends_list: [
        {
            user_id: {
                type: mongoose_1.default.SchemaTypes.ObjectId,
                ref: "User"
            },
            room_chat_id: mongoose_1.default.SchemaTypes.ObjectId
        }
    ]
}, {
    timestamps: true,
    autoCreate: true
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
