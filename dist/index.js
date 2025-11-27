"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const index_routes_1 = __importDefault(require("./routes/client/index.routes"));
const socket_io_1 = require("socket.io");
const database = __importStar(require("./configs/database.connect"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const chat_socket_1 = require("./sockets/client/chat.socket");
dotenv_1.default.config();
database.connect();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    maxHttpBufferSize: 10e6,
    pingTimeout: 60000,
    pingInterval: 25000
});
const port = process.env.PORT || 3000;
global._io = io;
(0, chat_socket_1.registerChatSocketHandlers)();
app.use((0, cookie_parser_1.default)());
app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);
app.use(express_1.default.static(`${__dirname}/public`));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(index_routes_1.default);
server.listen(port, () => {
    console.log(`Đăng lắng nghe cổng ${port}`);
});
