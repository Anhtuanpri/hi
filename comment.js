// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const commentsRef = ref(db, "comments");

// Submit form
document.getElementById("comment-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name && message) {
    push(commentsRef, {
      name,
      message,
      parentId: null,
      likes: 0,
      timestamp: Date.now()
    });
    this.reset();
  }
});

function renderComment(id, data, replies = []) {
  const wrapper = document.createElement("div");
  wrapper.className = "comment";
  if (data.parentId) wrapper.classList.add("reply");

  const meta = `<div class="meta">${data.name} • ${new Date(data.timestamp).toLocaleString()}</div>`;
  const like = `<span class="like-btn" data-id="${id}">👍 ${data.likes}</span>`;
  const replyBtn = `<button class="reply-btn" data-id="${id}" data-name="${data.name}">Trả lời</button>`;

  wrapper.innerHTML = `
    ${meta}
    <div>${data.message}</div>
    <div>${like} ${replyBtn}</div>
    <div class="replies"></div>
  `;

  replies.forEach(r => wrapper.querySelector(".replies").appendChild(renderComment(r.id, r.data)));
  return wrapper;
}

// Load comments
onValue(commentsRef, (snapshot) => {
  const container = document.getElementById("comments-container");
  container.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  const list = Object.entries(data).map(([id, data]) => ({ id, data }))
    .filter(item => Date.now() - item.data.timestamp < 7 * 24 * 60 * 60 * 1000); // 7 days

  // Auto-delete expired
  Object.entries(data).forEach(([id, d]) => {
    if (Date.now() - d.timestamp >= 7 * 24 * 60 * 60 * 1000) remove(ref(db, `comments/${id}`));
  });

  const rootComments = list.filter(c => !c.data.parentId);
  rootComments.forEach(comment => {
    const replies = list.filter(r => r.data.parentId === comment.id);
    container.appendChild(renderComment(comment.id, comment.data, replies));
  });
});

// Like & reply
document.getElementById("comments-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("like-btn")) {
    const id = e.target.dataset.id;
    const commentRef = ref(db, `comments/${id}`);
    onValue(commentRef, (snap) => {
      const data = snap.val();
      if (data) {
        set(commentRef, { ...data, likes: (data.likes || 0) + 1 });
      }
    }, { onlyOnce: true });
  }

  if (e.target.classList.contains("reply-btn")) {
    const id = e.target.dataset.id;
    const name = prompt(`Trả lời bình luận của ${e.target.dataset.name}:`);
    if (name) {
      const user = prompt("Tên của bạn:");
      if (user) {
        push(commentsRef, {
          name: user,
          message: name,
          parentId: id,
          likes: 0,
          timestamp: Date.now()
        });
      }
    }
  }
});
