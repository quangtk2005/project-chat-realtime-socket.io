import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import streamUpload from "../../helpers/streamUpload.helper";
import User from "../../models/user.model";
import jwt from "jsonwebtoken";

let isHandlerRegistered = false;

export const registerChatSocketHandlers = () => {
  if (isHandlerRegistered) {
    return;
  }
  isHandlerRegistered = true;

  _io.on("connection", (socket) => {
    socket.on("CLIENT_SEND_MESSAGEE", async (data, callback) => {
      try {
        const userId = socket.data?.userId || data?.userId;
        const roomChatId = socket.data?.roomChatId || data?.roomChatId;
        const fullname = socket.data?.fullname || data?.fullname;
        
        if (!userId || !roomChatId) {
          return callback({ message: "error", error: "Unauthorized" });
        }

        const { content, images, audio } = data;
        const linkImages = [];
        let linkAudio = null;
        
        if (images && images.length > 0) {
          for (const imageArray of images) {
            const buffer = Buffer.from(imageArray);
            const result = await streamUpload(buffer);
            linkImages.push((result as any).url);
          }
        }
        
        if (audio && audio.length > 0) {
          const buffer = Buffer.from(audio);
          const result = await streamUpload(buffer);
          linkAudio = (result as any).url;
        }

        let chatData: any = {
          userId: userId,
          content: content,
          roomChatId: roomChatId,
        };
        chatData["images"] = linkImages;
        if (linkAudio) {
          chatData["audio"] = linkAudio;
        }
        const chat = new Chat(chatData);
        await chat.save();
        const user = await User.findById(userId);
        const messageData = {
          userId: userId,
          roomChatId: roomChatId,
          fullname: fullname,
          picture: user?.picture || null,
          images: linkImages,
          audio: linkAudio,
          content: content,
          createdAt: chat.createdAt,
        };
        callback({ message:  "success" })
        _io.to(roomChatId).emit("SERVER_RETURN_MESSAGE", messageData);
        
        socket.to(roomChatId).emit("SERVER_STOP_TYPING", {
          userId: userId,
          roomChatId: roomChatId,
          fullname: fullname
        });
      } catch (error) {
        callback({ message: "error", error: error instanceof Error ? error.message : "Unknown error" });
      }
    });

    socket.on("CLIENT_TYPING", (data) => {
      const userId = socket.data?.userId || data?.userId;
      const roomChatId = socket.data?.roomChatId || data?.roomChatId;
      const fullname = socket.data?.fullname || data?.fullname;
      
      if (userId && roomChatId && fullname) {
        socket.to(roomChatId).emit("SERVER_TYPING", {
          userId: userId,
          roomChatId: roomChatId,
          fullname: fullname
        });
      }
    });

    socket.on("CLIENT_STOP_TYPING", (data) => {
      const userId = socket.data?.userId || data?.userId;
      const roomChatId = socket.data?.roomChatId || data?.roomChatId;
      const fullname = socket.data?.fullname || data?.fullname;
      
      if (userId && roomChatId && fullname) {
        socket.to(roomChatId).emit("SERVER_STOP_TYPING", {
          userId: userId,
          roomChatId: roomChatId,
          fullname: fullname
        });
      }
    });

    socket.on("JOIN_ROOM", async (data) => {
      const { roomChatId, token } = data;
      if (!roomChatId || !token) {
        return;
      }
      
      try {
        jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await User.findOne({ token: token });
        
        if (user) {
          socket.data.userId = user._id.toString();
          socket.data.roomChatId = roomChatId;
          socket.data.fullname = user.name;
          socket.join(roomChatId);
        }
      } catch (error) {
      }
    });
  });
};

export default async (req: Request, res: Response) => {
  registerChatSocketHandlers();
  
  if (res.locals.USER) {
    const roomChatId = req.params.roomChatId;
  }
};
