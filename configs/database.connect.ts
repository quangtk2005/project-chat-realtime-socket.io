import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Kết nối database thành công");
  } catch (error) {
    console.log("Kết nối database thất bại");
  }
}
