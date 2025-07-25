// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBO-eccBq3yRfZrSLaGBm37uCCK_H_xS-8", // Đã có trong code bạn gửi
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "122586785847",
  appId: "1:122586785847:web:ac7b00a97aaee6ccda79c7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");

// Khởi tạo tên tu tiên
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Nhập danh hiệu tu tiên của bạn:") || "Ẩn danh";
  localStorage.setItem("username", username);
}

// DOM elements
const messagesUl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const imageInput = document.getElementById("imageInput");

// Avatar mặc định & khung (sẽ cập nhật link sau)
const defaultAvatar = "https://i.ibb.co/6Nt5HPZ/avatar-default.png";
const avatarFrame = ""; // Placeholder – bạn sẽ thêm link khung avatar ở đây sau

// Gửi tin nhắn
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Gửi ảnh
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageUrl = reader.result;
    messagesRef.push({
      sender: username,
      image: imageUrl,
      avatar: defaultAvatar,
      timestamp: Date.now()
    });
  };
  reader.readAsDataURL(file);
});

// Gửi tin nhắn văn bản
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  messagesRef.push({
    sender: username,
    text: text,
    avatar: defaultAvatar,
    timestamp: Date.now()
  });

  messageInput.value = "";
}

// Hiển thị tin nhắn
messagesRef.on("child_added", (snapshot) => {
  const data = snapshot.val();
  const key = snapshot.key;

  const li = document.createElement("li");
  li.className = "message";

  // Tạo khung từng người
  li.innerHTML = `
    <div class="chat-bubble">
      <img src="${data.avatar || defaultAvatar}" class="avatar" />
      <div class="content">
        <div class="sender">${data.sender}</div>
        ${data.text ? `<div class="text-msg">${data.text}</div>` : ""}
        ${data.image ? `<img src="${data.image}" class="img-msg" />` : ""}
        <div class="actions">
          ${data.sender === username ? `
            <button onclick="editMessage('${key}', '${data.text || ""}')">✏️</button>
            <button onclick="deleteMessage('${key}')">🗑️</button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
  messagesUl.appendChild(li);
  messagesUl.scrollTop = messagesUl.scrollHeight;
});

// Chỉnh sửa tin nhắn
window.editMessage = function(key, oldText = "") {
  const newText = prompt("Chỉnh sửa tin nhắn:", oldText);
  if (newText !== null) {
    messagesRef.child(key).update({ text: newText });
  }
};

// Thu hồi tin nhắn
window.deleteMessage = function(key) {
  if (confirm("Xoá tin nhắn này?")) {
    messagesRef.child(key).remove();
  }
};

// Xoá toàn bộ
clearBtn.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn xoá toàn bộ đoạn chat không?")) {
    messagesRef.remove();
    messagesUl.innerHTML = "";
  }
});

// Cập nhật lại UI khi xoá
messagesRef.on("child_removed", (snapshot) => {
  const msgKey = snapshot.key;
  const items = document.querySelectorAll("#messages li");
  items.forEach(li => {
    if (li.innerHTML.includes(msgKey)) li.remove();
  });
});
