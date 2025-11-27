# Chat Realtime App - Socket.IO

## Introduction

This project is created as the Final Report for the course **"Network Programming"** at **VAA**.

---

## About

A real-time chat application supporting friend requests, personal and group messaging, Google authentication, and a modern interface with Bootstrap.  
The project uses Node.js, Express, MongoDB, Socket.IO, Cloudinary, Bootstrap, and Pug template.

---

## Technologies

- **Node.js** & **Express** (Backend)
- **MongoDB** & **Mongoose** (Database)
- **Socket.IO** (Realtime communication)
- **Cloudinary** (Image/audio upload)
- **Google OAuth2** (Google login)
- **Bootstrap 5**, **Pug template** (Frontend)
- **SweetAlert2**, **jQuery**, other UI plugins

---

## Features

### Account Management
- Register, login (supports Google OAuth)
- Logout

### Friend Management
- Send, cancel, accept, decline friend requests
- Friend list, strangers, sent/received requests

### Chat
- Real-time 1-1 and group chat (send text, images, audio)
- Real-time notifications via Socket.IO
- Typing, sent, and received status

### Room Management
- Create group chat rooms

### UI/UX
- Responsive, modern interface with Bootstrap
- Popup notifications, action confirmations

---

## Contributors

- Tran Kim Quang (2331540197@vaa.edu.vn)
- Duong Quang Minh (2331540103@vaa.edu.vn)
- Pham Chi Binh (2331540096@vaa.edu.vn)

---

## Installation

### This project requires the following technologies:

- Node.js >= 16.x
- MongoDB

### Setup

1. **Clone this repository**
2. **Install dependencies**
    ```bash
    npm install
    ```
3. **Run the application**
    ```bash
    npm run dev
    ```
    or build and run in production:
    ```bash
    npm run build
    npm start
    ```
4. **Access**
    ```
    http://localhost:3000
    ```

---

## Optional

- Cloudinary (image/audio upload)
- SweetAlert2 (popup notifications)
- UI plugins: Dropzone, Fancybox, Select2, FontAwesome, Swiper...

---

## References

- [Socket.IO Documentation](https://socket.io/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- ChatGPT
- GitHub Copilot

---
