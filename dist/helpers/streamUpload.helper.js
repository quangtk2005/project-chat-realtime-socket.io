"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
exports.default = (buffer) => {
    try {
        return new Promise((resolve, reject) => {
            let stream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: "auto",
                folder: "Kim Quang",
                public_id: Date.now().toString(),
                use_filename: true,
                unique_filename: true,
            }, (error, result) => {
                if (result) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
            streamifier_1.default.createReadStream(buffer).pipe(stream);
        });
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
