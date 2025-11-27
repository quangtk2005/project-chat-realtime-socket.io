import { Request, Response } from "express";
import Chat from "../../models/chat.model";
import RoomChat from "../../models/room.model";


export const home = async (req: Request, res: Response) => {
  // _io.on('connection', (socket) => {
  //   console.log("Có 1 người dùng kết nối", socket.id);
  // });
  
  

  res.render("client/pages/home/index", {
  });
};