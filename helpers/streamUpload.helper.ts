import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
export default (buffer: Buffer) => {
  try {
    return new Promise((resolve: any, reject: any) => {
      let stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "Kim Quang",
          public_id: Date.now().toString(),
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};
