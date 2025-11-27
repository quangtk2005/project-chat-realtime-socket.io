import { Request, Response } from "express";
import axios from "axios";
import { ObjectId } from "mongodb";
import Chat from "../../models/chat.model";
import chatSocket from "../../sockets/client/chat.socket";
import RoomChat from "../../models/room.model";
import User from "../../models/user.model";

export const create = async (req: Request, res: Response) => {
  try {
    const friendsList = res.locals.USER.friends_list;

    for (const friend of friendsList) {
      const infoFriend = await User.findOne({
        _id: friend.user_id,
      }).select("_id name picture");
      friend.fullName = infoFriend?.name || "";
      friend.avatar = infoFriend?.picture || "";
      friend.userId = infoFriend?._id || "";
      
    }

    res.render("client/pages/rooms-chat/index", {
      friendsList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const createPost = async (req: Request, res: Response) => {
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
    let dataRoomChat: any = {
      title: title,
      type_room: "group",
      users: [],
    };
    dataRoomChat.users.push({
      user_id: new ObjectId(res.locals.USER._id),
      role: "superAdmin",
    });
    for (const friend of selectedFriends) {
      dataRoomChat.users.push({
        user_id: new ObjectId(friend),
        role: "member",
      });
    }
    
    const roomChat = new RoomChat(dataRoomChat);
    await roomChat.save();
    
    const populatedRoom = await RoomChat.findById(roomChat._id).populate({
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
  } catch (error) {
    res.json({
      success: false,
      message: "Lỗi server",
    });
  }
};
