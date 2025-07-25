// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// ✅ Cấu hình Firebase đầy đủ
const firebaseConfig = {
  apiKey: "AIzaSyCzE5lX1CArKUT_pMr-vj1-Uhz6cDtGp1c",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "170812804219",
  appId: "1:170812804219:web:eb10a3f1e64b0b68bfc879"
};

// ✅ Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ DOM Elements
const messagesUl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageInput = document.getElementById("imageInput");
const emojiPicker = document.getElementById("emojiPicker");
const clearBtn = document.getElementById("clearChat");

const defaultAvatar = "https://i.imgur.com/IA8CIbj.png"; // Avatar mặc định

// ✅ Tên người dùng
let chatName = localStorage.getItem("chatName");
if (!chatName) {
  chatName = prompt("Nhập danh xưng tu tiên của bạn:");
  if (!chatName || chatName.trim() === "") chatName = "Ẩn Danh";
  localStorage.setItem("chatName", chatName);
}

// ✅ Gửi tin nhắn văn bản
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const message = {
    name: chatName,
    avatar: defaultAvatar,
    text,
    timestamp: Date.now()
  };
  push(ref(db, "messages"), message);
  messageInput.value = "";
});

// ✅ Gửi ảnh
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const message = {
      name: chatName,
      avatar: defaultAvatar,
      image: reader.result,
      timestamp: Date.now()
    };
    push(ref(db, "messages"), message);
  };
  reader.readAsDataURL(file);
});

// ✅ Gửi emoji
emojiPicker.addEventListener("change", () => {
  messageInput.value += emojiPicker.value;
  emojiPicker.selectedIndex = 0; // Reset emoji picker
});

// ✅ Hiển thị tin nhắn
onValue(ref(db, "messages"), (snapshot) => {
  messagesUl.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  Object.entries(data).forEach(([key, msg]) => {
    const li = document.createElement("li");
    li.classList.add("message");

    const nameEl = document.createElement("div");
    nameEl.className = "name";
    nameEl.innerText = msg.name;

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = msg.avatar || defaultAvatar;

    const textEl = document.createElement("div");
    textEl.className = "text";
    textEl.innerText = msg.text || "";

    const time = new Date(msg.timestamp).toLocaleTimeString();

    const timeEl = document.createElement("div");
    timeEl.className = "time";
    timeEl.innerText = time;

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content";

    if (msg.image) {
      const img = document.createElement("img");
      img.src = msg.image;
      img.style.maxWidth = "100%";
      contentWrapper.appendChild(img);
    }

    if (msg.text) {
      contentWrapper.appendChild(textEl);
    }

    li.appendChild(avatar);
    li.appendChild(nameEl);
    li.appendChild(contentWrapper);
    li.appendChild(timeEl);

    // Xoá hoặc sửa nếu là tin của mình
    if (msg.name === chatName) {
      const del = document.createElement("button");
      del.innerText = "❌";
      del.onclick = () => remove(ref(db, "messages/" + key));
      li.appendChild(del);
    }

    messagesUl.appendChild(li);
  });

  messagesUl.scrollTop = messagesUl.scrollHeight;
});

// ✅ Xoá toàn bộ chat
clearBtn.addEventListener("click", () => {
  if (confirm("Xoá toàn bộ đoạn chat?")) {
    remove(ref(db, "messages"));
  }
});
