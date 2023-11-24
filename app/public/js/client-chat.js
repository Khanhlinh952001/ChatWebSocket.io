// Tạo một đối tượng socket để kết nối với máy chủ
const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Bắt sự kiện khi form được submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Hàm callback để xử lý thông báo lỗi từ server
  const bad = (e) => {
    if (e) {
      return alert(e);
    }
    console.log("Gửi tin nhắn");
  }

  if (input.value) {
    // Gửi sự kiện 'chat message' với nội dung tin nhắn và hàm callback
    socket.emit('chat message', input.value, bad);
    input.value = ''; // Xóa nội dung input sau khi gửi tin nhắn
  }
});

// Lắng nghe sự kiện 'welcome' từ server khi người dùng tham gia phòng
socket.on('welcome', (a) => {
  console.log(a);
  const item = document.createElement('li');
  item.textContent = "Chào Mừng " + a + " đến với phòng";
  item.classList.add('headerxx');
  messages.appendChild(item);
});

// Lắng nghe sự kiện 'welcomex' từ server khi có người mới tham gia phòng
socket.on('welcomex', (a) => {
  const item = document.createElement('li');
  item.classList.add('headerxx');
  item.textContent = a + " Đã được thêm";
  messages.appendChild(item);
});

// Lắng nghe sự kiện 'Message' từ server khi có tin nhắn mới
socket.on('Message', (msg) => {
  console.log(msg);

  const item = document.createElement('li');
  const pElement = document.createElement('p');
  const spanElement = document.createElement('span');
  const spanElement1 = document.createElement('strong');
  item.classList.add('list-group');
  spanElement.classList.add('list-span');
  spanElement1.classList.add('p');
  pElement.textContent = msg.msg;
  spanElement.textContent = msg.time;
  spanElement1.textContent = msg.username;
  item.appendChild(spanElement1);
  item.appendChild(pElement);
  item.appendChild(spanElement);
  messages.appendChild(item);

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
    console.log(position);
    const { latitude, longitude } = position.coords;
    // Gửi sự kiện 'share location' với thông tin vị trí đến server
    socket.emit('share location', { latitude, longitude });
  })
});

// Lắng nghe sự kiện 'share location form sever' từ server khi có ai đó chia sẻ vị trí
socket.on("share location form sever", (location) => {
  const item = document.createElement('a');
  item.textContent = location; // Text bạn muốn hiển thị cho liên kết
  item.href = location; // Đặt đường dẫn cho liên kết
  messages.appendChild(item);
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
socket.on("user online", (user) => {
  console.log(user);
  let htmlContent = "";
  user.map((user) => {
    // Hiển thị danh sách người dùng online
    htmlContent += `<li class="app__item-user">${user.username}</li>`;
  })
  document.getElementById("app__list-user--content").innerHTML = htmlContent;
});
