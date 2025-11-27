const inviteUser = (button, userId) => {
  button.classList.add("d-none");
  button.nextElementSibling.classList.remove("d-none");
  socket.emit("CLIENT_ADD_FRIEND", userId, (response) => {
    if(response.status){
      const stockInviteRequest  = document.querySelector("[stock-invite-request]");
      stockInviteRequest.innerHTML = response.request_length
      
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: response.messages || 'Đã gửi lời mời kết bạn',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: response.messages || 'Không thể gửi lời mời kết bạn',
          timer: 2000,
          showConfirmButton: false
        });
      }
      button.classList.remove("d-none");
      button.nextElementSibling.classList.add("d-none");
    }
  });
};

const acceptInvite = (button, userId) => {
  button.classList.add("d-none");
  button.nextElementSibling.classList.remove("d-none");
  button.nextElementSibling.nextElementSibling.classList.add("d-none");
  socket.emit("CLIENT_ACCEPT_FRIEND", userId);
};

const rejectInvite = (button, userId) => {
  button.closest(".user-item").remove();
  socket.emit("CLIENT_REJECT_FRIEND", userId);
};

const cancelInvite = (button, userId) => {
  button.classList.add("d-none");
  button.previousElementSibling.classList.remove("d-none");
  socket.emit("CLIENT_CANCEL_FRIEND", userId);
};

const createRoomForm = document.getElementById("createRoomForm");
if (createRoomForm) {
  createRoomForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

const createRoomBtn = document.getElementById("createRoomBtn");
if (createRoomBtn) {
  createRoomBtn.addEventListener("click", () => {
    const roomName = createRoomForm.querySelector("[name='roomName']");
    const selectedFriends = document.querySelectorAll(
      "input[name='selectedFriends']:checked"
    );
    let arrayFriend = [];
    if (selectedFriends.length > 0) {
      for (const it of selectedFriends) {
        arrayFriend.push(it.value);
      }
    }

    const roomData = {
      title: roomName.value,
      selectedFriends: arrayFriend,
    };

    axios
      .post("/room-chat/create", roomData)
      .then((response) => {
        if (response.data.success) {
          location.href = `/chat/${response.data.roomChat}`;
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}


socket.on("SERVER_RETURN_LENGTH_ACCEPT_FRIEND", (data) => {
  const stockInviteAccept = document.querySelector(`[stock-invite-accept="${data.userId}"]`);
  if(stockInviteAccept) {
    stockInviteAccept.innerHTML = data.length;
  }
})