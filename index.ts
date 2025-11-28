import express from "express";
import http from "http";
import indexRoutes from "./routes/client/index.routes";
import { Server } from "socket.io";
import * as database from "./configs/database.connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { registerChatSocketHandlers } from "./sockets/client/chat.socket";
import { arcjetProtect } from "./configs/arcjet.config";


dotenv.config();
database.connect();

declare global {
  var _io: Server;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 10e6,
  pingTimeout: 60000,
  pingInterval: 25000
});

const port = process.env.PORT || 3000;

global._io = io;

registerChatSocketHandlers();


// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://apis.google.com"],
//       imgSrc: ["'self'", "data:", "https:", "http:"],
//       connectSrc: ["'self'", "https://api.cloudinary.com", "https://cdn.jsdelivr.net"],
//       fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
//       frameSrc: ["'self'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));

app.use(cookieParser())
app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(async (req, res, next) => {
//   try {
//     const decision = await arcjetProtect(req, { requested: 1 });
//     if (decision.isDenied()) {
//       if (decision.reason.isRateLimit()) {
//         return res.status(429).json({ error: "Quá nhiều yêu cầu" });
//       }
//       if (decision.reason.isBot()) {
//         return res.status(403).json({ error: "Bot được phát hiện" });
//       }
//       return res.status(403).json({ error: "Yêu cầu bị từ chối" });
//     }
//     next();
//   } catch (error) {
//     console.error("Lỗi Arcjet bảo vệ:", error);
//     next();
//   }
// });

app.use(indexRoutes);

server.listen(port, () => {
  console.log(`Đăng lắng nghe cổng ${port}`);
});