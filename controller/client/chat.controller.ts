import { Request, Response } from "express";
import axios from "axios";
import { ObjectId } from "mongodb";
import Chat from "../../models/chat.model";
import chatSocket from "../../sockets/client/chat.socket";
import RoomChat from "../../models/room.model";

export const index = async (req: Request, res: Response) => {
  const roomChatId = req.params.roomChatId;
  
  if (!ObjectId.isValid(roomChatId)) {
    return res.redirect("/");
  }
  
  const roomChatObjectId = new ObjectId(roomChatId);
  const chats = await Chat.find({
    roomChatId: roomChatObjectId
  }).populate({
    path: "userId",
  })
  chatSocket(req, res);
  const rooms = await RoomChat.findOne({
    _id: roomChatObjectId
  }).populate({
    path: "users.user_id",
  })
  res.render("client/pages/chat/index", {
    chats,
    rooms
  });
}