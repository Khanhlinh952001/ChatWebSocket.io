const socket = io();
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = (e)=>{
     if(e){
       return alert(e);
     }
     console.log("send message ")
    }
    if (input.value) {

      socket.emit('chat message', input.value,bad);
      input.value = '';
    }
  });

  socket.on('welcome',(a)=>{
    console.log(a);
    const item = document.createElement('li');
     item.textContent = "Chào Mừng " +a+ " đến với phòng";
     messages.appendChild(item);
  })
  socket.on('welcomex',(a)=>{
    const item = document.createElement('li');
    item.textContent = a + "Đã được thêm";
    messages.appendChild(item);
  }) 

  socket.on('Message', (msg) => {
    console.log(msg);

    const item = document.createElement('p');
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
   
   
    window.scrollTo(0, document.body.scrollHeight);
  });
 
  //share address
  document.getElementById("btn-location").addEventListener("click",()=>{
    if(!navigator.geolocation){
      return alert("Error browser")
    }
    navigator.geolocation.getCurrentPosition((position)=>{
      console.log(position);
      const {latitude,longitude} = position.coords;
      socket.emit('share location',{latitude,longitude});
    })
  })
  
  socket.on("share location form sever",(location)=>{
    const item = document.createElement('a');
  item.textContent = location; // Text bạn muốn hiển thị cho liên kết
  item.href = location; // Đặt đường dẫn cho liên kết
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  })

  //lay ten room and user
  const queryString = location.search;
  const params = Qs.parse(queryString,{
    ignoreQueryPrefix:true
  });
  const {room, username} = params;
  socket.emit('JoinRoom',{room , username});
  document.getElementById("app__title").innerHTML = room;

  //nhan user online
 socket.on("user online",(user)=>{
    console.log(user);
    var htmlContent = "";
    user.map((user)=>{
      htmlContent +=  `<li class="app__item-user">${user.username}</li>`;
    })
    document.getElementById("app__list-user--content").innerHTML = htmlContent;
  })
  