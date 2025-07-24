// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const commentRef = ref(db, "comments");

// Helper: Time formatter
function timeSince(ts) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(ts)) / 1000);
  const d = Math.floor(seconds / 86400);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(seconds / 3600);
  if (h > 0) return `${h} giờ trước`;
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m} phút trước` : `Vừa xong`;
}

// Gửi bình luận
window.postComment = function(parentId = null) {
  const name = document.getElementById("nameInput").value.trim();
  const avatar = document.getElementById("avatarInput").value.trim();
  const content = parentId ? document.getElementById(`replyInput-${parentId}`).value : document.getElementById("commentInput").value;

  if (!name || !content) return alert("Nhập đầy đủ tên và nội dung");

  const data = {
    name,
    avatar: avatar || "https://i.imgur.com/1X5j5Wk.png",
    content,
    timestamp: Date.now(),
    likes: 0,
    parent: parentId
  };

  push(commentRef, data);
  if (parentId) {
    document.getElementById(`replyInput-${parentId}`).value = "";
    document.getElementById(`replyForm-${parentId}`).style.display = "none";
  } else {
    document.getElementById("commentInput").value = "";
  }
};

// Hiển thị bình luận
onValue(commentRef, (snapshot) => {
  const data = snapshot.val();
  const list = document.getElementById("commentList");
  list.innerHTML = "";

  const comments = [];
  for (let id in data) {
    const c = data[id];
    comments.push({ id, ...c });
  }

  const parents = comments.filter(c => !c.parent);
  const replies = comments.filter(c => c.parent);

  parents.sort((a, b) => b.timestamp - a.timestamp);

  for (let c of parents) {
    const el = createCommentElement(c, replies);
    list.appendChild(el);
  }
});

// Tạo thẻ comment
function createCommentElement(comment, allReplies) {
  const div = document.createElement("div");
  div.className = "comment";

  const replies = allReplies.filter(r => r.parent === comment.id);

  div.innerHTML = `
    <div class="comment-header">
      <img class="avatar" src="${comment.avatar}" />
      <strong>${comment.name}</strong> <span style="font-size:12px;margin-left:auto;">${timeSince(comment.timestamp)}</span>
    </div>
    <div class="comment-content">${comment.content}</div>
    <button class="like-button" onclick="likeComment('${comment.id}')">👍 ${comment.likes}</button>
    <button class="reply-button" onclick="toggleReply('${comment.id}')">↩️ Trả lời</button>
    ${canDelete(comment) ? `<button class="delete-button" onclick="deleteComment('${comment.id}')">🗑 Xoá</button>` : ""}
    <div class="reply-form" id="replyForm-${comment.id}">
      <textarea id="replyInput-${comment.id}" placeholder="Nhập câu trả lời..."></textarea>
      <button onclick="postComment('${comment.id}')">Gửi</button>
    </div>
    <div class="reply-container" id="replies-${comment.id}"></div>
  `;

  for (let r of replies) {
    const replyDiv = createCommentElement(r, allReplies);
    div.querySelector(`#replies-${comment.id}`).appendChild(replyDiv);
  }

  return div;
}

// Like
window.likeComment = function(id) {
  const itemRef = ref(db, `comments/${id}`);
  onValue(itemRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      set(itemRef, { ...data, likes: (data.likes || 0) + 1 });
    }
  }, { onlyOnce: true });
};

// Toggle trả lời
window.toggleReply = function(id) {
  const f = document.getElementById(`replyForm-${id}`);
  f.style.display = f.style.display === "none" ? "flex" : "none";
};

// Xoá bình luận
window.deleteComment = function(id) {
  if (confirm("Bạn có chắc muốn xoá?")) {
    remove(ref(db, `comments/${id}`));
  }
};

// Tự xoá sau 7 ngày
onValue(commentRef, (snapshot) => {
  const data = snapshot.val();
  const now = Date.now();
  for (let id in data) {
    const c = data[id];
    if (now - c.timestamp > 7 * 24 * 60 * 60 * 1000) {
      remove(ref(db, `comments/${id}`));
    }
  }
}, { onlyOnce: false });

// Kiểm tra quyền xoá (admin hoặc người đăng)
function canDelete(cmt) {
  const currentName = document.getElementById("nameInput").value.trim();
  return currentName === "admin" || currentName === cmt.name;
}
