import { Request, Response } from "express";
import axios from "axios";
import User from "../../models/user.model";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import usersSocket from "../../sockets/client/users.socket";

dotenv.config();

export const login = (req: Request, res: Response) => {
  res.render("client/pages/account/login");
}

export const register = (req: Request, res: Response) => {
  res.render("client/pages/account/register");
}

export const registerGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.CLIENT_ID_GOOGLE,
      client_secret: process.env.CLIENT_SECRET_GOOGLE,
      code,
      redirect_uri: res.locals.REDIRECT_URI_GOOGLE_REGISTER_CALLBACK,
      grant_type: "authorization_code",
    });
    
    const { access_token, id_token } = data;
    
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    
    const check_user = await User.findOne({ email: profile.email });
    if (check_user) {
      const token = await jwt.sign(
        {
          id: check_user.id,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "2 days" }
      );
      await User.updateOne({ _id: check_user._id }, { token: token });
      
      res.cookie("tokenUser", token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });
      
      res.redirect("/");
    } else {
      profile._id = new ObjectId()
      const token = await jwt.sign(
        {
          id: profile._id,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "2 days" }
      );
      profile.token = token
      const newUser = new User(profile);
      await newUser.save();
      res.cookie("tokenUser", token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
 
      });
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    
    // res.redirect("/");
  }
}

export const notFriend = async (req: Request, res: Response) => {
  usersSocket(req, res);
  const userId = res.locals.USER._id
  const requestFriends = res.locals.USER.request_friends;
  const acceptFriends = res.locals.USER.accept_friends;
  const friendsList = res.locals.USER.friends_list.map((friend: any) => friend.user_id);
  const users = await User.find({
    _id: { $ne: userId },
    $and: [
      { _id: { $ne: userId } },
      { _id: { $nin: requestFriends } },
      { _id: { $nin: acceptFriends } },
      { _id: { $nin: friendsList } },
    ],
  }).select("-token");
  
  res.render("client/pages/account/not-friend", {
    users
  });
}

export const request  = async (req: Request, res: Response) => {
  usersSocket(req, res);
  const requestFriends = res.locals.USER.request_friends;

  const users = await User.find({
    _id: { $in: requestFriends },
  }).select("-token");
  
  res.render("client/pages/account/request", {
    users
  });
}

export const accept  = async (req: Request, res: Response) => {
  usersSocket(req, res);
  const acceptFriends = res.locals.USER.accept_friends;

  const users = await User.find({
    _id: { $in: acceptFriends },
  }).select("-token");
  res.render("client/pages/account/accept", {
    users
  });
}