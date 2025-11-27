import { Schema, model, SchemaTypes } from "mongoose";

const roomChatSchema  = new Schema({
  title: String,
  avatar: String,
  type_room: {
    type: String,
    default: "friend"
  },
  users: [
    {
      user_id: {
        type: SchemaTypes.ObjectId,
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

const RoomChat  = model("Room Chat", roomChatSchema);

export default RoomChat;