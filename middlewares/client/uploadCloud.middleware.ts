import streamUpload from "../../helpers/streamUpload.helper";
import { Request, Response, NextFunction } from "express";

export const uploadSingle = (req: any, res: any, next: NextFunction) => {
  if(req.file && req.file.buffer) {
    const uploadToCloudinary = async (buffer: Buffer) => {
      const result = await streamUpload(buffer);
      req.body[req.file.fieldname] = result as any;
      next();
    }

    uploadToCloudinary(req.file.buffer as Buffer);
  } else {
    next();
  }
}