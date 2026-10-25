// ---------- State ----------
let books = [];
let currentFilter = "all";

const STATUS_LABELS = {
  "to-read": "To read",
  "reading": "Reading",
  "finished": "Finished"
};

// ---------- Elements ----------
const form = document.getElementById("book-form");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const statusInput = document.getElementById("status");
const list = document.getElementById("book-list");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter");

// ---------- Saving and loading (browser localStorage) ----------
function saveBooks() {
  try { localStorage.setItem("readingList", JSON.stringify(books)); } catch (e) {}
}

function loadBooks() {
  try {
    const data = JSON.parse(localStorage.getItem("readingList"));
    if (Array.isArray(data)) books = data;
  } catch (e) {}
}

// ---------- Actions ----------
function addBook(title, author, status) {
  books.push({ id: Date.now(), title: title, author: author, status: status });
  saveBooks();
  render();
}

function updateStatus(id, status) {
  const book = books.find(b => b.id === id);
  if (book) book.status = status;
  saveBooks();
  render();
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  saveBooks();
  render();
}

// ---------- Rendering ----------
function updateSummary() {
  document.getElementById("count-total").textContent = books.length;
  document.getElementById("count-to-read").textContent = books.filter(b => b.status === "to-read").length;
  document.getElementById("count-reading").textContent = books.filter(b => b.status === "reading").length;
  document.getElementById("count-finished").textContent = books.filter(b => b.status === "finished").length;
}

function createBookItem(book) {
  const li = document.createElement("li");
  li.className = "book";

  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = book.title;
  const author = document.createElement("p");
  author.textContent = "by " + book.author;
  info.append(title, author);

  const actions = document.createElement("div");
  actions.className = "actions";

  const select = document.createElement("select");
  select.setAttribute("aria-label", "Status of " + book.title);
  Object.keys(STATUS_LABELS).forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = STATUS_LABELS[value];
    option.selected = value === book.status;
    select.appendChild(option);
  });
  select.addEventListener("change", () => updateStatus(book.id, select.value));

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "Delete";
  del.setAttribute("aria-label", "Delete " + book.title);
  del.addEventListener("click", () => deleteBook(book.id));

  actions.append(select, del);
  li.append(info, actions);
  return li;
}

function render() {
  updateSummary();
  list.innerHTML = "";

  const visible = currentFilter === "all"
    ? books
    : books.filter(b => b.status === currentFilter);

  visible.forEach(book => list.appendChild(createBookItem(book)));

  if (visible.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = books.length === 0
      ? "Your list is empty. Add your first book above."
      : "No books with this status yet.";
  } else {
    emptyMessage.hidden = true;
  }
}

// ---------- Events ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  if (!title || !author) return;
  addBook(title, author, statusInput.value);
  form.reset();
  titleInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === button));
    render();
  });
});

// ---------- Start ----------
loadBooks();
render();
