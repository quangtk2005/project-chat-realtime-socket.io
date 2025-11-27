import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
  },
  content: String,
  images: Array,
  audio: String,
  roomChatId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Room Chat"
  }
}, {
  timestamps: true,
  autoCreate: true
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;