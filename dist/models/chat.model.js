"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "User"
    },
    content: String,
    images: Array,
    audio: String,
    roomChatId: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Room Chat"
    }
}, {
    timestamps: true,
    autoCreate: true
});
const Chat = mongoose_1.default.model("Chat", chatSchema);
exports.default = Chat;
