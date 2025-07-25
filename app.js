// Firebase cấu hình
const firebaseConfig = {
  apiKey: "AIzaSyDVYgVwO6cfklbctAM_VfUBNpbW4HE7J5Y",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "1067149090198",
  appId: "1:1067149090198:web:5896b601d8e6e66fe589f2",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const messagesUl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageInput = document.getElementById("imageInput");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = new EmojiButton();

emojiBtn.addEventListener("click", () => emojiPicker.togglePicker(emojiBtn));
emojiPicker.on("emoji", emoji => {
  messageInput.value += emoji;
  messageInput.focus();
});

const DEFAULT_AVATAR = "https://i.ibb.co/Qr6qRdd/default-avatar.jpg";
const USER_NAME = localStorage.getItem("username") || prompt("Nhập danh hiệu tu tiên:");
localStorage.setItem("username", USER_NAME);

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  const file = imageInput.files[0];
  if (!text && !file) return;

  const msgData = {
    sender: USER_NAME,
    avatar: DEFAULT_AVATAR,
    timestamp: Date.now()
  };

  if (text) msgData.text = text;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      msgData.image = e.target.result;
      db.ref("messages").push(msgData);
    };
    reader.readAsDataURL(file);
  } else {
    db.ref("messages").push(msgData);
  }

  messageInput.value = "";
  imageInput.value = "";
};

db.ref("messages").on("child_added", snapshot => {
  const msg = snapshot.val();
  const li = document.createElement("li");
  li.className = "message-box";

  li.innerHTML = `
    <img class="avatar" src="${msg.avatar}" />
    <div class="message-content">
      <div class="sender">${msg.sender}</div>
      ${msg.text ? `<div class="text">${msg.text}</div>` : ""}
      ${msg.image ? `<img src="${msg.image}" style="max-width:200px;border-radius:6px;margin-top:5px;">` : ""}
    </div>
  `;

  messagesUl.appendChild(li);
  messagesUl.scrollTop = messagesUl.scrollHeight;
});
