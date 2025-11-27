"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const roomChatSchema = new mongoose_1.Schema({
    title: String,
    avatar: String,
    type_room: {
        type: String,
        default: "friend"
    },
    users: [
        {
            user_id: {
                type: mongoose_1.SchemaTypes.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: ["superAdmin", "member"],
                default: "member"
            }
        }
    ],
}, {
    timestamps: true,
    autoCreate: true
});
const RoomChat = (0, mongoose_1.model)("Room Chat", roomChatSchema);
exports.default = RoomChat;
