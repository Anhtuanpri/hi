import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const commentRef = ref(db, "comments");

window.postComment = () => {
  const text = document.getElementById("commentInput").value.trim();
  if (text) {
    push(commentRef, {
      text,
      time: Date.now(),
      avatar: "https://i.pravatar.cc/32",
      parentId: null,
      likes: 0
    });
    document.getElementById("commentInput").value = "";
  }
};

function renderComments(data) {
  const container = document.getElementById("commentsContainer");
  container.innerHTML = "";
  const comments = [];
  data.forEach(item => {
    const c = item.val();
    c.id = item.key;
    comments.push(c);
  });

  const parents = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  parents.sort((a,b) => b.time - a.time);

  parents.forEach(parent => {
    const div = document.createElement("div");
    div.className = "comment-box";
    div.innerHTML = `
      <div class="comment-header">
        <img src="${parent.avatar}" class="avatar">
        <strong>${new Date(parent.time).toLocaleString()}</strong>
        <span class="like-btn" onclick="likeComment('${parent.id}')">👍 ${parent.likes || 0}</span>
        <span class="reply-btn" onclick="toggleReply('${parent.id}')">Trả lời</span>
        <span class="delete-btn" onclick="deleteComment('${parent.id}')">Xóa</span>
      </div>
      <div>${parent.text}</div>
      <div class="reply-input" id="reply-${parent.id}">
        <textarea id="replyText-${parent.id}" rows="2" style="width:100%; margin-top:5px;"></textarea>
        <button onclick="submitReply('${parent.id}')">Gửi</button>
      </div>
      <div class="show-replies" onclick="toggleReplies('${parent.id}')">Xem câu trả lời (${replies.filter(r => r.parentId === parent.id).length})</div>
      <div id="replies-${parent.id}" style="display:none;"></div>
    `;
    container.appendChild(div);
  });
}

window.toggleReply = id => {
  const box = document.getElementById(`reply-${id}`);
  box.style.display = box.style.display === "block" ? "none" : "block";
};

window.submitReply = parentId => {
  const input = document.getElementById(`replyText-${parentId}`);
  const text = input.value.trim();
  if (text) {
    push(commentRef, {
      text,
      time: Date.now(),
      avatar: "https://i.pravatar.cc/32",
      parentId,
      likes: 0
    });
    input.value = "";
  }
};

window.toggleReplies = parentId => {
  const replyBox = document.getElementById(`replies-${parentId}`);
  if (replyBox.style.display === "block") {
    replyBox.style.display = "none";
    replyBox.innerHTML = "";
  } else {
    onValue(commentRef, snapshot => {
      const replies = [];
      snapshot.forEach(item => {
        const val = item.val();
        if (val.parentId === parentId) {
          replies.push({ ...val, id: item.key });
        }
      });
      replies.sort((a,b) => a.time - b.time);
      replyBox.innerHTML = "";
      replies.forEach(r => {
        const rdiv = document.createElement("div");
        rdiv.className = "reply-box";
        rdiv.innerHTML = `
          <div class="comment-header">
            <img src="${r.avatar}" class="avatar">
            <strong>${new Date(r.time).toLocaleString()}</strong>
            <span class="like-btn" onclick="likeComment('${r.id}')">👍 ${r.likes || 0}</span>
            <span class="delete-btn" onclick="deleteComment('${r.id}')">Xóa</span>
          </div>
          <div>${r.text}</div>
        `;
        replyBox.appendChild(rdiv);
      });
      replyBox.style.display = "block";
    });
  }
};

window.likeComment = id => {
  const targetRef = ref(db, `comments/${id}`);
  onValue(targetRef, snapshot => {
    const data = snapshot.val();
    if (data) {
      update(targetRef, { likes: (data.likes || 0) + 1 });
    }
  }, { onlyOnce: true });
};

window.deleteComment = id => {
  if (confirm("Bạn có chắc muốn xóa?")) {
    remove(ref(db, `comments/${id}`));
  }
};

// Tự động xóa comment sau 7 ngày
onValue(commentRef, snapshot => {
  const now = Date.now();
  snapshot.forEach(item => {
    const val = item.val();
    if (now - val.time > 7 * 24 * 60 * 60 * 1000) {
      remove(ref(db, `comments/${item.key}`));
    }
  });
});

onValue(commentRef, renderComments);
