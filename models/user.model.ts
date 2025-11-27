import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: String, 
  email: String,
  verified_email: Boolean,
  name: String,
  given_name: String,
  picture: String,
  token: String,
  accept_friends: [mongoose.SchemaTypes.ObjectId], // Danh sách người đã gửi lời mời kết bạn cho mình
  request_friends: [mongoose.SchemaTypes.ObjectId], // Danh sách người mà mình đã gửi lời mời kết bạn
  friends_list: [
    {
      user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
      },
      room_chat_id: mongoose.SchemaTypes.ObjectId
    }
  ]
}, {
  timestamps: true,
  autoCreate: true
});

const User = mongoose.model("User", userSchema);

export default User;