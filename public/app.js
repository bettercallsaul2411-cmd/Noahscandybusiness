const postsElement = document.getElementById("posts");
const postForm = document.getElementById("postForm");
const feedback = document.getElementById("feedback");
const categoryFilter = document.getElementById("categoryFilter");
const blockedWordsElement = document.getElementById("blockedWords");
const reviewForm = document.getElementById("reviewForm");
const reviewMessage = document.getElementById("reviewMessage");
const reviewFeedback = document.getElementById("reviewFeedback");
const applyButton = document.getElementById("applyButton");
const workerButton = document.getElementById("workerButton");
const workerForm = document.getElementById("workerForm");
const schoolIdInput = document.getElementById("schoolId");
const workerNameInput = document.getElementById("workerName");
const workerFeedback = document.getElementById("workerFeedback");

let allPosts = [];

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

async function loadBlockedWords() {
  const response = await fetch("/api/blocked-words");
  const data = await response.json();
  blockedWordsElement.textContent = `Blocked words: ${data.blockedWords.join(", ")}`;
}

function renderPosts() {
  const selectedCategory = categoryFilter.value;
  const filteredPosts =
    selectedCategory === "all"
      ? allPosts
      : allPosts.filter((post) => post.category === selectedCategory);

  postsElement.innerHTML = "";

  if (!filteredPosts.length) {
    postsElement.innerHTML = "<li>No posts found for this category.</li>";
    return;
  }

  for (const post of filteredPosts) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="meta">
        <strong>${post.author}</strong>
        <span class="tag">${post.category}</span>
      </div>
      <p>${post.message}</p>
      <div class="meta">
        <small>${formatDate(post.createdAt)}</small>
        <button data-id="${post.id}" type="button">Delete</button>
      </div>
    `;

    listItem.querySelector("button").addEventListener("click", async () => {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      await refreshPosts();
    });

    postsElement.appendChild(listItem);
  }
}

async function refreshPosts() {
  const response = await fetch("/api/posts");
  const data = await response.json();
  allPosts = data.posts;
  renderPosts();
}

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.textContent = "";

  const payload = {
    author: document.getElementById("author").value,
    category: document.getElementById("category").value,
    message: document.getElementById("message").value
  };

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    feedback.textContent = `${error.error} ${error.sanitizedPreview ? `(${error.sanitizedPreview})` : ""}`;
    feedback.style.color = "#b00020";
    return;
  }

  postForm.reset();
  feedback.textContent = "Message posted successfully!";
  feedback.style.color = "#0d7a46";
  await refreshPosts();
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  reviewFeedback.textContent = "";

  const response = await fetch("/api/review-language", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: reviewMessage.value })
  });
  const data = await response.json();

  if (data.clean) {
    reviewFeedback.style.color = "#0d7a46";
    reviewFeedback.textContent = "Language review passed: message looks clean.";
  } else {
    reviewFeedback.style.color = "#b00020";
    reviewFeedback.textContent = `Needs cleanup: ${data.sanitizedPreview}`;
  }
});

applyButton.addEventListener("click", () => {
  workerButton.hidden = false;
  workerFeedback.textContent = "Click Worker to continue your application.";
  workerFeedback.style.color = "#272343";
});

workerButton.addEventListener("click", () => {
  workerForm.hidden = false;
  schoolIdInput.focus();
});

workerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/worker-applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      schoolId: schoolIdInput.value,
      name: workerNameInput.value
    })
  });

  const data = await response.json();
  if (!response.ok) {
    workerFeedback.style.color = "#b00020";
    workerFeedback.textContent = data.error;
    return;
  }

  workerFeedback.style.color = "#0d7a46";
  workerFeedback.textContent = `Application saved for ${data.application.name} (School ID: ${data.application.schoolId}).`;
  workerForm.reset();
  workerForm.hidden = true;
});

categoryFilter.addEventListener("change", renderPosts);

loadBlockedWords();
refreshPosts();
