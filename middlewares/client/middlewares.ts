import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import User from "../../models/user.model";
import jwt from "jsonwebtoken";
import RoomChat from "../../models/room.model";
import moment from "moment";
import { ObjectId } from "mongodb";
dotenv.config();

export const runAllRouters = (req: Request, res: Response, next: NextFunction) => {
  
  const domain = process.env.PROTOCOL + "://" + req.headers.host;
  const REDIRECT_URI_GOOGLE_REGISTER_CALLBACK = domain + "/account/register/google/callback";
  
  res.locals.REDIRECT_URI_GOOGLE_REGISTER_CALLBACK = REDIRECT_URI_GOOGLE_REGISTER_CALLBACK
  next();
}

export const checkLogin = async (req: Request, res: Response, next: NextFunction) => {
  
  if(req.cookies.tokenUser){
    const user = await User.findOne({ token: req.cookies.tokenUser });
    try {
      const decoded = jwt.verify(req.cookies.tokenUser, process.env.JWT_SECRET as string);
      res.locals.USER = user
    } catch (error) {
      res.clearCookie('tokenUser');
    }
    
  }
  // else next()
  next()
}


export const requireLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(req.cookies.tokenUser){
      const user = await User.findOne({ token: req.cookies.tokenUser }).populate("accept_friends").populate("request_friends").select("-token");
      
      if(!user){
        res.clearCookie('tokenUser');
        res.redirect("/account/login")
      }
      try {
        const decoded = jwt.verify(req.cookies.tokenUser, process.env.JWT_SECRET as string);
        
        res.locals.moment = moment
        res.locals.USER = user
        next()
      } catch (error) {
        res.clearCookie('tokenUser');
        res.redirect("/account/login")
      }
      
    } else res.redirect("/account/login")
  } catch (error) {
    res.redirect("/account/login")
  }
  
}

export const isAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomChatId = req.params.roomChatId;
    
    if (!ObjectId.isValid(roomChatId)) {
      return res.redirect("/");
    }
    
    const userId = new ObjectId(res.locals.USER._id);
    const roomChatObjectId = new ObjectId(roomChatId);
    
    const roomChat = await RoomChat.findOne({
      _id: roomChatObjectId,
      users: { $elemMatch: { user_id: userId } }
    });

    if(roomChat) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/");
  }
}


export const roomFriendsAccess = async (req: Request, res: Response, next: NextFunction) => {
  const roomFriends = await RoomChat.find({
    type_room: "friend",
    users: { $elemMatch: { user_id: res.locals.USER._id } }
  }).populate({
    path: "users.user_id",
  })
  
  const Chat = (await import("../../models/chat.model")).default;
  for (const room of roomFriends) {
    const lastChat = await Chat.findOne({
      roomChatId: room._id
    }).sort({ createdAt: -1 }).populate({
      path: "userId",
      select: "name picture"
    });
    (room as any).lastChat = lastChat;
  }
  
  res.locals.ROOM_FRIENDS = roomFriends

  const roomGroups = await RoomChat.find({
    type_room: "group",
    users: { $elemMatch: { user_id: res.locals.USER._id } }
  }).populate({
    path: "users.user_id",
  })
  
  for (const room of roomGroups) {
    const lastChat = await Chat.findOne({
      roomChatId: room._id
    }).sort({ createdAt: -1 }).populate({
      path: "userId",
      select: "name picture"
    });
    (room as any).lastChat = lastChat;
  }
  
  res.locals.ROOM_GROUPS = roomGroups
  next()
}