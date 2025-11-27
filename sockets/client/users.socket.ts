import { Request, Response } from "express";
import User from "../../models/user.model";
import { ObjectId } from "mongodb";
import RoomChat from "../../models/room.model";
import Chat from "../../models/chat.model";

export default async (req: Request, res: Response) => {
  const userIdA = res.locals.USER._id;
  const roomChatId = req.params.roomChatId;
  _io.once("connection", (socket) => {
    // Khi A gửi yêu cầu cho B
    socket.on("CLIENT_ADD_FRIEND", async (userIdB, callback) => {
      // Thêm id của A vào acceptFriends của B

      const existUserAInB = await User.findOne({
        _id: userIdB,
        accept_friends: userIdA
      });
      if (!existUserAInB && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdB
        }, {
          $push: {
            accept_friends: userIdA
          }
        });
      }

      // Thêm id của B vào requestFriends của A 
      const existUserBInA = await User.findOne({
        _id: userIdA,
        request_friends: userIdB
      });
      
      if (!existUserBInA && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdA
        }, {
          $push: {
            request_friends: userIdB
          }
        });
        const updatedUserA = await User.findOne({ _id: userIdA });
        const updatedUserB = await User.findOne({ _id: userIdB });
        const requestLength = updatedUserA?.request_friends?.length || 0;
        callback({ status: true, messages: "Gửi thành công!", request_length: requestLength})
        socket.broadcast.emit("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", {
          length: updatedUserB?.accept_friends.length,
          userId: userIdB
        });
        
        const userA = await User.findById(userIdA).select("name picture");
        _io.to(userIdB.toString()).emit("SERVER_FRIEND_REQUEST", {
          userId: userIdA.toString(),
          userName: userA?.name || "",
          userPicture: userA?.picture || "/client/assets/img/profiles/avatar-01.jpg"
        });
      }
    })

    socket.on("CLIENT_CANCEL_FRIEND", async (userIdB) => {
      // Xóa id của A trong acceptFriends của B
      const existUserAInB = await User.findOne({
        _id: userIdB,
        accept_friends: userIdA
      });
      if (existUserAInB && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdB
        }, {
          $pull: {
            accept_friends: userIdA
          }
        });
      }

      // Xóa id của B trong requestFriends của A 
      const existUserBInA = await User.findOne({
        _id: userIdA,
        request_friends: userIdB
      });

      if (existUserBInA && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdA
        }, {
          $pull: {
            request_friends: userIdB
          }
        });
      }
    })

    socket.on("CLIENT_REJECT_FRIEND", async (userIdB) => {
      // Xóa id của B trong acceptFriends của A
      const existUserBInA = await User.findOne({
        _id: userIdA,
        accept_friends: userIdB
      });

      if (existUserBInA && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdA
        }, {
          $pull: {
            accept_friends: userIdB
          }
        });
      }

      // Xóa id của A trong requestFriends của B
      const existUserAInB = await User.findOne({
        _id: userIdB,
        request_friends: userIdA
      });

      if (existUserAInB && userIdB != userIdA) {
        await User.updateOne({
          _id: userIdB
        }, {
          $pull: {
            request_friends: userIdA
          }
        });
      }
    })

    socket.on("CLIENT_ACCEPT_FRIEND", async (userIdB) => {

      const roomChat = new RoomChat({
        type_room: "friend",
        users: [
          {
            user_id: new ObjectId(userIdA),
            role: "superAdmin"
          },
          {
            user_id: new ObjectId(userIdB),
            role: "superAdmin"
          }
        ]
      })
      await roomChat.save();
      // Thêm {userId, roomChatId} của B vào friendsList của A
      // Xóa id của B trong acceptFriends của A
      const existUserBInA = await User.findOne({
        _id: new ObjectId(userIdA),
        accept_friends: new ObjectId(userIdB)
      });

      if (existUserBInA && userIdB != userIdA) {
        await User.updateOne({
          _id: new ObjectId(userIdA)
        }, {
          $push: {
            friends_list: {
              user_id: new ObjectId(userIdB),
              room_chat_id: roomChat.id
            }
          },
          $pull: {
            accept_friends: new ObjectId(userIdB)
          }
        });
      }

      // Thêm {userId, roomChatId} của A vào friendsList của B
      // Xóa id của A trong requestFriends của B
      const existUserAInB = await User.findOne({
        _id: new ObjectId(userIdB),
        request_friends: new ObjectId(userIdA)
      });

      if (existUserAInB && userIdB != userIdA) {
        await User.updateOne({
          _id: new ObjectId(userIdB)
        }, {
          $push: {
            friends_list: {
              user_id: new ObjectId(userIdA),
              room_chat_id: roomChat.id
            }
          },
          $pull: {
            request_friends: new ObjectId(userIdA)
          }
        });
      }

      const userA = await User.findById(userIdA).select("name picture");
      const userB = await User.findById(userIdB).select("name picture");
      
      const friendDataA = {
        roomId: roomChat._id.toString(),
        friendId: userIdB.toString(),
        friendName: userB?.name || "",
        friendAvatar: userB?.picture || "/client/assets/img/profiles/avatar-01.jpg",
        type: "friend",
        userId: userIdA.toString()
      };
      
      const friendDataB = {
        roomId: roomChat._id.toString(),
        friendId: userIdA.toString(),
        friendName: userA?.name || "",
        friendAvatar: userA?.picture || "/client/assets/img/profiles/avatar-01.jpg",
        type: "friend",
        userId: userIdB.toString()
      };

      _io.emit("SERVER_ADD_FRIEND", friendDataA);
      _io.emit("SERVER_ADD_FRIEND", friendDataB);

    })
  })

}