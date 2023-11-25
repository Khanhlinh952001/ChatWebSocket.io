// Tạo một đối tượng socket để kết nối với máy chủ
const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Hàm callback để xử lý thông báo lỗi từ server
const handleSendMessageError = (error) => {
  if (error) {
    alert(`Error sending message: ${error}`);
  } else {
    console.log("Message sent");
  }
};

// Bắt sự kiện khi form được submit
form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (input.value.trim()) {
    // Gửi sự kiện 'chat message' với nội dung tin nhắn và hàm callback
    socket.emit('chat message', input.value, handleSendMessageError);
    input.value = ''; // Xóa nội dung input sau khi gửi tin nhắn
  }
});

// Lắng nghe sự kiện 'welcome' từ server khi người dùng tham gia phòng
socket.on('welcome', (username) => {
  const content = document.getElementById("app__messages");

  content.innerHTML += `
    <div class="message-itemx">
      <div class="message__row1">
        <p class="message__name">Chào bạn ${username} cảm ơn đã tham gia</p>
      </div>
    </div>
  `;
});

// Lắng nghe sự kiện 'welcomex' từ server khi có người mới tham gia phòng
socket.on('welcomex', (username) => {
  const content = document.getElementById("app__messages");

  content.innerHTML += `
    <div class="message-itemx">
      <div class="message__row1">
        <p class="message__name"> ${username} Đã tham gia nhóm</p>
      </div>
    </div>
  `;
});

// Lắng nghe sự kiện 'Message' từ server khi có tin nhắn mới
socket.on('Message', (msg) => {
  const content = document.getElementById("app__messages");

  content.innerHTML += `
    <div class="message-item">
      <div class="message__row1">
        <p class="message__name">${msg.username}</p>
        <p class="message__date">${msg.time}</p>
      </div>
      <div class="message__row2">
        <p class="message__content">
          ${msg.msg}
        </p>
      </div>
    </div>
  `;

  // Cuộn xuống dưới cùng của trang để xem tin nhắn mới nhất
  window.scrollTo(0, document.body.scrollHeight);
});

// Lắng nghe sự kiện click vào nút chia sẻ vị trí
document.getElementById("btn-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Trình duyệt không hỗ trợ tính năng này");
  }

  // Lấy vị trí hiện tại của người dùng
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    // Gửi sự kiện 'share location' với thông tin vị trí đến server
    socket.emit('share location', { latitude, longitude });
  });
});

// Lắng nghe sự kiện 'share location form sever' từ server khi có ai đó chia sẻ vị trí
socket.on("share location form sever", (location, username) => {
  const content = document.getElementById("app__messages");

  content.innerHTML += `
    <div class="message-item">
      <div class="message__row1">
        <p class="message__name">${username}</p>
        <a href="${location}" class="message__date">${location}</a>
      </div>
    </div>
  `;
  // Cuộn xuống dưới cùng của trang để xem tin nhắn mới nhất
  window.scrollTo(0, document.body.scrollHeight);
});

// Lấy thông tin về phòng và tên người dùng từ URL
const queryString = location.search;
const params = Qs.parse(queryString, {
  ignoreQueryPrefix: true
});
const { room, username } = params;

// Gửi sự kiện 'JoinRoom' với thông tin về phòng và người dùng đến server
socket.emit('JoinRoom', { room, username });

// Hiển thị tên phòng trên thanh tiêu đề
document.getElementById("app__title").innerHTML = room;

// Lắng nghe sự kiện 'user online' từ server khi có người dùng mới tham gia hoặc rời phòng
socket.on("user online", (users) => {
  const listUser = document.querySelector("#app__list-user--content");
  listUser.innerHTML = ""; // Clear existing list

  users.forEach((user) => {
    // Hiển thị danh sách người dùng online
    listUser.innerHTML += `<li class="app__item-user">${user.username}</li>`;
  });
});
