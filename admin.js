// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const adminComments = document.getElementById('admin-comments');

function renderComments(data, parentKey = "") {
  adminComments.innerHTML = "";

  Object.entries(data).forEach(([key, comment]) => {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = `
      <p><strong>${comment.name}</strong>: ${comment.text}</p>
      <p><small>🕒 ${new Date(comment.timestamp).toLocaleString()}</small></p>
      <button onclick="deleteComment('${key}')">🗑 Xoá bình luận</button>
    `;

    adminComments.appendChild(commentDiv);

    if (comment.replies) {
      Object.entries(comment.replies).forEach(([replyKey, reply]) => {
        const replyDiv = document.createElement("div");
        replyDiv.className = "comment";
        replyDiv.style.marginLeft = "20px";
        replyDiv.innerHTML = `
          <p><strong>${reply.name}</strong> (trả lời): ${reply.text}</p>
          <p><small>🕒 ${new Date(reply.timestamp).toLocaleString()}</small></p>
          <button onclick="deleteComment('${key}/replies/${replyKey}')">🗑 Xoá trả lời</button>
        `;
        adminComments.appendChild(replyDiv);
      });
    }
  });
}

function deleteComment(path) {
  const commentRef = ref(db, 'comments/' + path);
  if (confirm("Bạn có chắc muốn xoá bình luận này?")) {
    remove(commentRef)
      .then(() => alert("Đã xoá bình luận"))
      .catch(err => alert("Lỗi xoá: " + err.message));
  }
}

// Load comments
onValue(ref(db, 'comments'), snapshot => {
  const data = snapshot.val();
  if (data) renderComments(data);
  else adminComments.innerHTML = "<p>Không có bình luận nào.</p>";
});
