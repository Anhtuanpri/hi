// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-A-Z3MzVwFowAQ4_pN9K_g9ynNHdGQjI",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "929373087256",
  appId: "1:929373087256:web:f8f34c6f70eb9e457b53a3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("chat");

// Elements
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const messagesUl = document.getElementById("messages");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const imageInput = document.getElementById("imageInput");

let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Nhập danh hiệu tu tiên của bạn:");
  if (!username || username.trim() === "") username = "Ẩn Danh";
  localStorage.setItem("username", username);
}

const defaultAvatar = "https://i.ibb.co/PMnS8bT/user.png"; // Ảnh avatar mặc định
const defaultFrame = ""; // Link khung sẽ dán sau

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  const file = imageInput.files[0];
  if (!text && !file) return;

  const timestamp = Date.now();
  let message = {
    user: username,
    avatar: defaultAvatar,
    frame: defaultFrame,
    time: timestamp
  };

  if (text) message.text = text;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      message.image = reader.result;
      messagesRef.push(message);
    };
    reader.readAsDataURL(file);
  } else {
    messagesRef.push(message);
  }

  messageInput.value = "";
  imageInput.value = null;
  emojiPicker.classList.add("hidden");
};

clearBtn.onclick = () => {
  if (confirm("Bạn có chắc muốn xoá toàn bộ cuộc trò chuyện?")) {
    messagesRef.remove();
  }
};

emojiBtn.onclick = () => {
  emojiPicker.classList.toggle("hidden");
};

emojiPicker.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    messageInput.value += e.target.textContent;
  }
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

messagesRef.on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const id = snapshot.key;
  renderMessage(msg, id);
});

messagesRef.on("child_removed", (snapshot) => {
  const msgElement = document.getElementById(snapshot.key);
  if (msgElement) msgElement.remove();
});

messagesRef.on("child_changed", (snapshot) => {
  const msg = snapshot.val();
  const id = snapshot.key;
  const oldMsg = document.getElementById(id);
  if (oldMsg) oldMsg.remove();
  renderMessage(msg, id);
});

function renderMessage(msg, id) {
  const li = document.createElement("li");
  li.className = "message-box";
  li.id = id;

  const isMine = msg.user === username;

  const content = `
    <div class="message ${isMine ? "sent" : ""}">
      <div class="avatar-frame">
        <img class="avatar-img" src="${msg.avatar || defaultAvatar}" />
        ${msg.frame ? `<img class="avatar-frame-img" src="${msg.frame}" />` : ""}
      </div>
      <div class="message-content">
        <div class="meta">
          <strong>${msg.user}</strong> • <span>${formatTime(msg.time)}</span>
        </div>
        ${msg.text ? `<div class="text">${msg.text}</div>` : ""}
        ${msg.image ? `<img class="message-img" src="${msg.image}" />` : ""}
      </div>
      ${isMine ? `
        <div class="action-icon">⚙️</div>
        <div class="actions hidden">
          <button onclick="editMessage('${id}', '${msg.text || ""}')">Sửa</button>
          <button onclick="deleteMessage('${id}')">Xoá</button>
        </div>
      ` : ""}
    </div>
  `;

  li.innerHTML = content;
  messagesUl.appendChild(li);

  if (isMine) {
    const icon = li.querySelector(".action-icon");
    const actions = li.querySelector(".actions");
    icon.onclick = () => actions.classList.toggle("hidden");
  }

  messagesUl.scrollTop = messagesUl.scrollHeight;
}

window.editMessage = function (id, oldText) {
  const newText = prompt("Nhập nội dung mới:", oldText);
  if (newText !== null && newText.trim() !== "") {
    messagesRef.child(id).update({ text: newText });
  }
};

window.deleteMessage = function (id) {
  if (confirm("Xoá tin nhắn này?")) {
    messagesRef.child(id).remove();
  }
};
