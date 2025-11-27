const reloadPage = () => {
  location.reload();
};

const initMessageImageViewer = (container) => {
  if (!container || typeof Viewer === "undefined") {
    return;
  }
  if (container.__viewerInstance) {
    container.__viewerInstance.update();
    return;
  }
  container.__viewerInstance = new Viewer(container, {
    toolbar: false,
    navbar: false,
    title: false,
    tooltip: false,
    button: false,
    movable: false,
    rotatable: false,
    scalable: false,
    fullscreen: false,
    toggleOnDblclick: false,
  });
};

const registerMessageImageViewers = (root) => {
  if (!root) {
    return;
  }
  if (root.classList && root.classList.contains("message-images")) {
    initMessageImageViewer(root);
    return;
  }
  const containers =
    typeof root.querySelectorAll === "function"
      ? root.querySelectorAll(".message-images")
      : [];
  containers.forEach((container) => initMessageImageViewer(container));
};

const initActiveLink = () => {
  const link = document.querySelector(
    `.main-menu a[href="${location.pathname}"]`
  );
  const chatMessage = document.querySelector(".chat.chat-messages.show");
  const chatMenu = document.querySelector("[data-bs-target='#chat-menu']");
  const groupChatMenu = document.querySelector(
    "[data-bs-target='#group-menu']"
  );
  if (chatMessage && !chatMenu.classList.contains("active")) {
    chatMenu.classList.add("active");
    if (chatMessage.getAttribute("type-room") == "friend") {
    } else {
      groupChatMenu.click();
    }
  }
  if (link) {
    link.classList.add("active");
  }
};

initActiveLink();
const formChat = document.querySelector(".footer-form");
if (formChat) {
  const previewImageMain = new FileUploadWithPreview.FileUploadWithPreview(
    "upload-image-preview-main",
    {
      multiple: true,
      maxFileCount: 4,
      text: {
        label: "Ảnh bìa",
        chooseFile: "Thêm hình ảnh (0/4)",
        browse: "Duyệt ảnh",
        selectedCount: "ảnh được chọn",
      },
      accept: "image/*",
    }
  );
  formChat.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  const inputContent = document.querySelector(".chat-footer input#message");
  let typingTimeout = null;
  let isTyping = false;

  if (inputContent) {
    inputContent.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const btnSendMessage = document.querySelector("[btn-send-message]");
        btnSendMessage.click();
      }
    });

    inputContent.addEventListener("input", () => {
      const currentRoomChatId = getRoomChatIdFromUrl();
      if (currentRoomChatId && socket) {
        if (!isTyping) {
          isTyping = true;
          socket.emit("CLIENT_TYPING", { roomChatId: currentRoomChatId });
        }

        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        typingTimeout = setTimeout(() => {
          isTyping = false;
          socket.emit("CLIENT_STOP_TYPING", { roomChatId: currentRoomChatId });
        }, 1000);
      }
    });
  }
  const getRoomChatIdFromUrl = () => {
    const pathParts = window.location.pathname.split("/");
    const chatIndex = pathParts.indexOf("chat");
    if (chatIndex !== -1 && pathParts[chatIndex + 1]) {
      return pathParts[chatIndex + 1];
    }
    return null;
  };

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "tokenUser") {
        return value;
      }
    }
    return null;
  };

  const roomChatId = getRoomChatIdFromUrl();
  const token = getTokenFromCookie();
  if (roomChatId && token && socket) {
    socket.emit("JOIN_ROOM", { roomChatId, token });
  }

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  const microphoneBtn = document.querySelector(".action-circle .ti-microphone");
  if (microphoneBtn) {
    microphoneBtn.closest("a").addEventListener("click", async (event) => {
      event.preventDefault();

      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const audioBuffer = Array.from(uint8Array);

            const currentRoomChatId = getRoomChatIdFromUrl();
            if (currentRoomChatId && socket) {
              socket.emit(
                "CLIENT_SEND_MESSAGEE",
                {
                  content: "",
                  images: [],
                  audio: audioBuffer,
                  roomChatId: currentRoomChatId,
                },
                (status) => {}
              );
            }

            stream.getTracks().forEach((track) => track.stop());
          };

          mediaRecorder.start();
          isRecording = true;
          microphoneBtn.closest("a").classList.add("recording");
        } catch (error) {
          alert("Không thể truy cập microphone");
        }
      } else {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          isRecording = false;
          microphoneBtn.closest("a").classList.remove("recording");
        }
      }
    });
  }

  const btnSendMessage = document.querySelector("[btn-send-message]");
  if (btnSendMessage) {
    btnSendMessage.addEventListener("click", async (event) => {
      const message = document.querySelector("#message").value;
      const formatContent = message.trim().replace(/\s+/g, " ");
      const imageFiles = previewImageMain.cachedFileArray;
      const currentRoomChatId = getRoomChatIdFromUrl();

      if (formatContent || imageFiles.length > 0) {
        const imageBuffers = [];
        for (const file of imageFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          imageBuffers.push(Array.from(uint8Array));
        }

        if (isTyping) {
          socket.emit("CLIENT_STOP_TYPING", { roomChatId: currentRoomChatId });
          isTyping = false;
        }
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          typingTimeout = null;
        }
        
        socket.emit(
          "CLIENT_SEND_MESSAGEE",
          {
            content: formatContent || "",
            images: imageBuffers || [],
            audio: null,
            roomChatId: currentRoomChatId,
          },
          (status) => {}
        );
        document.querySelector("#message").value = "";
        previewImageMain.resetPreviewPanel();
      }
    });
  }
}

const openImage = () => {
  const inputImage = document.querySelector(
    ".custom-file-container  input#file-upload-with-preview-upload-image-preview-main"
  );
  if (inputImage) {
    inputImage.click();
  }
};

const encrypt = (message) => {
  let key = "nhom07laptrinhmangthayhung";
  var encrypted = CryptoJS.AES.encrypt(message, key);
  return encrypted.toString();
};

const decrypt = (encrypted) => {
  let key = "nhom07laptrinhmangthayhung";
  var decrypted = CryptoJS.AES.decrypt(encrypted, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

const logout = async () => {
  await cookieStore
    .delete("tokenUser")
    .then(() => {
      alert("Đã đăng xuất thành công!");
      window.location.reload();
    })
    .catch(() => {
      alert("Có lỗi xảy ra khi đăng xuất.");
    });
};

const addMessageRealtime = () => {
  const bodyMessage = document.querySelector(".chat-body .messages");
  if (!bodyMessage) return;

  socket.on("SERVER_RETURN_MESSAGE", (data) => {
    const {
      fullname,
      userId,
      images,
      content,
      createdAt,
      picture,
      audio,
      roomChatId,
    } = data;

    const hasContent = content && content.trim().length > 0;
    const hasImages = images && images.length > 0;
    const hasAudio = audio && audio.trim().length > 0;

    if (!hasContent && !hasImages && !hasAudio) {
      return;
    }

    if (bodyMessage) {
      const existingMessages = bodyMessage.querySelectorAll(".chats");
      const messageTime = moment(createdAt).format("hh:mm A");
      const isDuplicate = Array.from(existingMessages).some((msg) => {
        const timeEl = msg.querySelector(".chat-time");
        const msgUserId = msg
          .querySelector(".chat-avatar")
          ?.nextElementSibling?.querySelector(
            ".chat-profile-name h6"
          )?.textContent;
        return (
          timeEl?.textContent === messageTime &&
          (msgUserId === fullname ||
            (msgUserId === "Bạn" &&
              userId === bodyMessage.getAttribute("my-id")))
        );
      });

      if (isDuplicate) {
        return;
      }

    const message = document.createElement("div");

      let imagesHTML = "";
      if (hasImages) {
        imagesHTML =
          '<div class="message-content message-images" data-viewer-group="chat-images" style="display: flex; flex-wrap: wrap; gap: 10px; background: none;">';
        images.forEach((image) => {
          imagesHTML += `<img src="${image}" alt="Image" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
        });
        imagesHTML += "</div>";
      }

      let contentHTML = "";
      if (hasContent) {
        contentHTML = `<div class="message-content">${content}</div>`;
      }

      let audioHTML = "";
      if (hasAudio) {
        audioHTML = `<div class="message-content" style="padding: 10px;">
        <audio controls style="width: 250px; height: 40px;">
          <source src="${audio}" type="audio/webm">
          <source src="${audio}" type="audio/mpeg">
        </audio>
      </div>`;
      }

      const myId = bodyMessage.getAttribute("my-id");
      const isMyMessage = userId === myId;
      const myAvatar = isMyMessage
        ? picture || "/client/assets/img/profiles/avatar-17.jpg"
        : "/client/assets/img/profiles/avatar-17.jpg";
      const otherAvatar =
        picture || "/client/assets/img/profiles/avatar-06.jpg";

    if (bodyMessage.getAttribute("my-id") == userId) {
      message.classList.add("chats", "chats-right");
      let chatRight = `
          <div class="chat-content">
            <div class="chat-profile-name text-end">
              <h6>Bạn<i class="ti ti-circle-filled fs-7 mx-2"></i><span class="chat-time">${moment(
                createdAt
              ).format("hh:mm A")}</span><span
                  class="msg-read success"><i class="ti ti-checks"></i></span></h6>
            </div>
            <div class="chat-info">
              <div class="chat-actions"><a class="#" href="chat.html#" data-bs-toggle="dropdown"><i
                    class="ti ti-dots-vertical"></i></a>
                <ul class="dropdown-menu dropdown-menu-end p-3">
                  <li><a class="dropdown-item reply-btn" href="chat.html#"><i class="ti ti-corner-up-left me-2"></i>Reply</a>
                  </li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-pinned me-2"></i>Forward</a></li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-file-export me-2"></i>Copy</a></li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-heart me-2"></i>Mark as Favourite</a></li>
                  <li><a class="dropdown-item" href="chat.html#" data-bs-toggle="modal" data-bs-target="#message-delete"><i
                        class="ti ti-trash me-2"></i>Delete</a></li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-check me-2"></i>Mark as Unread</a></li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-box-align-right me-2"></i>Archeive Chat</a>
                  </li>
                  <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-pinned me-2"></i>Pin Chat</a></li>
                </ul>
              </div>
              ${imagesHTML}
              ${contentHTML}
              ${audioHTML}
              <div class="emoj-group">
                  <ul>
                    <li class="emoj-action"><a href="javascript:void(0);"><i class="ti ti-mood-smile"></i></a>
                      <div class="emoj-group-list">
                        <ul>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-02.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-05.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-06.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-07.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-08.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-03.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-10.svg" alt="Icon"></a>
                          </li>
                          <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-09.svg" alt="Icon"></a>
                          </li>
                          <li class="add-emoj"><a href="javascript:void(0);"><i class="ti ti-plus"></i></a></li>
                        </ul>
                      </div>
                    </li>
                    <li><a href="chat.html#" data-bs-toggle="modal" data-bs-target="#forward-message"><i
                          class="ti ti-arrow-forward-up"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
          <div class="chat-avatar"><img class="rounded-circle dreams_chat" src="${myAvatar}" alt="image" onerror="this.src='/client/assets/img/profiles/avatar-17.jpg'"></div>
      `;
      message.innerHTML = chatRight;
    } else {
      message.classList.add("chats");
      let chatLeft = `
        <div class="chat-avatar"><img class="rounded-circle" src="${otherAvatar}" alt="image" onerror="this.src='/client/assets/img/profiles/avatar-06.jpg'">
        </div>
        <div class="chat-content">
          <div class="chat-profile-name">
            <h6>${fullname}<i class="ti ti-circle-filled fs-7 mx-2"></i><span class="chat-time">${moment(
        createdAt
      ).format("hh:mm A")}</span><span
                class="msg-read success"><i class="ti ti-checks"></i></span></h6>
          </div>
          <div class="chat-info">
            ${imagesHTML}
            ${contentHTML}
            ${audioHTML}
            <div class="emoj-group">
                <ul>
                  <li class="emoj-action"><a href="javascript:void(0);"><i class="ti ti-mood-smile"></i></a>
                    <div class="emoj-group-list">
                      <ul>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-02.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-05.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-06.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-07.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-08.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-03.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-10.svg" alt="Icon"></a>
                        </li>
                        <li><a href="javascript:void(0);"><img src="/client/assets/img/icons/emonji-09.svg" alt="Icon"></a>
                        </li>
                        <li class="add-emoj"><a href="javascript:void(0);"><i class="ti ti-plus"></i></a></li>
                      </ul>
                    </div>
                  </li>
                  <li><a href="chat.html#" data-bs-toggle="modal" data-bs-target="#forward-message"><i
                        class="ti ti-arrow-forward-up"></i></a></li>
                </ul>
            </div>
            <div class="chat-actions"><a class="#" href="chat.html#" data-bs-toggle="dropdown"><i
                  class="ti ti-dots-vertical"></i></a>
              <ul class="dropdown-menu dropdown-menu-end p-3">
                <li><a class="dropdown-item reply-btn" href="chat.html#"><i class="ti ti-corner-up-left me-2"></i>Reply</a>
                </li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-pinned me-2"></i>Forward</a></li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-file-export me-2"></i>Copy</a></li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-heart me-2"></i>Mark as Favourite</a></li>
                <li><a class="dropdown-item" href="chat.html#" data-bs-toggle="modal" data-bs-target="#message-delete"><i
                      class="ti ti-trash me-2"></i>Delete</a></li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-check me-2"></i>Mark as Unread</a></li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-box-align-right me-2"></i>Archeive Chat</a>
                </li>
                <li><a class="dropdown-item" href="chat.html#"><i class="ti ti-pinned me-2"></i>Pin Chat</a></li>
              </ul>
            </div>
          </div>
        </div>
      `;
      message.innerHTML = chatLeft;
    }
      bodyMessage.appendChild(message);
      registerMessageImageViewers(message);
    const slimScrollDiv = document.querySelector(".chat .slimScrollDiv");
    const chatBody = slimScrollDiv.querySelector(".chat-body");
    chatBody.scrollTop = chatBody.scrollHeight;
    }

    const chatList = document.querySelector(`[data-room-id="${roomChatId}"]`);
    if (chatList) {
      const timeEl = chatList.querySelector(".chat-user-time .time");
      const typingIndicator = chatList.querySelector(".typing-indicator-text");
      const messageText = chatList.querySelector(".message-text");

      if (typingIndicator) {
        typingIndicator.style.display = "none";
      }

      if (messageText) {
        messageText.style.display = "inline";
        if (images && images.length > 0) {
          messageText.textContent = "Đã gửi ảnh";
        } else if (audio) {
          messageText.textContent = "Đã gửi audio";
        } else if (content) {
          messageText.textContent = content;
        } else {
          messageText.textContent = "";
        }
      }

      if (timeEl) {
        timeEl.textContent = moment(createdAt).format("hh:mm A");
      }

      const chatUsersWrap = document.querySelector(".chat-users-wrap");
      if (chatUsersWrap && chatList.parentNode) {
        chatList.parentNode.removeChild(chatList);
        chatUsersWrap.insertBefore(chatList, chatUsersWrap.firstChild);
      }
    }
  });

  socket.on("SERVER_TYPING", (data) => {
    const { userId, fullname } = data;
    const bodyMessage = document.querySelector(".chat-body .messages");
    if (!bodyMessage) return;
    const myId = bodyMessage.getAttribute("my-id");

    if (userId !== myId) {
      let typingIndicator = document.getElementById("typing-indicator");
      if (!typingIndicator) {
        typingIndicator = document.createElement("div");
        typingIndicator.id = "typing-indicator";
        typingIndicator.className = "typing-indicator";
        typingIndicator.innerHTML = `
          <div class="chats">
            <div class="chat-avatar">
              <img class="rounded-circle" src="/client/assets/img/profiles/avatar-06.jpg" alt="image">
            </div>
            <div class="chat-content">
              <div class="chat-info">
                <div class="message-content typing-message">
                  <span class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span class="typing-text">${fullname} đang gõ...</span>
                </div>
              </div>
            </div>
          </div>
        `;
        bodyMessage.appendChild(typingIndicator);
      } else {
        const typingText = typingIndicator.querySelector(".typing-text");
        if (typingText) {
          typingText.textContent = `${fullname} đang gõ...`;
        }
      }

      const slimScrollDiv = document.querySelector(".chat .slimScrollDiv");
      if (slimScrollDiv) {
        const chatBody = slimScrollDiv.querySelector(".chat-body");
        if (chatBody) {
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }
    }
  });

  socket.on("SERVER_STOP_TYPING", (data) => {
    const { userId } = data;
    const bodyMessage = document.querySelector(".chat-body .messages");
    if (!bodyMessage) return;
    const myId = bodyMessage.getAttribute("my-id");

    if (userId !== myId) {
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
  });
};
addMessageRealtime();

const updateChatListRealtime = () => {
  socket.on("SERVER_TYPING", (data) => {
    const { userId, roomChatId, fullname } = data;
    const isOnChatPage = window.location.pathname.includes("/chat/");

    if (!isOnChatPage) {
      const chatList = document.querySelector(`[data-room-id="${roomChatId}"]`);

      if (chatList) {
        const typingIndicator = chatList.querySelector(
          ".typing-indicator-text"
        );
        const messageText = chatList.querySelector(".message-text");

        if (typingIndicator) {
          typingIndicator.style.display = "inline";
        }

        if (messageText) {
          messageText.style.display = "none";
        }
      }
    }
  });

  socket.on("SERVER_STOP_TYPING", (data) => {
    const { userId, roomChatId } = data;
    const isOnChatPage = window.location.pathname.includes("/chat/");

    if (!isOnChatPage) {
      const chatList = document.querySelector(`[data-room-id="${roomChatId}"]`);

      if (chatList) {
        const typingIndicator = chatList.querySelector(
          ".typing-indicator-text"
        );
        const messageText = chatList.querySelector(".message-text");

        if (typingIndicator) {
          typingIndicator.style.display = "none";
        }

        if (messageText) {
          messageText.style.display = "inline";
        }
      }
    }
  });
};

if (document.querySelector(".chat-users-wrap")) {
  updateChatListRealtime();
}

const addFriendRealtime = () => {
  socket.on("SERVER_ADD_FRIEND", (data) => {
    const { roomId, friendId, friendName, friendAvatar, type, userId } = data;
    const currentUserId =
      typeof USER_ID !== "undefined"
        ? USER_ID
        : document.querySelector(".chat-body .messages")?.getAttribute("my-id");

    if (userId === currentUserId && type === "friend") {
      const allChatsTab = document.querySelector("#all-chats");
      const chatUsersWrap = allChatsTab ? allChatsTab.querySelector(".chat-users-wrap") : document.querySelector("#all-chats .chat-users-wrap");
      if (chatUsersWrap) {
        const existingChat = chatUsersWrap.querySelector(
          `[data-room-id="${roomId}"]`
        );
        if (!existingChat) {
          const chatListDiv = document.createElement("div");
          chatListDiv.className = "chat-list";
          chatListDiv.setAttribute("data-room-id", roomId);
          
          const chatUserListLink = document.createElement("a");
          chatUserListLink.href = `/chat/${roomId}`;
          chatUserListLink.className = "chat-user-list";
          
          chatUserListLink.innerHTML = `
            <div class="avatar avatar-lg online me-2">
              <img src="${friendAvatar}" class="rounded-circle border border-warning border-2" alt="image" onerror="this.src='/client/assets/img/profiles/avatar-01.jpg'">
            </div>
            <div class="chat-user-info">
              <div class="chat-user-msg">
                <h6>${friendName}</h6>
                <p class="last-message">
                  <span class="typing-indicator-text" style="display: none;">
                    <span class="animate-typing">
                      is typing
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                    </span>
                  </span>
                  <span class="message-text"></span>
                </p>
              </div>
              <div class="chat-user-time">
                <span class="time"></span>
                <div class="chat-pin">
                  <i class="ti ti-pin me-2"></i>
                  <span class="count-message fs-12 fw-semibold">0</span>
                </div>
              </div>
            </div>
          `;
          
          const chatDropdown = document.createElement("div");
          chatDropdown.className = "chat-dropdown";
          chatDropdown.innerHTML = `
            <a class="#" href="index.html#" data-bs-toggle="dropdown">
              <i class="ti ti-dots-vertical"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end p-3">
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-box-align-right me-2"></i>Archive Chat</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-heart me-2"></i>Mark as Favourite</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-check me-2"></i>Mark as Unread</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-pinned me-2"></i>Pin Chats</a></li>
              <li><a class="dropdown-item" href="index.html#" data-bs-toggle="modal" data-bs-target="#delete-chat"><i class="ti ti-trash me-2"></i>Delete</a></li>
            </ul>
          `;
          
          chatListDiv.appendChild(chatUserListLink);
          chatListDiv.appendChild(chatDropdown);
          chatUsersWrap.insertBefore(chatListDiv, chatUsersWrap.firstChild);
          
          const sidebarBody = chatUsersWrap.closest(".sidebar-body");
          if (sidebarBody) {
            sidebarBody.style.overflowY = "auto";
            sidebarBody.style.overflowX = "hidden";
            const currentHeight = sidebarBody.scrollHeight;
            const viewportHeight = window.innerHeight;
            if (currentHeight > viewportHeight - 200) {
              sidebarBody.style.maxHeight = `${viewportHeight - 200}px`;
            }
          }
        }
      }
    }
  });
};

const addGroupRealtime = () => {
  socket.on("SERVER_ADD_GROUP", (data) => {
    const { roomId, title, type, userIds } = data;
    const currentUserId =
      typeof USER_ID !== "undefined"
        ? USER_ID
        : document.querySelector(".chat-body .messages")?.getAttribute("my-id");

    if (
      userIds &&
      currentUserId &&
      userIds.includes(currentUserId) &&
      type === "group"
    ) {
      const allGroupsSection = document.querySelector("h5");
      let chatUsersWrap = null;
      
      if (allGroupsSection && allGroupsSection.textContent.includes("All Groups")) {
        const parentDiv = allGroupsSection.closest("div");
        if (parentDiv) {
          chatUsersWrap = parentDiv.querySelector(".chat-users-wrap");
        }
      }
      
      if (!chatUsersWrap) {
        const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabs.forEach((tab) => {
          if (tab.textContent.includes("All Groups")) {
            const targetId = tab.getAttribute("href")?.replace("#", "");
            const targetTab = document.querySelector(targetId);
            if (targetTab) {
              chatUsersWrap = targetTab.querySelector(".chat-users-wrap");
            }
          }
        });
      }

      if (chatUsersWrap) {
        const existingGroup = chatUsersWrap.querySelector(
          `[data-room-id="${roomId}"]`
        );
        if (!existingGroup) {
          const groupListDiv = document.createElement("div");
          groupListDiv.className = "chat-list";
          groupListDiv.setAttribute("data-room-id", roomId);
          
          const groupUserListLink = document.createElement("a");
          groupUserListLink.href = `/chat/${roomId}`;
          groupUserListLink.className = "chat-user-list";
          
          groupUserListLink.innerHTML = `
            <div class="avatar avatar-lg online me-2">
              <img src="/client/assets/img/groups/group-01.jpg" class="rounded-circle" alt="image">
            </div>
            <div class="chat-user-info">
              <div class="chat-user-msg">
                <h6>${title}</h6>
                <p>
                  <span class="animate-typing" style="display: none;">
                    is typing
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                </p>
              </div>
              <div class="chat-user-time">
                <span class="time"></span>
                <div class="chat-pin">
                  <i class="ti ti-pin me-2"></i>
                  <span class="count-message fs-12 fw-semibold">0</span>
                </div>
              </div>
            </div>
          `;
          
          const groupDropdown = document.createElement("div");
          groupDropdown.className = "chat-dropdown";
          groupDropdown.innerHTML = `
            <a class="#" href="index.html#" data-bs-toggle="dropdown">
              <i class="ti ti-dots-vertical"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end p-3">
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-box-align-right me-2"></i>Archive Group</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-volume-off me-2"></i>Mute Notification</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-logout-2 me-2"></i>Exit Group</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-pinned me-2"></i>Pin Group</a></li>
              <li><a class="dropdown-item" href="index.html#"><i class="ti ti-square-check me-2"></i>Mark as Unread</a></li>
            </ul>
          `;
          
          groupListDiv.appendChild(groupUserListLink);
          groupListDiv.appendChild(groupDropdown);
          chatUsersWrap.insertBefore(groupListDiv, chatUsersWrap.firstChild);
          
          const sidebarBody = chatUsersWrap.closest(".sidebar-body");
          if (sidebarBody) {
            sidebarBody.style.overflowY = "auto";
            sidebarBody.style.overflowX = "hidden";
            const currentHeight = sidebarBody.scrollHeight;
            const viewportHeight = window.innerHeight;
            if (currentHeight > viewportHeight - 200) {
              sidebarBody.style.maxHeight = `${viewportHeight - 200}px`;
            }
          }
        }
      }
    }
  });
};

addFriendRealtime();
addGroupRealtime();

const showFriendRequestNotification = () => {
  const pendingFriendRequests = new Set();

  socket.on("SERVER_FRIEND_REQUEST", (data) => {
    const { userId, userName, userPicture } = data;
    const currentUserId =
      typeof USER_ID !== "undefined"
        ? USER_ID
        : document.querySelector(".chat-body .messages")?.getAttribute("my-id");

    if (!currentUserId || pendingFriendRequests.has(userId)) {
      return;
    }

    pendingFriendRequests.add(userId);
    const picture = userPicture || "/client/assets/img/profiles/avatar-01.jpg";

    if (typeof Swal === "undefined") {
      const accept = window.confirm(
        `${userName} đã gửi lời mời kết bạn cho bạn. Chọn OK để chấp nhận.`
      );
      if (accept) {
        socket.once("SERVER_ADD_FRIEND", (friendData) => {
          if (friendData.userId === currentUserId && friendData.roomId) {
            window.location.href = `/chat/${friendData.roomId}`;
          }
        });
        socket.emit("CLIENT_ACCEPT_FRIEND", userId);
      }
      pendingFriendRequests.delete(userId);
      return;
    }

    Swal.fire({
      title: `${userName} đã gửi lời mời kết bạn`,
      text: "Bạn muốn làm gì?",
      imageUrl: picture,
      imageWidth: 80,
      imageHeight: 80,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Chấp nhận",
      denyButtonText: "Từ chối",
      cancelButtonText: "Để sau",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "btn btn-primary",
        denyButton: "btn btn-outline-danger",
        cancelButton: "btn btn-outline-secondary",
        popup: "friend-request-popup",
      },
      buttonsStyling: false,
    }).then((result) => {
      pendingFriendRequests.delete(userId);

      if (result.isConfirmed) {
        socket.once("SERVER_ADD_FRIEND", (friendData) => {
          if (friendData.userId === currentUserId && friendData.roomId) {
            Swal.fire({
              icon: "success",
              title: "Đã chấp nhận lời mời!",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              window.location.href = `/chat/${friendData.roomId}`;
            });
          }
        });
        socket.emit("CLIENT_ACCEPT_FRIEND", userId);
      } else if (result.isDenied) {
        socket.emit("CLIENT_REJECT_FRIEND", userId);
        Swal.fire({
          icon: "info",
          title: "Đã từ chối lời mời",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  });
};

showFriendRequestNotification();
registerMessageImageViewers(document);

const scrollToBottom = () => {
  const slimScrollDiv = document.querySelector(".chat .slimScrollDiv");
  const chatBody = slimScrollDiv.querySelector(".chat-body");
  const slimScrollBar = slimScrollDiv.querySelector(".slimScrollBar");
  slimScrollDiv.style.overflow = "auto";
  chatBody.style.overflow = "auto";
  slimScrollBar.style.display = "none";

  chatBody.scrollTop = chatBody.scrollHeight;
  var wHeight = $(window).height();
  const topScrollBar =
    wHeight - 70 - Number.parseFloat(slimScrollBar.style.height);
  slimScrollBar.style.top = `${topScrollBar}px`;
};

scrollToBottom();

const emojiPicker = document.querySelector("#emoji-picker");
if (emojiPicker) {
  const message = document.querySelector("#message");
  emojiPicker.addEventListener("emoji-click", (event) => {
    message.value = message.value + event.detail.unicode;
  });
}
const toggleEmojiPicker = (button) => {
  const emojiPicker = document.querySelector("#emoji-picker");
  if (!emojiPicker) return;
  emojiPicker.classList.toggle("d-none");
};

const insertEmoji = (emoji) => {
  const messageInput = document.getElementById("message");
  if (messageInput) {
    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    const text = messageInput.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    messageInput.value = before + emoji + after;
    messageInput.selectionStart = messageInput.selectionEnd =
      start + emoji.length;
    messageInput.focus();
  }
};

const closeEmojiPicker = () => {
  const emojiPicker = document.querySelector("emoji-picker");
  if (emojiPicker) {
    emojiPicker.remove();
  }
};
