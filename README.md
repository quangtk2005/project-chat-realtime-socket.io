# Chat Realtime App - Socket.IO

## Introduction

This project is made as the Final Report for the course **"Lập trình mạng"** at **Vietnam Aviation Academy**.

---

## About

Ứng dụng chat realtime hỗ trợ kết bạn, nhắn tin cá nhân, nhóm, xác thực Google, giao diện hiện đại với Bootstrap.  
Dự án sử dụng Node.js, Express, MongoDB, Socket.IO, Cloudinary, Bootstrap, Pug template.

---

## Technique

- **Node.js** & **Express** (Backend)
- **MongoDB** & **Mongoose** (Database)
- **Socket.IO** (Realtime communication)
- **Cloudinary** (Upload ảnh/audio)
- **Google OAuth2** (Đăng nhập Google)
- **Bootstrap 5**, **Pug template** (Frontend)
- **SweetAlert2**, **jQuery**, các plugin UI khác

---

## Feature

### Account Management
- Đăng ký, đăng nhập (hỗ trợ Google OAuth)
- Đăng xuất

### Friend Management
- Gửi, hủy, chấp nhận, từ chối lời mời kết bạn
- Danh sách bạn bè, người lạ, lời mời đã gửi/nhận

### Chat
- Chat realtime 1-1 và nhóm (gửi text, ảnh, audio)
- Thông báo realtime qua Socket.IO
- Trạng thái đang gõ, đã gửi, đã nhận

### Room Management
- Tạo phòng chat nhóm

### UI/UX
- Giao diện responsive, hiện đại với Bootstrap
- Popup thông báo, xác nhận thao tác

---

## Contributors

- Trần Kim Quang
- Dương Quang Minh
- Phạm Chí Bình

---

## Installation

### This project requires below technologies to implement:

- Node.js >= 16.x
- MongoDB

### Setup

1. **Clone this repository**
2. **Cài đặt dependencies**
    ```bash
    npm install
    ```
3. **Chạy ứng dụng**
    ```bash
    npm run dev
    ```
    hoặc build và chạy production:
    ```bash
    npm run build
    npm start
    ```
4. **Truy cập**
    ```
    http://localhost:3000
    ```

---

## Optional

- Cloudinary (upload ảnh/audio)
- SweetAlert2 (popup thông báo)
- Các plugin UI: Dropzone, Fancybox, Select2, FontAwesome, Swiper...

---

## References

- [Socket.IO Documentation](https://socket.io/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- ChatGPT
- GitHub Copilot

---
